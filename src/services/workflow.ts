import {approvals,clients,contracts,deals,legalCases,restructureCases} from "../data/mock";
import type{Approval,ApprovalDecisionEvent,WorkflowContext,WorkflowPriority,WorkflowRoute,WorkflowRouteStatus,WorkflowRule,WorkflowRuleField,WorkflowRuleOperator,WorkflowRole,WorkflowScope}from"../models/types";
import{recordAudit}from"./audit";

export const workflowRules:WorkflowRule[]=[
  {id:"WF-APP-BASE",nameKey:"v47.rule.applicationBase",descriptionKey:"v47.rule.applicationBaseDesc",scopes:["application"],field:"always",operator:"always",value:true,approvalType:"application",requiredRole:"Sales Head",stepOrder:10,slaHours:8,priority:"normal",active:true,editable:false},
  {id:"WF-DISCOUNT-03",nameKey:"v47.rule.discount3",descriptionKey:"v47.rule.discount3Desc",scopes:["offer","application","deal"],field:"discountPercent",operator:"gt",value:3,approvalType:"discount",requiredRole:"Sales Head",stepOrder:10,slaHours:8,priority:"high",active:true,editable:true},
  {id:"WF-DISCOUNT-07",nameKey:"v47.rule.discount7",descriptionKey:"v47.rule.discount7Desc",scopes:["offer","application","deal"],field:"discountPercent",operator:"gt",value:7,approvalType:"discount",requiredRole:"Commercial Director",stepOrder:20,slaHours:6,priority:"high",active:true,editable:true},
  {id:"WF-INSTALLMENT-18",nameKey:"v47.rule.installment18",descriptionKey:"v47.rule.installment18Desc",scopes:["application","deal","payment-plan"],field:"installmentMonths",operator:"gt",value:18,approvalType:"payment-plan",requiredRole:"Finance",stepOrder:30,slaHours:12,priority:"high",active:true,editable:true},
  {id:"WF-CORPORATE",nameKey:"v47.rule.corporate",descriptionKey:"v47.rule.corporateDesc",scopes:["application","deal","contract"],field:"buyerType",operator:"in",value:["company","foreign-company"],approvalType:"legal",requiredRole:"Legal",stepOrder:40,slaHours:12,priority:"normal",active:true,editable:true},
  {id:"WF-REPRESENTATIVE",nameKey:"v47.rule.representative",descriptionKey:"v47.rule.representativeDesc",scopes:["application","deal","contract","legal"],field:"hasRepresentative",operator:"truthy",value:true,approvalType:"legal",requiredRole:"Legal",stepOrder:40,slaHours:8,priority:"high",active:true,editable:true},
  {id:"WF-CONTRACT-DEVIATION",nameKey:"v47.rule.contractDeviation",descriptionKey:"v47.rule.contractDeviationDesc",scopes:["deal","contract"],field:"nonStandardClauses",operator:"gt",value:0,approvalType:"contract",requiredRole:"Legal",stepOrder:50,slaHours:8,priority:"high",active:true,editable:true},
  {id:"WF-HIGH-VALUE",nameKey:"v47.rule.highValue",descriptionKey:"v47.rule.highValueDesc",scopes:["application","deal"],field:"amount",operator:"gte",value:100000000,approvalType:"executive",requiredRole:"Financial Director",stepOrder:60,slaHours:8,priority:"critical",active:true,editable:true},
  {id:"WF-HIGH-RISK",nameKey:"v47.rule.highRisk",descriptionKey:"v47.rule.highRiskDesc",scopes:["application","deal","contract","legal"],field:"riskLevel",operator:"eq",value:"high",approvalType:"executive",requiredRole:"CEO",stepOrder:90,slaHours:4,priority:"critical",active:true,editable:true}
];

export const workflowRoutes:WorkflowRoute[]=[];
let initialized=false;

