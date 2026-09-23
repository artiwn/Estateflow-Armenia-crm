import { t } from "../i18n";
import { clients, deals, handoverCases, defects, properties, paymentSchedule, registrationCases } from "../data/mock";
import { badge } from "../utils";
import { navigate } from "../router";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";

export function handoverPage() {
  const openDef = defects.filter((d: any) => d.status !== "resolved").length;
  const activeCases=handoverCases.filter((h:any)=>h.status!=="handed-over");
  const ready = activeCases.filter((h: any) => h.financialClearance && h.registrationClearance && h.technicalReadiness >= 95).length;
  const handedOver = handoverCases.filter((h:any)=>h.status==="handed-over").length;
  const counts = {readiness:handoverCases.filter((h:any)=>h.status==="readiness").length,inspection:handoverCases.filter((h:any)=>h.status==="inspection").length,defects:handoverCases.filter((h:any)=>h.status==="defects").length,reinspection:handoverCases.filter((h:any)=>h.status==="reinspection").length,acceptance:handoverCases.filter((h:any)=>h.status==="acceptance").length,handedOver};
  return `<section class="page">
    <div class="page-header">
      <div class="page-title"><h1>${t("handoverPage.title")}</h1><p>${t("handoverPage.subtitle")}</p></div>
      <div class="toolbar"><button class="btn" id="handoverCalendar">${t("handoverPage.calendar")}</button><button class="btn btn-primary" id="newHandover">${t("handoverPage.schedule")}</button></div>
    </div>
    <div class="grid grid-4 u-mb-16">
      ${metric(t("handoverPage.metric.queue"), activeCases.length, t("handoverPage.metric.queueNote"))}
      ${metric(t("handoverPage.metric.ready"), ready, t("handoverPage.metric.readyNote"))}
      ${metric(t("handoverPage.metric.openDefects"), openDef, t("handoverPage.metric.openDefectsNote"))}
      ${metric(t("handoverPage.metric.handedOverMtd"), handedOver, t("handoverPage.metric.handedOverMtdNote"))}
    </div>
    <div class="handover-board card card-pad">
      <div class="section-title"><div><h2>${t("handoverPage.process")}</h2><p>${t("handoverPage.processNote")}</p></div></div>
      <div class="handover-pipeline">
        ${stage("1", t("handoverPage.stage.readiness"), String(counts.readiness), counts.readiness?"active":"")}
        ${stage("2", t("handoverPage.stage.inspection"), String(counts.inspection), counts.inspection?"active":"")}
        ${stage("3", t("handoverPage.stage.defects"), String(counts.defects), counts.defects?"warn":"")}
        ${stage("4", t("handoverPage.stage.reinspection"), String(counts.reinspection), counts.reinspection?"active":"")}
        ${stage("5", t("handoverPage.stage.acceptance"), String(counts.acceptance), counts.acceptance?"active":"")}
        ${stage("6", t("handoverPage.stage.keys"), String(counts.handedOver), counts.handedOver?"done":"")}
      </div>
    </div>
    <div class="card u-mt-16"><div class="table-wrap"><table class="table">
      <thead><tr><th>${t("handoverPage.case")}</th><th>${t("handoverPage.clientProperty")}</th><th>${t("handoverPage.stage")}</th><th>${t("handoverPage.readiness")}</th><th>${t("handoverPage.checks")}</th><th>${t("handoverPage.inspection")}</th><th>${t("v52.handover.clientDecision")}</th><th>${t("handoverPage.coordinator")}</th></tr></thead>
      <tbody>${handoverCases.map((h: any) => `<tr data-handover="${h.id}"><td><strong>${h.id}</strong></td><td><div class="person"><div class="avatar accent">${h.propertyLabel.split("·").pop()?.trim().slice(-4)}</div><div><strong>${h.clientName}</strong><span>${h.propertyLabel}</span></div></div></td><td>${badge(h.status)}</td><td><div class="u-minw-110"><div class="progress"><span style="width:${h.technicalReadiness}%"></span></div><small class="u-muted">${h.technicalReadiness}% ${t("handoverPage.technical")}</small></div></td><td><span class="chip ${h.financialClearance ? "success" : "warning"}">${t("handoverPage.financeShort")} ${h.financialClearance ? "✓" : "!"}</span> <span class="chip ${h.registrationClearance ? "success" : "warning"}">${t("handoverPage.registrationShort")} ${h.registrationClearance ? "✓" : "!"}</span></td><td>${h.plannedAt}</td><td><span class="chip ${h.clientAcceptance === "confirmed" ? "success" : h.clientAcceptance === "declined" ? "danger" : "warning"}">${t(`v52.acceptance.${h.clientAcceptance ?? "pending"}`)}</span></td><td>${h.coordinator}</td></tr>`).join("")}</tbody>
    </table></div></div>
  </section>`;
}

