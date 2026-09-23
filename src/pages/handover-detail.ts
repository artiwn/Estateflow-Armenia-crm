import { t } from "../i18n";
import { demoText } from "../demo-i18n";
import { handoverCases, inspectionRooms, defects, deals, properties } from "../data/mock";
import { badge, severityLabel } from "../utils";
import { navigate } from "../router";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";
import { entityAuditPanel } from "../components/audit-panel";
import { recordAudit } from "../services/audit";

const now = new Date("2026-09-23T09:14:00+04:00");

export function handoverDetailPage(id: string) {
  const h = handoverCases.find((x: any) => x.id === id);
  if (!h) return `<section class="page"><div class="card card-pad">${t("handoverDetail.notFound")}</div></section>`;

  const rooms = inspectionRooms.filter((r: any) => r.handoverId === id);
  const ds = defects.filter((d: any) => d.handoverId === id);
  const open = ds.filter((d: any) => d.status !== "resolved").length;
  const readyForCheck = ds.filter((d: any) => d.status === "ready-for-check").length;
  const overdue = ds.filter((d: any) => d.status !== "resolved" && parseLegacy(d.dueAt) < now).length;
  const inspectionComplete = rooms.length > 0 && rooms.every((r: any) => r.checklistDone >= r.checklistTotal);
  const baseReady = h.financialClearance && h.registrationClearance && h.technicalReadiness >= 95;
  const resolutionReady = open === 0 && inspectionComplete;
  const clientConfirmed = h.clientAcceptance === "confirmed";
  const readyForAct = baseReady && resolutionReady && clientConfirmed;
  const checkedPoints = rooms.reduce((sum: number, room: any) => sum + room.checklistDone, 0);
  const beforeEvidence = ds.reduce((sum: number, d: any) => sum + (d.beforeEvidence ?? d.evidence ?? 0), 0);
  const afterEvidence = ds.reduce((sum: number, d: any) => sum + (d.afterEvidence ?? 0), 0);

  return `<section class="page">
    <button class="btn btn-soft u-mb-16" id="backHandover">${t("handoverDetail.back")}</button>
    <div class="detail-header"><div class="detail-title"><small>${h.id} · ${h.project}</small><h1>${h.propertyLabel.split("·").pop()?.trim()} · ${h.clientName}</h1>${badge(h.status)} ${acceptanceBadge(h.clientAcceptance ?? "pending")}</div><div class="toolbar"><button class="btn" id="openDeal">${t("handoverDetail.openDeal")}</button><button class="btn btn-primary" id="openInspection">${t("handoverDetail.openInspection")}</button></div></div>

    <div class="grid grid-4 u-mb-16 v52-handover-kpis">
      ${metric(t("v52.handover.kpi.checklist"), rooms.length ? `${checkedPoints}/${rooms.reduce((s:number,r:any)=>s+r.checklistTotal,0)}` : "—", t("v52.handover.kpi.checklistNote"))}
      ${metric(t("v52.handover.kpi.openDefects"), open, overdue ? t("v52.handover.kpi.overdue",{count:overdue}) : t("v52.handover.kpi.noOverdue"))}
      ${metric(t("v52.handover.kpi.reinspection"), readyForCheck, t("v52.handover.kpi.reinspectionNote"))}
      ${metric(t("v52.handover.kpi.evidence"), `${beforeEvidence}/${afterEvidence}`, t("v52.handover.kpi.evidenceNote"))}
    </div>

    <div class="handover-readiness card card-pad"><div class="section-title"><div><h2>${t("handoverDetail.readiness.title")}</h2><p>${t("v52.handover.readinessSub")}</p></div><span class="chip ${readyForAct ? "success" : "warning"}">${readyForAct ? t("v52.handover.readyForAct") : t("v52.handover.blocked")}</span></div><div class="readiness-grid">
      ${check(t("handoverDetail.check.financial"), h.financialClearance, t("handoverDetail.check.financialNote"))}
      ${check(t("handoverDetail.check.registration"), h.registrationClearance, t("handoverDetail.check.registrationNote"))}
      ${check(t("handoverDetail.check.technical"), h.technicalReadiness >= 95, t("handoverDetail.check.technicalNote", { percent: h.technicalReadiness }))}
      ${check(t("handoverDetail.check.clientInspection"), inspectionComplete, inspectionComplete ? t("handoverDetail.path.checklistComplete") : t("handoverDetail.path.inspectionIncomplete"))}
      ${check(t("v52.handover.check.defects"), open === 0, open ? t("v52.handover.check.defectsOpen",{count:open}) : t("v52.handover.check.defectsClosed"))}
      ${check(t("v52.handover.check.acceptance"), clientConfirmed, clientConfirmed ? `${h.clientAcceptedAt ?? ""} · ${h.clientAcceptanceBy ?? h.clientName}` : h.clientAcceptance === "declined" ? t("v52.handover.acceptanceDeclined") : t("v52.handover.acceptancePending"))}
    </div></div>

    <div class="split">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("handoverDetail.inspectionMap")}</h2><p>${t("handoverDetail.inspectionMapNote")}</p></div><button class="btn btn-soft" id="openInspection2">${t("handoverDetail.fullChecklist")}</button></div><div class="mini-plan">${rooms.map((r: any) => `<button class="mini-room ${r.state}" data-room="${r.id}"><strong>${demoText(r.name)}</strong><span>${r.area} m²</span>${r.defectCount ? `<b>${r.defectCount}</b>` : ""}</button>`).join("")}</div></div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("handoverDetail.path.title")}</h2><p>${h.plannedAt}</p></div></div><div class="timeline">
        ${timeline(t("handoverDetail.path.readiness"), baseReady ? t("handover.readinessBundle") : t("handoverDetail.path.incompleteChecks"), baseReady ? "done" : "current")}
        ${timeline(t("handoverDetail.path.clientInspection"), inspectionComplete ? t("handoverDetail.path.checklistComplete") : t("handoverDetail.path.inspectionIncomplete"), inspectionComplete ? "done" : baseReady ? "current" : "")}
        ${timeline(t("handoverDetail.path.defectResolution"), open ? t("handoverDetail.path.openDefects", { count: open }) : t("handoverDetail.path.allResolved"), open && inspectionComplete ? "current" : !open && inspectionComplete ? "done" : "")}
        ${timeline(t("handoverDetail.path.reinspection"), readyForCheck ? t("v52.handover.reinspectionPending",{count:readyForCheck}) : !open ? t("handoverDetail.path.resolutionConfirmation") : t("handoverDetail.path.pending"), !open && inspectionComplete ? "done" : readyForCheck ? "current" : "")}
        ${timeline(t("v52.handover.path.clientAcceptance"), clientConfirmed ? t("v52.handover.acceptedByClient") : h.clientAcceptance === "declined" ? t("v52.handover.acceptanceDeclined") : t("v52.handover.acceptancePending"), clientConfirmed ? "done" : resolutionReady ? "current" : "")}
        ${timeline(t("handoverDetail.path.acceptanceAct"), readyForAct ? t("handoverDetail.path.readyForGeneration") : t("handoverDetail.path.waitingForReadiness"), readyForAct ? "current" : "")}
        ${timeline(t("handoverDetail.path.keys"), t("handoverDetail.path.keySets", { count: h.keysCount }), h.status === "handed-over" ? "done" : "")}
      </div></div>
    </div>

    <div class="card card-pad u-mt-16"><div class="section-title"><div><h2>${t("handoverDetail.defects.title")}</h2><p>${t("v52.handover.defectsSub")}</p></div><button class="btn btn-soft" id="openInspection3">${t("v52.handover.manageDefects")}</button></div><div class="defect-list">${ds.length ? ds.map((d: any) => defectRow(d)).join("") : `<div class="task-empty"><div>✓</div><h3>${t("v52.handover.noDefects")}</h3><p>${t("v52.handover.noDefectsNote")}</p></div>`}</div></div>

    <div class="v52-acceptance-grid u-mt-16">
      <div class="card card-pad v52-acceptance-card ${h.clientAcceptance ?? "pending"}"><div class="section-title"><div><span class="eyebrow">${t("v52.handover.acceptanceEyebrow")}</span><h2>${t("v52.handover.acceptanceTitle")}</h2><p>${t("v52.handover.acceptanceSub")}</p></div>${acceptanceBadge(h.clientAcceptance ?? "pending")}</div>
        <div class="v52-acceptance-summary"><div><span>${t("v52.handover.customer")}</span><strong>${h.clientName}</strong></div><div><span>${t("v52.handover.acceptedAt")}</span><strong>${h.clientAcceptedAt ?? "—"}</strong></div><div><span>${t("v52.handover.comment")}</span><strong>${h.clientAcceptanceComment ?? t("v52.common.notRecorded")}</strong></div></div>
        <button class="btn ${resolutionReady ? "btn-primary" : "btn-soft"}" id="recordAcceptance" ${!resolutionReady || h.status === "handed-over" ? "disabled" : ""}>${h.clientAcceptance === "confirmed" ? t("v52.handover.editAcceptance") : t("v52.handover.recordAcceptance")}</button>
      </div>
      <div class="card card-pad"><div class="section-title"><div><span class="eyebrow">${t("v52.handover.evidenceEyebrow")}</span><h2>${t("v52.handover.evidenceTitle")}</h2><p>${t("v52.handover.evidenceSub")}</p></div></div><div class="v52-evidence-comparison"><div class="before"><span>${t("v52.common.before")}</span><strong>${beforeEvidence}</strong><small>${t("v52.common.files")}</small></div><div class="evidence-arrow">→</div><div class="after"><span>${t("v52.common.after")}</span><strong>${afterEvidence}</strong><small>${t("v52.common.files")}</small></div></div><button class="btn btn-soft" id="openEvidence">${t("v52.handover.openEvidence")}</button></div>
    </div>

    <div class="handover-actions card card-pad u-mt-16"><div><strong>${t("handoverDetail.finalAction")}</strong><p>${t("v52.handover.finalActionNote")}</p></div><button class="btn btn-primary" id="generateAct" ${!readyForAct || h.status === "handed-over" ? "disabled" : ""}>${h.status === "handed-over" ? t("handoverDetail.completed") : t("handoverDetail.generateAct")}</button></div>
    ${entityAuditPanel("handover",h.id)}
  </section>`;
}

