import { t } from "../i18n";
import { demoText } from "../demo-i18n";
import { defects, handoverCases, inspectionRooms } from "../data/mock";
import { badge, severityLabel, statusLabel } from "../utils";
import { navigate } from "../router";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";

const contractors=["Aqua Systems LLC","Stone & Tile AM","Facade Pro Armenia","Interior Works CJSC","ElectroBuild LLC","Climate Systems AM"];

export function inspectionPage(id: string) {
  const h = handoverCases.find((x: any) => x.id === id);
  if (!h) return `<section class="page"><div class="card card-pad">${t("inspectionPage.notFound")}</div></section>`;
  const rooms = inspectionRooms.filter((r: any) => r.handoverId === id);
  const ds = defects.filter((d: any) => d.handoverId === id);
  const done = rooms.reduce((sum: number, r: any) => sum + r.checklistDone, 0);
  const total = rooms.reduce((sum: number, r: any) => sum + r.checklistTotal, 0);
  const before=ds.reduce((s:number,d:any)=>s+(d.beforeEvidence??d.evidence??0),0),after=ds.reduce((s:number,d:any)=>s+(d.afterEvidence??0),0);
  const readyCheck=ds.filter((d:any)=>d.status==="ready-for-check").length;

  return `<section class="page">
    <button class="btn btn-soft u-mb-16" id="backCase">← ${h.id}</button>
    <div class="page-header"><div class="page-title"><h1>${t("inspectionPage.title")} · ${h.propertyLabel.split("·").pop()?.trim()}</h1><p>${h.clientName} · ${h.plannedAt} · ${t("inspectionPage.checklistProgress", { done, total })}</p></div><div class="toolbar"><button class="btn" id="inspectionMedia">${t("inspectionPage.media")}</button><button class="btn btn-primary" id="newDefect">${t("inspectionPage.addDefect")}</button></div></div>

    <div class="grid grid-4 u-mb-16">
      ${metric(t("v52.inspection.progress"),`${Math.round(done/Math.max(total,1)*100)}%`,t("v52.inspection.progressNote"))}
      ${metric(t("v52.inspection.open"),ds.filter((d:any)=>d.status!=="resolved").length,t("v52.inspection.openNote"))}
      ${metric(t("v52.inspection.readyCheck"),readyCheck,t("v52.inspection.readyCheckNote"))}
      ${metric(t("v52.inspection.evidence"),`${before}/${after}`,t("v52.inspection.evidenceNote"))}
    </div>

    <div class="inspection-layout"><div class="card card-pad"><div class="section-title"><div><h2>${t("inspectionPage.plan.title")}</h2><p>${t("inspectionPage.plan.subtitle")}</p></div><span class="chip accent">${Math.round(done / Math.max(total, 1) * 100)}% ${t("inspectionPage.checklist")}</span></div><div class="apartment-plan">${rooms.map((r: any) => `<button class="plan-room room-${r.id.replace("RM-", "").toLowerCase()} ${r.state}" data-select-room="${r.id}"><strong>${demoText(r.name)}</strong><span>${r.area} m² · ${r.checklistDone}/${r.checklistTotal}</span>${r.defectCount ? `<b>${r.defectCount}</b>` : ""}</button>`).join("")}</div></div>
      <aside class="card card-pad inspection-side"><div class="section-title"><div><h2>${t("inspectionPage.checklist")}</h2><p>${t("inspectionPage.checklistGroups")}</p></div></div>
        ${checkline(t("inspectionPage.group.walls"), 8, 8)}${checkline(t("inspectionPage.group.floors"), 6, 7)}${checkline(t("inspectionPage.group.windows"), 7, 8)}${checkline(t("inspectionPage.group.electrical"), 9, 9)}${checkline(t("inspectionPage.group.plumbing"), 6, 8)}${checkline(t("inspectionPage.group.hvac"), 5, 5)}
        <div class="divider"></div><button class="btn btn-primary u-full" id="completeInspection">${t("inspectionPage.complete")}</button>
      </aside>
    </div>

    <div class="card card-pad u-mt-16"><div class="section-title"><div><h2>${t("inspectionPage.defects.title")}</h2><p>${t("v52.inspection.defectsSub")}</p></div><div class="toolbar"><select class="field compact" id="severityFilter"><option value="">${t("inspectionPage.allSeverities")}</option><option value="major">${severityLabel("major")}</option><option value="minor">${severityLabel("minor")}</option><option value="critical">${severityLabel("critical")}</option></select><select class="field compact" id="defectStatusFilter"><option value="">${t("inspectionPage.allStatuses")}</option><option value="open">${statusLabel("open")}</option><option value="in-progress">${statusLabel("in-progress")}</option><option value="ready-for-check">${statusLabel("ready-for-check")}</option><option value="resolved">${statusLabel("resolved")}</option></select></div></div>
      <div class="v52-defect-cards">${ds.map((d:any)=>defectCard(d)).join("")}</div>
    </div>
  </section>`;
}

