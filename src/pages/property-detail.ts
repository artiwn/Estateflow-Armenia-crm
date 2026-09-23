import {contracts,deals,paymentSchedule,properties,propertyPriceHistory,registrationCases} from "../data/mock";
import {badge,money,propertyTypeLabel,statusLabel} from "../utils";
import {navigate} from "../router";
import {bindTabs} from "../components/tabs";
import {closeModal,openLocalizedModal,toastLocalized} from "../components/layout";
import {t} from "../i18n";
import {demoText} from "../demo-i18n";
import {allowedPropertyTransitions,validatePropertyTransition} from "../services/property-flow";
import type{PropertyStatus}from"../models/types";
import{entityAuditPanel}from"../components/audit-panel";
import{recordAudit}from"../services/audit";

const pct=(current:number,initial:number)=>initial?((current-initial)/initial*100):0;
const formatDelta=(v:number)=>`${v>=0?"+":""}${v.toFixed(1)}%`;

export function propertyDetailPage(id:string){
  const p=properties.find(x=>x.id===id);
  if(!p)return`<section class="page"><div class="card card-pad">${t("propertyDetail.propertyNotFound")}</div></section>`;
  const related=deals.filter(d=>(d.propertyIds?.length?d.propertyIds:[d.propertyId]).includes(p.id));
  const priceHistory=propertyPriceHistory.filter(h=>h.propertyId===p.id).slice().reverse();
  const rooms=p.rooms>0?String(p.rooms):t("v41.property.roomsNotApplicable");
  const legalLabel=t(`v41.property.legalStatus.${p.legalStatus}`);
  const initial=p.initialPrice??p.totalPrice,change=pct(p.totalPrice,initial);
  const docs=p.documents??[];
  const statusHistory=p.statusHistory??[];
  const readiness=p.constructionReadiness??0;
  const saleReady=p.legalStatus!=="restricted"&&!p.restrictionDetails?.some(x=>x.status==="active")&&readiness>=50;
  return `<section class="page property-detail-v44">
    <button class="btn btn-soft u-mb-16" id="backProperties">${t("propertyDetail.propertyInventory")}</button>
    <div class="detail-header property-detail-header-v44">
      <div class="detail-title">
        <small>${p.internalCode??p.id} · ${p.project} · ${p.phase}</small>
        <h1>${p.unit}</h1>
        <div class="toolbar">${badge(p.status)}<span class="chip accent">${propertyTypeLabel(p.type)}</span><span class="chip">${p.currency}</span><span class="chip ${saleReady?"success":"warning"}">${saleReady?t("v44.property.saleReady"):t("v44.property.saleAttention")}</span></div>
      </div>
      <div class="toolbar"><button class="btn" id="propertyDocs">${t("propertyDetail.documents")}</button><button class="btn" id="changeStatus">${t("v44.property.changeStatus")}</button><button class="btn" id="changePrice">${t("propertyDetail.changePrice")}</button><button class="btn btn-accent" id="startPropertyDeal">${t("propertyDetail.createDeal")}</button></div>
    </div>

    <div class="foundation-path card">
      <div><span>${t("propertyDetail.project")}</span><strong>${p.project}</strong></div><b>›</b>
      <div><span>${t("v41.property.phase")}</span><strong>${p.phase}</strong></div><b>›</b>
      <div><span>${t("propertyDetail.building")}</span><strong>${p.building}</strong></div><b>›</b>
      <div><span>${t("v41.property.entrance")}</span><strong>${p.entrance}</strong></div><b>›</b>
      <div><span>${t("propertyDetail.floor")}</span><strong>${p.floor}</strong></div><b>›</b>
      <div class="active"><span>${t("v41.deal.asset")}</span><strong>${p.unit}</strong></div>
    </div>

    <div class="property-command-strip card">
      <div><span>${t("v44.property.readiness")}</span><strong>${readiness}%</strong><div class="progress"><span style="width:${readiness}%"></span></div></div>
      <div><span>${t("v44.property.plannedHandover")}</span><strong>${p.plannedHandover??"—"}</strong><small>${t("v44.property.availability")}: ${p.availabilityFrom??"—"}</small></div>
      <div><span>${t("v44.property.currentPrice")}</span><strong>${money(p.totalPrice,p.currency)}</strong><small class="${change>=0?"positive-delta":"negative-delta"}">${formatDelta(change)} ${t("v44.property.fromInitial")}</small></div>
      <div><span>${t("v44.property.documents")}</span><strong>${docs.length}</strong><small>${p.photoCount??0} ${t("v44.property.photos").toLowerCase()}</small></div>
    </div>

    <div id="propertyTabs">
      <div class="tabs"><button class="tab active" data-tab-target="overview">${t("propertyDetail.overview")}</button><button class="tab" data-tab-target="technical">${t("v44.property.technical")}</button><button class="tab" data-tab-target="pricing">${t("propertyDetail.prices")}</button><button class="tab" data-tab-target="legal">${t("propertyDetail.legalData")}</button><button class="tab" data-tab-target="documents">${t("propertyDetail.documents")}</button><button class="tab" data-tab-target="sales">${t("propertyDetail.sales")}</button><button class="tab" data-tab-target="lifecycle">${t("v44.property.lifecycle")}</button></div>
      <div class="detail-tab-content">
        <div data-tab-panel="overview">
          <div class="property-detail-hero property-detail-hero-v44">
            ${propertyBlueprint(p.unit,p.type,p.area,p.rooms,p.orientation)}
            <div class="card card-pad property-summary-panel">
              <div class="section-title"><div><h2>${t("propertyDetail.propertyDetails")}</h2><p>${t("v44.property.identityAndCommercial")}</p></div><span class="chip">${p.internalCode??p.id}</span></div>
              <div class="info-list">
                <div class="info-box"><span>${t("v41.property.type")}</span><strong>${propertyTypeLabel(p.type)}</strong></div>
                <div class="info-box"><span>${t("propertyDetail.rooms")}</span><strong>${rooms}</strong></div>
                <div class="info-box"><span>${t("propertyDetail.area")}</span><strong>${p.area} m²</strong></div>
                <div class="info-box"><span>${t("v44.property.usableArea")}</span><strong>${p.usableArea??p.area} m²</strong></div>
                <div class="info-box"><span>${t("v41.property.orientation")}</span><strong>${p.orientation}</strong></div>
                <div class="info-box"><span>${t("v41.property.finishing")}</span><strong>${p.finishing}</strong></div>
              </div>
              <div class="soft-callout"><span>${t("propertyDetail.currentValue")}</span><strong>${money(p.totalPrice,p.currency)}</strong><button class="btn btn-accent" id="quickPrice">${t("propertyDetail.change")}</button></div>
            </div>
          </div>
          <div class="grid grid-3 u-mt-16">
            <div class="card card-pad foundation-profile-card"><span>${t("v41.property.commercialProfile")}</span><strong>${money(p.pricePerSqm,p.currency)} / m²</strong><small>${p.currency} · ${p.vatIncluded?t("v41.property.vatIncluded"):t("v41.property.vatExcluded")}</small></div>
            <div class="card card-pad foundation-profile-card"><span>${t("v41.property.legalProfile")}</span><strong>${legalLabel}</strong><small>${p.cadastralCode}</small></div>
            <div class="card card-pad foundation-profile-card"><span>${t("v41.property.address")}</span><strong>${p.address}</strong><small>${p.project} · ${p.phase}</small></div>
          </div>
          <div class="grid grid-2 u-mt-16">
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.saleReadiness")}</h2><p>${t("v44.property.saleReadinessSub")}</p></div></div>${readinessChecklist(p,docs.length,related.length)}</div>
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.currentContext")}</h2><p>${t("v44.property.currentContextSub")}</p></div></div><div class="property-context-grid"><div><span>${t("propertiesPage.status")}</span><strong>${statusLabel(p.status)}</strong></div><div><span>${t("v44.property.relatedDeals")}</span><strong>${related.length}</strong></div><div><span>${t("v44.property.legalRestrictions")}</span><strong>${p.restrictionDetails?.filter(x=>x.status==="active").length??p.restrictions.length}</strong></div><div><span>${t("v44.property.plannedHandover")}</span><strong>${p.plannedHandover??"—"}</strong></div></div></div>
          </div>
        </div>

        <div data-tab-panel="technical" hidden>
          <div class="grid grid-2">
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.technicalPassport")}</h2><p>${t("v44.property.technicalPassportSub")}</p></div></div><div class="technical-spec-grid">
              ${tech(t("propertyDetail.area"),`${p.area} m²`)}${tech(t("v44.property.usableArea"),`${p.usableArea??p.area} m²`)}${tech(t("v44.property.balconyArea"),`${p.balconyArea??0} m²`)}${tech(t("v44.property.ceilingHeight"),`${p.ceilingHeight??0} m`)}${tech(t("v44.property.bathrooms"),String(p.bathrooms??0))}${tech(t("v44.property.balconies"),String(p.balconies??0))}${tech(t("v44.property.position"),p.position??p.orientation)}${tech(t("v41.property.finishing"),p.finishing)}
            </div><div class="technical-note"><strong>${t("v44.property.technicalNote")}</strong><p>${p.technicalNote??"—"}</p></div></div>
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.constructionStatus")}</h2><p>${t("v44.property.constructionStatusSub")}</p></div><span class="chip accent">${readiness}%</span></div><div class="construction-gauge"><div class="construction-ring" style="--progress:${readiness}"><strong>${readiness}%</strong><span>${t("v44.property.ready")}</span></div><div class="construction-meta"><div><span>${t("v44.property.plannedHandover")}</span><strong>${p.plannedHandover??"—"}</strong></div><div><span>${t("v44.property.availability")}</span><strong>${p.availabilityFrom??"—"}</strong></div><div><span>${t("propertyDetail.floorPlan")}</span><strong>${p.floorPlan??"—"}</strong></div><div><span>${t("v44.property.photos")}</span><strong>${p.photoCount??0}</strong></div></div></div></div>
          </div>
        </div>

        <div data-tab-panel="pricing" hidden>
          <div class="grid grid-3 u-mb-16">
            <div class="card card-pad price-summary-card"><span>${t("v44.property.initialPrice")}</span><strong>${money(initial,p.currency)}</strong><small>${money(p.initialPricePerSqm??p.pricePerSqm,p.currency)} / m²</small></div>
            <div class="card card-pad price-summary-card featured"><span>${t("v44.property.currentPrice")}</span><strong>${money(p.totalPrice,p.currency)}</strong><small>${money(p.pricePerSqm,p.currency)} / m²</small></div>
            <div class="card card-pad price-summary-card"><span>${t("v44.property.priceChange")}</span><strong class="${change>=0?"positive-delta":"negative-delta"}">${formatDelta(change)}</strong><small>${t("v44.property.fromInitial")}</small></div>
          </div>
          <div class="card card-pad"><div class="section-title"><div><h2>${t("propertyDetail.priceHistory")}</h2><p>${t("propertyDetail.priceListChangesAndIndividualAdjustments")}</p></div><span class="chip accent">${p.currency}</span></div><div class="price-history">${priceHistory.map(h=>`<div class="price-history-row"><span>${h.effectiveFrom}</span><strong>${h.versionId} · ${demoText(h.reason)}</strong><b>${money(h.pricePerSqm,p.currency)} / m²</b></div>`).join("")||`<div class="empty compact-empty">${t("propertyDetail.priceHistoryHasNotBeenCreatedYet")}</div>`}</div></div>
        </div>

        <div data-tab-panel="legal" hidden>
          <div class="grid grid-2">
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v41.property.legalProfile")}</h2><p>${p.id}</p></div><span class="chip accent">${legalLabel}</span></div><div class="info-list">
              <div class="info-box"><span>${t("propertyDetail.cadastralCode")}</span><strong>${p.cadastralCode}</strong></div>
              <div class="info-box"><span>${t("propertyDetail.legalStatus")}</span><strong>${legalLabel}</strong></div>
              <div class="info-box"><span>${t("v41.property.vat")}</span><strong>${p.vatIncluded?t("v41.property.vatIncluded"):t("v41.property.vatExcluded")}</strong></div>
              <div class="info-box"><span>${t("v41.property.currency")}</span><strong>${p.currency}</strong></div>
            </div></div>
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v41.property.restrictions")}</h2><p>${t("propertyDetail.encumbrances")}</p></div><span class="chip ${(p.restrictionDetails?.length??0)>0?"warning":"success"}">${p.restrictionDetails?.filter(x=>x.status==="active").length??0}</span></div>${restrictionList(p)}</div>
          </div>
          <div class="card card-pad u-mt-16"><div class="section-title"><div><h2>${t("v44.property.legalDocuments")}</h2><p>${t("v44.property.legalDocumentsSub")}</p></div></div><div class="document-control-grid">${docs.filter(d=>["title-document","project-document"].includes(d.category)).map(documentCard).join("")||docs.slice(0,2).map(documentCard).join("")}</div></div>
        </div>

        <div data-tab-panel="documents" hidden>
          <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.documentWorkspace")}</h2><p>${t("v44.property.documentWorkspaceSub")}</p></div><button class="btn" id="addPropertyDocument">${t("v44.property.addDocument")}</button></div><div class="document-control-grid">${docs.map(documentCard).join("")||`<div class="empty">${t("v44.property.noDocuments")}</div>`}</div></div>
        </div>

        <div data-tab-panel="sales" hidden>
          <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.salesHistory")}</h2><p>${t("v44.property.salesHistorySub")}</p></div><span class="chip">${related.length}</span></div>${related.length?related.map(d=>`<button class="client-deal-card" data-related-deal="${d.id}"><div><span>${d.id}</span><strong>${d.clientName}</strong><small>${demoText(d.nextAction)}</small></div><div><b>${money(d.amount,d.currency)}</b>${badge(d.status)}</div></button>`).join(""):`<div class="empty-action">${t("propertyDetail.thereIsNoActiveDealForThisPropertyYetYouCanCreateOneFromTheRecord")}</div>`}</div>
        </div>

        <div data-tab-panel="lifecycle" hidden>
          <div class="grid grid-2">
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.lifecycle")}</h2><p>${t("v44.property.lifecycleSub")}</p></div><button class="btn btn-accent" id="lifecycleChangeStatus">${t("v44.property.changeStatus")}</button></div><div class="property-status-timeline">${statusHistory.slice().reverse().map((e,i)=>`<div class="property-status-event ${i===0?"current":""}"><i></i><div><div>${badge(e.status)}<span>${e.at}</span></div><strong>${e.actor}</strong>${e.note?`<p>${e.note}</p>`:""}</div></div>`).join("")}</div></div>
            <div class="card card-pad"><div class="section-title"><div><h2>${t("v44.property.nextTransitions")}</h2><p>${t("v44.property.nextTransitionsSub")}</p></div></div><div class="transition-preview">${allowedPropertyTransitions(p.status).length?allowedPropertyTransitions(p.status).map(st=>`<div><span>→</span><strong>${statusLabel(st)}</strong><small>${transitionHint(st)}</small></div>`).join(""):`<div class="foundation-clear-state"><span>✓</span><div><strong>${t("v44.property.finalState")}</strong><small>${t("v44.property.finalStateSub")}</small></div></div>`}</div><div class="business-rule-note"><strong>${t("v44.property.businessRule")}</strong><p>${t("v44.property.businessRuleText")}</p></div></div>
          </div>
        </div>
      </div>
    </div>
    ${entityAuditPanel("property",p.id)}
  </section>`;
}

