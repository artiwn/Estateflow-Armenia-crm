import {clients,deals,properties} from "../data/mock";
import {badge,financingTypeLabel,money,propertyTypeLabel,statusLabel} from "../utils";
import {currentRoute,navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {t} from "../i18n";
import type {FinancingType} from "../models/types";

const nextActionKeys:Record<string,string>={
  "Legal review · today":"dealsPage.next.legalReviewToday",
  "Reservation payment · 18.09":"dealsPage.next.reservationPayment",
  "Commercial director approval":"dealsPage.next.commercialApproval",
  "Payment overdue · 4 days":"dealsPage.next.paymentOverdue",
  "Inspection & defects":"dealsPage.next.inspectionDefects",
  "Warranty period active":"dealsPage.next.warrantyActive",
  "Qualification / client verification":"dealsPage.next.qualification"
};
const nextActionLabel=(value:string)=>value.startsWith("i18n:")?t(value.slice(5)):nextActionKeys[value]?t(nextActionKeys[value]):value;

export function dealsPage(){
  const total=deals.reduce((s,d)=>s+d.amount,0);
  const corporate=deals.filter(d=>clients.find(c=>c.id===d.clientId)?.type.includes("company")).length;
  return `<section class="page">
    <div class="page-header">
      <div class="page-title"><h1>${t("dealsPage.title")}</h1><p>${t("dealsPage.subtitle")}</p></div>
      <button class="btn btn-primary" id="newDeal">${t("dealsPage.new")}</button>
    </div>
    <div class="foundation-strip card u-mb-16">
      <div><span>${t("v41.deal.assets")}</span><strong>${deals.reduce((s,d)=>s+(d.propertyIds?.length||1),0)}</strong><small>${t("v41.deal.addedFoundation")}</small></div>
      <div><span>${t("v41.deal.participants")}</span><strong>${deals.reduce((s,d)=>s+(d.participants?.length||1),0)}</strong><small>${corporate} corporate</small></div>
      <div><span>${t("dealsPage.amount")}</span><strong>${money(total,"AMD")}</strong><small>AMD base reporting view</small></div>
      <div><span>${t("v41.deal.financing")}</span><strong>${new Set(deals.map(d=>d.financing)).size}</strong><small>${deals.map(d=>financingTypeLabel(d.financing)).filter((x,i,a)=>a.indexOf(x)===i).join(" · ")}</small></div>
    </div>
    <div class="card">
      <div class="card-pad u-pb-10"><div class="toolbar">
        <input class="field u-minw-260" id="dealSearch" placeholder="${t("dealsPage.searchPlaceholder")}">
        <select class="field" id="dealStatus">
          <option value="">${t("dealsPage.allStatuses")}</option>
          <option value="qualification">${statusLabel("qualification")}</option><option value="offer">${statusLabel("offer")}</option><option value="reservation">${statusLabel("reservation")}</option><option value="approval">${statusLabel("approval")}</option><option value="contract">${statusLabel("contract")}</option><option value="payment">${statusLabel("payment")}</option><option value="registration">${statusLabel("registration")}</option><option value="handover">${statusLabel("handover")}</option>
        </select>
      </div></div>
      <div class="table-wrap"><table class="table deal-registry-v41">
        <thead><tr><th>${t("dealsPage.deal")}</th><th>${t("dealsPage.client")}</th><th>${t("v41.deal.assets")}</th><th>${t("dealsPage.status")}</th><th>${t("dealsPage.amount")}</th><th>${t("v41.deal.financing")}</th><th>${t("dealsPage.nextAction")}</th><th>${t("dealsPage.manager")}</th></tr></thead>
        <tbody>${deals.map(d=>{
          const assetRows=(d.propertyIds?.length?d.propertyIds:[d.propertyId]).map(id=>properties.find(p=>p.id===id)).filter(Boolean);
          const primary=assetRows[0];
          return `<tr data-deal="${d.id}" data-status="${d.status}"><td><strong>${d.id}</strong><div class="table-sub">${d.currency} · ${d.discount}%</div></td><td>${d.clientName}<div class="table-sub">${d.participants.length} ${t("v41.deal.participants").toLowerCase()}</div></td><td><strong>${primary?.unit??d.propertyLabel}</strong><div class="table-sub">${assetRows.length} × ${assetRows.map(x=>propertyTypeLabel(x!.type)).filter((x,i,a)=>a.indexOf(x)===i).join(", ")}</div></td><td>${badge(d.status)}</td><td><strong>${money(d.amount,d.currency)}</strong></td><td>${financingTypeLabel(d.financing)}</td><td>${nextActionLabel(d.nextAction)}</td><td>${d.manager}</td></tr>`;
        }).join("")}</tbody>
      </table></div>
    </div>
  </section>`;
}

export function bindDeals(){
  document.querySelectorAll("[data-deal]").forEach(el=>el.addEventListener("click",()=>navigate("deal/"+(el as HTMLElement).dataset.deal)));
  document.querySelector("#dealSearch")?.addEventListener("input",filter);
  document.querySelector("#dealStatus")?.addEventListener("change",filter);
  document.querySelector("#newDeal")?.addEventListener("click",()=>openDealForm());
  const params=new URLSearchParams(currentRoute().split("?")[1]??"");
  if(params.get("property")||params.get("client")) setTimeout(()=>openDealForm(params.get("property")??"",params.get("client")??""),0);
}

function filter(){
  const q=(document.querySelector<HTMLInputElement>("#dealSearch")?.value??"").toLowerCase();
  const st=document.querySelector<HTMLSelectElement>("#dealStatus")?.value??"";
  document.querySelectorAll<HTMLTableRowElement>("tr[data-deal]").forEach(r=>r.style.display=(!q||r.textContent!.toLowerCase().includes(q))&&(!st||r.dataset.status===st)?"":"none");
}

function openDealForm(preselected="",preselectedClient=""){
  const defaultNext=t("dealsPage.next.qualification"),available=properties.filter(p=>["available","offered","returned-to-sale"].includes(p.status)||p.id===preselected);
  openLocalizedModal(t("dealsPage.createTitle"),`<form id="dealCreateForm" class="form-grid">
    <div class="form-field full"><label>${t("dealsPage.client")}</label><select name="clientId" required><option value="">${t("dealsPage.chooseClient")}</option>${clients.map(c=>`<option value="${c.id}" ${c.id===preselectedClient?"selected":""}>${c.name} · ${c.id}</option>`).join("")}</select></div>
    <div class="form-field full"><label>${t("v41.deal.primaryAsset")}</label><select name="propertyId" required><option value="">${t("dealsPage.chooseProperty")}</option>${available.map(p=>`<option value="${p.id}" ${p.id===preselected?"selected":""}>${p.project} · ${p.phase} · ${p.unit} · ${propertyTypeLabel(p.type)} · ${money(p.totalPrice,p.currency)}</option>`).join("")}</select></div>
    <div class="form-field full"><label>${t("v45.package.additionalAssets")}</label><span class="field-help">${t("v45.package.additionalAssetsSub")}</span><div class="package-deal-picker">${available.map(p=>`<label class="package-deal-choice" data-package-choice="${p.id}" data-currency="${p.currency}"><input type="checkbox" name="packageAsset" value="${p.id}"><span><b>${p.unit}</b><small>${propertyTypeLabel(p.type)} · ${p.area} m² · ${money(p.totalPrice,p.currency)}</small></span></label>`).join("")}</div><div class="modal-note u-mt-8">${t("v45.package.sameCurrencyRule")}</div></div>
    <div class="form-field"><label>${t("dealsPage.discountPercent")}</label><input name="discount" type="number" min="0" max="30" value="0"></div>
    <div class="form-field"><label>${t("v41.create.financing")}</label><select name="financing"><option value="own-funds">${financingTypeLabel("own-funds")}</option><option value="installment">${financingTypeLabel("installment")}</option><option value="mortgage">${financingTypeLabel("mortgage")}</option><option value="mixed">${financingTypeLabel("mixed")}</option></select></div>
    <div class="form-field"><label>${t("dealsPage.manager")}</label><select name="manager"><option>Անի Հակոբյան</option><option>Նարեկ Կարապետյան</option><option>Մարի Հովհաննիսյան</option></select></div>
    <div class="form-field"><label>${t("v41.deal.currency")}</label><input id="dealCurrencyPreview" value="AMD" disabled></div>
    <div class="form-field full"><label>${t("dealsPage.nextAction")}</label><input name="nextAction" value="${defaultNext}"></div>
    <div class="form-field full"><div class="modal-note">${t("v41.deal.addedFoundation")}. ${t("v45.package.applicationRule")}</div></div>
  </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveDeal">${t("dealsPage.create")}</button>`);
  setTimeout(()=>{
    const form=document.querySelector<HTMLFormElement>("#dealCreateForm")!,assetSelect=form.elements.namedItem("propertyId") as HTMLSelectElement;
    const syncCurrency=()=>{const primary=properties.find(x=>x.id===assetSelect.value),preview=document.querySelector<HTMLInputElement>("#dealCurrencyPreview");if(preview)preview.value=primary?.currency??"AMD";document.querySelectorAll<HTMLElement>("[data-package-choice]").forEach(el=>{const input=el.querySelector<HTMLInputElement>("input")!,same=el.dataset.packageChoice!==primary?.id&&(!primary||el.dataset.currency===primary.currency);input.disabled=!same;if(!same)input.checked=false;el.classList.toggle("disabled",!same)})};
    assetSelect.addEventListener("change",syncCurrency);syncCurrency();
    document.querySelector("#saveDeal")?.addEventListener("click",()=>{
      if(!form.reportValidity())return;const c=clients.find(x=>x.id===formValue(form,"clientId"))!,primary=properties.find(x=>x.id===formValue(form,"propertyId"))!,extra=[...form.querySelectorAll<HTMLInputElement>('input[name="packageAsset"]:checked')].map(x=>x.value),ids=[primary.id,...extra.filter(id=>id!==primary.id)],assetRows=ids.map(id=>properties.find(p=>p.id===id)).filter(Boolean) as typeof properties;
      if(assetRows.some(p=>p.currency!==primary.currency)){toastLocalized(t("v45.package.sameCurrencyRule"));return}
      const discount=Number(formValue(form,"discount")),id=`DL-2026-${String(490+deals.length).padStart(5,"0")}`,dealPrices=assetRows.map(p=>Math.round(p.totalPrice*(1-discount/100))),amount=dealPrices.reduce((a,b)=>a+b,0),enteredNext=formValue(form,"nextAction");
      const assetLines=assetRows.map((p,i)=>({propertyId:p.id,listPrice:p.totalPrice,dealPrice:dealPrices[i],discountPercent:discount,contractMode:"shared" as const,paymentSharePercent:amount?Number((dealPrices[i]/amount*100).toFixed(2)):0}));
      deals.push({id,clientId:c.id,clientName:c.name,propertyId:primary.id,propertyLabel:`${primary.project} · ${assetRows.map(p=>p.unit).join(" + ")}`,propertyIds:ids,assetLines,participants:[{id:`DP-${id}-1`,clientId:c.id,name:c.name,role:"buyer",phone:c.phone,sharePercent:100}],status:discount>3?"approval":"qualification",amount,currency:primary.currency,taxIncluded:assetRows.every(p=>p.vatIncluded),financing:formValue(form,"financing") as FinancingType,discount,manager:formValue(form,"manager"),nextAction:enteredNext===defaultNext?"i18n:dealsPage.next.qualification":enteredNext});
      c.activeDeals+=1;closeModal();toastLocalized(assetRows.length>1?t("v45.package.packageCreated",{count:assetRows.length}):t("dealsPage.created"));navigate("deal/"+id);
    });
  },0);
}
