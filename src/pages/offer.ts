import { leads, properties } from "../data/mock";
import { amd,propertyTypeLabel } from "../utils";
import { currentRoute, navigate } from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import { locale,t } from "../i18n";
import { closeOffer,getSalesFlowState,markOfferAccepted,markOfferSent,markOfferViewed,resetReservationPayment,updateOfferTerms,type OfferLifecycleStatus,type OfferPaymentPlan } from "../services/sales-flow";
import {createWorkflowRoute,getWorkflowRoute,invalidateWorkflowRoute} from "../services/workflow";
import {canAction,getRolePolicy} from "../services/permissions";

const paymentPlans:OfferPaymentPlan[]=["30-70","installment12","mortgage"];
const selectable=(id:string)=>properties.filter(p=>["available","offered","pre-reserved"].includes(p.status)||id&&getSalesFlowState(id).selectedPropertyIds.includes(p.id));
const defaultSelection=(leadId:string)=>{
  const available=properties.filter(p=>p.status==="available"&&p.type==="apartment");
  return leadId==="LD-26062"?available.slice(0,2).map(p=>p.id):available.slice(0,1).map(p=>p.id);
};
const discounted=(amount:number,discount:number)=>Math.round(amount*(1-discount/100));
const fmtDate=(iso?:string)=>iso?new Intl.DateTimeFormat(locale(),{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"—";
const statusClass=(status:OfferLifecycleStatus)=>status==="accepted"||status==="approved"?"success":status==="rejected"||status==="expired"||status==="cancelled"?"danger":status==="sent"||status==="viewed"?"warning":"accent";
const statusLabel=(status:OfferLifecycleStatus)=>t(`v46.offer.status.${status}`);

export function offerPage(leadId:string){
  const l=leads.find(x=>x.id===leadId);
  if(!l)return `<section class="page"><div class="card card-pad">${t("common.recordNotFound")}</div></section>`;
  const state=getSalesFlowState(l.id,defaultSelection(l.id),l.stage);
  const selectedIds=new Set(state.selectedPropertyIds);
  const pool=selectable(l.id);
  const selectedRows=state.selectedPropertyIds.map(id=>properties.find(p=>p.id===id)).filter(Boolean) as typeof properties;
  const rest=pool.filter(p=>!selectedIds.has(p.id));
  const apartments=rest.filter(p=>p.type==="apartment").slice(0,3),extras=rest.filter(p=>["parking","storage"].includes(p.type)).slice(0,3),other=rest.filter(p=>!["apartment","parking","storage"].includes(p.type)).slice(0,2);
  const candidates=[...selectedRows,...apartments,...extras,...other].filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,9);
  const total=selectedRows.reduce((sum,p)=>sum+p.totalPrice,0),final=discounted(total,state.discountPercent),primary=selectedRows[0];
  const rolePolicy=getRolePolicy(),discountLimit=rolePolicy.discountLimit??0,overRoleLimit=state.discountPercent>discountLimit;
  const approvalRoute=overRoleLimit?getWorkflowRoute("offer",l.id):undefined;
  if(approvalRoute?.status==="approved"&&state.offerStatus==="draft")state.offerStatus="approved";
  const locked=state.offerStatus==="accepted"||["active","converted"].includes(state.reservationStatus);
  return `<section class="page">
    <div class="breadcrumbs"><span>${t("leads")}</span><span>›</span><span>${l.name}</span><span>›</span><span>${t("offer.title")}</span></div>
    <div class="page-header"><div class="page-title"><div class="eyebrow">${t("offer.builder")}</div><h1>${t("offer.title")}</h1><p>${t("offer.subtitle",{name:l.name,id:l.id})}</p></div><div class="toolbar"><button class="btn" id="backLead">${t("offer.backToLead")}</button><button class="btn" id="editOfferTerms" ${locked?"disabled":""}>${t("v46.offer.editTerms")}</button><button class="btn" id="previewOfferPdf">${t("offer.previewPdf")}</button>${offerPrimaryAction(state.offerStatus,locked,state.discountPercent,discountLimit,approvalRoute?.status)}</div></div>

    <div class="sales-flow-statusbar">
      <div class="sales-flow-current"><span>${t("v46.offer.lifecycle")}</span><strong>${statusLabel(state.offerStatus)}</strong><small>${t("v46.offer.validThrough")}: ${fmtDate(state.offerValidUntil)}</small></div>
      ${offerLifecycle(state.offerStatus)}
      <span class="status ${statusClass(state.offerStatus)}">${statusLabel(state.offerStatus)}</span>
    </div>

    ${state.offerClosedReason?`<div class="sales-flow-alert danger"><b>!</b><div><strong>${t("v46.offer.closedReason")}</strong><span>${state.offerClosedReason}</span></div></div>`:""}
    ${locked?`<div class="sales-flow-alert"><b>i</b><div><strong>${t("v46.offer.lockedTitle")}</strong><span>${t("v46.offer.lockedText")}</span></div></div>`:""}

    ${overRoleLimit?offerApprovalBanner(approvalRoute?.status,approvalRoute?.id,state.discountPercent,discountLimit):""}

    <div class="package-flow-banner">
      <div class="package-flow-icon">▦</div><div><span>${t("v45.package.mode")}</span><strong>${t("v45.package.offerTitle")}</strong><p>${t("v45.package.offerText")}</p></div>
      <div class="package-flow-stats"><div><span>${t("v45.package.assets")}</span><strong id="packageAssetCount">${selectedRows.length}</strong></div><div><span>${t("v45.package.listValue")}</span><strong id="packageListValue">${amd(total)}</strong></div><div><span>${t("v45.package.saving")}</span><strong id="packageSaving">${amd(total-final)}</strong></div></div>
    </div>

    <div class="offer-layout">
      <div class="card card-pad">
        <div class="section-title"><div><h2>${t("offer.propertiesTitle")}</h2><p>${t("v45.package.selectMix")}</p></div><span class="chip accent" id="offerSelectedCount">${t("offer.selectedCount",{count:selectedRows.length})}</span></div>
        <div class="package-type-hint"><span>${t("enum.propertyType.apartment")}</span><span>+</span><span>${t("enum.propertyType.parking")}</span><span>+</span><span>${t("enum.propertyType.storage")}</span><small>${t("v45.package.orAnyMix")}</small></div>
        ${candidates.length?candidates.map(p=>`<button type="button" class="offer-property package-option ${selectedIds.has(p.id)?"selected":""}" data-offer-unit="${p.id}" aria-pressed="${selectedIds.has(p.id)?"true":"false"}" ${locked?"disabled":""}><div class="property-thumb"><span>${propertyTypeLabel(p.type)}</span><b>${p.unit}</b></div><div><div class="package-option-head"><strong>${p.project} · ${p.unit}</strong><span class="chip">${propertyTypeLabel(p.type)}</span></div><div class="u-meta-11 u-mt-5">${t("offer.propertyMeta",{rooms:p.rooms,area:p.area,floor:p.floor,building:p.building})}</div><div class="u-meta-11 u-mt-4">${p.phase} · ${p.entrance}</div></div><div class="u-text-right"><strong>${amd(p.totalPrice)}</strong><div class="u-mt-6"><span class="chip success">${t("offer.available")}</span></div></div></button>`).join(""):`<div class="empty compact-empty">${t("offer.noAvailableProperties")}</div>`}
      </div>

      <aside class="card card-pad package-summary-card">
        <div class="section-title"><div><h2>${t("v45.package.summary")}</h2><p>${t("v46.offer.validUntilDynamic",{date:fmtDate(state.offerValidUntil)})}</p></div>${selectedRows.length>1?`<span class="status accent">${t("v45.package.bundle")}</span>`:""}</div>
        <div id="offerPackageLines" class="package-summary-lines">${packageLines(selectedRows)}</div>
        <div class="divider"></div>
        <div class="info-box"><span>${t("offer.primaryProperty")}</span><strong id="offerPrimaryProperty">${primary?`${primary.project} · ${primary.unit}`:"—"}</strong></div>
        <div class="info-box u-mt-9"><span>${t("offer.selectedValue")}</span><strong id="offerBasePrice">${amd(total)}</strong></div>
        <div class="info-box u-mt-9"><span>${t("offer.discount")}</span><strong id="offerDiscount">${state.discountPercent}% · ${!overRoleLimit?t("v46.offer.withinLimit"):t("v46.offer.overLimit")}</strong></div>
        <div class="u-section-kicker">${t("offer.paymentScenarios")}</div>
        <button type="button" class="payment-option ${state.paymentPlan==="30-70"?"selected":""}" data-payment-plan="30-70" aria-pressed="${state.paymentPlan==="30-70"}" ${locked?"disabled":""}><strong>${t("offer.plan3070")}</strong><div class="u-meta-11 u-mt-5">${t("offer.plan3070Desc")}</div></button>
        <button type="button" class="payment-option ${state.paymentPlan==="installment12"?"selected":""}" data-payment-plan="installment12" aria-pressed="${state.paymentPlan==="installment12"}" ${locked?"disabled":""}><strong>${t("offer.installment12")}</strong><div class="u-meta-11 u-mt-5">${t("offer.installmentDesc")}</div></button>
        <button type="button" class="payment-option ${state.paymentPlan==="mortgage"?"selected":""}" data-payment-plan="mortgage" aria-pressed="${state.paymentPlan==="mortgage"}" ${locked?"disabled":""}><strong>${t("offer.mortgage")}</strong><div class="u-meta-11 u-mt-5">${t("offer.mortgageDesc")}</div></button>
        <div class="divider"></div>
        <div class="package-price-total"><div><span>${t("v45.package.packagePrice")}</span><div class="price-big" id="offerFinalPrice">${amd(final)}</div></div><div class="package-saving"><span>${t("v45.package.saving")}</span><strong id="offerSaving">${amd(total-final)}</strong></div></div>
      </aside>
    </div>

    <div class="grid grid-2 u-mt-16">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("v46.offer.clientResponse")}</h2><p>${t("v46.offer.clientResponseSub")}</p></div></div>${responsePanel(state.offerStatus)}</div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("v46.offer.history")}</h2><p>${t("v46.offer.historySub")}</p></div></div><div class="sales-flow-history">${state.history.filter(x=>x.kind==="offer").slice(0,6).map(x=>historyRow(x.at,statusLabel(x.status as OfferLifecycleStatus),x.note,x.actor)).join("")}</div></div>
    </div>
  </section>`;
}

function offerPrimaryAction(status:OfferLifecycleStatus,locked:boolean,discount:number,limit:number,routeStatus?:string){
  if(status==="accepted")return `<button class="btn btn-accent" id="goReservation">${t("v46.offer.goReservation")}</button>`;
  if(["rejected","cancelled","expired"].includes(status))return `<button class="btn btn-accent" id="restartOffer" ${locked?"disabled":""}>${t("v46.offer.createNewVersion")}</button>`;
  if(status==="sent"||status==="viewed")return `<button class="btn btn-danger-soft" id="cancelOffer">${t("v46.offer.cancel")}</button>`;
  if(discount>limit&&routeStatus==="active")return `<button class="btn btn-accent" id="openOfferWorkflow">${t("v47.offer.openApproval")}</button>`;
  if(discount>limit&&routeStatus!=="approved")return `<button class="btn btn-accent" id="requestOfferApproval" ${locked?"disabled":""}>${t("v47.offer.requestApproval")}</button>`;
  return `<button class="btn btn-accent" id="sendOffer" ${locked?"disabled":""}>${t("offer.send")}</button>`;
}
function offerLifecycle(status:OfferLifecycleStatus){const steps:[OfferLifecycleStatus,string][]=[["draft",t("v46.offer.step.prepared")],["approved",t("v47.offer.step.approved")],["sent",t("v46.offer.step.sent")],["viewed",t("v46.offer.step.viewed")],["accepted",t("v46.offer.step.decision")]];const order=["draft","approved","sent","viewed","accepted"] as OfferLifecycleStatus[];const idx=order.indexOf(status);return `<div class="mini-lifecycle">${steps.map(([key,label],i)=>`<div class="mini-life-step ${["rejected","cancelled","expired"].includes(status)?(i===0?"done":""):i<=Math.max(0,idx)?"done":""} ${key===status?"active":""}"><i></i><span>${label}</span></div>`).join("")}</div>`}
function offerApprovalBanner(status:string|undefined,routeId:string|undefined,discount:number,limit:number){
  if(status==="approved")return `<div class="sales-flow-alert success"><b>✓</b><div><strong>${t("v47.offer.approvedTitle")}</strong><span>${t("v47.offer.approvedText",{discount})}${routeId?` · ${routeId}`:""}</span></div></div>`;
  if(status==="active")return `<div class="sales-flow-alert warning"><b>↗</b><div><strong>${t("v47.offer.inApprovalTitle")}</strong><span>${t("v47.offer.inApprovalText",{discount})}${routeId?` · ${routeId}`:""}</span></div><button class="btn" id="openOfferWorkflow">${t("v47.offer.openApproval")}</button></div>`;
  return `<div class="sales-flow-alert warning"><b>!</b><div><strong>${t("v47.offer.approvalRequiredTitle")}</strong><span>${t("v47.offer.approvalRequiredText",{discount,limit})}</span></div></div>`;
}
function responsePanel(status:OfferLifecycleStatus){
  if(status==="sent")return `<div class="response-state waiting"><div class="response-icon">↗</div><div><strong>${t("v46.offer.awaitingView")}</strong><p>${t("v46.offer.awaitingViewText")}</p></div></div><div class="response-actions"><button class="btn btn-soft" id="markOfferViewed">${t("v46.offer.markViewed")}</button><button class="btn btn-success" id="acceptOffer">${t("v46.offer.acceptDemo")}</button><button class="btn btn-danger-soft" id="rejectOffer">${t("v46.offer.rejectDemo")}</button></div>`;
  if(status==="viewed")return `<div class="response-state"><div class="response-icon">◉</div><div><strong>${t("v46.offer.viewedAwaitingDecision")}</strong><p>${t("v46.offer.viewedAwaitingDecisionText")}</p></div></div><div class="response-actions"><button class="btn btn-success" id="acceptOffer">${t("v46.offer.acceptDemo")}</button><button class="btn btn-danger-soft" id="rejectOffer">${t("v46.offer.rejectDemo")}</button></div>`;
  if(status==="accepted")return `<div class="response-state success"><div class="response-icon">✓</div><div><strong>${t("v46.offer.acceptedTitle")}</strong><p>${t("v46.offer.acceptedText")}</p></div></div><button class="btn btn-accent u-mt-12" id="goReservationSecondary">${t("v46.offer.goReservation")}</button>`;
  if(status==="rejected")return `<div class="response-state danger"><div class="response-icon">×</div><div><strong>${t("v46.offer.rejectedTitle")}</strong><p>${t("v46.offer.rejectedText")}</p></div></div>`;
  if(status==="cancelled")return `<div class="response-state danger"><div class="response-icon">×</div><div><strong>${t("v46.offer.cancelledTitle")}</strong><p>${t("v46.offer.cancelledText")}</p></div></div>`;
  if(status==="expired")return `<div class="response-state danger"><div class="response-icon">⌛</div><div><strong>${t("v46.offer.expiredTitle")}</strong><p>${t("v46.offer.expiredText")}</p></div></div>`;
  return `<div class="response-state"><div class="response-icon">✦</div><div><strong>${t("v46.offer.draftTitle")}</strong><p>${t("v46.offer.draftText")}</p></div></div>`;
}
function historyRow(at:string,status:string,note:string,actor:string){return `<div class="sales-history-row"><i></i><div><span>${fmtDate(at)}</span><strong>${status}</strong><p>${note}</p><small>${actor}</small></div></div>`}
function packageLines(rows:typeof properties){return rows.length?rows.map((p,i)=>`<div class="package-summary-line"><div><span>${String(i+1).padStart(2,"0")} · ${propertyTypeLabel(p.type)}</span><strong>${p.unit}</strong></div><b>${amd(p.totalPrice)}</b></div>`).join(""):`<div class="empty compact-empty">${t("v45.package.chooseAssets")}</div>`}
function selectedProperties(){return [...document.querySelectorAll<HTMLElement>("[data-offer-unit].selected")].map(el=>properties.find(p=>p.id===el.dataset.offerUnit)).filter(Boolean) as (typeof properties)[number][]}
function updateOfferSummary(leadId:string){
  const state=getSalesFlowState(leadId),selected=selectedProperties();state.selectedPropertyIds=selected.map(p=>p.id);state.offerStatus="draft";state.offerSent=false;
  const total=selected.reduce((sum,p)=>sum+p.totalPrice,0),final=discounted(total,state.discountPercent),primary=selected[0];
  const set=(q:string,v:string)=>{const el=document.querySelector<HTMLElement>(q);if(el)el.textContent=v};
  set("#offerSelectedCount",t("offer.selectedCount",{count:selected.length}));set("#offerPrimaryProperty",primary?`${primary.project} · ${primary.unit}`:"—");set("#offerBasePrice",amd(total));set("#offerFinalPrice",amd(final));set("#offerSaving",amd(total-final));set("#packageAssetCount",String(selected.length));set("#packageListValue",amd(total));set("#packageSaving",amd(total-final));
  const lines=document.querySelector<HTMLElement>("#offerPackageLines");if(lines)lines.innerHTML=packageLines(selected);
}

export function bindOffer(){
  const id=currentRoute().split("/")[1],lead=leads.find(x=>x.id===id);if(!lead)return;const state=getSalesFlowState(id);
  document.querySelector("#backLead")?.addEventListener("click",()=>navigate("lead/"+id));
  document.querySelectorAll("#goReservation,#goReservationSecondary").forEach(el=>el.addEventListener("click",()=>navigate("reservation/"+id)));
  document.querySelector("#editOfferTerms")?.addEventListener("click",()=>openOfferTerms(id));
  document.querySelectorAll("#openOfferWorkflow").forEach(el=>el.addEventListener("click",()=>navigate("approvals?tab=routes")));
  document.querySelector("#requestOfferApproval")?.addEventListener("click",()=>{const selected=selectedProperties();if(!selected.length){toastLocalized(t("offer.chooseAtLeastOne"));return}state.selectedPropertyIds=selected.map(p=>p.id);const total=selected.reduce((sum,p)=>sum+p.totalPrice,0),final=discounted(total,state.discountPercent),months=state.paymentPlan==="installment12"?12:undefined;const route=createWorkflowRoute({sourceType:"offer",subjectId:id,dealId:`OFF-${id}`,title:`${t("offer.title")} · ${id}`,clientName:lead.name,propertyLabel:selected.map(p=>p.unit).join(" + "),requestedBy:lead.manager,discountPercent:state.discountPercent,amount:final,currency:"AMD",installmentMonths:months,assetCount:selected.length,riskLevel:"low"});toastLocalized(t("v47.offer.routeCreated",{route:route.id}));navigate("approvals?tab=inbox")});
  document.querySelector("#restartOffer")?.addEventListener("click",()=>{state.offerStatus="draft";state.offerSent=false;state.offerClosedReason=undefined;state.offerValidUntil=new Date(Date.now()+5*86400000).toISOString();toastLocalized(t("v46.offer.newVersionReady"));refresh(id)});
  document.querySelector("#previewOfferPdf")?.addEventListener("click",()=>{
    const selected=selectedProperties();if(!selected.length){toastLocalized(t("offer.chooseAtLeastOne"));return}
    const w=window.open("","_blank","width=900,height=720");if(!w){toastLocalized(t("offer.popupBlocked"));return}
    const total=selected.reduce((sum,p)=>sum+p.totalPrice,0),final=discounted(total,state.discountPercent);
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t("offer.previewTitle")}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#18212b}h1{margin:0 0 8px}.muted{color:#6b7280}.item{display:grid;grid-template-columns:1fr auto;gap:20px;border-bottom:1px solid #ddd;padding:14px 0}.item small{display:block;color:#6b7280;margin-top:4px}.total{margin-top:28px;font-size:22px;font-weight:700}.saving{color:#157347;margin-top:8px}</style></head><body><h1>${t("offer.previewBrandTitle")}</h1><div class="muted">${lead.name} · ${new Date().toLocaleDateString(locale())}</div><div class="muted">${t("v46.offer.validThrough")}: ${fmtDate(state.offerValidUntil)}</div><h2 style="margin-top:34px">${t("v45.package.packageComposition")}</h2>${selected.map(p=>`<div class="item"><span>${p.project} · ${p.unit}<small>${propertyTypeLabel(p.type)} · ${p.area} m²</small></span><strong>${amd(p.totalPrice)}</strong></div>`).join("")}<div class="total">${t("v45.package.packagePrice")}: ${amd(final)}</div><div class="saving">${t("offer.discount")}: ${state.discountPercent}% · ${t("v45.package.saving")}: ${amd(total-final)}</div><p class="muted">${t("offer.demoPreview")}</p></body></html>`);w.document.close();w.focus();toastLocalized(t("offer.previewOpened"));
  });
  document.querySelector("#sendOffer")?.addEventListener("click",()=>{
    const selected=selectedProperties();if(!selected.length){toastLocalized(t("offer.chooseAtLeastOne"));return}
    const discountLimit=getRolePolicy().discountLimit??0;
    if(state.discountPercent>discountLimit&&getWorkflowRoute("offer",id)?.status!=="approved"){toastLocalized(t("v47.offer.approvalStillRequired"));navigate("approvals?tab=inbox");return}
    state.selectedPropertyIds=selected.map(p=>p.id);markOfferSent(id);selected.forEach(p=>{if(p.status==="available")p.status="offered"});lead.stage="offer";lead.lastActivity="i18n:leads.activity.now";lead.nextAction="i18n:v46.offer.nextClientDecision";
    toastLocalized(selected.length>1?t("v45.package.offerSent",{count:selected.length}):t("offer.sent"));refresh(id);
  });
  document.querySelector("#markOfferViewed")?.addEventListener("click",()=>{markOfferViewed(id);lead.nextAction="i18n:v46.offer.nextDecision";toastLocalized(t("v46.offer.viewedToast"));refresh(id)});
  document.querySelector("#acceptOffer")?.addEventListener("click",()=>{markOfferAccepted(id);state.selectedPropertyIds.forEach(pid=>{const p=properties.find(x=>x.id===pid);if(p&&["available","offered"].includes(p.status))p.status="pre-reserved"});lead.nextAction="i18n:reservation.check.created";toastLocalized(t("v46.offer.acceptedToast"));refresh(id)});
  document.querySelector("#rejectOffer")?.addEventListener("click",()=>openCloseOffer(id,"rejected"));
  document.querySelector("#cancelOffer")?.addEventListener("click",()=>openCloseOffer(id,"cancelled"));
  document.querySelectorAll<HTMLElement>("[data-offer-unit]").forEach(el=>el.addEventListener("click",()=>{
    if(["active","converted"].includes(state.reservationStatus)){toastLocalized(t("v46.offer.lockedEditToast"));return}
    if(state.reservationPaid){state.reservedPropertyIds.forEach(pid=>{const p=properties.find(x=>x.id===pid);if(p?.status==="reserved")p.status="available"});resetReservationPayment(id)}
    invalidateWorkflowRoute("offer",id,"Offer asset composition changed");state.offerStatus="draft";el.classList.toggle("selected");el.setAttribute("aria-pressed",String(el.classList.contains("selected")));updateOfferSummary(id);
  }));
  document.querySelectorAll<HTMLElement>("[data-payment-plan]").forEach(el=>el.addEventListener("click",()=>{
    if(["active","converted"].includes(state.reservationStatus))return;
    invalidateWorkflowRoute("offer",id,"Offer payment scenario changed");document.querySelectorAll<HTMLElement>("[data-payment-plan]").forEach(x=>{x.classList.remove("selected");x.setAttribute("aria-pressed","false")});el.classList.add("selected");el.setAttribute("aria-pressed","true");state.paymentPlan=(el.dataset.paymentPlan??"30-70") as OfferPaymentPlan;state.offerStatus="draft";state.offerSent=false;
  }));
}