function propertyBlueprint(unit:string,type:string,area:number,rooms:number,orientation:string){return `<div class="property-blueprint"><div class="blueprint-top"><span>${t("v44.property.conceptPlan")}</span><b>${unit}</b></div><div class="blueprint-canvas"><div class="bp-room bp-main"><span>${rooms>0?t("v44.property.livingZone"):propertyTypeLabel(type)}</span></div><div class="bp-room bp-side"><span>${t("v44.property.serviceZone")}</span></div><div class="bp-room bp-entry"><span>${t("v44.property.entry")}</span></div><div class="bp-direction">N ↑</div></div><div class="blueprint-meta"><strong>${area} m²</strong><span>${orientation}</span></div></div>`}
function tech(label:string,value:string){return`<div><span>${label}</span><strong>${value}</strong></div>`}
function readinessChecklist(p:(typeof properties)[number],docCount:number,dealCount:number){
  const rows=[
    [t("v44.property.check.coreData"),Boolean(p.cadastralCode&&p.address&&p.type)],
    [t("v44.property.check.price"),p.totalPrice>0&&p.pricePerSqm>0],
    [t("v44.property.check.legal"),p.legalStatus!=="restricted"&&!p.restrictionDetails?.some(x=>x.status==="active")],
    [t("v44.property.check.documents"),docCount>=2],
    [t("v44.property.check.sales"),!["unavailable","suspended","cancelled"].includes(p.status)],
    [t("v44.property.check.context"),dealCount>0||["available","offered","pre-reserved","returned-to-sale"].includes(p.status)]
  ];
  return`<div class="property-readiness-list">${rows.map(([label,ok])=>`<div><span class="checkmark ${ok?"":"pending"}">${ok?"✓":"!"}</span><strong>${label}</strong><small>${ok?t("v44.property.ready"):t("v44.property.requiresAttention")}</small></div>`).join("")}</div>`
}
function documentCard(d:any){return`<button class="document-control-card"><div class="document-file-icon">${d.fileType}</div><div><span>${t(`v44.property.docCategory.${d.category}`)}</span><strong>${d.title}</strong><small>${d.version} · ${d.updatedAt}</small></div><div class="document-card-meta"><span class="chip">${d.source}</span><small>${t(`v44.property.confidentiality.${d.confidentiality}`)}</small></div></button>`}
function restrictionList(p:(typeof properties)[number]){const rows=p.restrictionDetails??[];return rows.length?`<div class="restriction-list">${rows.map(r=>`<div><span class="attention-badge">!</span><div><strong>${r.type}</strong><p>${r.basis}${r.note?` · ${r.note}`:""}</p><small>${r.registeredAt??""}${r.validUntil?` → ${r.validUntil}`:""}</small></div><span class="status ${r.status==="active"?"danger":r.status==="review"?"warning":"success"}">${statusLabel(r.status)}</span></div>`).join("")}</div>`:`<div class="foundation-clear-state"><span>✓</span><div><strong>${t("v41.property.noRestrictions")}</strong><small>${t("propertyDetail.readyForSale")}</small></div></div>`}
function transitionHint(status:PropertyStatus){const key=`v44.property.transition.${status}`;const value=t(key);return value===key?t("v44.property.transitionDefault"):value}

