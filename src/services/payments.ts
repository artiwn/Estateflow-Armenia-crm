import { paymentSchedule, paymentScheduleVersions, restructureCases } from "../data/mock";
import type { PaymentScheduleItem, RestructureCase } from "../models/types";

const cloneRows=(rows:PaymentScheduleItem[])=>rows.map(x=>({...x}));

export function ensureScheduleSnapshot(dealId:string, reason="i18n:restructurePage.reason.currentSchedule"){
  const existing=paymentScheduleVersions.filter(v=>v.dealId===dealId);
  if(existing.length)return existing[existing.length-1];
  const rows=paymentSchedule.filter(x=>x.dealId===dealId);
  const version={id:`PSV-${dealId.replace(/\D/g,"")}-1`,dealId,version:1,createdAt:"17.09.2026 · snapshot",reason,rows:cloneRows(rows)};
  paymentScheduleVersions.push(version);
  return version;
}

export function applyRestructure(caseId:string){
  const r=restructureCases.find(x=>x.id===caseId);
  if(!r||!r.proposedSchedule?.length)return null;
  if(r.appliedVersion)return paymentScheduleVersions.find(v=>`v${v.version}`===r.appliedVersion&&v.dealId===r.dealId)??null;
  const current=paymentSchedule.filter(x=>x.dealId===r.dealId);
  if(!paymentScheduleVersions.some(v=>v.dealId===r.dealId)){
    paymentScheduleVersions.push({id:`PSV-${r.dealId.replace(/\D/g,"")}-1`,dealId:r.dealId,version:1,createdAt:"17.09.2026 · before restructure",reason:"i18n:restructurePage.reason.beforeRestructure",rows:cloneRows(current)});
  }
  const maxVersion=Math.max(0,...paymentScheduleVersions.filter(v=>v.dealId===r.dealId).map(v=>v.version));
  const paidBySource=current.reduce((acc,row)=>{acc[row.source]=(acc[row.source]??0)+row.paid;return acc},{buyer:0,mortgage:0,reservation:0} as Record<string,number>);
  const nextRows:PaymentScheduleItem[]=r.proposedSchedule.map((row,index)=>{
    const paid=Math.min(row.amount,paidBySource[row.source]??0);
    paidBySource[row.source]=Math.max(0,(paidBySource[row.source]??0)-paid);
    return {id:`SCH-${r.dealId.split("-").pop()}-R${index+1}`,dealId:r.dealId,sequence:index+1,dueDate:row.dueDate,title:row.title,amount:row.amount,paid,source:row.source,status:paid>=row.amount?"paid":paid>0?"partial":"future"};
  });
  const indices=paymentSchedule.map((x,i)=>x.dealId===r.dealId?i:-1).filter(i=>i>=0).reverse();
  indices.forEach(i=>paymentSchedule.splice(i,1));
  paymentSchedule.push(...nextRows);
  const version=maxVersion+1;
  const entry={id:`PSV-${r.dealId.replace(/\D/g,"")}-${version}`,dealId:r.dealId,version,createdAt:"17.09.2026 · сейчас",reason:`${r.id} · ${r.reason}`,sourceCaseId:r.id,rows:cloneRows(nextRows)};
  paymentScheduleVersions.push(entry);
  r.status="approved";
  r.appliedVersion=`v${version}`;
  r.updatedAt="17.09 · сейчас";
  return entry;
}

export function findRestructureForApproval(dealId:string){
  return restructureCases.find(r=>r.dealId===dealId&&r.status==="approval");
}
