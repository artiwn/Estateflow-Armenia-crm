import {approvals,bankStatementLines,clients,contracts,deals,legalCases,mortgageApplications,paymentSchedule,handoverCases,warrantyCases,powersOfAttorney,registrationCases} from "../data/mock";
import {cashflowForecast,dataQualityTrend,discountBands,executiveRisks,inventoryHeatmap,leadSources,managerPerformance,monthlySales,processBenchmarks,projectPortfolio,slaTrend} from "../data/analytics";
import {amd,compactAmd,statusLabel} from "../utils";
import {navigate} from "../router";
import {toastLocalized} from "../components/layout";
import {t} from "../i18n";
import {clientDocuments,clientDuplicateCases,kycChecklist} from "../data/client360";
import {ensureTasksInitialized,taskNow,tasks} from "../services/tasks";

type ReportTab="executive"|"sales"|"finance"|"inventory"|"team"|"operations"|"quality"|"process";

const monthKey:Record<string,string>={Jan:"jan",Feb:"feb",Mar:"mar",Apr:"apr",May:"may",Jun:"jun",Jul:"jul",Aug:"aug",Sep:"sep",Oct:"oct",Nov:"nov",Dec:"dec"};
const sourceKey:Record<string,string>={Website:"website",Instagram:"instagram",Referral:"referral","Call center":"callCenter",Partners:"partners"};
const locationKey:Record<string,string>={"Nor Nork":"norNork",Arabkir:"arabkir",Kentron:"kentron"};
const riskKey:Record<string,string>={"Receivables overdue":"receivables","Discount approvals":"discount","Mortgage decisions":"mortgage","Handover backlog":"handover","Warranty SLA":"warranty"};
const paymentTitleKey:Record<string,string>={"Reservation fee":"reservationFee","Buyer down payment":"buyerDown","Buyer contribution":"buyerContribution","Mortgage disbursement":"mortgageDisbursement","Reservation / advance":"reservationAdvance","Initial contribution":"initialContribution","Bank financing":"bankFinancing","Contract payment":"contractPayment"};

const month=(name:string)=>t(`reports.month.${monthKey[name]??name.toLowerCase()}`);
const projectLocation=(name:string)=>t(`reports.location.${locationKey[name]??name}`);
const paymentTitle=(name:string)=>paymentTitleKey[name]?t(`reports.payment.${paymentTitleKey[name]}`):name;
const sourceName=(name:string)=>sourceKey[name]?t(`reports.source.${sourceKey[name]}`):name;
const priorityLabel=(p:string)=>t(`reports.priority.${p}`);
const categoryLabel=(c:string)=>t(`reports.category.${c.toLowerCase()}`);

export function reportsPage(route:string){
  const params=new URLSearchParams(route.split("?")[1]??"");
  const tab=(params.get("tab")??"executive") as ReportTab;
  return `<section class="page analytics-page">
    <div class="analytics-head">
      <div>
        <div class="eyebrow">${t("reports.eyebrow")}</div>
        <h1>${t("reports.title")}</h1>
        <p>${t("reports.subtitle")}</p>
      </div>
      <div class="analytics-actions">
        <select class="field compact" aria-label="${t("reports.allProjects")}" title="${t("reports.fixedDemoFilters")}" disabled><option>${t("reports.allProjects")}</option><option>Norq Residence</option><option>Arabkir Heights</option><option>Cascade Yard</option></select>
        <select class="field compact" aria-label="${t("reports.period.sep")}" title="${t("reports.fixedDemoFilters")}" disabled><option>${t("reports.period.sep")}</option><option>${t("reports.period.q3")}</option><option>${t("reports.period.ytd")}</option></select>
        <button class="btn" id="exportReport" data-report-export="${tab}" ${["executive","quality","process"].includes(tab)?"":`disabled title="${t("v56.export.available")}"`}>${t("reports.export")}</button>
      </div>
    </div>
    <div class="report-tabs">
      ${tabButton("executive","reports.tab.executive",tab)}${tabButton("sales","reports.tab.sales",tab)}${tabButton("finance","reports.tab.finance",tab)}${tabButton("inventory","reports.tab.inventory",tab)}${tabButton("team","reports.tab.team",tab)}${tabButton("operations","reports.tab.operations",tab)}${tabButton("process","reports.tab.process",tab)}${tabButton("quality","reports.tab.quality",tab)}
    </div>
    ${renderTab(tab)}
  </section>`;
}

function tabButton(id:ReportTab,key:string,current:ReportTab){return `<button class="report-tab ${id===current?"active":""}" data-report-tab="${id}">${t(key)}</button>`}
function renderTab(tab:ReportTab){switch(tab){case"sales":return salesView();case"finance":return financeView();case"inventory":return inventoryView();case"team":return teamView();case"operations":return operationsView();case"process":return processView();case"quality":return dataQualityView();default:return executiveView()}}