const priorityRank:Record<WorkflowPriority,number>={normal:1,high:2,critical:3};
const nowIso=()=>new Date().toISOString();
const afterHours=(hours:number)=>new Date(Date.now()+Math.max(1,hours)*3600000).toISOString();
const nextRouteId=()=>`WF-2026-${String(201+workflowRoutes.length).padStart(3,"0")}`;
const nextApprovalId=()=>`AP-${String(201+approvals.length).padStart(3,"0")}`;
const eventId=()=>`WFE-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function normalizeRisk(value:string|undefined):"low"|"medium"|"high"|undefined{
  const v=(value??"").toLowerCase();
  return v==="low"?"low":v==="medium"?"medium":v==="high"?"high":undefined;
}
function fieldValue(context:WorkflowContext,field:WorkflowRuleField){return field==="always"?true:context[field as keyof WorkflowContext] as unknown}
function numeric(value:unknown){return typeof value==="number"?value:Number(value)}
export function ruleMatches(rule:WorkflowRule,context:WorkflowContext){
  if(!rule.active||!rule.scopes.includes(context.sourceType))return false;
  const actual=fieldValue(context,rule.field),expected=rule.value;
  switch(rule.operator){
    case"always":return true;
    case"truthy":return Boolean(actual);
    case"gt":return numeric(actual)>numeric(expected);
    case"gte":return numeric(actual)>=numeric(expected);
    case"eq":return String(actual??"").toLowerCase()===String(expected).toLowerCase();
    case"in":return Array.isArray(expected)&&expected.map(String).map(x=>x.toLowerCase()).includes(String(actual??"").toLowerCase());
    default:return false;
  }
}
export function previewWorkflow(context:WorkflowContext){
  const matched=workflowRules.filter(r=>ruleMatches(r,context)).sort((a,b)=>a.stepOrder-b.stepOrder||priorityRank[b.priority]-priorityRank[a.priority]);
  const groups:{order:number;role:WorkflowRole;rules:WorkflowRule[];priority:WorkflowPriority;slaHours:number;type:Approval["type"]}[]=[];
  matched.forEach(rule=>{
    const existing=groups.find(g=>g.order===rule.stepOrder&&g.role===rule.requiredRole);
    if(existing){existing.rules.push(rule);if(priorityRank[rule.priority]>priorityRank[existing.priority])existing.priority=rule.priority;existing.slaHours=Math.min(existing.slaHours,rule.slaHours)}
    else groups.push({order:rule.stepOrder,role:rule.requiredRole,rules:[rule],priority:rule.priority,slaHours:rule.slaHours,type:rule.approvalType});
  });
  return {matched,groups};
}
function ruleLimit(rule:WorkflowRule){
  const val=Array.isArray(rule.value)?rule.value.join(", "):String(rule.value);
  return rule.operator==="always"?"Policy":`${rule.operator} ${val}`;
}
function ruleActual(rule:WorkflowRule,context:WorkflowContext){
  const value=fieldValue(context,rule.field);
  if(rule.field==="discountPercent")return `${Number(value??0).toFixed(2)}%`;
  if(rule.field==="amount")return `${Math.round(Number(value??0)).toLocaleString("en-US")} ${context.currency??"AMD"}`;
  if(rule.field==="installmentMonths")return `${Number(value??0)} months`;
  if(rule.field==="hasRepresentative")return Boolean(value)?"Yes":"No";
  if(rule.field==="nonStandardClauses")return String(Number(value??0));
  return String(value??"—");
}
function buildApproval(route:WorkflowRoute,context:WorkflowContext,group:ReturnType<typeof previewWorkflow>["groups"][number],index:number):Approval{
  const first=group.rules[0],ruleIds=group.rules.map(r=>r.id),actuals=group.rules.map(r=>ruleActual(r,context)).join(" · "),limits=group.rules.map(r=>ruleLimit(r)).join(" · ");
  return {id:nextApprovalId(),type:group.type,dealId:context.dealId,clientName:context.clientName,propertyLabel:context.propertyLabel,requestedBy:context.requestedBy,requestedValue:actuals,limitValue:limits,reason:"i18n:v47.workflow.generatedReason",status:index===0?"pending":"queued",routeId:route.id,ruleIds,requiredRole:group.role,sequence:index+1,slaDueAt:afterHours(group.slaHours),priority:group.priority,triggerSummary:ruleIds.join(" · "),history:[]};
}
function createRouteInternal(context:WorkflowContext):WorkflowRoute{
  const plan=previewWorkflow(context),route:WorkflowRoute={id:nextRouteId(),sourceType:context.sourceType,subjectId:context.subjectId,dealId:context.dealId,title:context.title,clientName:context.clientName,propertyLabel:context.propertyLabel,createdAt:nowIso(),status:"active",context:{...context},matchedRuleIds:plan.matched.map(r=>r.id),approvalIds:[],currentStep:plan.groups.length?1:0,history:[]};
  route.history.push({id:eventId(),at:route.createdAt,actor:"System",action:"created",note:plan.groups.length?`Route created with ${plan.groups.length} approval step(s)`:"No approval rules matched"});
  workflowRoutes.push(route);
  plan.groups.forEach((group,index)=>{const approval=buildApproval(route,context,group,index);approvals.push(approval);route.approvalIds.push(approval.id)});
  if(!plan.groups.length){route.status="approved";route.history.push({id:eventId(),at:nowIso(),actor:"System",action:"completed",note:"No approval was required"})}
  return route;
}
export function createWorkflowRoute(context:WorkflowContext){
  const existing=workflowRoutes.find(r=>r.sourceType===context.sourceType&&r.subjectId===context.subjectId&&r.status==="active");
  if(existing)return existing;
  return createRouteInternal(context);
}
export function createManualWorkflowRoute(context:WorkflowContext,config:{type:Approval["type"];role:WorkflowRole;priority?:WorkflowPriority;slaHours?:number;requestedValue:string;limitValue:string;reason:string}){
  const old=workflowRoutes.find(r=>r.sourceType===context.sourceType&&r.subjectId===context.subjectId&&r.status==="active");if(old)return old;
  const route:WorkflowRoute={id:nextRouteId(),sourceType:context.sourceType,subjectId:context.subjectId,dealId:context.dealId,title:context.title,clientName:context.clientName,propertyLabel:context.propertyLabel,createdAt:nowIso(),status:"active",context:{...context},matchedRuleIds:[],approvalIds:[],currentStep:1,history:[{id:eventId(),at:nowIso(),actor:context.requestedBy,action:"created",note:config.reason}]};
  workflowRoutes.push(route);
  const approval:Approval={id:nextApprovalId(),type:config.type,dealId:context.dealId,clientName:context.clientName,propertyLabel:context.propertyLabel,requestedBy:context.requestedBy,requestedValue:config.requestedValue,limitValue:config.limitValue,reason:config.reason,status:"pending",routeId:route.id,ruleIds:[],requiredRole:config.role,sequence:1,slaDueAt:afterHours(config.slaHours??8),priority:config.priority??"high",history:[]};
  approvals.push(approval);route.approvalIds.push(approval.id);return route;
}
export function getWorkflowRoute(sourceType:WorkflowScope,subjectId:string){ensureWorkflowInitialized();return workflowRoutes.filter(r=>r.sourceType===sourceType&&r.subjectId===subjectId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0]}
export function getRouteById(id:string){ensureWorkflowInitialized();return workflowRoutes.find(r=>r.id===id)}
export function getRuleById(id:string){return workflowRules.find(r=>r.id===id)}
export function getRouteApprovals(route:WorkflowRoute){return route.approvalIds.map(id=>approvals.find(a=>a.id===id)).filter(Boolean) as Approval[]}
export function invalidateWorkflowRoute(sourceType:WorkflowScope,subjectId:string,note="Input data changed"){
  const route=getWorkflowRoute(sourceType,subjectId);if(!route||route.status!=="active"&&route.status!=="approved")return;
  route.status="cancelled";route.history.unshift({id:eventId(),at:nowIso(),actor:"System",action:"cancelled",note});
  getRouteApprovals(route).filter(a=>a.status==="pending"||a.status==="queued").forEach(a=>a.status="cancelled");
}
function addApprovalEvent(approval:Approval,action:ApprovalDecisionEvent["action"],actor:string,note:string){approval.history??=[];approval.history.unshift({id:`ADE-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,at:nowIso(),actor,action,note})}
function routeEvent(route:WorkflowRoute,action:WorkflowRoute["history"][number]["action"],actor:string,note:string,approvalId?:string){route.history.unshift({id:eventId(),at:nowIso(),actor,action,note,approvalId})}
function unlockNext(route:WorkflowRoute){
  const rows=getRouteApprovals(route),pending=rows.find(a=>a.status==="pending");if(pending)return;
  const queued=rows.find(a=>a.status==="queued");
  if(queued){queued.status="pending";const hours=(queued.ruleIds??[]).map(id=>getRuleById(id)?.slaHours).filter((x):x is number=>typeof x==="number");queued.slaDueAt=afterHours(hours.length?Math.min(...hours):8);route.currentStep=queued.sequence??route.currentStep+1;return}
  if(rows.length&&rows.every(a=>a.status==="approved")){route.status="approved";route.currentStep=rows.length;routeEvent(route,"completed","System","All required approval steps completed")}
}
export function decideWorkflowApproval(id:string,decision:"approve"|"return"|"reject",actor:string,note=""){
  const approval=approvals.find(a=>a.id===id);if(!approval||approval.status!=="pending")return approval;
  const before=approval.status,route=approval.routeId?getRouteById(approval.routeId):undefined;
  approval.decisionBy=actor;approval.decisionNote=note;approval.resolvedAt=nowIso();
  if(decision==="approve"){
    approval.status="approved";addApprovalEvent(approval,"approved",actor,note||"Approved");if(route){routeEvent(route,"step-approved",actor,note||"Approval step completed",approval.id);unlockNext(route)}
  }else if(decision==="return"){
    approval.status="returned";addApprovalEvent(approval,"returned",actor,note||"Returned for revision");if(route){route.status="returned";routeEvent(route,"returned",actor,note||"Returned for revision",approval.id)}
  }else{
    approval.status="rejected";addApprovalEvent(approval,"rejected",actor,note||"Rejected");if(route){route.status="rejected";routeEvent(route,"rejected",actor,note||"Rejected",approval.id);getRouteApprovals(route).filter(a=>a.status==="queued").forEach(a=>a.status="cancelled")}
  }
  recordAudit({module:"approvals",action:"approval",entityType:"approval",entityId:approval.id,entityLabel:`${approval.type} · ${approval.dealId}`,route:"approvals?tab=inbox",field:"Decision",oldValue:before,newValue:approval.status,note:note||decision,actor,severity:decision==="reject"?"critical":decision==="return"?"warning":"info"});
  return approval;
}
export function approveWithCondition(id:string,actor:string,condition:string){
  const approval=approvals.find(a=>a.id===id);if(!approval||approval.status!=="pending")return approval;
  const before=approval.status;approval.status="approved";approval.condition=condition;approval.conditionStatus="open";approval.decisionBy=actor;approval.resolvedAt=nowIso();addApprovalEvent(approval,"conditional",actor,condition);
  const route=approval.routeId?getRouteById(approval.routeId):undefined;if(route){routeEvent(route,"conditional",actor,condition,approval.id);unlockNext(route)}
  recordAudit({module:"approvals",action:"approval",entityType:"approval",entityId:approval.id,entityLabel:`${approval.type} · ${approval.dealId}`,route:"approvals?tab=inbox",field:"Decision",oldValue:before,newValue:"approved with condition",note:condition,actor,severity:"warning"});return approval;
}
export function reassignApproval(id:string,actor:string,role:WorkflowRole,note:string){const a=approvals.find(x=>x.id===id);if(!a||a.status!=="pending")return a;const old=a.requiredRole;a.requiredRole=role;addApprovalEvent(a,"reassigned",actor,`${old??"—"} → ${role}${note?` · ${note}`:""}`);const route=a.routeId?getRouteById(a.routeId):undefined;if(route)routeEvent(route,"reassigned",actor,`${old??"—"} → ${role}${note?` · ${note}`:""}`,a.id);recordAudit({module:"approvals",action:"update",entityType:"approval",entityId:a.id,entityLabel:`${a.type} · ${a.dealId}`,route:"approvals?tab=inbox",field:"Assigned role",oldValue:old,newValue:role,note:note||"Approval reassigned",actor,severity:"warning"});return a}
export function requestApprovalDocument(id:string,actor:string,note:string){const a=approvals.find(x=>x.id===id);if(!a||a.status!=="pending")return a;addApprovalEvent(a,"document-request",actor,note);const route=a.routeId?getRouteById(a.routeId):undefined;if(route)routeEvent(route,"document-request",actor,note,a.id);recordAudit({module:"approvals",action:"document",entityType:"approval",entityId:a.id,entityLabel:`${a.type} · ${a.dealId}`,route:"approvals?tab=inbox",field:"Additional document",newValue:"Requested",note,actor,severity:"warning"});return a}
export function addApprovalComment(id:string,actor:string,note:string){const a=approvals.find(x=>x.id===id);if(!a)return a;addApprovalEvent(a,"comment",actor,note);const route=a.routeId?getRouteById(a.routeId):undefined;if(route)routeEvent(route,"comment",actor,note,a.id);return a}