function openOfferTerms(id:string){if(!canAction("deal.discount")){toastLocalized(t("v54.toast.noPermission"));return}const st=getSalesFlowState(id),limit=getRolePolicy().discountLimit??0;const days=Math.max(1,Math.ceil((new Date(st.offerValidUntil).getTime()-Date.now())/86400000));openLocalizedModal(t("v46.offer.editTerms"),`<form id="offerTermsForm" class="form-grid"><div class="form-field"><label>${t("offer.discount")}</label><div class="input-suffix"><input name="discount" type="number" min="0" max="30" step="0.5" value="${st.discountPercent}" required><span>%</span></div><small>${t("v54.offer.roleLimit",{limit})}</small></div><div class="form-field"><label>${t("v46.offer.validDays")}</label><input name="days" type="number" min="1" max="30" value="${days}" required></div><div class="full sales-flow-modal-note">${t("v46.offer.termsNote")}</div></form>`,`<button class="btn" data-modal-close>${t("application.cancel")}</button><button class="btn btn-accent" id="saveOfferTerms">${t("v43.common.save")}</button>`);setTimeout(()=>document.querySelector("#saveOfferTerms")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#offerTermsForm")!;if(!f.reportValidity())return;invalidateWorkflowRoute("offer",id,"Offer commercial terms changed");updateOfferTerms(id,Number(formValue(f,"discount")),Number(formValue(f,"days")));closeModal();toastLocalized(t("v46.offer.termsSaved"));refresh(id)}),0)}
function openCloseOffer(id:string,status:"rejected"|"cancelled"){openLocalizedModal(status==="rejected"?t("v46.offer.rejectTitle"):t("v46.offer.cancelTitle"),`<form id="closeOfferForm" class="form-grid"><div class="form-field full"><label>${t("v46.common.reason")}</label><textarea name="reason" rows="4" required placeholder="${status==="rejected"?t("v46.offer.rejectPlaceholder"):t("v46.offer.cancelPlaceholder")}"></textarea></div></form>`,`<button class="btn" data-modal-close>${t("application.cancel")}</button><button class="btn btn-danger" id="confirmCloseOffer">${status==="rejected"?t("v46.offer.confirmReject"):t("v46.offer.confirmCancel")}</button>`);setTimeout(()=>document.querySelector("#confirmCloseOffer")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#closeOfferForm")!;if(!f.reportValidity())return;const state=closeOffer(id,status,formValue(f,"reason"));state.selectedPropertyIds.forEach(pid=>{const p=properties.find(x=>x.id===pid);if(p&&["offered","pre-reserved"].includes(p.status))p.status="available"});closeModal();toastLocalized(status==="rejected"?t("v46.offer.rejectedToast"):t("v46.offer.cancelledToast"));refresh(id)}),0)}
function refresh(id:string){navigate("lead/"+id);setTimeout(()=>navigate("offer/"+id),20)}