function metric(label:string,value:string|number,note:string){return `<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div></div>`}
function checkline(title: string, done: number, total: number) {return `<div class="checkline"><div><strong>${title}</strong><span>${t("inspectionPage.points", { done, total })}</span></div><div class="progress"><span style="width:${done / total * 100}%"></span></div></div>`;}
function defectCard(d:any){const before=d.beforeEvidence??d.evidence??0,after=d.afterEvidence??0;return `<article class="v52-defect-card" data-defect-row="${d.id}" data-severity="${d.severity}" data-status="${d.status}"><div class="v52-defect-card-head"><div><span>${d.id} · ${demoText(d.roomName)}</span><h3>${demoText(d.title)}</h3></div><div>${badge(d.status)} <span class="chip ${d.severity==="critical"?"danger":d.severity==="major"?"warning":""}">${severityLabel(d.severity)}</span></div></div><p>${demoText(d.description)}</p><div class="v52-defect-meta"><div><span>${t("inspectionPage.col.contractor")}</span><strong>${d.contractor}</strong></div><div><span>${t("inspectionPage.col.deadline")}</span><strong>${d.dueAt}</strong></div><div><span>${t("v52.inspection.reinspection")}</span><strong>${d.reinspectionAt??"—"}</strong></div></div><div class="v52-before-after"><button class="v52-evidence-box before" data-evidence-gallery="${d.id}"><span>${t("v52.common.before")}</span><strong>${before}</strong><small>${t("v52.common.files")}</small></button><div class="evidence-arrow">→</div><button class="v52-evidence-box after" data-evidence-gallery="${d.id}"><span>${t("v52.common.after")}</span><strong>${after}</strong><small>${after?t("v52.inspection.afterReady"):t("v52.inspection.afterMissing")}</small></button></div>${d.resolutionNote?`<div class="v52-resolution-note"><strong>${t("v52.inspection.resolution")}</strong><p>${demoText(d.resolutionNote)}</p></div>`:""}<div class="v52-defect-actions"><button class="btn btn-soft" data-assignment-history="${d.id}">${t("v52.inspection.assignmentHistory")}</button><button class="btn btn-primary" data-defect-action="${d.id}">${t("inspectionPage.update")}</button></div></article>`}

function currentId() { return location.hash.split("?")[0].split("/").pop()!; }
function refresh() { const id = currentId(); navigate("handover-case/" + id); setTimeout(() => navigate("inspection/" + id), 20); }

export function bindInspection() {
  const id = currentId();
  document.querySelector("#backCase")?.addEventListener("click", () => navigate("handover-case/" + id));
  document.querySelector("#inspectionMedia")?.addEventListener("click", () => openMediaGallery(id));
  document.querySelector("#newDefect")?.addEventListener("click", () => openNewDefect(id));
  document.querySelector("#completeInspection")?.addEventListener("click", () => {
    const h = handoverCases.find((x: any) => x.id === id);if (!h) return;
    const open = defects.filter((d: any) => d.handoverId === id && d.status !== "resolved").length;
    h.status = open ? "defects" : "acceptance";
    toastLocalized(open ? t("inspectionPage.toast.completedWithDefects", { count: open }) : t("inspectionPage.toast.completedNoDefects"));navigate("handover-case/" + id);
  });
  document.querySelectorAll("[data-defect-action]").forEach(el => el.addEventListener("click", () => openDefectUpdate((el as HTMLElement).dataset.defectAction!)));
  document.querySelectorAll<HTMLElement>("[data-evidence-gallery]").forEach(el => el.addEventListener("click", () => openMediaGallery(id, el.dataset.evidenceGallery)));
  document.querySelectorAll<HTMLElement>("[data-assignment-history]").forEach(el=>el.addEventListener("click",()=>openAssignmentHistory(el.dataset.assignmentHistory!)));
  document.querySelectorAll("[data-select-room]").forEach(el => el.addEventListener("click", () => {const room = inspectionRooms.find((r: any) => r.id === (el as HTMLElement).dataset.selectRoom);toastLocalized(t("inspectionPage.toast.roomSelected", { room: room ? demoText(room.name) : "" }));}));
  document.querySelector("#severityFilter")?.addEventListener("change", filter);document.querySelector("#defectStatusFilter")?.addEventListener("change", filter);
}

