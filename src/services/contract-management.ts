import type {Client,Contract,ContractClauseSnapshot,ContractSigner,ContractTemplateVersion,Deal} from "../models/types";
import {contractTemplates} from "../data/contract-management";

export const allTemplateVersions=()=>contractTemplates.flatMap(template=>template.versions.map(version=>({template,version})));
export const activeTemplateVersions=()=>allTemplateVersions().filter(x=>x.version.status==="active");
export const findTemplateVersion=(code:string)=>allTemplateVersions().find(x=>x.version.code===code);

const conditionResult=(condition:ContractTemplateVersion["clauses"][number]["condition"],deal?:Deal,client?:Client)=>{
  switch(condition){
    case"always":return{included:true,reason:"always"};
    case"installment":return{included:Boolean(deal&&["installment","mixed"].includes(deal.financing)),reason:"installment"};
    case"mortgage":return{included:Boolean(deal&&["mortgage","mixed"].includes(deal.financing)),reason:"mortgage"};
    case"representative":return{included:Boolean(deal?.participants.some(p=>p.role==="representative")),reason:"representative"};
    case"corporate":return{included:Boolean(client&&["company","foreign-company"].includes(client.type)),reason:"corporate"};
    case"package":return{included:Boolean(deal&&deal.propertyIds.length>1),reason:"package"};
    case"vat":return{included:Boolean(deal?.taxIncluded),reason:"vat"};
  }
};

export function buildClauseSnapshot(contract:Contract,deal?:Deal,client?:Client):ContractClauseSnapshot[]{
  const source=findTemplateVersion(contract.template)?.version;
  if(!source)return[];
  return source.clauses.slice().sort((a,b)=>a.order-b.order).map(clause=>{
    const result=conditionResult(clause.condition,deal,client);
    return{id:`${contract.id}-${clause.code}`,code:clause.code,title:clause.title,text:clause.text,category:clause.category,mode:clause.mode,condition:clause.condition,required:clause.required,included:result.included,inclusionReason:result.reason,sourceTemplateVersionId:source.id};
  });
}

function defaultSigners(contract:Contract,deal?:Deal,client?:Client):ContractSigner[]{
  const participants=deal?.participants??[];
  const rep=participants.find(p=>p.role==="representative");
  const buyerSignatory=participants.find(p=>p.role==="signatory");
  const buyer=participants.find(p=>p.role==="buyer");
  const buyerSide:ContractSigner[]=[];
  if(rep)buyerSide.push({id:`${contract.id}-SIG-REP`,name:rep.name,role:"representative",side:"buyer",required:true,status:"pending",method:"pending",authority:rep.authority});
  else if(buyerSignatory)buyerSide.push({id:`${contract.id}-SIG-BSIG`,name:buyerSignatory.name,role:"buyer-signatory",side:"buyer",required:true,status:"pending",method:"pending",authority:buyerSignatory.authority});
  else buyerSide.push({id:`${contract.id}-SIG-BUY`,name:buyer?.name??client?.name??contract.clientName,role:"buyer",side:"buyer",required:true,status:"pending",method:"pending",authority:"Acts in person"});
  participants.filter(p=>p.role==="co-buyer").forEach((p,i)=>buyerSide.push({id:`${contract.id}-SIG-CO${i+1}`,name:p.name,role:"co-buyer",side:"buyer",required:true,status:"pending",method:"pending",authority:p.authority}));
  buyerSide.push({id:`${contract.id}-SIG-SELLER`,name:"Արմեն Մանուկյան",role:"seller-signatory",side:"seller",required:true,status:"pending",method:"pending",authority:"Developer authorized signatory"});
  return buyerSide;
}

export function ensureContractManagement(contract:Contract,deal?:Deal,client?:Client){
  const source=findTemplateVersion(contract.template);
  if(source){contract.templateId??=source.template.id;contract.templateVersionId??=source.version.id}
  if(!contract.clauses?.length)contract.clauses=buildClauseSnapshot(contract,deal,client);
  if(!contract.deviations)contract.deviations=[];
  if(contract.nonStandardClauses>0&&contract.deviations.length===0){
    contract.deviations.push({id:`${contract.id}-DEV-1`,clauseCode:"HANDOVER",title:"Property handover term",standardText:"30 calendar days after full settlement",proposedText:"15 calendar days after title registration",reason:"Buyer request",status:"approval",createdAt:contract.updatedAt,createdBy:contract.owner});
  }
  contract.nonStandardClauses=contract.deviations.length;
  if(!contract.signers?.length)contract.signers=defaultSigners(contract,deal,client);
  if(["signed","notary","registered"].includes(contract.status)){
    contract.signers.forEach(s=>{if(s.required&&s.status!=="signed"){s.status="signed";s.method="paper";s.signedAt=contract.updatedAt}});
    contract.signedDocumentName??=`${contract.id}-signed.pdf`;
  }
  return contract;
}

export const requiredSignersComplete=(contract:Contract)=>Boolean(contract.signers?.filter(s=>s.required).length)&&contract.signers!.filter(s=>s.required).every(s=>s.status==="signed");
export const signingProgress=(contract:Contract)=>{const required=contract.signers?.filter(s=>s.required)??[],signed=required.filter(s=>s.status==="signed").length;return{signed,total:required.length,percent:required.length?Math.round(signed/required.length*100):0}};