function executiveView(){
  const dealValue=deals.reduce((s,d)=>s+d.amount,0);
  const openReceivables=paymentSchedule.reduce((s,p)=>s+Math.max(0,p.amount-p.paid),0);
  const mortgagePipeline=mortgageApplications.filter(m=>!["funded","declined"].includes(m.status)).reduce((s,m)=>s+(m.approvedAmount||m.requestedAmount),0);
  const sold=projectPortfolio.reduce((s,p)=>s+p.sold,0),total=projectPortfolio.reduce((s,p)=>s+p.units,0);
  return `<div class="analytics-grid kpi-5">
    ${execKpi(t("reports.salesMtd"),compactAmd(1_840_000_000),t("reports.targetPct",{value:"122.7"}),"up","deals")}
    ${execKpi(t("reports.activeDealValue"),compactAmd(dealValue),t("reports.activeWorkflows",{count:deals.length}),"neutral","deals")}
    ${execKpi(t("reports.openReceivables"),compactAmd(openReceivables),t("reports.overdueAmount",{value:compactAmd(23_500_000)}),"down","payments")}
    ${execKpi(t("reports.mortgagePipeline"),compactAmd(mortgagePipeline),t("reports.applications",{count:mortgageApplications.length}),"neutral","mortgages")}
    ${execKpi(t("reports.portfolioSold"),`${Math.round(sold/total*100)}%`,t("reports.soldUnits",{sold,total}),"up","properties")}
  </div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.revenuePerformance"),t("reports.actualVsTarget"),"reports?tab=sales")}${revenueChart()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.executiveAttention"),t("reports.liveExceptions"))}<div class="risk-stack">${executiveRisks.map(r=>riskRow(r)).join("")}</div></div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.portfolioOverview"),t("reports.commercialByProject"),"properties")}<div class="project-table">${projectPortfolio.map(p=>projectRow(p)).join("")}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.cashCollection"),t("reports.next6Months"),"reports?tab=finance")}${cashflowMini()}</div>
  </div>
  <div class="analytics-main-grid bottom-row">
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.conversionHealth"),t("reports.leadToDeal"),"reports?tab=sales")}${conversionRing()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.inventoryMix"),t("reports.acrossPortfolio"),"reports?tab=inventory")}${inventoryDonut()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.operations"),t("reports.handoverService"),"reports?tab=operations")}${operationsPulse()}</div>
  </div>`;
}

function salesView(){
  const stages=["new","qualified","viewing","offer","reservation","contract","sold"].map((key,i)=>({key,value:[128,83,54,39,27,19,14][i]}));
  const max=stages[0].value;
  return `<div class="analytics-grid kpi-4">${execKpi(t("reports.leadsMtd"),"128",t("reports.vsAug"),"up","leads")}${execKpi(t("reports.qualifiedRate"),"64.8%",t("reports.qualifiedLeads"),"up","leads")}${execKpi(t("reports.leadSold"),"10.9%",t("reports.closedDeals"),"neutral","deals")}${execKpi(t("reports.avgDiscount"),"4.1%",t("reports.withinPolicy"),"neutral","approvals")}</div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.salesFunnel"),t("reports.volumeStep"),"deals")}<div class="funnel-modern">${stages.map((s,i)=>`<button class="funnel-step" data-route="${i<5?"leads":"deals"}" style="--w:${Math.max(30,s.value/max*100)}%"><span><strong>${t(`reports.stage.${s.key}`)}</strong><small>${i?t("reports.previousPct",{value:Math.round(s.value/stages[i-1].value*100)}):t("reports.monthlyInflow")}</small></span><b>${s.value}</b></button>`).join("")}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.leadSources"),t("reports.qualityAcquisition"),"leads")}<div class="source-list">${leadSources.map(s=>sourceRow(s)).join("")}</div></div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.revenueTrend"),t("reports.ytdMillions"))}${revenueChart()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.discountDistribution"),t("reports.dealCountBand"),"approvals")}<div class="discount-bars">${discountBands.map(d=>barMetric(d.label,d.deals,31,compactAmd(d.value*1_000_000))).join("")}</div></div>
  </div>`;
}

function financeView(){
  const planned=paymentSchedule.reduce((s,p)=>s+p.amount,0),paid=paymentSchedule.reduce((s,p)=>s+p.paid,0),overdue=paymentSchedule.filter(p=>p.status==="overdue"||p.status==="partial").reduce((s,p)=>s+(p.amount-p.paid),0);
  return `<div class="analytics-grid kpi-4">${execKpi(t("reports.contractedCash"),compactAmd(planned),t("reports.currentDemoPortfolio"),"neutral","payments")}${execKpi(t("reports.collected"),compactAmd(paid),t("reports.collectedPct",{value:Math.round(paid/planned*100)}),"up","finance")}${execKpi(t("reports.overduePartial"),compactAmd(overdue),t("reports.requiresCollection"),"down","payments")}${execKpi(t("reports.mortgageApproved"),compactAmd(mortgageApplications.reduce((s,m)=>s+m.approvedAmount,0)),t("reports.bankBackedInflow"),"up","mortgages")}</div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.cashFlowForecast"),t("reports.buyerMortgageInflows"),"finance")}${cashflowChart()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.collectionQuality"),t("reports.portfolioReceivables"))}${collectionGauge()}</div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.upcomingObligations"),t("reports.nextScheduledInflows"),"payments")}<div class="finance-obligations">${paymentSchedule.filter(x=>x.status!=="paid").slice(0,7).map(x=>`<button data-route="deal/${x.dealId}"><span><strong>${x.dueDate}</strong><small>${paymentTitle(x.title)} · ${x.dealId}</small></span><b>${compactAmd(x.amount-x.paid)}</b><em class="pay-state ${x.status}">${statusLabel(x.status)}</em></button>`).join("")}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.mortgagePipeline"),t("reports.mortgageByStatus"),"mortgages")}<div class="mortgage-summary">${["documents","bank-review","approved","contracting"].map(st=>{const list=mortgageApplications.filter(m=>m.status===st);return `<button data-route="mortgages"><span>${labelMortgage(st)}</span><strong>${list.length}</strong><small>${compactAmd(list.reduce((s,m)=>s+(m.approvedAmount||m.requestedAmount),0))}</small></button>`}).join("")}</div></div>
  </div>`;
}

function inventoryView(){
  const total=projectPortfolio.reduce((s,p)=>s+p.units,0),avail=projectPortfolio.reduce((s,p)=>s+p.available,0);
  return `<div class="analytics-grid kpi-4">${execKpi(t("reports.portfolioUnits"),String(total),t("reports.activeDemoProjects"),"neutral","properties")}${execKpi(t("reports.available"),String(avail),t("reports.portfolioPct",{value:Math.round(avail/total*100)}),"neutral","properties")}${execKpi(t("reports.avgAskingPrice"),`${amd(948000)} / m²`,t("reports.weightedAverage"),"up","properties")}${execKpi(t("reports.reservedContract"),String(projectPortfolio.reduce((s,p)=>s+p.reserved+p.contract,0)),t("reports.nearTermStock"),"neutral","deals")}</div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.availabilityHeatmap"),t("reports.demoTower"),"properties")}${heatmap()}</div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.portfolioStatus"),t("reports.allActiveProjects"),"properties")}${inventoryDonut()}</div>
    <div class="card card-pad analytics-panel span-3">${panelTitle(t("reports.projectMatrix"),t("reports.salesVelocityPricing"),"properties")}<div class="portfolio-matrix">${projectPortfolio.map(p=>projectMatrix(p)).join("")}</div></div>
  </div>`;
}