function openNewDefect(id: string) {
  const rooms = inspectionRooms.filter((r: any) => r.handoverId === id);
  openLocalizedModal(t("inspectionPage.modal.newDefect"), `<form id="defectForm" class="form-grid"><div class="form-field"><label>${t("inspectionPage.modal.room")}</label><select name="roomId">${rooms.map((r: any) => `<option value="${r.id}">${demoText(r.name)}</option>`).join("")}</select></div><div class="form-field"><label>${t("inspectionPage.modal.severity")}</label><select name="severity"><option value="minor">${severityLabel("minor")}</option><option value="major">${severityLabel("major")}</option><option value="critical">${severityLabel("critical")}</option></select></div><div class="form-field full"><label>${t("inspectionPage.modal.title")}</label><input name="title" required></div><div class="form-field full"><label>${t("inspectionPage.modal.description")}</label><textarea name="description" required></textarea></div><div class="form-field"><label>${t("inspectionPage.modal.contractor")}</label><select name="contractor">${contractors.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="form-field"><label>${t("inspectionPage.modal.deadline")}</label><input name="dueAt" value="24.09.2026 · 18:00"></div><div class="form-field full"><label>${t("v52.inspection.beforeEvidence")}</label><input id="defectFiles" type="file" accept="image/*,video/*" multiple></div></form>`, `<button class="btn" data-modal-close>${t("inspectionPage.cancel")}</button><button class="btn btn-accent" id="saveDefect">${t("inspectionPage.create")}</button>`);
  setTimeout(() => document.querySelector("#saveDefect")?.addEventListener("click", () => {const f = document.querySelector<HTMLFormElement>("#defectForm")!;if (!f.reportValidity()) return;const room = inspectionRooms.find((r: any) => r.id === formValue(f, "roomId"))!;const files=Math.max(1,document.querySelector<HTMLInputElement>("#defectFiles")?.files?.length??0);const contractor=formValue(f,"contractor");const nid = `DF-${260180 + defects.length + 1}`;defects.push({ id: nid, handoverId: id, roomId: room.id, roomName: room.name, title: formValue(f, "title"), description: formValue(f, "description"), severity: formValue(f, "severity") as any, status: "open", contractor, createdAt: "23.09.2026 · 09:14", dueAt: formValue(f, "dueAt"), evidence:files,beforeEvidence:files,afterEvidence:0,assignmentHistory:[{id:`DA-${Date.now()}`,at:"23.09.2026 · 09:14",actor:"Handover team",from:"Handover team",to:contractor,note:"Назначено при регистрации замечания."}] });room.defectCount += 1;room.state = "attention";const h = handoverCases.find((x: any) => x.id === id);if (h) {h.status = "defects";h.clientAcceptance="pending";}closeModal();toastLocalized(t("inspectionPage.toast.defectCreated"));refresh();}), 0);
}