function metric(label:string,value:string|number,note:string){return `<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div></div>`}
function check(title: string, ok: boolean, subtitle: string) {return `<div class="readiness-item ${ok ? "ok" : "wait"}"><div class="readiness-icon">${ok ? "✓" : "!"}</div><div><strong>${title}</strong><span>${subtitle}</span></div></div>`;}
function timeline(title: string, subtitle: string, cls: string) {return `<div class="timeline-item ${cls}"><div class="timeline-dot"></div><div class="timeline-copy"><strong>${title}</strong><span>${subtitle}</span></div></div>`;}
function acceptanceBadge(status:string){const cls=status==="confirmed"?"success":status==="declined"?"danger":"warning";return `<span class="chip ${cls}">${t(`v52.acceptance.${status}`)}</span>`}
function parseLegacy(v:string){const [date,time="23:59"]=v.split(" · ");const [d,m,y]=date.split(".");return new Date(`${y}-${m}-${d}T${time}:00`)}
function defectRow(d:any){const late=d.status!=="resolved"&&parseLegacy(d.dueAt)<now;return `<div class="defect-row v52-defect-row"><div class="defect-severity ${d.severity}"></div><div class="defect-main"><strong>${demoText(d.title)}</strong><span>${demoText(d.roomName)} · ${d.contractor}</span><div class="v52-evidence-mini"><span>${t("v52.common.before")}: <b>${d.beforeEvidence??d.evidence??0}</b></span><span>${t("v52.common.after")}: <b>${d.afterEvidence??0}</b></span>${d.resolutionNote?`<span>✓ ${demoText(d.resolutionNote)}</span>`:""}</div></div><div><span class="chip ${d.severity === "major" ? "warning" : d.severity === "critical" ? "danger" : ""}">${severityLabel(d.severity)}</span></div><div>${badge(d.status)}${late?`<small class="v52-overdue-label">${t("v52.common.slaOverdue")}</small>`:""}</div><div class="defect-date"><small>${t("handoverDetail.dueBy")}</small><strong>${d.dueAt.split(" · ")[0]}</strong></div></div>`}