export function bindPropertyDetail(){
  bindTabs("#propertyTabs");
  document.querySelector("#backProperties")?.addEventListener("click",()=>navigate("properties"));
  document.querySelectorAll("#changePrice,#quickPrice").forEach(el=>el.addEventListener("click",openPrice));
  document.querySelectorAll("#changeStatus,#lifecycleChangeStatus").forEach(el=>el.addEventListener("click",openStatusChange));
  document.querySelector("#propertyDocs")?.addEventListener("click",()=>{document.querySelector<HTMLElement>('[data-tab-target="documents"]')?.click()});
  document.querySelector("#startPropertyDeal")?.addEventListener("click",()=>navigate("deals?property="+location.hash.split("/").pop()));
  document.querySelectorAll("[data-related-deal]").forEach(el=>el.addEventListener("click",()=>navigate("deal/"+(el as HTMLElement).dataset.relatedDeal)));
  document.querySelector("#addPropertyDocument")?.addEventListener("click",openDocumentForm);
}

function currentProperty(){const id=location.hash.split("/").pop()!;return properties.find(x=>x.id===id)}
function openStatusChange(){
  const p=currentProperty();if(!p)return;const transitions=allowedPropertyTransitions(p.status);
  openLocalizedModal(t("v44.property.changeStatus"),transitions.length?`<div class="status-change-workspace"><div class="status-change-current"><span>${t("v44.property.currentStatus")}</span>${badge(p.status)}</div><div class="form-field"><label>${t("v44.property.nextStatus")}</label><select id="propertyNextStatus">${transitions.map(st=>`<option value="${st}">${statusLabel(st)}</option>`).join("")}</select></div><div class="form-field"><label>${t("v44.property.changeReason")}</label><textarea id="propertyStatusReason">${t("v44.property.defaultStatusReason")}</textarea></div><div class="business-rule-note"><strong>${t("v44.property.businessRule")}</strong><p>${t("v44.property.businessRuleText")}</p></div></div>`:`<div class="empty">${t("v44.property.noTransitions")}</div>`,transitions.length?`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="savePropertyStatus">${t("v44.property.applyStatus")}</button>`:`<button class="btn" data-modal-close>${t("common.close")}</button>`);
  if(!transitions.length)return;
  setTimeout(()=>document.querySelector("#savePropertyStatus")?.addEventListener("click",()=>{const target=document.querySelector<HTMLSelectElement>("#propertyNextStatus")?.value as PropertyStatus;const result=validatePropertyTransition(p,target,{deals,contracts,schedule:paymentSchedule,registrations:registrationCases});if(!result.ok){toastLocalized(t(`v44.property.block.${result.code}`));return}const reason=(document.querySelector<HTMLTextAreaElement>("#propertyStatusReason")?.value??"").trim();const oldStatus=p.status;p.status=target;p.statusHistory??=[];p.statusHistory.push({id:`PSE-${p.id}-${p.statusHistory.length+1}`,status:target,at:"23.09.2026 · сейчас",actor:"Commercial Office",note:reason});recordAudit({module:"properties",action:"status",entityType:"property",entityId:p.id,entityLabel:`${p.project} · ${p.unit}`,route:`property/${p.id}`,field:"Property status",oldValue:oldStatus,newValue:target,note:reason});closeModal();toastLocalized(t("v44.property.statusUpdated"));navigate("properties");setTimeout(()=>navigate("property/"+p.id),20)}),0);
}
function openDocumentForm(){const p=currentProperty();if(!p)return;openLocalizedModal(t("v44.property.addDocument"),`<div class="form-grid"><div class="form-field full"><label>${t("v44.property.documentTitle")}</label><input id="newPropertyDocTitle" value="${p.unit} · ${t("propertyDetail.projectDocumentation")}"></div><div class="form-field"><label>${t("v44.property.documentCategory")}</label><select id="newPropertyDocCategory"><option value="floor-plan">${t("v44.property.docCategory.floor-plan")}</option><option value="technical-passport">${t("v44.property.docCategory.technical-passport")}</option><option value="title-document">${t("v44.property.docCategory.title-document")}</option><option value="project-document">${t("v44.property.docCategory.project-document")}</option><option value="other">${t("v44.property.docCategory.other")}</option></select></div><div class="form-field"><label>${t("v44.property.version")}</label><input id="newPropertyDocVersion" value="v1.0"></div></div>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="savePropertyDocument">${t("v44.property.saveDocument")}</button>`);setTimeout(()=>document.querySelector("#savePropertyDocument")?.addEventListener("click",()=>{const title=(document.querySelector<HTMLInputElement>("#newPropertyDocTitle")?.value??"").trim();if(!title)return;p.documents??=[];p.documents.push({id:`PD-${p.id}-${p.documents.length+1}`,title,category:(document.querySelector<HTMLSelectElement>("#newPropertyDocCategory")?.value??"other") as any,fileType:"PDF",version:document.querySelector<HTMLInputElement>("#newPropertyDocVersion")?.value||"v1.0",updatedAt:"22.09.2026",status:"current",source:"platform",confidentiality:"internal"});closeModal();toastLocalized(t("v44.property.documentAdded"));navigate("properties");setTimeout(()=>navigate("property/"+p.id),20)}),0)}