function teamView(){return `<div class="analytics-grid kpi-4">${execKpi(t("reports.salesTeam"),"4",t("reports.activeManagers"),"neutral","clients")}${execKpi(t("reports.dealsClosed"),"46",t("reports.ytdDemoMetric"),"up","deals")}${execKpi(t("reports.avgCycle"),t("reports.days",{value:24}),t("reports.leadContract"),"up","deals")}${execKpi(t("reports.avgConversion"),"15.2%",t("reports.acrossManagers"),"neutral","leads")}</div>
  <div class="analytics-main-grid"><div class="card card-pad analytics-panel span-3">${panelTitle(t("reports.managerPerformance"),t("reports.comparableKpis"),"deals")}<div class="manager-table"><div class="manager-head"><span>${t("reports.col.manager")}</span><span>${t("reports.col.leads")}</span><span>${t("reports.col.meetings")}</span><span>${t("reports.col.deals")}</span><span>${t("reports.col.revenue")}</span><span>${t("reports.col.conversion")}</span><span>${t("reports.col.avgDiscount")}</span><span>${t("reports.col.cycle")}</span></div>${managerPerformance.map(m=>`<button class="manager-row" data-route="deals"><span><b>${m.name}</b></span><span>${m.leads}</span><span>${m.meetings}</span><span>${m.deals}</span><span>${compactAmd(m.revenue*1_000_000)}</span><span><strong>${m.conversion}%</strong></span><span>${m.discount}%</span><span>${t("reports.days",{value:m.cycle})}</span></button>`).join("")}</div></div>
  <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.conversionBenchmark"),t("reports.managerComparison"))}${managerConversionChart()}</div><div class="card card-pad analytics-panel">${panelTitle(t("reports.coachingSignals"),t("reports.managementAttention"))}<div class="insight-list"><div><span class="insight-dot good"></span><p><strong>Նարեկ Կարապետյան</strong><small>${t("reports.fastestCycle")}</small></p></div><div><span class="insight-dot warn"></span><p><strong>Անի Հակոբյան</strong><small>${t("reports.discountAboveAvg")}</small></p></div><div><span class="insight-dot neutral"></span><p><strong>Մարի Հովհաննիսյան</strong><small>${t("reports.conversionOpportunity")}</small></p></div></div></div></div>`}

function operationsView(){
  const openDefects=handoverCases.filter(h=>h.status==="defects"||h.status==="reinspection").length;
  const openWarranty=warrantyCases.filter(w=>!["resolved","closed"].includes(w.status)).length;
  const flowKeys=["readiness","inspection","defects","reinspection","acceptance","handedOver"];
  return `<div class="analytics-grid kpi-4">${execKpi(t("reports.handoverPipeline"),String(handoverCases.length),t("reports.withDefectResolution",{count:openDefects}),"neutral","handover")}${execKpi(t("reports.warrantyOpen"),String(openWarranty),t("reports.slaRisks"),"down","service")}${execKpi(t("reports.technicalReadiness"),"96.3%",t("reports.activeHandoverCases"),"up","handover")}${execKpi(t("reports.registrationQueue"),"3",t("reports.notaryState"),"neutral","registration")}</div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.handoverFlow"),t("reports.operationalPipeline"),"handover")}<div class="ops-flow">${flowKeys.map((x,i)=>`<button data-route="handover"><span>${i+1}</span><strong>${t(`reports.flow.${x}`)}</strong><b>${[3,2,2,1,2,11][i]}</b></button>`).join("")}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.warrantySla"),t("reports.openServiceCases"),"service")}${warrantySla()}</div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("reports.operationalAttention"),t("reports.casesCoordination"))}<div class="ops-attention"><button data-route="handover"><span class="risk-dot high"></span><p><strong>HO-2026-0068 · B-1401</strong><small>${t("reports.majorDefects")}</small></p><b>20.09</b></button><button data-route="service"><span class="risk-dot high"></span><p><strong>WR-2026-0038 · ${t("reports.category.electrical")}</strong><small>${t("reports.slaContractor")}</small></p><b>${t("reports.today")}</b></button><button data-route="registration/RG-0251"><span class="risk-dot medium"></span><p><strong>RG-0251 · B-1303</strong><small>${t("v51.status.additional-documents")}</small></p><b>26.09</b></button></div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("reports.customerExperience"),t("reports.postSalePulse"))}<div class="cx-score"><strong>4.72</strong><span>/ 5</span><p>${t("reports.demoSatisfaction")}</p><div class="cx-stars">★★★★★</div><small>${t("reports.feedbackModel")}</small></div></div>
  </div>`;
}

