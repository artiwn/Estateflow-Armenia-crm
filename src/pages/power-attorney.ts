import {clients,deals,powersOfAttorney,properties} from "../data/mock";
import {navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {badge,statusLabel} from "../utils";
import {demoText} from "../demo-i18n";
import {t} from "../i18n";
import {POA_ACTIONS,poaActionLabel,poaUsable} from "../services/authority";
import type {PowerOfAttorneyAction} from "../models/types";

export function powerAttorneyPage(){
 const usable=powersOfAttorney.filter(p=>poaUsable(p)).length,attention=powersOfAttorney.filter(p=>["expiring","review","suspended"].includes(p.status)).length,closed=powersOfAttorney.filter(p=>["revoked","expired"].includes(p.status)).length,linked=new Set(powersOfAttorney.map(p=>p.relatedDeal).filter(Boolean)).size;
 return `<section class="page" id="poaRegistryPage">
  <div class="breadcrumbs"><span>${t("legal")}</span><span>›</span><span>${t("poaPage.title")}</span></div>
  <div class="page-header"><div class="page-title"><div class="eyebrow">${t("poaPage.eyebrow")}</div><h1>${t("poaPage.title")}</h1><p>${t("v43.poa.registrySubtitle")}</p></div><div class="toolbar"><button class="btn" id="backLegal">${t("poaPage.backLegal")}</button><button class="btn btn-accent" id="newPoa">${t("poaPage.new")}</button></div></div>
  <div class="grid grid-4 u-mb-16">
   ${metric(t("v43.poa.metric.usable"),String(usable),t("v43.poa.metric.usableNote"),"success")}
   ${metric(t("v43.poa.metric.attention"),String(attention),t("v43.poa.metric.attentionNote"),"warning")}
   ${metric(t("v43.poa.metric.closed"),String(closed),t("v43.poa.metric.closedNote"),"danger")}
   ${metric(t("v43.poa.metric.deals"),String(linked),t("v43.poa.metric.dealsNote"),"accent")}
  </div>
  <div class="card card-pad poa-registry-shell">
   <div class="section-title"><div><h2>${t("v43.poa.controlTitle")}</h2><p>${t("v43.poa.controlSubtitle")}</p></div><div class="filter-row poa-filters"><button class="filter-pill active" data-poa-filter="all">${t("v43.common.all")}</button><button class="filter-pill" data-poa-filter="usable">${t("v43.poa.filter.usable")}</button><button class="filter-pill" data-poa-filter="attention">${t("v43.poa.filter.attention")}</button><button class="filter-pill" data-poa-filter="closed">${t("v43.poa.filter.closed")}</button></div></div>
   <div class="table-wrap"><table class="table poa-table"><thead><tr><th>${t("poaPage.document")}</th><th>${t("poaPage.principal")}</th><th>${t("poaPage.representative")}</th><th>${t("v43.poa.authority")}</th><th>${t("v43.poa.coverage")}</th><th>${t("poaPage.term")}</th><th>${t("poaPage.status")}</th></tr></thead><tbody>
   ${powersOfAttorney.map(p=>{const covered=p.allowedPropertyIds.map(id=>properties.find(x=>x.id===id)?.unit??id),group=poaUsable(p)?(p.status==="expiring"?"attention":"usable"):["revoked","expired"].includes(p.status)?"closed":"attention";return `<tr data-poa-id="${p.id}" data-poa-group="${group}"><td><strong>${p.documentNo}</strong><div class="row-sub">${p.id} · ${p.documentFile??t("v43.poa.noFile")}</div></td><td><strong>${p.principal}</strong><div class="row-sub">${demoText(p.authorityBasis??"")}</div></td><td>${p.representative}<div class="row-sub">${p.representativePersonalNumber??"—"}</div></td><td><div class="poa-action-preview">${p.allowedActions.slice(0,3).map(a=>`<span>${poaActionLabel(a)}</span>`).join("")}${p.allowedActions.length>3?`<small>+${p.allowedActions.length-3}</small>`:""}</div></td><td><strong>${covered.join(", ")||"—"}</strong><div class="row-sub">${p.relatedDeal??t("poaPage.noRelation")}</div></td><td>${p.expiresAt}<div class="row-sub">${p.canSubdelegate?t("v43.poa.subdelegateYes"):t("v43.poa.subdelegateNo")}</div></td><td>${badge(p.status)}</td></tr>`}).join("")}
   </tbody></table></div>
  </div>
 </section>`;
}
function metric(label:string,value:string,note:string,tone:string){return `<div class="card metric-card poa-metric ${tone}"><div class="metric-top"><span>${label}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${note}</div></div>`}

export function bindPowerAttorney(){
 document.querySelector("#backLegal")?.addEventListener("click",()=>navigate("legal"));
 document.querySelector("#newPoa")?.addEventListener("click",openPoaForm);
 document.querySelectorAll<HTMLElement>("[data-poa-id]").forEach(row=>row.addEventListener("click",e=>{if((e.target as HTMLElement).closest("button,a"))return;navigate("poa/"+row.dataset.poaId)}));
 document.querySelectorAll<HTMLElement>("[data-poa-filter]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-poa-filter]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");const filter=btn.dataset.poaFilter;document.querySelectorAll<HTMLElement>("[data-poa-group]").forEach(row=>row.hidden=filter!=="all"&&row.dataset.poaGroup!==filter)}));
}