function openPrice(){
  const p=currentProperty();if(!p)return;
  openLocalizedModal(t("propertyDetail.priceChange"),`<div class="form-grid">
    <div class="form-field"><label>${t("propertyDetail.currentPriceM")} · ${p.currency}</label><input id="newPpsm" type="number" value="${p.pricePerSqm}"></div>
    <div class="form-field"><label>${t("propertyDetail.newTotalValue")}</label><input id="newTotalPreview" value="${p.totalPrice}" disabled></div>
    <div class="form-field full"><label>${t("propertyDetail.reasonForChange")}</label><textarea id="priceReason">${t("propertyDetail.newPriceListVersion")}</textarea></div>
  </div>`,`<button class="btn" data-modal-close>${t("propertyDetail.cancel")}</button><button class="btn btn-accent" id="savePrice">${t("propertyDetail.save")}</button>`);
  setTimeout(()=>{const input=document.querySelector<HTMLInputElement>("#newPpsm"),preview=document.querySelector<HTMLInputElement>("#newTotalPreview");input?.addEventListener("input",()=>{if(preview)preview.value=String(Math.round(p.area*Number(input.value||0)))});document.querySelector("#savePrice")?.addEventListener("click",()=>{const v=Number(input?.value??p.pricePerSqm),oldPrice=p.pricePerSqm,oldTotal=p.totalPrice;p.pricePerSqm=v;p.totalPrice=Math.round(p.area*v);const reasonValue=(document.querySelector<HTMLTextAreaElement>("#priceReason")?.value||"").trim();const storedReason=reasonValue===t("propertyDetail.newPriceListVersion")?"i18n:propertyDetail.newPriceListVersion":reasonValue||"i18n:propertyDetail.individualAdjustment";propertyPriceHistory.push({id:`PH-${propertyPriceHistory.length+1}`,propertyId:p.id,pricePerSqm:p.pricePerSqm,totalPrice:p.totalPrice,effectiveFrom:"23.09.2026",versionId:"MANUAL",reason:storedReason});recordAudit({module:"properties",action:"update",entityType:"property",entityId:p.id,entityLabel:`${p.project} · ${p.unit}`,route:`property/${p.id}`,field:"Price per sqm",oldValue:`${oldPrice} ${p.currency}`,newValue:`${p.pricePerSqm} ${p.currency}`,note:`${reasonValue} · total ${oldTotal} → ${p.totalPrice}`});closeModal();toastLocalized(t("propertyDetail.propertyPriceUpdatedInDemoSession"));navigate("properties");setTimeout(()=>navigate("property/"+p.id),20)})},0);
}
