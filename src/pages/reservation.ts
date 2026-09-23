import {leads,properties} from "../data/mock";
import {amd,propertyTypeLabel} from "../utils";
import {currentRoute,navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {locale,t} from "../i18n";
import {activateReservation,closeReservation,extendReservation,getSalesFlowState,restartReservation,type ReservationLifecycleStatus} from "../services/sales-flow";

const feeFor=(type:string)=>["apartment","house","commercial","office"].includes(type)?1000000:type==="parking"?300000:type==="storage"?200000:500000;
const fmtDate=(iso?:string)=>iso?new Intl.DateTimeFormat(locale(),{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso)):"—";
const reservationStatusLabel=(status:ReservationLifecycleStatus)=>t(`v46.reservation.status.${status}`);
const reservationStatusClass=(status:ReservationLifecycleStatus)=>status==="active"||status==="converted"?"success":status==="draft"?"warning":"danger";
let countdownTimer:number|undefined;

export function reservationPage(id?:string){
  const leadId=id??currentRoute().split("/")[1],l=leads.find(x=>x.id===leadId);
  if(!l)return `<section class="page"><div class="card card-pad">${t("common.recordNotFound")}</div></section>`;
  const fallback=properties.find(x=>x.status==="available"),flow=getSalesFlowState(leadId,fallback?[fallback.id]:[],l.stage);
  const rows=flow.selectedPropertyIds.map(pid=>properties.find(x=>x.id===pid)).filter(Boolean) as typeof properties;
  if(!rows.length)return `<section class="page"><div class="card card-pad">${t("reservation.noProperty")}</div></section>`;
  if(flow.reservationStatus==="expired")releaseAssets(rows);
  const paid=flow.reservationPaid,total=rows.reduce((s,p)=>s+p.totalPrice,0),fee=rows.reduce((s,p)=>s+feeFor(p.type),0),allAvailable=rows.every(p=>["available","offered","pre-reserved","reserved"].includes(p.status));
  const offerAccepted=flow.offerStatus==="accepted",canManage=["draft","active"].includes(flow.reservationStatus)&&offerAccepted;
  return `<section class="page">
    <div class="breadcrumbs"><span>${t("nav.sales")}</span><span>›</span><span>${l.name}</span><span>›</span><span>${t("reservation.title")}</span></div>
    <div class="page-header"><div class="page-title"><div class="eyebrow">${t("reservation.eyebrow")}</div><h1>${t("reservation.title")}</h1><p>${rows.length>1?t("v45.package.reservationSubtitle",{count:rows.length}):t("reservation.subtitle")}</p></div><div class="toolbar"><button class="btn" id="backOffer">${t("reservation.backOffer")}</button>${canManage?`<button class="btn" id="extendReservation">${t("v46.reservation.extend")}</button><button class="btn btn-danger-soft" id="cancelReservation">${t("v46.reservation.cancel")}</button>`:""}${["cancelled","released","expired"].includes(flow.reservationStatus)&&offerAccepted?`<button class="btn btn-accent" id="restartReservation">${t("v46.reservation.restart")}</button>`:""}<button class="btn btn-accent" id="toApplication" ${flow.reservationStatus!=="active"||!paid?"disabled":""}>${t("reservation.toApplication")}</button></div></div>

    ${!offerAccepted?`<div class="sales-flow-alert danger"><b>!</b><div><strong>${t("v46.reservation.offerRequiredTitle")}</strong><span>${t("v46.reservation.offerRequiredText")}</span></div><button class="btn" id="returnToOffer">${t("v46.reservation.returnOffer")}</button></div>`:""}
    ${flow.reservationClosedReason?`<div class="sales-flow-alert danger"><b>!</b><div><strong>${t("v46.reservation.closedReason")}</strong><span>${flow.reservationClosedReason}</span></div></div>`:""}

    <div class="reservation-banner u-mb-16 ${flow.reservationStatus}"><div><span class="package-kicker">${rows.length>1?t("v45.package.bundleReservation"):t("reservation.title")}</span><strong>${t("v46.reservation.activeUntil",{date:fmtDate(flow.reservationExpiresAt)})}</strong><div class="u-meta-11 u-mt-5">${t("reservation.expiryNote")}</div></div><div><div class="u-overline-muted">${t("reservation.remaining")}</div><div class="countdown" id="reservationCountdown" data-expiry="${["draft","active"].includes(flow.reservationStatus)?flow.reservationExpiresAt??"":""}">${["draft","active"].includes(flow.reservationStatus)?countdownText(flow.reservationExpiresAt):"—"}</div></div><span class="status ${reservationStatusClass(flow.reservationStatus)}">${reservationStatusLabel(flow.reservationStatus)}</span></div>
    <div class="package-reservation-strip"><div><span>${t("v45.package.assets")}</span><strong>${rows.length}</strong></div><div><span>${t("v45.package.listValue")}</span><strong>${amd(total)}</strong></div><div><span>${t("reservation.fee")}</span><strong>${amd(fee)}</strong></div><div><span>${t("reservation.responsible")}</span><strong>${l.manager}</strong></div></div>
    <div class="grid grid-2">
      <div class="card card-pad">
        <div class="section-title"><div><h2>${t("v45.package.reservedAssets")}</h2><p>${t("v45.package.oneReservationAllAssets")}</p></div><span class="status ${paid?"success":"warning"}" id="reservationPaymentStatus">${paid?t("reservation.paid"):t("reservation.awaitingPayment")}</span></div>
        <div class="package-reservation-list">${rows.map((p,i)=>`<div class="package-reservation-item"><div class="package-index">${String(i+1).padStart(2,"0")}</div><div><span>${propertyTypeLabel(p.type)}</span><strong>${p.project} · ${p.unit}</strong><small>${p.area} m² · ${p.phase} · ${p.building}/${p.entrance}</small></div><div class="package-reservation-price"><strong>${amd(p.totalPrice)}</strong><span>${t("v45.package.reservationFee")}: ${amd(feeFor(p.type))}</span><small class="reservation-unit-status">${t("v46.reservation.assetStatus")}: ${t(`status.${p.status}`)}</small></div></div>`).join("")}</div>
        <div class="divider"></div><div class="u-copy-soft"><strong>${t("reservation.refundLabel")}</strong> ${t("reservation.refundTerms")}</div>
      </div>
      <div class="card card-pad">
        <div class="section-title"><div><h2>${t("reservation.control")}</h2><p>${t("v45.package.packageChecks")}</p></div></div>
        ${check(t("v45.package.allAssetsAvailable"),allAvailable)}${check(t("reservation.check.offerAccepted"),offerAccepted)}${check(t("v45.package.singleReservationCreated"),Boolean(flow.reservationCreatedAt))}${check(t("reservation.check.paymentConfirmed"),paid)}
        <div class="package-rule-note"><b>i</b><span>${t("v45.package.atomicRule")}</span></div>
        ${flow.reservationStatus==="draft"&&offerAccepted?`<button class="btn btn-success u-full u-mt-16" id="confirmFee" ${paid?"disabled":""}>${paid?t("reservation.paymentConfirmed"):t("v45.package.confirmPackageFee")}</button>`:""}
        ${flow.reservationStatus==="active"?`<button class="btn btn-danger-soft u-full u-mt-9" id="releaseReservation">${t("v46.reservation.release")}</button>`:""}
      </div>
    </div>

    <div class="grid grid-2 u-mt-16">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("v46.reservation.rules")}</h2><p>${t("v46.reservation.rulesSub")}</p></div></div><div class="reservation-policy-grid"><div><span>01</span><div><strong>${t("v46.reservation.rule1")}</strong><p>${t("v46.reservation.rule1Text")}</p></div></div><div><span>02</span><div><strong>${t("v46.reservation.rule2")}</strong><p>${t("v46.reservation.rule2Text")}</p></div></div><div><span>03</span><div><strong>${t("v46.reservation.rule3")}</strong><p>${t("v46.reservation.rule3Text")}</p></div></div></div></div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("v46.reservation.history")}</h2><p>${t("v46.reservation.historySub")}</p></div><span class="chip">${t("v46.reservation.extensions",{count:flow.reservationExtensionCount})}</span></div><div class="sales-flow-history">${flow.history.filter(x=>x.kind==="reservation").slice(0,7).map(x=>historyRow(x.at,reservationStatusLabel((x.status in ({draft:1,active:1,cancelled:1,released:1,expired:1,converted:1})?x.status:"draft") as ReservationLifecycleStatus),x.note,x.actor)).join("")}</div></div>
    </div>
  </section>`;
}
function check(text:string,done:boolean){return `<div class="doc-check"><span class="u-fs-115">${text}</span><span class="checkmark ${done?"":"pending"}">${done?"✓":"!"}</span></div>`}
function historyRow(at:string,status:string,note:string,actor:string){return `<div class="sales-history-row"><i></i><div><span>${fmtDate(at)}</span><strong>${status}</strong><p>${note}</p><small>${actor}</small></div></div>`}
function countdownText(expiry?:string){if(!expiry)return "—";const diff=Math.max(0,new Date(expiry).getTime()-Date.now()),h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function releaseAssets(rows:typeof properties){rows.forEach(p=>{if(["pre-reserved","reserved","offered"].includes(p.status))p.status="available"})}

export function bindReservation(){
  if(countdownTimer)window.clearInterval(countdownTimer);
  const id=currentRoute().split("/")[1],lead=leads.find(x=>x.id===id);if(!lead)return;const flow=getSalesFlowState(id),rows=flow.selectedPropertyIds.map(pid=>properties.find(x=>x.id===pid)).filter(Boolean) as typeof properties;
  document.querySelector("#backOffer")?.addEventListener("click",()=>navigate("offer/"+id));
  document.querySelector("#returnToOffer")?.addEventListener("click",()=>navigate("offer/"+id));
  document.querySelector("#toApplication")?.addEventListener("click",()=>{if(flow.offerStatus!=="accepted"){toastLocalized(t("v46.reservation.offerMustBeAccepted"));return}if(flow.reservationStatus!=="active"||!flow.reservationPaid){toastLocalized(t("reservation.payBeforeApplication"));return}navigate("application/"+id)});
  document.querySelector("#confirmFee")?.addEventListener("click",()=>{
    if(flow.offerStatus!=="accepted"){toastLocalized(t("v46.reservation.offerMustBeAccepted"));return}if(!rows.length)return;
    const blocked=rows.find(p=>!["available","offered","pre-reserved","reserved"].includes(p.status));if(blocked){toastLocalized(t("v45.package.assetUnavailable",{unit:blocked.unit}));return}
    activateReservation(id,rows.map(p=>p.id));rows.forEach(p=>p.status="reserved");lead.stage="reservation";lead.lastActivity="i18n:leads.activity.now";lead.nextAction="i18n:reservation.nextApplication";
    toastLocalized(rows.length>1?t("v45.package.reservationConfirmed",{count:rows.length}):t("reservation.toastConfirmed"));refresh(id);
  });
  document.querySelector("#extendReservation")?.addEventListener("click",()=>openExtend(id));
  document.querySelector("#cancelReservation")?.addEventListener("click",()=>openCloseReservation(id,"cancelled",rows));
  document.querySelector("#releaseReservation")?.addEventListener("click",()=>openCloseReservation(id,"released",rows));
  document.querySelector("#restartReservation")?.addEventListener("click",()=>{const blocked=rows.find(p=>!["available","offered","pre-reserved"].includes(p.status));if(blocked){toastLocalized(t("v45.package.assetUnavailable",{unit:blocked.unit}));return}restartReservation(id);rows.forEach(p=>p.status="pre-reserved");toastLocalized(t("v46.reservation.restartedToast"));refresh(id)});
  const countdown=document.querySelector<HTMLElement>("#reservationCountdown");if(countdown?.dataset.expiry){countdownTimer=window.setInterval(()=>{if(!currentRoute().startsWith("reservation/")){if(countdownTimer)window.clearInterval(countdownTimer);return}const expiry=countdown.dataset.expiry;countdown.textContent=countdownText(expiry);if(expiry&&new Date(expiry).getTime()<=Date.now()){if(countdownTimer)window.clearInterval(countdownTimer);releaseAssets(rows);toastLocalized(t("v46.reservation.expiredToast"));refresh(id)}},1000)}
}
function openExtend(id:string){openLocalizedModal(t("v46.reservation.extendTitle"),`<form id="extendReservationForm" class="form-grid"><div class="form-field"><label>${t("v46.reservation.extensionPeriod")}</label><select name="hours"><option value="24">24 ${t("v46.reservation.hours")}</option><option value="48" selected>48 ${t("v46.reservation.hours")}</option><option value="72">72 ${t("v46.reservation.hours")}</option></select></div><div class="form-field full"><label>${t("v46.common.reason")}</label><textarea name="reason" rows="3" required placeholder="${t("v46.reservation.extendPlaceholder")}"></textarea></div><div class="full sales-flow-modal-note">${t("v46.reservation.extensionNote")}</div></form>`,`<button class="btn" data-modal-close>${t("application.cancel")}</button><button class="btn btn-accent" id="confirmExtension">${t("v46.reservation.confirmExtension")}</button>`);setTimeout(()=>document.querySelector("#confirmExtension")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#extendReservationForm")!;if(!f.reportValidity())return;extendReservation(id,Number(formValue(f,"hours")),formValue(f,"reason"));closeModal();toastLocalized(t("v46.reservation.extendedToast"));refresh(id)}),0)}
function openCloseReservation(id:string,status:"cancelled"|"released",rows:typeof properties){openLocalizedModal(status==="cancelled"?t("v46.reservation.cancelTitle"):t("v46.reservation.releaseTitle"),`<form id="closeReservationForm" class="form-grid"><div class="form-field full"><label>${t("v46.common.reason")}</label><textarea name="reason" rows="4" required placeholder="${status==="cancelled"?t("v46.reservation.cancelPlaceholder"):t("v46.reservation.releasePlaceholder")}"></textarea></div><div class="full sales-flow-modal-note danger-note">${t("v46.reservation.closeWarning")}</div></form>`,`<button class="btn" data-modal-close>${t("application.cancel")}</button><button class="btn btn-danger" id="confirmCloseReservation">${status==="cancelled"?t("v46.reservation.confirmCancel"):t("v46.reservation.confirmRelease")}</button>`);setTimeout(()=>document.querySelector("#confirmCloseReservation")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#closeReservationForm")!;if(!f.reportValidity())return;closeReservation(id,status,formValue(f,"reason"));releaseAssets(rows);closeModal();toastLocalized(status==="cancelled"?t("v46.reservation.cancelledToast"):t("v46.reservation.releasedToast"));refresh(id)}),0)}
function refresh(id:string){navigate("offer/"+id);setTimeout(()=>navigate("reservation/"+id),20)}
