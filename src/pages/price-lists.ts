import { priceListVersions, properties, propertyPriceHistory } from "../data/mock";
import { amd, badge } from "../utils";
import { navigate } from "../router";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";
import { t } from "../i18n";
import { demoText } from "../demo-i18n";

export function priceListsPage(){
  const sorted=priceListVersions.slice().sort((a,b)=>b.effectiveFrom.localeCompare(a.effectiveFrom));
  const active=sorted.find(x=>x.status==="active");
  const avg=properties.length?Math.round(properties.reduce((sum,p)=>sum+p.pricePerSqm,0)/properties.length):0;
  return`<section class="page"><div class="page-header"><div class="page-title"><div class="eyebrow">${t("priceLists.eyebrow")}</div><h1>${t("priceLists.title")}</h1><p>${t("priceLists.subtitle")}</p></div><div class="toolbar"><button class="btn" id="backInventory">${t("priceLists.backInventory")}</button><button class="btn btn-accent" id="newPriceList">${t("priceLists.newVersion")}</button></div></div>
  <div class="grid grid-4 u-mb-16"><div class="card metric-card"><div class="metric-top"><span>${t("priceLists.activeVersion")}</span></div><div class="metric-value u-fs-18">${active?.id??"—"}</div><div class="metric-note">${active?t("priceLists.activeFrom",{date:active.effectiveFrom}):"—"}</div></div><div class="card metric-card"><div class="metric-top"><span>${t("priceLists.unitsInInventory")}</span></div><div class="metric-value">${properties.length}</div></div><div class="card metric-card"><div class="metric-top"><span>${t("priceLists.avgPriceSqm")}</span></div><div class="metric-value u-fs-20">${amd(avg)}</div></div><div class="card metric-card"><div class="metric-top"><span>${t("priceLists.versionsCount")}</span></div><div class="metric-value">${sorted.length}</div></div></div>
  <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>${t("priceLists.col.version")}</th><th>${t("priceLists.col.projectBuilding")}</th><th>${t("priceLists.col.effectiveFrom")}</th><th>${t("priceLists.col.change")}</th><th>${t("priceLists.col.author")}</th><th>${t("priceLists.col.status")}</th><th></th></tr></thead><tbody>${sorted.map(v=>`<tr><td><strong>${v.id}</strong><div class="subtle">${demoText(v.note)}</div></td><td>${v.project} · ${v.building}</td><td>${v.effectiveFrom}</td><td>${v.adjustmentPercent>0?"+":""}${v.adjustmentPercent}%</td><td>${demoText(v.createdBy)}</td><td>${badge(v.status)}</td><td>${v.status==="draft"?`<button class="btn btn-primary" data-apply-price="${v.id}">${t("priceLists.apply")}</button>`:`<button class="btn btn-soft" data-price-preview="${v.id}">${t("priceLists.preview")}</button>`}</td></tr>`).join("")}</tbody></table></div></div>
  <div class="card card-pad u-mt-16"><div class="section-title"><div><h2>${t("priceLists.recentChanges")}</h2><p>${t("priceLists.historyPerUnit")}</p></div></div><div class="price-history">${propertyPriceHistory.slice(-8).reverse().map(h=>{const p=properties.find(x=>x.id===h.propertyId);return`<div class="price-history-row"><span>${h.effectiveFrom}</span><strong>${p?.unit??h.propertyId} · ${h.versionId}</strong><b>${amd(h.pricePerSqm)} / m²</b></div>`}).join("")}</div></div>
  </section>`;
}

export function bindPriceLists(){
  document.querySelector("#backInventory")?.addEventListener("click",()=>navigate("properties"));
  document.querySelector("#newPriceList")?.addEventListener("click",openNewVersion);
  document.querySelectorAll<HTMLElement>("[data-apply-price]").forEach(el=>el.addEventListener("click",()=>confirmApply(el.dataset.applyPrice!)));
  document.querySelectorAll<HTMLElement>("[data-price-preview]").forEach(el=>el.addEventListener("click",()=>previewVersion(el.dataset.pricePreview!)));
}

