import{currentRoute}from"../router";
import{t}from"../i18n";
import{canAction,canEditModule,currentRole,getRolePolicy,moduleForRoute,type PermissionAction,type PlatformModule}from"./permissions";

const moduleMutationSelectors:Partial<Record<PlatformModule,string[]>>={
  leads:["#newLead","#importLeads","#editLead","#createOffer","#acceptOffer","#cancelOffer","#extendReservation","#cancelReservation","#applicationAddParty"],
  clients:["#newClient","#importClients","#newClientDeal","#editClient","#mergeDuplicate","#keepSeparate","[data-demo-action]","#finalizeKyc"],
  properties:["#addProperty","#newPriceList","#changePrice","#changeStatus","#addPropertyDocument","#applyPriceVersion","[data-edit-property]"],
  deals:["#newDeal","#newDealApproval","#addDealParticipant","#configurePackage","#nextDealStage","[data-edit-deal]"],
  payments:["#importStatement","[data-confirm-recon]","[data-manual-recon]","[data-allocate-advance]","[data-refund-advance]","#advanceRestructure"],
  approvals:["[data-action]","#addWorkflowRule","[data-rule-edit]","[data-rule-toggle]"],
  tasks:["#newTask","[data-task-start]","[data-task-action]"],
  contracts:["#newContract","#newTemplate","#newContractTemplate","#newContractVersion","#addDeviation","#confirmSigner","#generateContract","[data-sign]","[data-contract-action]"],
  legal:["#newLegalCase","#newPoa","#finalizeLegalReview","#poaSuspend","#poaReactivate","#poaRevoke","#editPoaActions","[data-legal-check]"],
  finance:["#editRates","#newSecurity","[data-security-release]"],
  mortgages:["#newMortgage","#advanceMortgage","[data-mortgage-action]"],
  registration:["#newRegistration","#advanceRegistration","#confirmFee","#addRegistrationDoc","#confirmRegReject","#confirmRegistrationDone","[data-registration-action]"],
  handover:["#newHandover","#generateAct","#newDefect","#completeInspection","[data-defect-action]","[data-handover-action]"],
  service:["#newWarranty","#completeWarrantyWork","#confirmWarrantyClient","#escalateWarranty","#rateWarranty","[data-warranty-action]"],
  reports:["#exportReport"]
};
const actionSelectors:Partial<Record<PermissionAction,string[]>>={
  "client.merge":["#mergeDuplicate","#keepSeparate"],
  "client.kyc":["#finalizeKyc","[data-kyc-check]","#saveKycDecision","#saveKycCheck"],
  "property.price":["#changePrice","#newPriceList","#applyPriceVersion","#quickPrice"],
  "property.status":["#changeStatus","#lifecycleChangeStatus"],
  "deal.discount":["#editOfferTerms","#offerDiscount","[data-package-discount]"],
  "deal.stage":["#nextDealStage"],
  "approval.decide":["[data-action=\"approve\"]","[data-action=\"condition\"]","[data-action=\"return\"]","[data-action=\"reject\"]","[data-action=\"request-document\"]"],
  "approval.reassign":["[data-action=\"reassign\"]"],
  "approval.rules":["#addWorkflowRule","[data-rule-edit]","[data-rule-toggle]","#saveWorkflowRule"],
  "contract.edit":["#newContract","#newContractVersion","#addDeviation"],
  "contract.templates":["#newTemplate","#newContractTemplate","#newTemplateVersion","#saveTemplate","#activateTemplate"],
  "contract.sign":["#confirmSigner","[data-sign]","#uploadSignedCopy"],
  "legal.review":["#newLegalCase","#finalizeLegalReview","[data-legal-check]"],
  "legal.poa":["#newPoa","#poaSuspend","#poaReactivate","#poaRevoke","#editPoaActions"],
  "finance.payment":["[data-allocate-advance]","[data-refund-advance]"],
  "finance.bank-confirm":["#importStatement","[data-confirm-recon]","[data-manual-recon]"],
  "finance.fx":["#editRates","#saveRates"],
  "finance.security":["#newSecurity","[data-security-release]"],
  "finance.schedule":["#advanceRestructure","[data-restructure-action]"],
  "mortgage.manage":["#newMortgage","#advanceMortgage","[data-mortgage-action]"],
  "registration.manage":["#newRegistration","#advanceRegistration","#confirmFee","#addRegistrationDoc","#confirmRegReject","#confirmRegistrationDone","[data-registration-action]"],
  "handover.manage":["#newHandover","#generateAct","#newDefect","#completeInspection","[data-defect-action]","[data-handover-action]"],
  "service.manage":["#newWarranty","#completeWarrantyWork","#confirmWarrantyClient","#escalateWarranty","#rateWarranty","[data-warranty-action]"],
  "task.manage":["#newTask","[data-task-start]"],
  "task.reassign":["[data-task-reassign]"],
  "report.export":["#exportReport"],
  "data.export":["[data-export-sensitive]"]
};
function lockElement(el:HTMLElement,reason:string){
  el.classList.add("permission-locked");el.setAttribute("aria-disabled","true");el.setAttribute("data-permission-lock",reason);el.title=reason;
  if(el instanceof HTMLButtonElement||el instanceof HTMLInputElement||el instanceof HTMLSelectElement||el instanceof HTMLTextAreaElement)el.disabled=true;
  else{el.tabIndex=-1;el.addEventListener("click",event=>{event.preventDefault();event.stopImmediatePropagation()},true)}
}
function lockSelectors(selectors:string[],reason:string){selectors.forEach(selector=>{try{document.querySelectorAll<HTMLElement>(selector).forEach(el=>lockElement(el,reason))}catch{}})}
function mask(kind:"personal"|"financial"){
  document.querySelectorAll<HTMLElement>(`[data-sensitive="${kind}"]`).forEach(el=>{el.classList.add("sensitive-masked");el.dataset.maskedLabel=t(kind==="personal"?"v54.mask.personal":"v54.mask.financial")});
}
export function applyPermissionUi(){
  const role=currentRole(),module=moduleForRoute(currentRoute()),policy=getRolePolicy(role),access=policy.modules[module];
  document.body.dataset.permissionRole=role;document.body.dataset.permissionLevel=access;
  if(!canEditModule(module,role))lockSelectors(moduleMutationSelectors[module]??[],t("v54.lock.readonly"));
  (Object.keys(actionSelectors) as PermissionAction[]).forEach(action=>{if(!canAction(action,role))lockSelectors(actionSelectors[action]??[],t("v54.lock.permission"))});
  if(!canAction("client.personal",role))mask("personal");if(!canAction("client.financial",role))mask("financial");
  const page=document.querySelector<HTMLElement>(".page");if(page&&access==="view"){page.classList.add("permission-readonly-page");const banner=document.createElement("div");banner.className="page-permission-banner readonly";banner.innerHTML=`<span>◉</span><div><strong>${t("v54.banner.readonly")}</strong><p>${t("v54.banner.readonlySub")}</p></div>`;page.prepend(banner)}
}