export function bindHandoverDetail() {
  const id = location.hash.split("/").pop()!;
  document.querySelector("#backHandover")?.addEventListener("click", () => navigate("handover"));
  document.querySelector("#openDeal")?.addEventListener("click", () => {const h = handoverCases.find((x: any) => x.id === id);if (h) navigate("deal/" + h.dealId);});
  document.querySelectorAll("#openInspection,#openInspection2,#openInspection3").forEach(el => el.addEventListener("click", () => navigate("inspection/" + id)));
  document.querySelectorAll("[data-room]").forEach(el => el.addEventListener("click", () => navigate("inspection/" + id)));
  document.querySelector("#openEvidence")?.addEventListener("click",()=>navigate("inspection/"+id));
  document.querySelector("#recordAcceptance")?.addEventListener("click",()=>openAcceptance(id));
  document.querySelector("#generateAct")?.addEventListener("click", () => generateAct(id));
}

function openAcceptance(id:string){
  const h=handoverCases.find((x:any)=>x.id===id);if(!h)return;
  openLocalizedModal(t("v52.handover.acceptanceModal"),`<form id="acceptanceForm" class="form-grid"><div class="form-field full"><label>${t("v52.handover.acceptanceDecision")}</label><select name="decision"><option value="confirmed" ${h.clientAcceptance==="confirmed"?"selected":""}>${t("v52.acceptance.confirmed")}</option><option value="declined" ${h.clientAcceptance==="declined"?"selected":""}>${t("v52.acceptance.declined")}</option></select></div><div class="form-field full"><label>${t("v52.handover.comment")}</label><textarea name="comment" required>${h.clientAcceptanceComment??""}</textarea></div></form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveAcceptance">${t("common.save")}</button>`);
  setTimeout(()=>document.querySelector("#saveAcceptance")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#acceptanceForm")!;if(!f.reportValidity())return;const before=h.clientAcceptance??"pending",decision=formValue(f,"decision") as "confirmed"|"declined";h.clientAcceptance=decision;h.clientAcceptanceComment=formValue(f,"comment");h.clientAcceptanceBy=h.clientName;h.clientAcceptedAt="23.09.2026 · 09:14";h.status=decision==="confirmed"?"acceptance":"reinspection";recordAudit({module:"handover",action:"status",entityType:"handover",entityId:h.id,entityLabel:`${h.id} · ${h.propertyLabel}`,route:`handover-case/${h.id}`,field:"Client acceptance",oldValue:before,newValue:decision,note:h.clientAcceptanceComment,actor:"Հանձնման թիմ",actorRole:"Handover",severity:decision==="declined"?"warning":"info"});closeModal();toastLocalized(decision==="confirmed"?t("v52.handover.acceptanceSaved"):t("v52.handover.acceptanceReturned"));navigate("handover-case/"+id)}),0)
}

function generateAct(id:string){
  const h = handoverCases.find((x: any) => x.id === id);if (!h) return;
  const open = defects.filter((d: any) => d.handoverId === id && d.status !== "resolved").length;
  const rooms = inspectionRooms.filter((r: any) => r.handoverId === id);
  const blockers: string[] = [];
  if (open) blockers.push(t("handoverDetail.blocker.openDefects", { count: open }));
  if (!h.financialClearance) blockers.push(t("handover.noFinancialClearance"));
  if (!h.registrationClearance) blockers.push(t("handoverDetail.blocker.registration"));
  if (h.technicalReadiness < 95) blockers.push(t("handoverDetail.blocker.technical", { percent: h.technicalReadiness }));
  if (!rooms.length || rooms.some((r: any) => r.checklistDone < r.checklistTotal)) blockers.push(t("handoverDetail.blocker.inspection"));
  if(h.clientAcceptance!=="confirmed") blockers.push(t("v52.handover.blocker.acceptance"));
  if (blockers.length) {toastLocalized(t("handoverDetail.cannotGenerate", { blockers: blockers.join("; ") }));return;}
  const before=h.status;h.status = "handed-over";h.actNo = `ACT-${new Date().getFullYear()}-${String(handoverCases.indexOf(h) + 1).padStart(4, "0")}`;h.handedOverAt = "23.09.2026 · 09:14";
  const d = deals.find(x => x.id === h.dealId);if (d) {d.status = "handover";d.nextAction = "i18n:handoverDetail.next.warranty";}
  const p = properties.find(x => x.id === h.propertyId);if (p) p.status = "handed-over";
  recordAudit({module:"handover",action:"status",entityType:"handover",entityId:h.id,entityLabel:`${h.id} · ${h.propertyLabel}`,route:`handover-case/${h.id}`,field:"Handover status",oldValue:before,newValue:h.status,note:`Acceptance act ${h.actNo} generated and keys handed over.`,actor:"Հանձնման թիմ",actorRole:"Handover",severity:"info"});
  toastLocalized(t("handoverDetail.toast.actGenerated", { actNo: h.actNo }));navigate("handover");
}