function openDefectUpdate(defectId: string) {
  const d = defects.find((x: any) => x.id === defectId);if (!d) return;
  openLocalizedModal(t("inspectionPage.modal.updateDefect"), `<form id="defectUpdateForm" class="form-grid"><div class="form-field full"><label>${d.id} · ${demoText(d.title)}</label><select name="status"><option value="open" ${d.status === "open" ? "selected" : ""}>${statusLabel("open")}</option><option value="in-progress" ${d.status === "in-progress" ? "selected" : ""}>${statusLabel("in-progress")}</option><option value="ready-for-check" ${d.status === "ready-for-check" ? "selected" : ""}>${statusLabel("ready-for-check")}</option><option value="resolved" ${d.status === "resolved" ? "selected" : ""}>${statusLabel("resolved")}</option></select></div><div class="form-field"><label>${t("inspectionPage.modal.contractor")}</label><select name="contractor">${contractors.map(x=>`<option ${x===d.contractor?"selected":""}>${x}</option>`).join("")}</select></div><div class="form-field"><label>${t("inspectionPage.modal.deadline")}</label><input name="dueAt" value="${d.dueAt}"></div><div class="form-field full"><label>${t("v52.inspection.afterEvidence")}</label><select name="afterEvidence"><option value="0">${t("v52.inspection.noNewFiles")}</option><option value="1">+1</option><option value="2">+2</option><option value="3">+3</option></select></div><div class="form-field full"><label>${t("v52.inspection.resolution")}</label><textarea name="note">${d.resolutionNote??t("inspectionPage.modal.defaultUpdateNote")}</textarea></div></form>`, `<button class="btn" data-modal-close>${t("inspectionPage.cancel")}</button><button class="btn btn-accent" id="saveDefectUpdate">${t("inspectionPage.save")}</button>`);
  setTimeout(() => document.querySelector("#saveDefectUpdate")?.addEventListener("click", () => {const f = document.querySelector<HTMLFormElement>("#defectUpdateForm")!;const old = d.status;const oldContractor=d.contractor;const nextStatus=formValue(f,"status") as any;const addAfter=Number(formValue(f,"afterEvidence")||0);if(nextStatus==="resolved" && (d.afterEvidence??0)+addAfter<=0){toastLocalized(t("v52.inspection.needAfterEvidence"));return}d.status=nextStatus;d.contractor=formValue(f,"contractor");d.dueAt=formValue(f,"dueAt");d.afterEvidence=(d.afterEvidence??0)+addAfter;d.beforeEvidence=d.beforeEvidence??d.evidence??0;d.evidence=d.beforeEvidence+d.afterEvidence;d.resolutionNote=formValue(f,"note");if(oldContractor!==d.contractor){d.assignmentHistory=d.assignmentHistory??[];d.assignmentHistory.unshift({id:`DA-${Date.now()}`,at:"23.09.2026 · 09:14",actor:"Լուսինե Աբրահամյան",from:oldContractor,to:d.contractor,note:d.resolutionNote||"Переназначение подрядчика."})}if(d.status==="ready-for-check")d.reinspectionAt="23.09.2026 · 11:00";if (d.status === "resolved" && old !== "resolved") {d.reinspectionAt="23.09.2026 · 09:14";const room = inspectionRooms.find((r: any) => r.id === d.roomId);if (room) {room.defectCount = Math.max(0, room.defectCount - 1);if (room.defectCount === 0) room.state = "ready";}}if(old==="resolved"&&d.status!=="resolved"){const room=inspectionRooms.find((r:any)=>r.id===d.roomId);if(room){room.defectCount+=1;room.state="attention"}}const h=handoverCases.find((x:any)=>x.id===d.handoverId);if(h){const remaining=defects.filter((x:any)=>x.handoverId===d.handoverId&&x.status!=="resolved").length;h.status=remaining?"reinspection":"acceptance";h.clientAcceptance="pending"}closeModal();toastLocalized(t("inspectionPage.toast.defectUpdated"));refresh();}), 0);
}

function openAssignmentHistory(defectId:string){const d=defects.find((x:any)=>x.id===defectId);if(!d)return;const rows=(d.assignmentHistory??[]).map((a:any)=>`<div class="v52-history-row"><div class="timeline-dot"></div><div><strong>${a.from} → ${a.to}</strong><span>${a.at} · ${a.actor}</span><p>${demoText(a.note)}</p></div></div>`).join("");openLocalizedModal(t("v52.inspection.assignmentHistory"),`<div class="v52-history-list">${rows||`<div class="empty">${t("v52.inspection.noAssignmentHistory")}</div>`}</div>`)}
function filter() {const sev = document.querySelector<HTMLSelectElement>("#severityFilter")?.value ?? "";const st = document.querySelector<HTMLSelectElement>("#defectStatusFilter")?.value ?? "";document.querySelectorAll<HTMLElement>("[data-defect-row]").forEach(r => r.style.display = (!sev || r.dataset.severity === sev) && (!st || r.dataset.status === st) ? "" : "none");}

function openMediaGallery(handoverId: string, defectId?: string) {
  const rows = defects.filter((d: any) => d.handoverId === handoverId && (!defectId || d.id === defectId));
  const cards = rows.flatMap((d: any) => {const before=d.beforeEvidence??d.evidence??0,after=d.afterEvidence??0;const one=(kind:"before"|"after",count:number)=>Array.from({length:count},(_,i)=>`<button class="media-tile ${kind}" data-media-label="${demoText(d.roomName)} · ${d.id} · ${kind} · ${i+1}"><div class="media-preview"><span>${t(kind==="before"?"v52.common.before":"v52.common.after")}</span><b>${demoText(d.roomName)}</b></div><strong>${demoText(d.title)}</strong><small>${kind==="before"?t("v52.inspection.beforeEvidence"):t("v52.inspection.afterEvidence")} · ${i+1}</small></button>`);return [...one("before",before),...one("after",after)]}).join("");
  openLocalizedModal(defectId ? `${t("inspectionPage.materials")} · ${defectId}` : t("v52.inspection.evidenceGallery"), `<div class="media-gallery">${cards || `<div class="empty">${t("inspectionPage.noMedia")}</div>`}</div><div class="modal-note u-mt-14">${t("inspectionPage.demoMediaNote")}</div>`, `<button class="btn" data-modal-close>${t("inspectionPage.close")}</button>`);setTimeout(() => document.querySelectorAll<HTMLElement>("[data-media-label]").forEach(el => el.addEventListener("click", () => toastLocalized(t("inspectionPage.viewer", { label: el.dataset.mediaLabel ?? "" })))), 0);
}