function openPoaForm(){
 openLocalizedModal(t("poaPage.modal.title"),`<form id="poaForm" class="form-grid">
  <div class="form-field"><label>${t("poaPage.principal")}</label><select name="principalClientId" required><option value="">${t("v43.poa.choosePrincipal")}</option>${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
  <div class="form-field"><label>${t("poaPage.representative")}</label><input name="representative" required></div>
  <div class="form-field"><label>${t("v43.poa.representativeId")}</label><input name="representativePersonalNumber"></div>
  <div class="form-field"><label>${t("poaPage.number")}</label><input name="documentNo" required value="N-${Date.now().toString().slice(-5)}/26"></div>
  <div class="form-field"><label>${t("poaPage.notary")}</label><input name="notary" value="${t("poaPage.defaultNotary")}"></div>
  <div class="form-field"><label>${t("v43.poa.authorityBasis")}</label><input name="authorityBasis" value="${t("v43.poa.defaultBasis")}"></div>
  <div class="form-field"><label>${t("poaPage.issuedAt")}</label><input name="issuedAt" value="22.09.2026"></div>
  <div class="form-field"><label>${t("poaPage.expiresAt")}</label><input name="expiresAt" value="22.09.2027"></div>
  <div class="form-field full"><label>${t("poaPage.relatedDeal")}</label><select name="relatedDeal"><option value="">${t("poaPage.noRelation")}</option>${deals.map(d=>`<option value="${d.id}">${d.id} · ${d.clientName}</option>`).join("")}</select><small>${t("v43.poa.dealCoverageHint")}</small></div>
  <div class="form-field full"><label>${t("v43.poa.allowedActions")}</label><div class="poa-action-picker">${POA_ACTIONS.map((a,i)=>`<label><input type="checkbox" name="actions" value="${a}" ${i<4?"checked":""}><span>${poaActionLabel(a)}</span></label>`).join("")}</div></div>
  <div class="form-field full"><label>${t("poaPage.scope")}</label><textarea name="scope" required>${t("poaPage.defaultScope")}</textarea></div>
  <div class="form-field full"><label class="switch-line"><input type="checkbox" name="canSubdelegate" value="1"><span>${t("v43.poa.allowSubdelegation")}</span></label></div>
 </form>`,`<button class="btn" data-modal-close>${t("poaPage.cancel")}</button><button class="btn btn-accent" id="savePoa">${t("poaPage.create")}</button>`);
 setTimeout(()=>document.querySelector("#savePoa")?.addEventListener("click",()=>{
   const f=document.querySelector<HTMLFormElement>("#poaForm")!;if(!f.reportValidity())return;const fd=new FormData(f),client=clients.find(c=>c.id===formValue(f,"principalClientId")),deal=deals.find(d=>d.id===formValue(f,"relatedDeal"));
   const actions=fd.getAll("actions").map(String) as PowerOfAttorneyAction[];if(!actions.length){toastLocalized(t("v43.poa.chooseAction"));return}
   const id=`POA-2026-${String(45+powersOfAttorney.length).padStart(3,"0")}`,enteredScope=formValue(f,"scope");
   powersOfAttorney.push({id,principal:client?.name??"",principalClientId:client?.id,representative:formValue(f,"representative"),representativePersonalNumber:formValue(f,"representativePersonalNumber")||undefined,documentNo:formValue(f,"documentNo"),issuedAt:formValue(f,"issuedAt"),expiresAt:formValue(f,"expiresAt"),notary:formValue(f,"notary"),scope:enteredScope===t("poaPage.defaultScope")?"i18n:poaPage.defaultScope":enteredScope,status:"active",relatedDeal:deal?.id,authorityBasis:formValue(f,"authorityBasis"),allowedActions:actions,allowedPropertyIds:deal?(deal.propertyIds?.length?deal.propertyIds:[deal.propertyId]):[],canSubdelegate:fd.get("canSubdelegate")==="1",documentFile:`${id}.pdf`,verificationStatus:"verified",createdBy:"Անահիտ Մարտիրոսյան",updatedAt:"23.09.2026 · сейчас",history:[{id:`${id}-H1`,at:"23.09.2026 · сейчас",actor:"Անահիտ Մարտիրոսյան",action:"Создана доверенность"}]});
   closeModal();toastLocalized(t("poaPage.created"));navigate("legal");setTimeout(()=>navigate("poa/"+id),20)
 }),0)
}
