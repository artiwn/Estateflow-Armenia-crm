import {deals,clients,properties,contracts,mortgageApplications,paymentSchedule,handoverCases,approvals,registrationCases,powersOfAttorney,dealObligations,financialSecurities,paymentReceipts} from "../data/mock";
import {clientOffers,clientReservations,clientDocuments,relatedPeople} from "../data/client360";
import {amd,badge,clientTypeLabel,financingTypeLabel,money,propertyTypeLabel,statusLabel} from "../utils";
import {navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {bindTabs} from "../components/tabs";
import {t} from "../i18n";
import {demoText} from "../demo-i18n";
import {applyRestructure,findRestructureForApproval} from "../services/payments";
import {dealFinancialSummary,penaltyFor,scheduleCurrency} from "../services/finance-control";
import {POA_ACTIONS,poaActionLabel,validateAuthority} from "../services/authority";
import type {PowerOfAttorneyAction,WorkflowRole} from "../models/types";
import {allocateAmount,normalizedAssetLines,syncDealAmountFromAssets} from "../services/package-deal";
import {createManualWorkflowRoute,getRouteById} from "../services/workflow";
import{entityAuditPanel}from"../components/audit-panel";
import{recordAudit}from"../services/audit";


const participantRoleCode:Record<string,string>={coBuyer:"dealDetail.coBuyer",representative:"dealDetail.representative",coBorrower:"dealDetail.coBorrower",spouse:"dealDetail.spouse",signatory:"dealDetail.signatory"};
const participantRoleLabel=(value:string)=>participantRoleCode[value]?t(participantRoleCode[value]):demoText(value);

const tabs=[
  ["overview","dealDetail.tab.overview"],["parties","dealDetail.tab.parties"],["property","dealDetail.tab.property"],["offer","dealDetail.tab.offer"],["reservation","dealDetail.tab.reservation"],
  ["approvals","dealDetail.tab.approvals"],["documents","dealDetail.tab.documents"],["contract","dealDetail.tab.contract"],["payments","dealDetail.tab.payments"],["mortgage","dealDetail.tab.mortgage"],
  ["registration","dealDetail.tab.registration"],["handover","dealDetail.tab.handover"],["history","dealDetail.tab.history"]
] as const;

export function dealDetailPage(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return`<section class="page"><div class="card card-pad">${t("dealDetail.dealNotFound")}</div></section>`;
  const c=clients.find(x=>x.id===d.clientId);
  const dealProperties=(d.propertyIds?.length?d.propertyIds:[d.propertyId]).map(propertyId=>properties.find(x=>x.id===propertyId)).filter(Boolean) as typeof properties;
  const primary=dealProperties[0]??properties.find(x=>x.id===d.propertyId);
  const contract=contracts.find(x=>x.dealId===d.id),mortgage=mortgageApplications.find(x=>x.dealId===d.id),schedule=paymentSchedule.filter(x=>x.dealId===d.id),handover=handoverCases.find((x:any)=>x.dealId===d.id),approvalRows=approvals.filter(x=>x.dealId===d.id),obligations=dealObligations.filter(x=>x.dealId===d.id),registration=registrationCases.find(x=>x.dealId===d.id),offer=clientOffers.find(x=>x.clientId===d.clientId),reservation=clientReservations.find(x=>x.dealId===d.id),docs=clientDocuments.filter(x=>x.clientId===d.clientId),people=relatedPeople.filter(x=>x.clientId===d.clientId),poa=powersOfAttorney.find((x:any)=>x.relatedDeal===d.id);
  return`<section class="page" id="deal360">
    <div class="breadcrumbs"><span>${t("dealDetail.sales")}</span><span>›</span><span>${t("dealDetail.deals")}</span><span>›</span><span>${d.id}</span></div>
    <div class="detail-header">
      <div class="detail-title"><small>${d.id} · ${d.currency} · ${financingTypeLabel(d.financing)}</small><h1>${d.clientName} · ${primary?.unit??d.propertyLabel}${dealProperties.length>1?` <span class="title-count">+${dealProperties.length-1}</span>`:""}</h1><div class="toolbar">${badge(d.status)}<span class="chip">${d.manager}</span><span class="chip accent">${t("v41.deal.assetsCount",{count:dealProperties.length})}</span></div></div>
      <div class="toolbar"><button class="btn" id="backDeals">${t("dealDetail.registry")}</button>${handover?`<button class="btn btn-accent" id="openHandover">${t("dealDetail.handover")}</button>`:""}${mortgage?`<button class="btn" id="openMortgage">${t("dealDetail.mortgage")}</button>`:""}${contract?`<button class="btn" id="openContract">${t("dealDetail.contract")}</button>`:""}<button class="btn btn-primary" id="nextDealStage">${t("dealDetail.nextStage")}</button></div>
    </div>
    <div class="deal-foundation-banner">
      <div><span>${t("v41.deal.assets")}</span><strong>${dealProperties.map(p=>p.unit).join(" · ")||"—"}</strong></div>
      <div><span>${t("v41.deal.participants")}</span><strong>${d.participants.length}</strong></div>
      <div><span>${t("v41.deal.currency")}</span><strong>${d.currency}</strong></div>
      <div><span>${t("v41.deal.financing")}</span><strong>${financingTypeLabel(d.financing)}</strong></div>
    </div>
    <div class="tabs">${tabs.map(([key,labelKey],i)=>`<button class="tab ${i===0?"active":""}" data-tab-target="${key}">${t(labelKey)}</button>`).join("")}</div>
    <div class="detail-tab-content">
      <div data-tab-panel="overview">${overview(d,c,dealProperties,schedule,mortgage,handover)}</div>
      <div data-tab-panel="parties" hidden>${parties(d,c,people,poa)}</div>
      <div data-tab-panel="property" hidden>${propertyPanel(dealProperties,d)}</div>
      <div data-tab-panel="offer" hidden>${offerPanel(offer,d)}</div>
      <div data-tab-panel="reservation" hidden>${reservationPanel(reservation)}</div>
      <div data-tab-panel="approvals" hidden>${approvalsPanel(approvalRows,obligations)}</div>
      <div data-tab-panel="documents" hidden>${documentsPanel(docs,contract)}</div>
      <div data-tab-panel="contract" hidden>${contractPanel(contract)}</div>
      <div data-tab-panel="payments" hidden>${paymentsPanel(schedule,d.id,d.currency)}</div>
      <div data-tab-panel="mortgage" hidden>${mortgagePanel(mortgage)}</div>
      <div data-tab-panel="registration" hidden>${registrationPanel(registration)}</div>
      <div data-tab-panel="handover" hidden>${handoverPanel(handover)}</div>
      <div data-tab-panel="history" hidden>${historyPanel(d)}</div>
    </div>
  </section>`;
}

function overview(d:any,c:any,dealProperties:any[],schedule:any[],mortgage:any,handover:any){
  const paid=schedule.reduce((sum,x)=>sum+x.paid,0),total=schedule.reduce((sum,x)=>sum+x.amount,0),primary=dealProperties[0];
  const listValue=dealProperties.reduce((sum,p)=>sum+p.totalPrice,0);
  return`<div class="grid grid-4 u-mb-16">${metric(t("dealDetail.metric.value"),money(d.amount,d.currency))}${metric(t("v41.deal.assets"),String(dealProperties.length))}${metric(t("dealDetail.metric.paid"),money(paid,d.currency))}${metric(t("dealDetail.metric.balance"),money(Math.max(total-paid,0),d.currency))}</div>
    <div class="split">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.dealSummary")}</h2><p>${t("dealDetail.keyCommercialAndLegalParameters")}</p></div><span class="chip accent">${t("v41.deal.addedFoundation")}</span></div>
        <div class="info-list">
          <div class="info-box"><span>${t("dealDetail.buyer")}</span><strong>${c?.name??d.clientName}</strong></div>
          <div class="info-box"><span>${t("v41.deal.assets")}</span><strong>${dealProperties.map(p=>p.unit).join(", ")||"—"}</strong></div>
          <div class="info-box"><span>${t("v41.deal.listPrice")}</span><strong>${money(listValue,d.currency)}</strong></div>
          <div class="info-box"><span>${t("dealDetail.metric.discount")}</span><strong>${d.discount}%</strong></div>
          <div class="info-box"><span>${t("v41.deal.financing")}</span><strong>${mortgage?`${financingTypeLabel(d.financing)} · ${mortgage.bank}`:financingTypeLabel(d.financing)}</strong></div>
          <div class="info-box"><span>${t("v41.deal.tax")}</span><strong>${d.taxIncluded?t("v41.deal.taxIncluded"):"—"}</strong></div>
          <div class="info-box"><span>${t("v41.deal.currency")}</span><strong>${d.currency}</strong></div>
          <div class="info-box"><span>${t("dealDetail.nextStep")}</span><strong>${demoText(d.nextAction)}</strong></div>
        </div>
        ${primary?`<div class="soft-callout"><span>${t("v41.deal.primaryAsset")}</span><strong>${primary.project} · ${primary.phase} · ${primary.unit}</strong><button class="btn btn-soft" data-global-route="property/${primary.id}">${t("dealDetail.open")}</button></div>`:""}
      </div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.dealJourney")}</h2><p>${t("dealDetail.workflowAndTransitionControl")}</p></div></div><div class="timeline">${handover?handoverTimeline():salesTimeline(d.status)}</div></div>
    </div>`;
}
function metric(label:string,v:string){return`<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div class="metric-value u-fs-20">${v}</div></div>`}

function parties(d:any,c:any,people:any[],poa:any){
  const dealPeople=d.participants?.length?d.participants:[{id:`DP-${d.id}-1`,clientId:c?.id,name:c?.name??d.clientName,role:"buyer",phone:c?.phone,sharePercent:100}];
  return`<div class="grid grid-2">
    <div class="card card-pad"><div class="section-title"><div><h2>${t("v41.deal.participants")}</h2><p>${t("dealDetail.contractParty")}</p></div><button class="btn btn-primary" id="addDealParticipant">${t("dealDetail.participant")}</button></div>
      <div class="deal-participant-list">${dealPeople.map((x:any)=>`<div class="deal-participant-card"><div class="avatar ${x.role==="buyer"?"accent":""}">${x.name.slice(0,1)}</div><div><span>${t(`v41.deal.role.${x.role}`)}</span><strong>${x.name}</strong><small>${x.phone??"—"}${x.sharePercent!=null?` · ${x.sharePercent}%`:""}</small></div>${x.role==="buyer"&&x.clientId?`<button class="btn btn-soft" data-client-link="${x.clientId}">${t("dealDetail.openClient")}</button>`:""}</div>`).join("")}</div>
    </div>
    <div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.relatedParties")}</h2><p>${t("dealDetail.representativesSpousesSignatories")}</p></div></div>
      ${c?`<div class="info-list"><div class="info-box"><span>${t("dealDetail.nameCompany")}</span><strong>${c.name}</strong></div><div class="info-box"><span>${t("dealDetail.type")}</span><strong>${clientTypeLabel(c.type)}</strong></div><div class="info-box"><span>${t("dealDetail.phone")}</span><strong>${c.phone}</strong></div><div class="info-box"><span>${t("dealDetail.email")}</span><strong>${c.email}</strong></div></div>`:"—"}
      ${people.length?`<div class="divider"></div>${people.map(x=>`<div class="attention-item"><div class="avatar">${x.name.slice(0,1)}</div><div class="attention-copy"><strong>${x.name}</strong><span>${participantRoleLabel(x.role)} · ${x.phone}</span></div></div>`).join("")}`:""}
      ${poa?`<div class="deal-authority-card"><div class="deal-authority-head"><div><span>${t("v43.authority.representation")}</span><strong>${poa.documentNo} · ${poa.representative}</strong><small>${t(`status.${poa.status}`)} · ${poa.expiresAt}</small></div><span class="authority-shield ${["active","expiring"].includes(poa.status)?"ok":"fail"}">${["active","expiring"].includes(poa.status)?"✓":"!"}</span></div><div class="deal-authority-actions">${poa.allowedActions.slice(0,4).map((a:any)=>`<span>${poaActionLabel(a)}</span>`).join("")}</div><div class="toolbar u-mt-10"><button class="btn btn-soft" data-global-route="poa/${poa.id}">${t("dealDetail.open")}</button><button class="btn btn-primary" id="dealAuthorityCheck">${t("v43.authority.check")}</button></div></div>`:`<div class="soft-callout"><span>${t("v43.authority.representation")}</span><strong>${t("v43.authority.inPerson")}</strong><span>${t("v43.authority.inPersonText")}</span></div>`}
    </div>
  </div>`;
}

function propertyPanel(rows:any[],d:any){
  if(!rows.length)return`<div class="card card-pad">${t("dealDetail.propertyNotFound")}</div>`;
  const listTotal=rows.reduce((sum,p)=>sum+p.totalPrice,0),lines=normalizedAssetLines(d,properties);
  return `<div class="card card-pad"><div class="section-title"><div><h2>${t("v41.deal.assets")}</h2><p>${rows.length>1?t("v45.package.dealAssetsSub"):t("v41.deal.assetsSubtitle")}</p></div><div class="toolbar"><span class="chip accent">${t("v41.deal.assetsCount",{count:rows.length})}</span>${rows.length>1?`<button class="btn btn-soft" id="configurePackage">${t("v45.package.configure")}</button>`:""}</div></div>
    ${rows.length>1?`<div class="package-deal-banner"><div><span>${t("v45.package.bundle")}</span><strong>${rows.map(p=>p.unit).join(" + ")}</strong></div><div><span>${t("v45.package.contractLogic")}</span><strong>${lines.every(x=>x.contractMode==="shared")?t("v45.package.sharedContract"):t("v45.package.mixedContracts")}</strong></div><div><span>${t("v45.package.packageDiscount")}</span><strong>${d.discount}%</strong></div></div>`:""}
    <div class="deal-assets-grid">${rows.map((p,index)=>{const line=lines.find(x=>x.propertyId===p.id);return`<button class="deal-asset-card package-deal-asset" data-global-route="property/${p.id}"><div class="deal-asset-top"><div><span>${index===0?t("v41.deal.primaryAsset"):t("v41.deal.asset")} · ${propertyTypeLabel(p.type)}</span><strong>${p.project} · ${p.unit}</strong><small>${p.phase} · ${t("propertyDetail.building")} ${p.building} · ${t("propertyDetail.floor")} ${p.floor}</small></div>${badge(p.status)}</div><div class="deal-asset-metrics"><div><span>${t("dealDetail.area")}</span><strong>${p.area} m²</strong></div><div><span>${t("v45.package.listPrice")}</span><strong>${money(line?.listPrice??p.totalPrice,p.currency)}</strong></div><div><span>${t("v45.package.dealPrice")}</span><strong>${money(line?.dealPrice??p.totalPrice,d.currency)}</strong></div></div><div class="package-asset-terms"><span>${t("dealDetail.discount")}: <b>${line?.discountPercent??0}%</b></span><span>${t("v45.package.paymentShare")}: <b>${line?.paymentSharePercent??0}%</b></span><span>${t("v45.package.contract")}: <b>${line?.contractMode==="separate"?t("v45.package.separateContract"):t("v45.package.sharedContract")}</b></span></div></button>`}).join("")}</div>
    <div class="deal-commercial-summary"><div><span>${t("v41.deal.listPrice")}</span><strong>${money(listTotal,d.currency)}</strong></div><div><span>${t("dealDetail.discount")}</span><strong>${d.discount}%</strong></div><div><span>${t("dealDetail.dealPrice")}</span><strong>${money(d.amount,d.currency)}</strong></div><div><span>${t("dealDetail.differenceFromListPrice")}</span><strong>${money(Math.max(listTotal-d.amount,0),d.currency)}</strong></div></div>
  </div>`;
}
function offerPanel(o:any,d:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.commercialOffer")}</h2><p>${t("dealDetail.termsThatFormedTheDeal")}</p></div><button class="btn" data-demo-action="new-offer-version">${t("dealDetail.newVersion")}</button></div>
    ${o?`<div class="info-list"><div class="info-box"><span>${t("dealDetail.number")}</span><strong>${o.id}</strong></div><div class="info-box"><span>${t("dealDetail.created")}</span><strong>${demoText(o.createdAt)}</strong></div><div class="info-box"><span>${t("dealDetail.properties")}</span><strong>${o.objects.join(", ")}</strong></div><div class="info-box"><span>${t("dealDetail.amount")}</span><strong>${amd(o.total)}</strong></div><div class="info-box"><span>${t("dealDetail.validUntil")}</span><strong>${o.validUntil}</strong></div><div class="info-box"><span>${t("dealDetail.status")}</span><strong>${statusLabel(o.status)}</strong></div></div><div class="soft-callout"><span>${t("dealDetail.conversion")}</span><strong>${t("dealDetail.offerLinkedToDeal")} ${d.id}</strong><button class="btn btn-soft" data-demo-action="preview-offer">${t("dealDetail.viewPdf")}</button></div>`:`<div class="empty compact-empty">${t("dealDetail.linkedOfferNotFound")}</div>`}
  </div>`;
}
function reservationPanel(r:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.reservation")}</h2><p>${t("dealDetail.reservationTermAndFee")}</p></div></div>
    ${r?`<div class="info-list"><div class="info-box"><span>${t("dealDetail.number")}</span><strong>${r.id}</strong></div><div class="info-box"><span>${t("dealDetail.property")}</span><strong>${r.property}</strong></div><div class="info-box"><span>${t("dealDetail.start")}</span><strong>${r.from}</strong></div><div class="info-box"><span>${t("dealDetail.validUntil")}</span><strong>${r.until}</strong></div><div class="info-box"><span>${t("dealDetail.contribution")}</span><strong>${amd(r.fee)}</strong></div><div class="info-box"><span>${t("dealDetail.status")}</span><strong>${statusLabel(r.status)}</strong></div></div>`:`<div class="empty compact-empty">${t("dealDetail.noSeparateReservationIsRegisteredForThisDeal")}</div>`}
  </div>`;
}
function approvalType(type:string){const key=({application:"v47.type.application",discount:"dealDetail.approvalType.discount",contract:"dealDetail.approvalType.contract","payment-plan":"dealDetail.approvalType.paymentPlan",legal:"dealDetail.approvalType.legal",executive:"v47.type.executive"} as Record<string,string>)[type];return key?t(key):type}
const dealWorkflowRole=(role?:string)=>({"Sales Head":t("role.salesHead"),"Commercial Director":t("role.commercialDirector"),Legal:t("role.legal"),Finance:t("role.finance"),"Financial Director":t("role.financialDirector"),CEO:t("role.ceo")}[role??""]??role??"—");
function approvalsPanel(rows:any[],obligations:any[]){
  return`<div class="grid grid-2">
    <div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.approvals")}</h2><p>${t("dealDetail.discountsContractDeviationsSchedulesAndLegalChecks")}</p></div><div class="toolbar"><button class="btn btn-accent" id="newDealApproval">${t("dealDetail.approval")}</button><button class="btn" data-global-route="approvals">${t("dealDetail.center")}</button></div></div>
      ${rows.length?rows.map(a=>{const route=a.routeId?getRouteById(a.routeId):undefined;return`<div class="attention-item deal-workflow-approval"><div class="attention-badge">${a.status==="approved"?"✓":a.status==="queued"?"↳":"●"}</div><div class="attention-copy"><strong>${approvalType(a.type)} · ${demoText(a.requestedValue)}</strong><span>${demoText(a.reason)} · ${a.requestedBy}</span><div class="deal-approval-meta">${a.requiredRole?`<em>${dealWorkflowRole(a.requiredRole)}</em>`:""}${route?`<button class="link-button" data-deal-route="${route.id}">${route.id}${a.sequence?` · ${t("v47.routes.step")} ${a.sequence}`:""}</button>`:""}${a.priority?`<em class="priority-label ${a.priority}">${t(`v47.priority.${a.priority}`)}</em>`:""}</div>${a.condition?`<small class="approval-inline-condition">${t("dealDetail.condition")} ${demoText(a.condition)}</small>`:""}</div>${badge(a.status)}</div>`}).join(""):`<div class="empty compact-empty">${t("dealDetail.noApprovalsForThisDeal")}</div>`}
    </div>
    <div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.conditionalObligations")}</h2><p>${t("dealDetail.whatMustBeCompletedAfterConditionalApproval")}</p></div></div>
      ${obligations.length?obligations.map(o=>`<div class="obligation-row"><div><strong>${demoText(o.title)}</strong><span>${demoText(o.condition)}</span><small>${demoText(o.owner)} · ${demoText(o.createdAt)}</small></div><div><span class="status ${o.status==="completed"?"success":"warning"}">${statusLabel(o.status)}</span>${o.status==="open"?`<button class="btn btn-soft u-mt-7" data-complete-obligation="${o.id}">${t("dealDetail.completed")}</button>`:""}</div></div>`).join(""):`<div class="empty compact-empty">${t("dealDetail.noConditionalObligations")}</div>`}
    </div>
  </div>`;
}
function documentSource(value:string){const m=value.match(/^Deal (.+)$/);return m?`${t("dealDetail.deal")} ${m[1]}`:demoText(value)}
function documentsPanel(docs:any[],contract:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.documentPackage")}</h2><p>${t("dealDetail.clientAndDealDocuments")}</p></div><button class="btn btn-primary" data-demo-action="upload-deal-doc">${t("dealDetail.document")}</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>${t("dealDetail.document2")}</th><th>${t("dealDetail.number")}</th><th>${t("dealDetail.date")}</th><th>${t("dealDetail.source")}</th><th>${t("dealDetail.status")}</th></tr></thead><tbody>
      ${docs.map(x=>`<tr><td><strong>${demoText(x.type)}</strong></td><td>${x.number}</td><td>${x.issuedAt}</td><td>${documentSource(x.source)}</td><td>${statusLabel(x.status)}</td></tr>`).join("")}
      ${contract?`<tr><td><strong>${demoText(contract.type)}</strong></td><td>${contract.id}</td><td>${contract.createdAt}</td><td>${t("deal.contractEngine")}</td><td>${statusLabel(contract.status)}</td></tr>`:""}
    </tbody></table></div>
  </div>`;
}
function contractPanel(c:any){
  const assetCount=c?(c.propertyIds?.length??1):0;
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.contract")}</h2><p>${t("dealDetail.legalSideOfTheDeal")}</p></div>${c?`<button class="btn btn-primary" data-contract-link="${c.id}">${t("dealDetail.openContract360")}</button>`:""}</div>
    ${c?`${assetCount>1?`<div class="package-deal-banner"><div><span>${t("v45.package.bundleContract")}</span><strong>${c.propertyLabel}</strong></div><div><span>${t("v45.package.assets")}</span><strong>${assetCount}</strong></div><div><span>${t("v45.package.contractLogic")}</span><strong>${c.packageMode==="separate"?t("v45.package.mixedContracts"):t("v45.package.sharedContract")}</strong></div></div>`:""}<div class="info-list"><div class="info-box"><span>${t("dealDetail.number")}</span><strong>${c.id}</strong></div><div class="info-box"><span>${t("dealDetail.type")}</span><strong>${demoText(c.type)}</strong></div><div class="info-box"><span>${t("dealDetail.template")}</span><strong>${c.template}</strong></div><div class="info-box"><span>${t("dealDetail.language")}</span><strong>${c.language}</strong></div><div class="info-box"><span>${t("dealDetail.version")}</span><strong>${c.versions.at(-1)?.version??"—"}</strong></div><div class="info-box"><span>${t("dealDetail.deviations")}</span><strong>${c.nonStandardClauses}</strong></div></div>`:`<div class="empty compact-empty">${t("dealDetail.contractHasNotBeenCreatedYet")}</div>`}
  </div>`;
}
function paymentsPanel(rows:any[],dealId:string,currency:any){
  const summary=dealFinancialSummary(dealId),receipts=paymentReceipts.filter(x=>x.dealId===dealId),securities=financialSecurities.filter(x=>x.dealId===dealId);
  return`<div class="finance-deal-summary u-mb-16">${metric(t("dealDetail.metric.scheduled"),money(summary.scheduled,summary.currency))}${metric(t("dealDetail.metric.received"),money(summary.paid,summary.currency))}${metric(t("dealDetail.metric.balance"),money(summary.balance,summary.currency))}${metric(t("v50.payments.penalty"),money(summary.penalty,summary.currency))}${metric(t("v50.finance.advances"),money(summary.advance,summary.currency))}</div>
    <div class="card"><div class="card-pad table-toolbar"><div><strong>${t("v50.dealFinance.schedule")}</strong><div class="subtle">${t("v50.dealFinance.scheduleSub")}</div></div><button class="btn btn-soft" data-global-route="payments">${t("v50.dealFinance.openPayments")}</button></div><div class="table-wrap"><table class="table package-payment-table"><thead><tr><th>${t("dealDetail.stage")}</th><th>${t("dealDetail.deadline")}</th><th>${t("dealDetail.source")}</th><th>${t("v50.payments.currencyRate")}</th><th>${t("dealDetail.plan")}</th><th>${t("v45.package.allocation")}</th><th>${t("dealDetail.paid")}</th><th>${t("v50.payments.penalty")}</th><th>${t("dealDetail.status")}</th></tr></thead><tbody>${rows.map(x=>{const rowCurrency=scheduleCurrency(x),pen=penaltyFor(x);return`<tr><td><strong>${demoText(x.title)}</strong></td><td>${x.dueDate}</td><td>${documentSource(x.source)}</td><td><strong>${rowCurrency}</strong><div class="table-sub">${t(`v50.fxRule.${x.exchangeRateRule??"payment-date"}`)}</div></td><td>${money(x.amount,rowCurrency)}</td><td>${x.allocations?.length?`<div class="payment-allocation-list">${x.allocations.map((a:any)=>{const p=properties.find(p=>p.id===a.propertyId);return`<span><b>${p?.unit??a.propertyId}</b>${money(a.amount,rowCurrency)}</span>`}).join("")}</div>`:`<span class="subtle">${t("v45.package.wholeDeal")}</span>`}</td><td>${money(x.paid,rowCurrency)}</td><td>${pen.amount?`<strong class="penalty-value">${money(pen.amount,rowCurrency)}</strong><div class="table-sub">${pen.chargeableDays} ${t("v50.payments.days")}</div>`:"—"}</td><td>${badge(x.status)}</td></tr>`}).join("")||`<tr><td colspan="9"><div class="empty">${t("dealDetail.scheduleHasNotBeenCreatedYet")}</div></td></tr>`}</tbody></table></div></div>
    <div class="grid grid-2 u-mt-16"><div class="card card-pad"><div class="section-title"><div><h2>${t("v50.dealFinance.receipts")}</h2><p>${t("v50.dealFinance.receiptsSub")}</p></div></div>${receipts.length?`<div class="deal-finance-mini-list">${receipts.slice().reverse().map(r=>`<div><span>${r.receivedAt} · ${r.reference}</span><strong>${money(r.sourceAmount,r.sourceCurrency)}</strong><small>${t("v50.payments.allocated")}: ${money(r.allocatedAmount,r.dealCurrency)}${r.unallocatedAmount?` · ${t("v50.payments.advance")}: ${money(r.unallocatedAmount,r.dealCurrency)}`:""}</small></div>`).join("")}</div>`:`<div class="empty compact-empty">${t("v50.dealFinance.noReceipts")}</div>`}</div><div class="card card-pad"><div class="section-title"><div><h2>${t("v50.dealFinance.securities")}</h2><p>${t("v50.dealFinance.securitiesSub")}</p></div><button class="text-btn" data-global-route="securities">${t("financePage.open")}</button></div>${securities.length?`<div class="deal-finance-mini-list">${securities.map(s=>`<div><span>${t(`v50.securityType.${s.type}`)} · ${s.provider}</span><strong>${money(s.amount,s.currency)}</strong><small>${s.documentNo} · ${statusLabel(s.status)}</small></div>`).join("")}</div>`:`<div class="empty compact-empty">${t("v50.dealFinance.noSecurities")}</div>`}</div></div>`;
}
function mortgagePanel(m:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.mortgageFinancing")}</h2><p>${t("dealDetail.bankDocumentCompletenessAndDecision")}</p></div>${m?`<button class="btn btn-primary" data-mortgage-link="${m.id}">${t("deal.mortgage360")}</button>`:""}</div>
    ${m?`<div class="info-list"><div class="info-box"><span>${t("dealDetail.bank")}</span><strong>${m.bank}</strong></div><div class="info-box"><span>${t("dealDetail.program")}</span><strong>${demoText(m.program)}</strong></div><div class="info-box"><span>${t("dealDetail.requested")}</span><strong>${amd(m.requestedAmount)}</strong></div><div class="info-box"><span>${t("dealDetail.approved")}</span><strong>${m.approvedAmount?amd(m.approvedAmount):"—"}</strong></div><div class="info-box"><span>${t("dealDetail.documents")}</span><strong>${m.documentsDone}/${m.documentsTotal}</strong></div><div class="info-box"><span>${t("dealDetail.decisionDeadline")}</span><strong>${m.decisionDue}</strong></div></div>`:`<div class="empty compact-empty">${t("dealDetail.mortgageApplicationIsNotLinkedToTheDeal")}</div>`}
  </div>`;
}
function registrationPanel(r:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.notaryStateRegistration")}</h2><p>${t("dealDetail.submissionFeeStatusAndResult")}</p></div><button class="btn" data-global-route="registration">${t("dealDetail.openRegistry")}</button></div>
    ${r?`<div class="info-list"><div class="info-box"><span>${t("deal.case")}</span><strong>${r.id}</strong></div><div class="info-box"><span>${t("dealDetail.notary")}</span><strong>${r.notary}</strong></div><div class="info-box"><span>${t("dealDetail.scheduled")}</span><strong>${r.plannedAt}</strong></div><div class="info-box"><span>${t("dealDetail.stateFee")}</span><strong>${amd(r.stateFee)}</strong></div><div class="info-box"><span>${t("dealDetail.application")}</span><strong>${r.applicationNo??t("dealDetail.notSubmittedYet")}</strong></div><div class="info-box"><span>${t("dealDetail.status")}</span><strong>${statusLabel(r.status)}</strong></div></div>`:`<div class="empty compact-empty">${t("dealDetail.registrationProcessHasNotBeenCreatedYet")}</div>`}
  </div>`;
}
function handoverPanel(h:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.propertyHandover")}</h2><p>${t("dealDetail.readinessInspectionDefectsActAndKeys")}</p></div>${h?`<button class="btn btn-primary" data-handover-link="${h.id}">${t("deal.handover360")}</button>`:""}</div>
    ${h?`<div class="info-list"><div class="info-box"><span>${t("deal.case")}</span><strong>${h.id}</strong></div><div class="info-box"><span>${t("dealDetail.inspection")}</span><strong>${h.plannedAt}</strong></div><div class="info-box"><span>${t("deal.technicalReadiness")}</span><strong>${h.technicalReadiness}%</strong></div><div class="info-box"><span>${t("deal.financeClearance")}</span><strong>${h.financialClearance?t("dealDetail.state.passedM"):t("dealDetail.state.awaiting")}</strong></div><div class="info-box"><span>${t("deal.registration")}</span><strong>${h.registrationClearance?t("dealDetail.state.passedF"):t("dealDetail.state.awaiting")}</strong></div><div class="info-box"><span>${t("dealDetail.keys")}</span><strong>${h.keysCount} ${t("dealDetail.sets")}</strong></div></div>`:`<div class="empty compact-empty">${t("dealDetail.propertyHandoverHasNotBeenOpenedYet")}</div>`}
  </div>`;
}
function historyPanel(d:any){
  return`<div class="card card-pad"><div class="section-title"><div><h2>${t("dealDetail.dealHistory")}</h2><p>${t("dealDetail.keyEventsAndStatusChanges")}</p></div></div><div class="timeline">
    ${timeline(t("dealDetail.timeline.dealCreated"),`${t("dealDetail.sales")} · 12.09.2026`,"done")}
    ${timeline(t("dealDetail.timeline.propertyAssigned"),`${d.propertyLabel} · 13.09.2026`,"done")}
    ${timeline(t("dealDetail.timeline.commercialTermsApproved"),`${t("dealDetail.discount")} ${d.discount}% · 14.09.2026`,"done")}
    ${timeline(t("dealDetail.timeline.currentStatus"),`${statusLabel(d.status)} · ${demoText(d.nextAction)}`,"current")}
  </div></div>${entityAuditPanel("deal",d.id)}`;
}
function timeline(title:string,sub:string,state:string){return`<div class="timeline-item ${state}"><div class="timeline-dot"></div><div class="timeline-copy"><strong>${title}</strong><span>${sub}</span></div></div>`}
function salesTimeline(status:string){
  const flow=[
    ["qualification",t("dealDetail.timeline.clientQualification"),t("dealDetail.timeline.kycNeed")],
    ["offer",t("dealDetail.timeline.commercialOffer"),t("dealDetail.timeline.selectionTerms")],
    ["reservation",t("dealDetail.timeline.reservation"),t("dealDetail.timeline.reservationFee")],
    ["approval",t("dealDetail.timeline.internalApproval"),t("dealDetail.timeline.approvalSub")],
    ["contract",t("dealDetail.timeline.contract"),t("dealDetail.timeline.contractSub")],
    ["payment",t("dealDetail.timeline.payments"),t("dealDetail.timeline.paymentsSub")],
    ["registration",t("dealDetail.timeline.stateRegistration"),t("dealDetail.timeline.stateRegistrationSub")],
    ["handover",t("dealDetail.timeline.handover"),t("dealDetail.timeline.handoverSub")]
  ] as const;
  const current=Math.max(0,flow.findIndex(([key])=>key===status));
  return flow.map(([,title,sub],i)=>timeline(title,i<current?t("dealDetail.timeline.completed"):i===current?sub:t("dealDetail.timeline.waiting"),i<current?"done":i===current?"current":"")).join("");
}
function handoverTimeline(){
  return timeline(t("dealDetail.timeline.clientOffer"),t("dealDetail.timeline.completed"),"done")+
    timeline(t("dealDetail.timeline.contract"),t("dealDetail.timeline.signed"),"done")+
    timeline(t("dealDetail.timeline.payments"),t("dealDetail.timeline.financialClearance"),"done")+
    timeline(t("dealDetail.timeline.stateRegistration"),t("dealDetail.timeline.completed"),"done")+
    timeline(t("dealDetail.timeline.technicalReadiness"),t("dealDetail.timeline.confirmed"),"done")+
    timeline(t("dealDetail.timeline.inspectionDefects"),t("dealDetail.timeline.currentStage"),"current")+
    timeline(t("dealDetail.timeline.handoverAct"),t("dealDetail.timeline.waiting"),"")+
    timeline(t("dealDetail.timeline.keysWarranty"),t("dealDetail.timeline.waiting"),"");
}

export function bindDealDetail(){
  bindTabs("#deal360");
  const id=location.hash.split("?")[0].split("/").pop()!;
  const contract=contracts.find(x=>x.dealId===id),mortgage=mortgageApplications.find(x=>x.dealId===id),handover=handoverCases.find((x:any)=>x.dealId===id);
  document.querySelector("#backDeals")?.addEventListener("click",()=>navigate("deals"));
  document.querySelector("#openContract")?.addEventListener("click",()=>contract&&navigate("contract/"+contract.id));
  document.querySelector("#openMortgage")?.addEventListener("click",()=>mortgage&&navigate("mortgage/"+mortgage.id));
  document.querySelector("#openHandover")?.addEventListener("click",()=>handover&&navigate("handover-case/"+handover.id));
  document.querySelector("#nextDealStage")?.addEventListener("click",()=>advanceDeal(id));
  document.querySelector("#addDealParticipant")?.addEventListener("click",()=>openDealParticipant(id));
  document.querySelector("#newDealApproval")?.addEventListener("click",()=>openDealApproval(id));
  document.querySelectorAll<HTMLElement>("[data-deal-route]").forEach(x=>x.addEventListener("click",()=>navigate(`approvals?tab=routes`)));
  document.querySelector("#dealAuthorityCheck")?.addEventListener("click",()=>openDealAuthorityCheck(id));
  document.querySelector("#configurePackage")?.addEventListener("click",()=>openPackageTerms(id));
  document.querySelectorAll<HTMLElement>("[data-client-link]").forEach(x=>x.addEventListener("click",()=>x.dataset.clientLink&&navigate("client/"+x.dataset.clientLink)));
  document.querySelectorAll<HTMLElement>("[data-contract-link]").forEach(x=>x.addEventListener("click",()=>navigate("contract/"+x.dataset.contractLink)));
  document.querySelectorAll<HTMLElement>("[data-mortgage-link]").forEach(x=>x.addEventListener("click",()=>navigate("mortgage/"+x.dataset.mortgageLink)));
  document.querySelectorAll<HTMLElement>("[data-handover-link]").forEach(x=>x.addEventListener("click",()=>navigate("handover-case/"+x.dataset.handoverLink)));
  document.querySelectorAll<HTMLElement>("[data-global-route]").forEach(x=>x.addEventListener("click",()=>navigate(x.dataset.globalRoute!)));
  document.querySelectorAll<HTMLElement>("[data-demo-action]").forEach(x=>x.addEventListener("click",()=>handleDealDemoAction(x.dataset.demoAction!,id)));
  document.querySelectorAll<HTMLElement>("[data-complete-obligation]").forEach(x=>x.addEventListener("click",()=>completeObligation(x.dataset.completeObligation!,id)));
}


function openPackageTerms(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;const rows=(d.propertyIds?.length?d.propertyIds:[d.propertyId]).map(pid=>properties.find(x=>x.id===pid)).filter(Boolean) as typeof properties,lines=normalizedAssetLines(d,properties);if(rows.length<2)return;
  openLocalizedModal(t("v45.package.configure"),`<form id="packageTermsForm" class="package-terms-form"><div class="package-editor-head"><span>${t("v45.package.asset")}</span><span>${t("v45.package.listPrice")}</span><span>${t("dealDetail.discount")}</span><span>${t("v45.package.dealPrice")}</span><span>${t("v45.package.contract")}</span></div>${rows.map(p=>{const line=lines.find(x=>x.propertyId===p.id)!;return`<div class="package-editor-row" data-package-editor="${p.id}"><div><strong>${p.unit}</strong><small>${propertyTypeLabel(p.type)} · ${p.area} m²</small></div><div><strong>${money(p.totalPrice,d.currency)}</strong></div><div><input class="field" type="number" min="0" max="35" step="0.1" name="discount-${p.id}" value="${line.discountPercent}"></div><div class="package-editor-price" data-price-for="${p.id}">${money(line.dealPrice,d.currency)}</div><div><select class="field" name="contract-${p.id}"><option value="shared" ${line.contractMode==="shared"?"selected":""}>${t("v45.package.shared")}</option><option value="separate" ${line.contractMode==="separate"?"selected":""}>${t("v45.package.separate")}</option></select></div></div>`}).join("")}<div class="package-editor-total"><span>${t("v45.package.packagePrice")}</span><strong id="packageEditorTotal">${money(d.amount,d.currency)}</strong></div><div class="modal-note">${t("v45.package.editorNote")}</div></form>`,`<button class="btn" data-modal-close>${t("dealDetail.cancel")}</button><button class="btn btn-accent" id="savePackageTerms">${t("v45.package.applyTerms")}</button>`);
  setTimeout(()=>{
    const form=document.querySelector<HTMLFormElement>("#packageTermsForm")!;
    const recalc=()=>{let total=0;rows.forEach(p=>{const raw=(form.elements.namedItem(`discount-${p.id}`) as HTMLInputElement)?.value??"0",discount=Math.max(0,Math.min(35,Number(raw)||0)),price=Math.round(p.totalPrice*(1-discount/100));total+=price;const el=form.querySelector<HTMLElement>(`[data-price-for="${p.id}"]`);if(el)el.textContent=money(price,d.currency)});const totalEl=form.querySelector<HTMLElement>("#packageEditorTotal");if(totalEl)totalEl.textContent=money(total,d.currency)};
    rows.forEach(p=>(form.elements.namedItem(`discount-${p.id}`) as HTMLInputElement)?.addEventListener("input",recalc));
    document.querySelector("#savePackageTerms")?.addEventListener("click",()=>{d.assetLines=rows.map(p=>{const discount=Math.max(0,Math.min(35,Number((form.elements.namedItem(`discount-${p.id}`) as HTMLInputElement).value)||0)),dealPrice=Math.round(p.totalPrice*(1-discount/100)),contractMode=(form.elements.namedItem(`contract-${p.id}`) as HTMLSelectElement).value as "shared"|"separate";return{propertyId:p.id,listPrice:p.totalPrice,dealPrice,discountPercent:Number(discount.toFixed(2)),contractMode,paymentSharePercent:0}});syncDealAmountFromAssets(d);d.assetLines.forEach(line=>line.paymentSharePercent=d.amount?Number((line.dealPrice/d.amount*100).toFixed(2)):0);const dealSchedule=paymentSchedule.filter(x=>x.dealId===d.id),scheduleTotal=dealSchedule.reduce((sum,x)=>sum+x.amount,0)||1;let assigned=0;dealSchedule.forEach((row,index)=>{row.amount=index===dealSchedule.length-1?d.amount-assigned:Math.round(d.amount*(row.amount/scheduleTotal));assigned+=row.amount;row.allocations=allocateAmount(row.amount,d.assetLines!)});const c=contracts.find(x=>x.dealId===d.id);if(c){c.amount=d.amount;c.propertyIds=[...d.propertyIds];c.packageMode=d.assetLines.some(x=>x.contractMode==="separate")?"separate":"shared"}closeModal();toastLocalized(t("v45.package.termsUpdated"));reloadDeal(id)})
  },0);
}

function openDealAuthorityCheck(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;const poa=powersOfAttorney.find(x=>x.relatedDeal===d.id);
  openLocalizedModal(t("v43.authority.check"),`<form id="dealAuthorityForm" class="form-grid"><div class="form-field full"><label>${t("v43.authority.operation")}</label><select name="action">${POA_ACTIONS.map(a=>`<option value="${a}">${poaActionLabel(a)}</option>`).join("")}</select></div><div class="form-field full"><label>${t("v43.authority.property")}</label><select name="propertyId">${(d.propertyIds?.length?d.propertyIds:[d.propertyId]).map(pid=>{const p=properties.find(x=>x.id===pid);return`<option value="${pid}">${p?.project??""} · ${p?.unit??pid}</option>`}).join("")}</select></div><div id="dealAuthorityResult" class="authority-modal-result">${poa?t("v43.authority.chooseAndRun"):t("v43.authority.inPersonText")}</div></form>`,`<button class="btn" data-modal-close>${t("contractDetail.close")}</button><button class="btn btn-accent" id="runDealAuthority">${t("v43.authority.run")}</button>`);
  setTimeout(()=>document.querySelector("#runDealAuthority")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#dealAuthorityForm")!,fd=new FormData(f),result=validateAuthority(d,poa,String(fd.get("action")) as PowerOfAttorneyAction,[String(fd.get("propertyId"))]);const el=document.querySelector<HTMLElement>("#dealAuthorityResult");if(el){el.className=`authority-modal-result ${result.ok?"ok":"fail"}`;el.innerHTML=`<strong>${result.ok?"✓":"!"} ${result.title}</strong><span>${result.message}</span>`}}),0);
}

const dealFlow=["qualification","offer","reservation","approval","contract","payment","registration","handover"] as const;
function reloadDeal(id:string){navigate("deals");setTimeout(()=>navigate("deal/"+id),20)}
function advanceDeal(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;const idx=dealFlow.indexOf(d.status as any);
  if(idx<0||idx===dealFlow.length-1){toastLocalized(t("dealDetail.theDealIsAlreadyAtTheFinalStage"));return}
  if(d.status==="approval"){
    const unresolved=approvals.filter(a=>a.dealId===d.id&&a.status!=="approved");
    const openObligations=dealObligations.filter(o=>o.dealId===d.id&&o.status!=="completed");
    if(unresolved.length){toastLocalized(`${t("dealDetail.cannotMoveToContract")} ${unresolved.length} ${t("dealDetail.approvalsAreIncomplete")}`);return}
    if(openObligations.length){toastLocalized(`${t("dealDetail.cannotMoveToContract")} ${openObligations.length} ${t("dealDetail.approvalConditionsAreIncomplete")}`);return}
  }
  if(d.status==="contract"){
    const c=contracts.find(x=>x.dealId===d.id);if(!c){toastLocalized(t("dealDetail.cannotMoveToPaymentsContractHasNotBeenCreated"));return}
    if(!["signed","notary","registered"].includes(c.status)){toastLocalized(t("dealDetail.cannotMoveToPaymentsContractIsNotSignedYet"));return}
  }
  const dealSchedule=paymentSchedule.filter(x=>x.dealId===d.id);
  const totalScheduled=dealSchedule.reduce((sum,x)=>sum+x.amount,0),totalPaid=dealSchedule.reduce((sum,x)=>sum+x.paid,0);
  if(d.status==="registration"){
    const r=registrationCases.find(x=>x.dealId===d.id);if(!r||r.status!=="registered"){toastLocalized(t("dealDetail.cannotMoveToHandoverStateRegistrationIsNotComplete"));return}
    const existingHandover=handoverCases.filter(x=>x.dealId===d.id);
    const financialClearance=existingHandover.length?existingHandover.every(x=>x.financialClearance):!dealSchedule.length||dealSchedule.every(x=>x.paid>=x.amount);
    if(!financialClearance){toastLocalized(t("dealDetail.cannotMoveToHandoverFinancialClearanceIncomplete"));return}
  }
  const previous=d.status;const next=dealFlow[idx+1],linked=(d.propertyIds?.length?d.propertyIds:[d.propertyId]).map(propertyId=>properties.find(x=>x.id===propertyId)).filter(Boolean);
  d.status=next;recordAudit({module:"deals",action:"status",entityType:"deal",entityId:d.id,entityLabel:`${d.id} · ${d.clientName}`,route:`deal/${d.id}`,field:"Deal stage",oldValue:previous,newValue:next,note:`Stage advanced to ${next}.`});
  d.nextAction=({offer:"i18n:dealDetail.next.offer",reservation:"i18n:dealDetail.next.reservation",approval:"i18n:dealDetail.next.approval",contract:"i18n:dealDetail.next.contract",payment:"i18n:dealDetail.next.payment",registration:"i18n:dealDetail.next.registration",handover:"i18n:dealDetail.next.handover"} as Record<string,string>)[next]??"i18n:dealDetail.next.default";
  linked.forEach(p=>{
    if(next==="reservation"&&["available","offered","pre-reserved","returned-to-sale"].includes(p!.status))p!.status="reserved";
    if(next==="contract")p!.status="contract";
    if(next==="payment"){p!.status=totalScheduled>0&&totalPaid>=totalScheduled?"paid":totalPaid>0?"partially-paid":"contract"}
    if(next==="registration")p!.status="registration";
    if(next==="handover"){p!.status="handover";p!.legalStatus="registered"}
  });
  if(next==="handover"){
    const registration=registrationCases.find(x=>x.dealId===d.id),contract=contracts.find(x=>x.dealId===d.id);if(contract&&registration?.status==="registered")contract.status="registered";
    const nextNo=()=>{const nums=handoverCases.map(x=>Number(x.id.match(/(\d+)$/)?.[1]??0));return Math.max(0,...nums)+1};
    linked.forEach(p=>{if(!handoverCases.some(x=>x.dealId===d.id&&x.propertyId===p!.id)){const n=nextNo(),date=new Date(Date.now()+7*86400000).toISOString().slice(0,10).split("-").reverse().join(".");handoverCases.push({id:`HO-2026-${String(n).padStart(4,"0")}`,dealId:d.id,clientId:d.clientId,clientName:d.clientName,propertyId:p!.id,propertyLabel:`${p!.project} · ${p!.unit}`,project:p!.project,status:"readiness",plannedAt:`${date} · 10:00`,coordinator:d.manager,financialClearance:true,registrationClearance:true,technicalReadiness:95,keysCount:p!.type==="apartment"||p!.type==="house"?2:1,clientAcceptance:"pending"})}});
  }
  toastLocalized(`${t("dealDetail.dealMovedTo")} ${statusLabel(next)}`);reloadDeal(id);
}
function openDealParticipant(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;
  openLocalizedModal(t("dealDetail.addDealParticipant"),`<form id="dealPartyForm" class="form-grid">
    <div class="form-field full"><label>${t("dealDetail.fullName")}</label><input name="name" required></div>
    <div class="form-field"><label>${t("dealDetail.roleInDeal")}</label><select name="role"><option value="coBuyer">${t("dealDetail.coBuyer")}</option><option value="representative">${t("dealDetail.representative")}</option><option value="coBorrower">${t("dealDetail.coBorrower")}</option><option value="spouse">${t("dealDetail.spouse")}</option><option value="signatory">${t("dealDetail.signatory")}</option></select></div>
    <div class="form-field"><label>${t("dealDetail.phone")}</label><input name="phone" value="+374 "></div>
    <div class="form-field full"><label>${t("dealDetail.basisNote")}</label><textarea name="note"></textarea></div>
  </form>`,`<button class="btn" data-modal-close>${t("dealDetail.cancel")}</button><button class="btn btn-accent" id="saveDealParty">${t("dealDetail.add")}</button>`);
  setTimeout(()=>document.querySelector("#saveDealParty")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#dealPartyForm")!;if(!f.reportValidity())return;
    const legacyRole=formValue(f,"role"),roleMap:Record<string,any>={coBuyer:"co-buyer",representative:"representative",coBorrower:"co-borrower",spouse:"spouse",signatory:"signatory"};
    const name=formValue(f,"name"),phone=formValue(f,"phone"),note=formValue(f,"note");
    relatedPeople.push({id:`RP-${d.clientId}-${relatedPeople.length+1}`,clientId:d.clientId,name,role:legacyRole,phone,verification:"review",note});
    d.participants.push({id:`DP-${d.id}-${d.participants.length+1}`,name,role:roleMap[legacyRole]??"representative",phone,authority:note||undefined});
    closeModal();toastLocalized(t("dealDetail.participantAddedToDealContext"));reloadDeal(id);
  }),0);
}
function openDealApproval(id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;
  const roleOptions:[WorkflowRole,string][]= [["Sales Head",t("role.salesHead")],["Commercial Director",t("role.commercialDirector")],["Legal",t("role.legal")],["Finance",t("role.finance")],["Financial Director",t("role.financialDirector")],["CEO",t("role.ceo")]];
  openLocalizedModal(t("dealDetail.newApproval"),`<form id="dealApprovalForm" class="form-grid">
    <div class="form-field"><label>${t("dealDetail.type")}</label><select name="type"><option value="discount">${t("dealDetail.discount")}</option><option value="payment-plan">${t("dealDetail.paymentSchedule")}</option><option value="legal">${t("dealDetail.legalException")}</option><option value="contract">${t("dealDetail.contractTerm")}</option><option value="executive">${t("v47.type.executive")}</option></select></div>
    <div class="form-field"><label>${t("v47.rules.approver")}</label><select name="role">${roleOptions.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select></div>
    <div class="form-field"><label>${t("dealDetail.requested")}</label><input name="requestedValue" required value="${d.discount?d.discount+'%':''}"></div>
    <div class="form-field"><label>${t("dealDetail.limitStandard")}</label><input name="limitValue" value="3% / ${t("dealDetail.standard")}"></div>
    <div class="form-field"><label>${t("v47.rules.priority")}</label><select name="priority"><option value="normal">${t("v47.priority.normal")}</option><option value="high" selected>${t("v47.priority.high")}</option><option value="critical">${t("v47.priority.critical")}</option></select></div>
    <div class="form-field"><label>SLA · ${t("v47.common.hours")}</label><input name="sla" type="number" min="1" max="72" value="8"></div>
    <div class="form-field full"><label>${t("dealDetail.rationale")}</label><textarea name="reason" required>${t("dealDetail.theExceptionRequiresAdditionalApproval")}</textarea></div>
  </form>`,`<button class="btn" data-modal-close>${t("dealDetail.cancel")}</button><button class="btn btn-accent" id="saveDealApproval">${t("dealDetail.send")}</button>`);
  setTimeout(()=>document.querySelector("#saveDealApproval")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#dealApprovalForm")!;if(!f.reportValidity())return;
    const type=formValue(f,"type") as "discount"|"payment-plan"|"legal"|"contract"|"executive",subjectId=`${d.id}:manual:${Date.now()}`;
    const route=createManualWorkflowRoute({sourceType:"deal",subjectId,dealId:d.id,title:`${d.id} · ${approvalType(type)}`,clientName:d.clientName,propertyLabel:d.propertyLabel,requestedBy:d.manager,discountPercent:d.discount,amount:d.amount,currency:d.currency,assetCount:d.propertyIds?.length??1},{type,role:formValue(f,"role") as WorkflowRole,priority:formValue(f,"priority") as any,slaHours:Number(formValue(f,"sla"))||8,requestedValue:formValue(f,"requestedValue"),limitValue:formValue(f,"limitValue"),reason:formValue(f,"reason")});
    d.status="approval";d.nextAction="i18n:dealDetail.next.waitingApproval";closeModal();toastLocalized(`${t("dealDetail.approvalCreated")} · ${route.id}`);navigate("approvals?tab=inbox");
  }),0);
}
function handleDealDemoAction(action:string,id:string){
  const d=deals.find(x=>x.id===id);if(!d)return;
  if(action==="upload-deal-doc"){
    openLocalizedModal(t("dealDetail.dealDocument"),`<form id="dealDocForm" class="form-grid"><div class="form-field"><label>${t("dealDetail.type")}</label><input name="type" required value="${t("dealDetail.dealDocument")}"></div><div class="form-field"><label>${t("dealDetail.number")}</label><input name="number" required value="DL-${Date.now().toString().slice(-6)}"></div><div class="form-field"><label>${t("dealDetail.date")}</label><input name="issuedAt" value="17.09.2026"></div><div class="form-field"><label>${t("dealDetail.file")}</label><input type="file"></div></form>`,`<button class="btn" data-modal-close>${t("dealDetail.cancel")}</button><button class="btn btn-accent" id="saveDealDoc">${t("dealDetail.add")}</button>`);
    setTimeout(()=>document.querySelector("#saveDealDoc")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#dealDocForm")!;if(!f.reportValidity())return;clientDocuments.push({id:`DOC-${d.clientId}-${clientDocuments.length+1}`,clientId:d.clientId,type:formValue(f,"type"),number:formValue(f,"number"),issuedAt:formValue(f,"issuedAt"),status:"review",source:`Deal ${d.id}`});closeModal();toastLocalized(t("dealDetail.documentAddedToDealPackage"));reloadDeal(id)}),0);return;
  }
  if(action==="new-offer-version"){
    const prev=[...clientOffers].reverse().find(x=>x.clientId===d.clientId);if(!prev){toastLocalized(t("dealDetail.noSourceOfferForANewVersion"));return}
    const next={...prev,id:`OF-2026-${220+clientOffers.length}`,createdAt:"17.09.2026 · сейчас",status:"draft" as const};clientOffers.push(next);toastLocalized(`${t("dealDetail.newVersionCreated")} ${next.id}`);reloadDeal(id);return;
  }
  if(action==="preview-offer"){
    const o=[...clientOffers].reverse().find(x=>x.clientId===d.clientId);if(!o){toastLocalized(t("dealDetail.offerNotFound"));return}
    openLocalizedModal(`${t("dealDetail.offer")} ${o.id}`,`<div class="info-list"><div class="info-box"><span>${t("dealDetail.client")}</span><strong>${d.clientName}</strong></div><div class="info-box"><span>${t("dealDetail.status")}</span><strong>${statusLabel(o.status)}</strong></div><div class="info-box"><span>${t("dealDetail.properties")}</span><strong>${o.objects.join(", ")}</strong></div><div class="info-box"><span>${t("dealDetail.amount")}</span><strong>${amd(o.total)}</strong></div><div class="info-box"><span>${t("dealDetail.validUntil")}</span><strong>${o.validUntil}</strong></div></div><div class="modal-note u-mt-14">${t("dealDetail.offerLinkedToDeal")} ${d.id}.</div>`);return;
  }
  toastLocalized(t("dealDetail.actionCompleted"));
}
function completeObligation(obligationId:string,dealId:string){
  const o=dealObligations.find(x=>x.id===obligationId);if(!o)return;
  o.status="completed";
  const a=approvals.find(x=>x.id===o.approvalId);
  if(a){
    a.conditionStatus="completed";
    if(a.type==="payment-plan"){const r=findRestructureForApproval(a.dealId);if(r)applyRestructure(r.id)}
  }
  toastLocalized(t("dealDetail.conditionalObligationCompleted"));reloadDeal(dealId);
}
