import { leads } from "../data/mock";
import { amd } from "../utils";
import { navigate } from "../router";
import type { LeadStage } from "../models/types";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";
import { importLeads, readTabularFile } from "../services/importers";
import { t } from "../i18n";
import { leadDistrict, leadLastActivity, leadSource, leadStageLabel } from "./lead-i18n";

const stages:LeadStage[]=["new","qualified","viewing","offer","reservation"];

export function leadsPage(){
  const totalBudget=leads.reduce((s,l)=>s+l.budgetTo,0);
  return `<section class="page">
    <div class="page-header">
      <div class="page-title"><div class="eyebrow">${t("leads.eyebrow")}</div><h1>${t("leads.title")}</h1><p>${t("leads.subtitle")}</p></div>
      <div class="toolbar"><button class="btn" id="importLeads">${t("leads.import")}</button><button class="btn btn-accent" id="newLead">${t("leads.new")}</button></div>
    </div>
    <div class="grid grid-4 u-mb-16">
      ${metric(t("leads.metric.active"),String(leads.length),t("leads.metric.activeNote"))}
      ${metric(t("leads.metric.score"),"84",t("leads.metric.scoreNote"))}
      ${metric(t("leads.metric.volume"),amd(totalBudget),t("leads.metric.volumeNote"),true)}
      ${metric(t("leads.metric.conversion"),"21.8%",t("leads.metric.conversionNote"))}
    </div>
    <div class="kanban">
      ${stages.map(stage=>{
        const items=leads.filter(l=>l.stage===stage);
        return `<div class="kanban-column">
          <div class="kanban-head"><strong>${leadStageLabel(stage)}</strong><span class="kanban-count">${items.length}</span></div>
          ${items.map(l=>`<article class="lead-card" data-lead="${l.id}">
            <div class="lead-card-top"><div><h3>${l.name}</h3><p>${t("leads.roomsShort",{rooms:l.rooms})} · ${leadDistrict(l.district)}<br>${amd(l.budgetFrom)} — ${amd(l.budgetTo)}</p></div><span class="chip ${l.score>=90?"success":l.score>=80?"accent":""}">${l.language}</span></div>
            <div class="lead-score"><span class="u-meta-105">${t("leads.score",{score:l.score})}</span><div class="lead-score-bar"><span style="width:${l.score}%"></span></div></div>
            <div class="lead-meta"><span><span class="source-dot"></span> ${leadSource(l.source)}</span><span>${leadLastActivity(l.lastActivity)}</span></div>
          </article>`).join("") || `<div class="empty u-empty-pad">${t("leads.empty")}</div>`}
        </div>`;
      }).join("")}
    </div>
  </section>`;
}

function metric(label:string,value:string,note:string,compact=false){
  return `<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div><div class="metric-value u-fs-22"${compact?'':""}>${value}</div><div class="metric-note">${note}</div></div></div>`;
}

export function bindLeads(){
  document.querySelectorAll("[data-lead]").forEach(el=>el.addEventListener("click",()=>navigate("lead/"+(el as HTMLElement).dataset.lead)));
  document.querySelector("#newLead")?.addEventListener("click",openLeadForm);
  document.querySelector("#importLeads")?.addEventListener("click",()=>{
    openLocalizedModal(t("leads.importModal.title"),`<div class="modal-note">${t("leads.importModal.note")}</div><form class="form-grid u-mt-14"><div class="form-field full"><label>${t("leads.importModal.file")}</label><input id="leadImportFile" type="file" accept=".csv,.xlsx,.xls" required></div><div class="form-field full"><label>${t("leads.importModal.duplicates")}</label><select id="leadDuplicateMode"><option value="skip">${t("leads.importModal.skip")}</option><option value="update">${t("leads.importModal.update")}</option></select></div></form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="runLeadImport">${t("leads.importModal.run")}</button>`);
    setTimeout(()=>document.querySelector("#runLeadImport")?.addEventListener("click",async()=>{
      const file=document.querySelector<HTMLInputElement>("#leadImportFile")?.files?.[0];
      if(!file){toastLocalized(t("leads.importModal.chooseFile"));return}
      try{
        const rows=await readTabularFile(file);
        const mode=(document.querySelector<HTMLSelectElement>("#leadDuplicateMode")?.value??"skip") as "skip"|"update";
        const result=importLeads(rows,mode);
        closeModal();
        toastLocalized(t("leads.importModal.result",{added:result.added,updated:result.updated,skipped:result.skipped,errors:result.errors.length}));
        navigate("dashboard");setTimeout(()=>navigate("leads"),20);
      }catch{toastLocalized(t("leads.importModal.error"))}
    }),0);
  });
}

function openLeadForm(){
  openLocalizedModal(t("leads.create.title"),`<form id="leadCreateForm" class="form-grid">
    <div class="form-field full"><label>${t("leads.create.name")}</label><input name="name" required placeholder="${t("leads.create.namePlaceholder")}"></div>
    <div class="form-field"><label>${t("leads.create.phone")}</label><input name="phone" value="+374 " required></div>
    <div class="form-field"><label>${t("leads.create.email")}</label><input name="email" type="email"></div>
    <div class="form-field"><label>${t("leads.create.source")}</label><select name="source"><option value="Website">${t("leads.source.website")}</option><option value="Instagram">Instagram</option><option value="Call Center">${t("leads.source.callCenter")}</option><option value="Referral">${t("leads.source.referral")}</option><option value="Walk-in">${t("leads.source.walkIn")}</option></select></div>
    <div class="form-field"><label>${t("leads.create.language")}</label><select name="language"><option>HY</option><option>RU</option><option>EN</option></select></div>
    <div class="form-field"><label>${t("leads.create.budgetFrom")}</label><input name="budgetFrom" type="number" value="40000000"></div>
    <div class="form-field"><label>${t("leads.create.budgetTo")}</label><input name="budgetTo" type="number" value="70000000"></div>
    <div class="form-field"><label>${t("leads.create.rooms")}</label><input name="rooms" value="2–3"></div>
    <div class="form-field"><label>${t("leads.create.district")}</label><input name="district" value="${t("leads.district.yerevan")}"></div>
    <div class="form-field full"><label>${t("leads.create.comment")}</label><textarea name="notes">${t("leads.notes.initialInterest")}</textarea></div>
  </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveLead">${t("leads.create.submit")}</button>`);
  setTimeout(()=>document.querySelector("#saveLead")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#leadCreateForm")!;
    if(!f.reportValidity())return;
    const id=`LD-2026-${String(100+leads.length+1).padStart(4,"0")}`;
    leads.push({id,name:formValue(f,"name"),phone:formValue(f,"phone"),email:formValue(f,"email"),source:formValue(f,"source"),stage:"new",manager:"Անի Հակոբյան",budgetFrom:Number(formValue(f,"budgetFrom")),budgetTo:Number(formValue(f,"budgetTo")),rooms:formValue(f,"rooms"),district:formValue(f,"district"),score:65,lastActivity:"i18n:leads.activity.now",nextAction:"i18n:leads.nextAction.initialCallToday",language:formValue(f,"language") as any,notes:formValue(f,"notes")});
    closeModal();toastLocalized(t("leads.create.created"));navigate("lead/"+id);
  }),0);
}