export function ruleConditionValue(rule:WorkflowRule){return rule.value}
export function updateWorkflowRule(id:string,patch:Partial<Pick<WorkflowRule,"active"|"value"|"requiredRole"|"slaHours"|"priority"|"stepOrder">>){const r=workflowRules.find(x=>x.id===id);if(!r)return;r.active=patch.active??r.active;if(patch.value!==undefined)r.value=patch.value;if(patch.requiredRole)r.requiredRole=patch.requiredRole;if(patch.slaHours!==undefined)r.slaHours=Math.max(1,patch.slaHours);if(patch.priority)r.priority=patch.priority;if(patch.stepOrder!==undefined)r.stepOrder=Math.max(1,patch.stepOrder);return r}
export function addWorkflowRule(rule:Omit<WorkflowRule,"id">){const id=`WF-CUSTOM-${String(workflowRules.filter(r=>r.id.startsWith("WF-CUSTOM")).length+1).padStart(2,"0")}`;const created={...rule,id};workflowRules.push(created);return created}

export function workflowStats(){ensureWorkflowInitialized();const now=Date.now();return{pending:approvals.filter(a=>a.status==="pending").length,queued:approvals.filter(a=>a.status==="queued").length,activeRoutes:workflowRoutes.filter(r=>r.status==="active").length,slaBreached:approvals.filter(a=>a.status==="pending"&&a.slaDueAt&&new Date(a.slaDueAt).getTime()<now).length,activeRules:workflowRules.filter(r=>r.active).length}}