function profileMissingFields(c:(typeof clients)[number]){
  const base=[c.name,c.phone,c.email,c.preferredLanguage];
  const individual=c.type==="individual"||c.type==="sole-proprietor";
  const required=individual?[...base,c.firstName,c.lastName,c.dateOfBirth,c.citizenship,c.personalNumber,c.registrationAddress?.address,c.consentPersonalData]:[...base,c.taxId,c.registrationNumber,c.legalForm,c.legalAddress?.address,c.director?.name,c.beneficialOwners?.length,c.bankAccounts?.length];
  return required.filter(v=>v===undefined||v===null||v===""||v===0||v===false).length;
}
function expiredIdentityDocuments(){
  const cutoff=new Date("2026-09-23T00:00:00+04:00");
  return clientDocuments.filter(d=>["passport","idCard"].includes(d.type)&&d.expiresAt&&parseDmy(d.expiresAt)<cutoff);
}
function parseDmy(v:string){const m=v.match(/^(\d{2})\.(\d{2})\.(\d{4})/);return m?new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00+04:00`):new Date(v)}
function dataQualityMetrics(){
  const duplicates=clientDuplicateCases.filter(x=>x.status==="open");
  const missing=clients.reduce((s,c)=>s+profileMissingFields(c),0);
  const expiredIds=expiredIdentityDocuments();
  const kycOpen=kycChecklist.filter(x=>x.mandatory&&x.status!=="passed");
  const poaAttention=powersOfAttorney.filter(x=>["expiring","expired","suspended"].includes(x.status));
  const unlinked=bankStatementLines.filter(x=>x.status==="unmatched"||!x.matchedDealId);
  const registrationDocs=registrationCases.reduce((sum,r)=>sum+(r.documents??[]).filter(d=>d.required&&d.status!=="verified").length,0);
  const issueWeight=duplicates.length*3+missing*2+expiredIds.length*4+kycOpen.length*2+poaAttention.length*2+unlinked.length*3+registrationDocs;
  const score=Math.max(0,Math.min(100,100-issueWeight));
  return{duplicates,missing,expiredIds,kycOpen,poaAttention,unlinked,registrationDocs,score};
}
function dataQualityView(){
  const q=dataQualityMetrics();
  const openIssues=q.duplicates.length+q.missing+q.expiredIds.length+q.kycOpen.length+q.poaAttention.length+q.unlinked.length+q.registrationDocs;
  return `<div class="analytics-grid kpi-5">
    ${qualityKpi(t("v56.quality.score"),`${q.score}%`,t("v56.quality.scoreNote"),q.score>=90?"good":"warn")}
    ${qualityKpi(t("v56.quality.duplicates"),String(q.duplicates.length),t("v56.quality.duplicatesNote"),q.duplicates.length?"warn":"good","clients")}
    ${qualityKpi(t("v56.quality.kyc"),String(q.kycOpen.length),t("v56.quality.kycNote"),q.kycOpen.length?"warn":"good","clients")}
    ${qualityKpi(t("v56.quality.unlinked"),String(q.unlinked.length),t("v56.quality.unlinkedNote"),q.unlinked.length?"bad":"good","reconciliation")}
    ${qualityKpi(t("v56.quality.openIssues"),String(openIssues),t("v56.quality.openIssuesNote"),openIssues>8?"bad":"warn")}
  </div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("v56.quality.queue"),t("v56.quality.queueSub"))}<div class="quality-queue">
      ${qualityQueueRow("duplicate",t("v56.quality.issue.duplicate"),q.duplicates.length,t("v56.quality.issue.duplicateNote"),q.duplicates.length?"warning":"healthy","clients")}
      ${qualityQueueRow("profile",t("v56.quality.issue.profile"),q.missing,t("v56.quality.issue.profileNote"),q.missing?"warning":"healthy","clients")}
      ${qualityQueueRow("id",t("v56.quality.issue.identity"),q.expiredIds.length,t("v56.quality.issue.identityNote"),q.expiredIds.length?"critical":"healthy","clients")}
      ${qualityQueueRow("kyc",t("v56.quality.issue.kyc"),q.kycOpen.length,t("v56.quality.issue.kycNote"),q.kycOpen.length?"warning":"healthy","clients")}
      ${qualityQueueRow("poa",t("v56.quality.issue.poa"),q.poaAttention.length,t("v56.quality.issue.poaNote"),q.poaAttention.some(x=>["expired","suspended"].includes(x.status))?"critical":"warning","legal/poa")}
      ${qualityQueueRow("payment",t("v56.quality.issue.payment"),q.unlinked.length,t("v56.quality.issue.paymentNote"),q.unlinked.length?"critical":"healthy","reconciliation")}
      ${qualityQueueRow("registration",t("v56.quality.issue.registration"),q.registrationDocs,t("v56.quality.issue.registrationNote"),q.registrationDocs?"warning":"healthy","registration")}
    </div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("v56.quality.trend"),t("v56.quality.trendSub"))}${qualityTrendChart()}</div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("v56.quality.records"),t("v56.quality.recordsSub"))}<div class="quality-records">
      ${q.duplicates.map(x=>qualityRecord("warning",x.id,x.candidateName,`${x.source} · ${x.confidence}% · ${x.matchedFields.join(", ")}`,`client/${x.canonicalClientId}`)).join("")}
      ${q.kycOpen.slice(0,4).map(x=>{const c=clients.find(c=>c.id===x.clientId);return qualityRecord("warning",x.code,c?.name??x.clientId,`${x.owner} · ${x.status} · ${x.evidence}`,`client/${x.clientId}`)}).join("")}
      ${q.poaAttention.map(x=>qualityRecord(["expired","suspended"].includes(x.status)?"critical":"warning",x.documentNo,x.principal,`${x.status} · ${x.expiresAt}`,`poa/${x.id}`)).join("")}
      ${q.unlinked.map(x=>qualityRecord("critical",x.id,x.payer,`${x.bank} · ${x.amount.toLocaleString("ru-RU")} ${x.currency} · ${x.purpose}`,"reconciliation")).join("")}
      ${!openIssues?`<div class="quality-empty">✓ ${t("v56.quality.noIssues")}</div>`:""}
    </div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("v56.quality.coverage"),t("v56.quality.coverageSub"))}${qualityCoverage(q)}</div>
  </div>`;
}
function qualityKpi(label:string,value:string,note:string,tone:"good"|"warn"|"bad",route?:string){return `<${route?"button":"div"} class="quality-kpi ${tone}" ${route?`data-route="${route}"`:""}><span>${label}</span><strong>${value}</strong><small>${note}</small></${route?"button":"div"}>`}
function qualityQueueRow(icon:string,title:string,count:number,note:string,tone:"healthy"|"warning"|"critical",route:string){return `<button class="quality-queue-row ${tone}" data-route="${route}"><i class="quality-icon">${tone==="healthy"?"✓":tone==="critical"?"!":"•"}</i><span><strong>${title}</strong><small>${note}</small></span><b>${count}</b><em>${tone==="healthy"?t("v56.quality.healthy"):tone==="critical"?t("v56.quality.critical"):t("v56.quality.review")}</em><u>›</u></button>`}
function qualityRecord(tone:"warning"|"critical",code:string,title:string,note:string,route:string){return `<button class="quality-record" data-route="${route}"><span class="quality-record-dot ${tone}"></span><span><strong>${title}</strong><small>${code} · ${note}</small></span><em>${tone==="critical"?t("v56.quality.critical"):t("v56.quality.review")}</em><i>›</i></button>`}
function qualityTrendChart(){const max=100;return `<div class="quality-trend-chart">${dataQualityTrend.map(x=>`<div><span style="height:${x.value/max*150}px"></span><strong>${x.value}%</strong><small>${month(x.month)}</small></div>`).join("")}</div>`}
function qualityCoverage(q:ReturnType<typeof dataQualityMetrics>){const identity=Math.round((clientDocuments.filter(x=>["passport","idCard","stateRegistration","soleProprietorRegistration"].includes(x.type)).length/clients.length)*100);const kyc=Math.round(kycChecklist.filter(x=>x.mandatory&&x.status==="passed").length/Math.max(1,kycChecklist.filter(x=>x.mandatory).length)*100);const linked=Math.round((bankStatementLines.length-q.unlinked.length)/bankStatementLines.length*100);const poa=Math.round(powersOfAttorney.filter(x=>["active","expiring"].includes(x.status)).length/Math.max(1,powersOfAttorney.length)*100);return `<div class="coverage-stack">${coverageLine(t("v56.quality.coverage.identity"),identity)}${coverageLine(t("v56.quality.coverage.kyc"),kyc)}${coverageLine(t("v56.quality.coverage.payments"),linked)}${coverageLine(t("v56.quality.coverage.poa"),poa)}</div>`}
function coverageLine(label:string,value:number){return `<div class="coverage-line"><div><span>${label}</span><b>${value}%</b></div><i><em style="width:${value}%"></em></i></div>`}

function processView(){
  ensureTasksInitialized();
  const active=tasks.filter(x=>!["done","cancelled"].includes(x.status));
  const now=taskNow();
  const overdue=active.filter(x=>new Date(x.dueAt).getTime()<now.getTime());
  const escalated=active.filter(x=>x.escalated);
  const within=Math.max(0,Math.round((active.length-overdue.length)/Math.max(1,active.length)*100));
  const pendingApprovals=approvals.filter(a=>["pending","queued"].includes(a.status));
  return `<div class="analytics-grid kpi-5">
    ${execKpi(t("v56.process.sla"),`${within}%`,t("v56.process.slaNote"),within>=85?"up":"down","tasks")}
    ${execKpi(t("v56.process.overdue"),String(overdue.length),t("v56.process.overdueNote"),overdue.length?"down":"up","tasks?tab=overdue")}
    ${execKpi(t("v56.process.escalated"),String(escalated.length),t("v56.process.escalatedNote"),escalated.length?"down":"neutral","tasks?tab=escalated")}
    ${execKpi(t("v56.process.approvals"),String(pendingApprovals.length),t("v56.process.approvalsNote"),"neutral","approvals?tab=inbox")}
    ${execKpi(t("v56.process.active"),String(active.length),t("v56.process.activeNote"),"neutral","tasks")}
  </div>
  <div class="analytics-main-grid">
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("v56.process.benchmarks"),t("v56.process.benchmarksSub"))}<div class="process-benchmarks">${processBenchmarks.map(processBenchmarkRow).join("")}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("v56.process.trend"),t("v56.process.trendSub"))}${slaTrendChart()}</div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("v56.process.workload"),t("v56.process.workloadSub"),"tasks?tab=team")}<div class="process-category-table">${processCategoryRows(active,now)}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("v56.process.aging"),t("v56.process.agingSub"))}${taskAging(active,now)}</div>
    <div class="card card-pad analytics-panel span-2">${panelTitle(t("v56.process.bottlenecks"),t("v56.process.bottlenecksSub"))}<div class="process-bottlenecks">${bottleneckRows(overdue)}</div></div>
    <div class="card card-pad analytics-panel">${panelTitle(t("v56.process.lifecycle"),t("v56.process.lifecycleSub"))}${processLifecycleSummary()}</div>
  </div>`;
}
function processBenchmarkRow(x:(typeof processBenchmarks)[number]){const unit=t(`v56.process.unit.${x.unit}`);const avg=x.unit==="hours"?`${x.avg} ${unit}`:`${x.avg} ${unit}`;const target=`${x.target} ${unit}`;const good=x.avg<=x.target;return `<button class="process-benchmark-row" data-route="${x.route}"><span><strong>${t(`v56.process.type.${x.key}`)}</strong><small>${t("v56.process.target")}: ${target}</small></span><b>${avg}</b><span class="process-sla-badge ${x.withinSla>=85?"good":"warn"}">${x.withinSla}% SLA</span><em class="${good?"good":"bad"}">${x.trend<0?"↓":"↑"} ${Math.abs(x.trend)}%</em><i>›</i></button>`}
function slaTrendChart(){return `<div class="sla-trend-chart"><div class="sla-trend-bars">${slaTrend.map(x=>`<div><span style="height:${x.value/100*145}px"></span><strong>${x.value}%</strong><small>${x.label}</small></div>`).join("")}</div><div class="sla-trend-target"><i></i><span>${t("v56.process.targetLine")}</span></div></div>`}
function processCategoryRows(active:typeof tasks,now:Date){const keys=["approval","contract","payment","legal","registration","handover","service"] as const;return `<div class="process-cat-head"><span>${t("v56.process.category")}</span><span>${t("v56.process.open")}</span><span>${t("v56.process.overdue")}</span><span>${t("v56.process.escalated")}</span><span>SLA</span></div>${keys.map(k=>{const list=active.filter(x=>x.category===k),od=list.filter(x=>new Date(x.dueAt).getTime()<now.getTime()).length,esc=list.filter(x=>x.escalated).length,sla=Math.round((list.length-od)/Math.max(1,list.length)*100);return `<button class="process-cat-row" data-route="tasks"><span><i class="cat-dot ${k}"></i>${t(`v56.process.cat.${k}`)}</span><b>${list.length}</b><b class="${od?"bad":""}">${od}</b><b class="${esc?"warn":""}">${esc}</b><span><em style="width:${sla}%"></em><strong>${sla}%</strong></span></button>`}).join("")}`}
function taskAging(active:typeof tasks,now:Date){const buckets=[{k:"fresh",n:0},{k:"watch",n:0},{k:"risk",n:0},{k:"late",n:0}];active.forEach(x=>{const start=new Date(x.createdAt).getTime(),due=new Date(x.dueAt).getTime(),n=now.getTime();const ratio=(n-start)/Math.max(1,due-start);if(n>due)buckets[3].n++;else if(ratio>=.8)buckets[2].n++;else if(ratio>=.5)buckets[1].n++;else buckets[0].n++});const max=Math.max(1,...buckets.map(x=>x.n));return `<div class="aging-stack">${buckets.map((b,i)=>`<div class="aging-row"><span>${t(`v56.process.aging.${b.k}`)}</span><i><em class="a${i}" style="width:${b.n/max*100}%"></em></i><b>${b.n}</b></div>`).join("")}</div>`}
function bottleneckRows(overdue:typeof tasks){const rows=overdue.slice().sort((a,b)=>Date.parse(a.dueAt)-Date.parse(b.dueAt)).slice(0,6);if(!rows.length)return `<div class="quality-empty">✓ ${t("v56.process.noBottlenecks")}</div>`;return rows.map(x=>{const hours=Math.max(1,Math.round((taskNow().getTime()-new Date(x.dueAt).getTime())/36e5));return `<button data-route="${x.sourceRoute||"tasks"}"><span class="process-risk ${x.priority}"></span><span><strong>${x.title}</strong><small>${x.assignedTo} · ${x.sourceLabel??x.sourceType}</small></span><b>${t("v56.process.hoursLate",{value:hours})}</b><em>${x.escalated?`L${x.escalationLevel??1}`:"—"}</em><i>›</i></button>`}).join("")}
function processLifecycleSummary(){const contractOpen=contracts.filter(c=>!["signed","registered"].includes(c.status)).length;const legalOpen=legalCases.filter(c=>c.status!=="clear").length;const regOpen=registrationCases.filter(c=>c.status!=="registered").length;const handOpen=handoverCases.filter(c=>c.status!=="handed-over").length;const warrantyOpen=warrantyCases.filter(c=>!["resolved","closed"].includes(c.status)).length;return `<div class="lifecycle-summary">${lifecycleLine(t("v56.process.type.contract"),contractOpen,"contracts")}${lifecycleLine(t("v56.process.type.legal"),legalOpen,"legal")}${lifecycleLine(t("v56.process.type.registration"),regOpen,"registration")}${lifecycleLine(t("v56.process.type.handover"),handOpen,"handover")}${lifecycleLine(t("v56.process.type.warranty"),warrantyOpen,"service")}</div>`}
function lifecycleLine(label:string,value:number,route:string){return `<button data-route="${route}"><span>${label}</span><b>${value}</b><i>›</i></button>`}

function riskRow(r:(typeof executiveRisks)[number]){const key=riskKey[r.title]??"receivables";const detail=key==="mortgage"?t(`reports.risk.${key}.detail`,{value:compactAmd(73_800_000)}):t(`reports.risk.${key}.detail`);const value=key==="receivables"?compactAmd(23_500_000):r.value;return `<button class="risk-row" data-route="${r.route}"><span class="risk-dot ${r.severity}"></span><span class="risk-copy"><strong>${t(`reports.risk.${key}.title`)}</strong><small>${detail}</small></span><b>${value}</b><i>›</i></button>`}
function execKpi(label:string,value:string,note:string,tone:"up"|"down"|"neutral",route:string){return `<button class="executive-kpi" data-route="${route}"><div><span>${label}</span><i>↗</i></div><strong>${value}</strong><small class="${tone}">${note}</small></button>`}
function panelTitle(title:string,sub:string,route?:string){return `<div class="analytics-panel-title"><div><h2>${title}</h2><p>${sub}</p></div>${route?`<button data-route="${route}">${t("reports.explore")} <span>↗</span></button>`:""}</div>`}

function revenueChart(){const max=Math.max(...monthlySales.flatMap(x=>[x.revenue,x.target]));const w=760,h=220,p=28;const x=(i:number)=>p+i*((w-2*p)/(monthlySales.length-1));const y=(v:number)=>h-p-v/max*(h-2*p);const pts=monthlySales.map((d,i)=>`${x(i)},${y(d.revenue)}`).join(" ");const tpts=monthlySales.map((d,i)=>`${x(i)},${y(d.target)}`).join(" ");const area=`${p},${h-p} ${pts} ${w-p},${h-p}`;return `<div class="svg-chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6f63e8" stop-opacity=".22"/><stop offset="100%" stop-color="#6f63e8" stop-opacity="0"/></linearGradient></defs>${[0.25,.5,.75,1].map(r=>`<line x1="${p}" y1="${p+(h-2*p)*r}" x2="${w-p}" y2="${p+(h-2*p)*r}" class="grid-line"/>`).join("")}<polygon points="${area}" fill="url(#revFill)"/><polyline points="${tpts}" class="target-line"/><polyline points="${pts}" class="actual-line"/>${monthlySales.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.revenue)}" r="4" class="data-dot"/>`).join("")}</svg><div class="chart-axis">${monthlySales.map(d=>`<span>${month(d.month)}</span>`).join("")}</div><div class="chart-legend"><span><i class="legend actual"></i>${t("reports.chart.revenue")}</span><span><i class="legend target"></i>${t("reports.chart.target")}</span></div></div>`}
function cashflowChart(){const max=Math.max(...cashflowForecast.map(x=>x.actual+x.forecast+x.mortgage));return `<div class="cash-forecast-chart">${cashflowForecast.map(d=>`<div class="cash-month"><div class="cash-columns"><i class="cash-part actual" style="height:${d.actual/max*170}px"></i><i class="cash-part forecast" style="height:${d.forecast/max*170}px"></i><i class="cash-part mortgage" style="height:${d.mortgage/max*170}px"></i></div><strong>${month(d.month)}</strong><small>${compactAmd((d.actual+d.forecast+d.mortgage)*1_000_000)}</small></div>`).join("")}</div><div class="chart-legend centered"><span><i class="legend collected"></i>${t("reports.chart.collected")}</span><span><i class="legend forecast"></i>${t("reports.chart.buyerForecast")}</span><span><i class="legend mortgage"></i>${t("reports.chart.mortgage")}</span></div>`}
function cashflowMini(){return `<div class="mini-cashflow">${cashflowForecast.map(d=>{const v=d.actual+d.forecast+d.mortgage;return `<div><span>${month(d.month)}</span><i style="--h:${Math.min(100,v/300*100)}%"></i><b>${compactAmd(v*1_000_000)}</b></div>`}).join("")}</div>`}
function projectRow(p:(typeof projectPortfolio)[number]){const soldPct=Math.round(p.sold/p.units*100);return `<button class="project-row" data-route="properties"><span class="project-name"><strong>${p.name}</strong><small>${projectLocation(p.location)} · ${p.units} ${t("reports.units")}</small></span><span><small>${t("reports.sales")}</small><strong>${soldPct}%</strong></span><span class="project-progress"><i style="width:${soldPct}%"></i></span><span><small>${t("reports.col.revenue")}</small><strong>${compactAmd(p.revenue*1_000_000_000)}</strong></span><span><small>${t("reports.collection")}</small><strong>${p.collection}%</strong></span><em>›</em></button>`}
function conversionRing(){return `<div class="ring-block"><div class="ring" style="--pct:64.8"><div><strong>64.8%</strong><span>${t("reports.qualified")}</span></div></div><div class="ring-notes"><p><span>${t("reports.leadQualified")}</span><b>64.8%</b></p><p><span>${t("reports.qualifiedOffer")}</span><b>47.0%</b></p><p><span>${t("reports.offerSold")}</span><b>35.9%</b></p></div></div>`}
function inventoryDonut(){const vals={sold:projectPortfolio.reduce((s,p)=>s+p.sold,0),reserved:projectPortfolio.reduce((s,p)=>s+p.reserved,0),contract:projectPortfolio.reduce((s,p)=>s+p.contract,0),available:projectPortfolio.reduce((s,p)=>s+p.available,0)};const total=Object.values(vals).reduce((a,b)=>a+b,0);const a=vals.sold/total*100,b=(vals.sold+vals.reserved)/total*100,c=(vals.sold+vals.reserved+vals.contract)/total*100;return `<div class="donut-block"><div class="donut" style="background:conic-gradient(#253545 0 ${a}%,#d49a43 ${a}% ${b}%,#6f63e8 ${b}% ${c}%,#dfe5ea ${c}% 100%)"><div><strong>${total}</strong><span>${t("reports.units")}</span></div></div><div class="donut-legend"><p><i class="d-sold"></i><span>${t("reports.heat.sold")}</span><b>${vals.sold}</b></p><p><i class="d-reserved"></i><span>${t("reports.heat.reserved")}</span><b>${vals.reserved}</b></p><p><i class="d-contract"></i><span>${t("reports.heat.contract")}</span><b>${vals.contract}</b></p><p><i class="d-available"></i><span>${t("reports.heat.available")}</span><b>${vals.available}</b></p></div></div>`}
function operationsPulse(){return `<div class="ops-pulse"><button data-route="handover"><strong>${handoverCases.filter(x=>x.status!=="handed-over").length}</strong><span>${t("reports.activeHandovers")}</span></button><button data-route="service"><strong>${warrantyCases.filter(x=>!["resolved","closed"].includes(x.status)).length}</strong><span>${t("reports.openWarranty")}</span></button><button data-route="service"><strong>2</strong><span>${t("reports.slaAtRisk")}</span></button></div>`}
function sourceRow(s:(typeof leadSources)[number]){const cv=Math.round(s.deals/s.leads*1000)/10;return `<button class="source-row" data-route="leads"><span><strong>${sourceName(s.name)}</strong><small>${s.leads} ${t("reports.leads")}</small></span><span><small>${t("reports.qualified")}</small><b>${Math.round(s.qualified/s.leads*100)}%</b></span><span><small>${t("reports.leadDeal")}</small><b>${cv}%</b></span><span><small>${t("reports.cac")}</small><b>${Math.round(s.cac/1000)} ${t("abbr.thousand")} ֏</b></span><i>›</i></button>`}
function barMetric(label:string,value:number,max:number,note:string){return `<div class="metric-bar-row"><div><span>${label}</span><b>${value}</b></div><i><em style="width:${value/max*100}%"></em></i><small>${note}</small></div>`}
function collectionGauge(){return `<div class="gauge-wrap"><div class="gauge"><div class="gauge-mask"></div><div class="gauge-copy"><strong>89%</strong><span>${t("reports.collected")}</span></div></div><div class="gauge-notes"><p><span>${t("reports.onTime")}</span><b>82%</b></p><p><span>${t("reports.partial")}</span><b>5%</b></p><p><span>${t("reports.overdue")}</span><b>6%</b></p><p><span>${t("reports.future")}</span><b>7%</b></p></div></div>`}
function labelMortgage(s:string){return ({documents:t("reports.mortgage.documents"),"bank-review":t("reports.mortgage.bankReview"),approved:t("reports.mortgage.approved"),contracting:t("reports.mortgage.contracting")} as Record<string,string>)[s]??s}
function heatmap(){return `<div class="heatmap-wrap"><div class="heatmap-legend"><span><i class="available"></i>${t("reports.heat.available")}</span><span><i class="reserved"></i>${t("reports.heat.reserved")}</span><span><i class="contract"></i>${t("reports.heat.contract")}</span><span><i class="sold"></i>${t("reports.heat.sold")}</span></div><div class="inventory-heatmap">${inventoryHeatmap.map(row=>`<div class="heat-row"><b>${row.floor}${t("abbr.floor")}</b>${row.units.map((s,i)=>`<button class="heat-cell ${s}" data-route="properties" title="${t("reports.floorUnit",{floor:row.floor,unit:i+1,status:t(`reports.heat.${s}`)})}"></button>`).join("")}</div>`).join("")}</div></div>`}
function projectMatrix(p:(typeof projectPortfolio)[number]){return `<button class="portfolio-row" data-route="properties"><span><strong>${p.name}</strong><small>${projectLocation(p.location)}</small></span><span>${p.units}</span><span>${p.available}</span><span>${p.sold}</span><span>${amd(p.avgSqm)}</span><span>${compactAmd(p.revenue*1_000_000_000)} / ${compactAmd(p.target*1_000_000_000)}</span><span><b>${Math.round(p.revenue/p.target*100)}%</b></span><span>${p.collection}%</span></button>`}
function managerConversionChart(){const max=Math.max(...managerPerformance.map(m=>m.conversion));return `<div class="manager-bars">${managerPerformance.map(m=>`<button data-route="deals"><span>${m.name}</span><i><em style="width:${m.conversion/max*100}%"></em></i><b>${m.conversion}%</b></button>`).join("")}</div>`}
function warrantySla(){const open=warrantyCases.filter(w=>!["resolved","closed"].includes(w.status));return `<div class="sla-ring"><div class="ring" style="--pct:78"><div><strong>78%</strong><span>${t("reports.withinSla")}</span></div></div><div class="sla-list">${open.map(w=>`<button data-route="warranty/${w.id}"><span class="priority ${w.priority}">${priorityLabel(w.priority)}</span><p><strong>${w.id}</strong><small>${categoryLabel(w.category)}</small></p><b>${w.slaHours}${t("abbr.hour")}</b></button>`).join("")}</div></div>`}