function openNewVersion(){
  openLocalizedModal(t("priceLists.newModal.title"),`<form id="priceListForm" class="form-grid"><div class="form-field"><label>${t("priceLists.project")}</label><input name="project" value="Norq Residence" required></div><div class="form-field"><label>${t("priceLists.building")}</label><input name="building" value="B" required></div><div class="form-field"><label>${t("priceLists.effectiveDate")}</label><input name="effectiveFrom" value="01.10.2026" required></div><div class="form-field"><label>${t("priceLists.priceChangePct")}</label><input name="adjustment" type="number" step="0.1" value="2.5" required></div><div class="form-field full"><label>${t("priceLists.comment")}</label><textarea name="note">${t("priceLists.defaultNote")}</textarea></div><div class="modal-note full">${t("priceLists.draftNotice")}</div></form>`,`<button class="btn" data-modal-close>${t("priceLists.cancel")}</button><button class="btn btn-accent" id="savePriceVersion">${t("priceLists.createVersion")}</button>`);
  setTimeout(()=>document.querySelector("#savePriceVersion")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#priceListForm")!;
    if(!f.reportValidity())return;
    const effective=formValue(f,"effectiveFrom"),id=`PL-NR-${formValue(f,"building")}-${effective.split(".").reverse().join("")}`;
    priceListVersions.push({id,project:formValue(f,"project"),building:formValue(f,"building"),effectiveFrom:effective,adjustmentPercent:Number(formValue(f,"adjustment")),status:"draft",createdBy:"Անի Հակոբյան",createdAt:`17.09.2026 · ${t("priceLists.now")}`,note:formValue(f,"note")});
    closeModal();
    toastLocalized(t("priceLists.toast.created"));
    refresh();
  }),0);
}

function confirmApply(id:string){
  const v=priceListVersions.find(x=>x.id===id);if(!v)return;
  const affected=properties.filter(p=>p.project===v.project&&p.building===v.building&&p.status!=="sold");
  openLocalizedModal(t("priceLists.applyModal.title"),`<div class="modal-note">${t("priceLists.applyModal.summary",{count:affected.length,project:v.project,building:v.building})}</div><div class="info-list one u-mt-14"><div class="info-box"><span>${t("priceLists.col.version")}</span><strong>${v.id}</strong></div><div class="info-box"><span>${t("priceLists.effectiveDate")}</span><strong>${v.effectiveFrom}</strong></div><div class="info-box"><span>${t("priceLists.indexation")}</span><strong>${v.adjustmentPercent>0?"+":""}${v.adjustmentPercent}%</strong></div></div>`,`<button class="btn" data-modal-close>${t("priceLists.cancel")}</button><button class="btn btn-accent" id="applyPriceVersion">${t("priceLists.applyToInventory")}</button>`);
  setTimeout(()=>document.querySelector("#applyPriceVersion")?.addEventListener("click",()=>{
    priceListVersions.filter(x=>x.project===v.project&&x.building===v.building&&x.status==="active").forEach(x=>x.status="archived");
    v.status="active";
    affected.forEach(p=>{p.pricePerSqm=Math.round(p.pricePerSqm*(1+v.adjustmentPercent/100)/1000)*1000;p.totalPrice=Math.round(p.area*p.pricePerSqm);propertyPriceHistory.push({id:`PH-${propertyPriceHistory.length+1}`,propertyId:p.id,pricePerSqm:p.pricePerSqm,totalPrice:p.totalPrice,effectiveFrom:v.effectiveFrom,versionId:v.id,reason:v.note})});
    closeModal();
    toastLocalized(t("priceLists.toast.applied",{id:v.id,count:affected.length}));
    refresh();
  }),0);
}

function previewVersion(id:string){
  const v=priceListVersions.find(x=>x.id===id);if(!v)return;
  const items=properties.filter(p=>p.project===v.project&&p.building===v.building).slice(0,8);
  openLocalizedModal(t("priceLists.previewTitle",{id:v.id}),`<div class="info-list"><div class="info-box"><span>${t("priceLists.effectiveDate")}</span><strong>${v.effectiveFrom}</strong></div><div class="info-box"><span>${t("priceLists.col.status")}</span>${badge(v.status)}</div></div><div class="table-wrap u-mt-14"><table class="table"><thead><tr><th>${t("priceLists.object")}</th><th>${t("priceLists.priceSqm")}</th><th>${t("priceLists.cost")}</th></tr></thead><tbody>${items.map(p=>`<tr><td>${p.unit}</td><td>${amd(p.pricePerSqm)}</td><td>${amd(p.totalPrice)}</td></tr>`).join("")}</tbody></table></div>`);
}
function refresh(){navigate("properties");setTimeout(()=>navigate("price-lists"),20)}