function dealContext(dealId:string,sourceType:WorkflowScope="deal",overrides:Partial<WorkflowContext>={}):WorkflowContext|undefined{
  const d=deals.find(x=>x.id===dealId);if(!d)return;const c=clients.find(x=>x.id===d.clientId),contract=contracts.find(x=>x.dealId===d.id),legal=legalCases.find(x=>x.dealId===d.id);
  return{sourceType,subjectId:dealId,dealId:d.id,title:d.id,clientName:d.clientName,propertyLabel:d.propertyLabel,requestedBy:d.manager,discountPercent:d.discount,amount:d.amount,currency:d.currency,installmentMonths:d.id==="DL-2026-00469"?24:d.financing==="installment"?18:undefined,buyerType:c?.type,hasRepresentative:d.participants.some(p=>p.role==="representative"),nonStandardClauses:contract?.nonStandardClauses??0,riskLevel:normalizeRisk(legal?.risk),assetCount:d.propertyIds?.length??1,...overrides};
}
export function ensureWorkflowInitialized(){
  if(initialized)return;initialized=true;
  // Keep resolved approvals as audit/history, and build live routes only for processes that are still awaiting a decision.
  const historical=approvals.filter(a=>["approved","returned","rejected","cancelled"].includes(a.status));
  approvals.splice(0,approvals.length,...historical);
  const packageDealRecord=deals.find(d=>d.id==="DL-2026-00469");
  if(packageDealRecord?.status==="approval"){const packageDeal=dealContext(packageDealRecord.id,"deal",{installmentMonths:24});if(packageDeal)createRouteInternal(packageDeal)}
  const representedRecord=deals.find(d=>d.id==="DL-2026-00481");
  if(representedRecord&&["approval","contract"].includes(representedRecord.status)){const representedContract=dealContext(representedRecord.id,"deal",{installmentMonths:18});if(representedContract)createRouteInternal(representedContract)}
  const restructure=restructureCases.find(r=>r.dealId==="DL-2026-00477"&&r.status==="approval");
  if(restructure){const paymentPlan=dealContext(restructure.dealId,"payment-plan",{subjectId:restructure.id,title:restructure.id,installmentMonths:24,discountPercent:3});if(paymentPlan){const route=createRouteInternal(paymentPlan);restructure.approvalId=route.approvalIds[0]}}
  // Keep one visibly overdue live SLA item so the operational control center has a realistic exception state.
  const firstPending=approvals.find(a=>a.status==="pending");if(firstPending)firstPending.slaDueAt=new Date(Date.now()-2*3600000).toISOString();
}