function metric(label: string, value: number, note: string) {
  return `<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div></div>`;
}

function stage(number: string, label: string, value: string, cls: string) {
  return `<div class="handover-stage ${cls}"><span>${number}</span><strong>${label}</strong><small>${t("handoverPage.cases", { count: value })}</small></div>`;
}

export function bindHandover() {
  document.querySelectorAll("[data-handover]").forEach(el => el.addEventListener("click", () => navigate("handover-case/" + (el as HTMLElement).dataset.handover)));
  document.querySelector("#newHandover")?.addEventListener("click", openHandoverForm);
  document.querySelector("#handoverCalendar")?.addEventListener("click", () => {
    openLocalizedModal(t("handoverPage.calendar"), `<div class="entity-card-grid">${handoverCases.map((h: any) => `<button class="entity-card u-text-left" data-calendar-handover="${h.id}"><span>${h.plannedAt}</span><strong>${h.propertyLabel}</strong><small>${h.clientName} · ${h.coordinator}</small></button>`).join("")}</div>`);
    setTimeout(() => document.querySelectorAll("[data-calendar-handover]").forEach(el => el.addEventListener("click", () => {
      closeModal();
      navigate("handover-case/" + (el as HTMLElement).dataset.calendarHandover);
    })), 0);
  });
}

function openHandoverForm() {
  const eligibleDeals=deals.filter(d=>["payment","registration","handover"].includes(d.status)&&!handoverCases.some((h:any)=>h.dealId===d.id));
  openLocalizedModal(t("handoverPage.modal.title"), `<form id="handoverCreateForm" class="form-grid">
    <div class="form-field full"><label>${t("handoverPage.modal.deal")}</label><select name="dealId" required ${eligibleDeals.length?"":"disabled"}><option value="">${eligibleDeals.length?t("handoverPage.modal.chooseDeal"):t("handoverPage.modal.noEligibleDeals")}</option>${eligibleDeals.map(d => `<option value="${d.id}">${d.id} · ${d.clientName} · ${d.propertyLabel}</option>`).join("")}</select></div>
    <div class="form-field"><label>${t("handoverPage.modal.date")}</label><input name="date" type="date" value="2026-09-24" required></div>
    <div class="form-field"><label>${t("handoverPage.modal.time")}</label><input name="time" type="time" value="11:00" required></div>
    <div class="form-field"><label>${t("handoverPage.modal.coordinator")}</label><select name="coordinator"><option>Լուսինե Աբրահամյան</option><option>Գոռ Մելիքյան</option></select></div>
    <div class="form-field"><label>${t("handoverPage.modal.keySets")}</label><input name="keys" type="number" min="1" value="2"></div>
  </form>`, `<button class="btn" data-modal-close>${t("handoverPage.cancel")}</button><button class="btn btn-accent" id="saveHandover" ${eligibleDeals.length?"":"disabled"}>${t("handoverPage.modal.schedule")}</button>`);

  setTimeout(() => document.querySelector("#saveHandover")?.addEventListener("click", () => {
    const f = document.querySelector<HTMLFormElement>("#handoverCreateForm")!;
    if (!f.reportValidity()) return;
    const dealId=formValue(f,"dealId");
    if(handoverCases.some((h:any)=>h.dealId===dealId)){toastLocalized(t("handoverPage.toast.duplicate"));return}
    const d = deals.find(x => x.id === dealId);if(!d){toastLocalized(t("common.recordNotFound"));return}
    const c = clients.find(x => x.id === d.clientId),p = properties.find(x => x.id === d.propertyId);if(!c||!p){toastLocalized(t("common.recordNotFound"));return}
    const id = `HO-2026-${String(72 + handoverCases.length).padStart(4, "0")}`;
    const date = formValue(f, "date").split("-").reverse().join(".");
    const schedule=paymentSchedule.filter(x=>x.dealId===d.id);
    const financialClearance=schedule.length>0&&schedule.every(x=>x.paid>=x.amount);
    const registrationClearance=registrationCases.some(x=>x.dealId===d.id&&x.status==="registered");
    handoverCases.push({ id, dealId: d.id, clientId: c.id, clientName: c.name, propertyId: p.id, propertyLabel: `${p.project} · ${p.unit}`, project: p.project, status: "readiness", plannedAt: `${date} · ${formValue(f, "time")}`, coordinator: formValue(f, "coordinator"), financialClearance, registrationClearance, technicalReadiness: 85, keysCount: Number(formValue(f, "keys")) });
    closeModal();toastLocalized(t("handoverPage.toast.scheduled"));navigate("handover-case/" + id);
  }), 0);
}