function downloadCsv(filename:string,rows:string[][]){const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toastLocalized(t("reports.exported"))}
function exportReportCsv(tab:ReportTab){
  if(tab==="quality"){const q=dataQualityMetrics();downloadCsv("estateflow-data-quality-2026-09-23.csv",[[t("v56.quality.queue"),t("v56.export.count")],[t("v56.quality.issue.duplicate"),String(q.duplicates.length)],[t("v56.quality.issue.profile"),String(q.missing)],[t("v56.quality.issue.identity"),String(q.expiredIds.length)],[t("v56.quality.issue.kyc"),String(q.kycOpen.length)],[t("v56.quality.issue.poa"),String(q.poaAttention.length)],[t("v56.quality.issue.payment"),String(q.unlinked.length)],[t("v56.quality.issue.registration"),String(q.registrationDocs)]]);return}
  if(tab==="process"){ensureTasksInitialized();const now=taskNow(),active=tasks.filter(x=>!["done","cancelled"].includes(x.status));downloadCsv("estateflow-process-sla-2026-09-23.csv",[[t("v56.process.category"),t("v56.process.open"),t("v56.process.overdue"),t("v56.process.escalated")],...(["approval","contract","payment","legal","registration","handover","service"] as const).map(k=>{const list=active.filter(x=>x.category===k);return[t(`v56.process.cat.${k}`),String(list.length),String(list.filter(x=>new Date(x.dueAt).getTime()<now.getTime()).length),String(list.filter(x=>x.escalated).length)]})]);return}
  const rows:string[][]=[[t("reports.csv.title"),"23.09.2026"],[],[t("reports.col.manager"),t("reports.col.leads"),t("reports.col.meetings"),t("reports.col.deals"),t("reports.csv.revenue"),t("reports.csv.conversion"),t("reports.csv.discount"),t("reports.csv.cycle")],...managerPerformance.map(m=>[m.name,String(m.leads),String(m.meetings),String(m.deals),String(m.revenue),String(m.conversion),String(m.discount),String(m.cycle)]),[],[t("reports.csv.title"),t("reports.csv.location"),t("reports.csv.units"),t("reports.csv.available"),t("reports.csv.sold"),t("reports.csv.avgSqm"),t("reports.csv.revenueB"),t("reports.csv.targetB"),t("reports.csv.collection")],...projectPortfolio.map(p=>[p.name,projectLocation(p.location),String(p.units),String(p.available),String(p.sold),String(p.avgSqm),String(p.revenue),String(p.target),String(p.collection)])];downloadCsv(`estateflow-${tab}-report-2026-09-23.csv`,rows)
}
export function bindReports(){
  document.querySelectorAll<HTMLElement>("[data-report-tab]").forEach(el=>el.addEventListener("click",()=>navigate(`reports?tab=${el.dataset.reportTab}`)));
  document.querySelectorAll<HTMLElement>("[data-route]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.route!)));
  document.querySelector<HTMLButtonElement>("#exportReport")?.addEventListener("click",e=>exportReportCsv((((e.currentTarget as HTMLButtonElement).dataset.reportExport)||"executive") as ReportTab));
}
