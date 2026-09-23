import {contractTemplates} from "../data/contract-management";
import {navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {t} from "../i18n";
import type {ContractTemplate,ContractTemplateClause,ContractTemplateVersion} from "../models/types";

const selectedId=()=>new URLSearchParams(location.hash.split("?")[1]??"").get("id")||contractTemplates[0]?.id||"";
const selectedTemplate=()=>contractTemplates.find(x=>x.id===selectedId())??contractTemplates[0];
const statusClass=(s:string)=>s==="active"?"success":s==="draft"?"warning":"neutral";
const conditionLabel=(c:string)=>t(`v49.condition.${c}`);
const clauseModeLabel=(m:string)=>t(`v49.clauseMode.${m}`);
const typeKey:Record<string,string>={"Основной договор купли-продажи":"contractsPage.type.mainSale","Предварительный договор":"contractsPage.type.preliminary","Соглашение о бронировании":"contractsPage.type.reservation","Договор рассрочки":"contractsPage.type.installment","Соглашение о рассрочке":"contractsPage.type.installmentAgreement"};
const contractTypeLabel=(value:string)=>typeKey[value]?t(typeKey[value]):value;

export function contractTemplatesPage(){
  const selected=selectedTemplate();
  const active=contractTemplates.flatMap(x=>x.versions).filter(x=>x.status==="active").length;
  const draft=contractTemplates.flatMap(x=>x.versions).filter(x=>x.status==="draft").length;
  const languages=new Set(contractTemplates.flatMap(x=>x.versions.map(v=>v.language))).size;
  return `<section class="page">
    <div class="breadcrumbs"><span>${t("contractsPage.title")}</span><span>›</span><span>${t("v49.templates.title")}</span></div>
    <div class="page-header">
      <div class="page-title"><div class="eyebrow">${t("v49.templates.eyebrow")}</div><h1>${t("v49.templates.title")}</h1><p>${t("v49.templates.subtitle")}</p></div>
      <div class="toolbar"><button class="btn" id="backContracts">${t("v49.templates.back")}</button><button class="btn btn-accent" id="newTemplate">${t("v49.templates.new")}</button></div>
    </div>
    <div class="contract-template-kpis">
      ${kpi(t("v49.templates.kpi.families"),contractTemplates.length,t("v49.templates.kpi.familiesNote"))}
      ${kpi(t("v49.templates.kpi.active"),active,t("v49.templates.kpi.activeNote"))}
      ${kpi(t("v49.templates.kpi.drafts"),draft,t("v49.templates.kpi.draftsNote"))}
      ${kpi(t("v49.templates.kpi.languages"),languages,t("v49.templates.kpi.languagesNote"))}
    </div>
    <div class="template-workspace">
      <aside class="card template-catalog">
        <div class="template-catalog-head"><strong>${t("v49.templates.catalog")}</strong><span>${contractTemplates.length}</span></div>
        <div class="template-catalog-list">${contractTemplates.map(template=>templateCard(template,selected?.id===template.id)).join("")}</div>
      </aside>
      <div class="template-main">${selected?templateDetail(selected):`<div class="card card-pad empty">${t("v49.templates.empty")}</div>`}</div>
    </div>
  </section>`;
}

function kpi(label:string,value:number,note:string){return`<div class="card template-kpi"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`}
function templateCard(template:ContractTemplate,active:boolean){const activeVersions=template.versions.filter(v=>v.status==="active");return`<button class="template-family-card ${active?"active":""}" data-template-id="${template.id}"><div><span>${template.id}</span><strong>${template.name}</strong><small>${contractTypeLabel(template.type)}</small></div><b>${activeVersions.length}</b></button>`}
function templateDetail(template:ContractTemplate){
  const latest=template.versions.find(v=>v.status==="active")??template.versions[0];
  return `<div class="card card-pad template-hero">
    <div class="template-hero-head"><div><span class="eyebrow">${template.id}</span><h2>${template.name}</h2><p>${template.description}</p></div><div class="toolbar"><button class="btn" id="previewTemplate" data-version="${latest?.id??""}">${t("v49.templates.preview")}</button><button class="btn btn-accent" id="newTemplateVersion">${t("v49.templates.newVersion")}</button></div></div>
    <div class="template-summary-strip"><div><span>${t("v49.templates.type")}</span><strong>${contractTypeLabel(template.type)}</strong></div><div><span>${t("v49.templates.owner")}</span><strong>${template.owner}</strong></div><div><span>${t("v49.templates.languages")}</span><strong>${[...new Set(template.versions.map(v=>v.language))].join(" · ")}</strong></div><div><span>${t("v49.templates.clauses")}</span><strong>${latest?.clauses.length??0}</strong></div></div>
  </div>
  <div class="card card-pad">
    <div class="section-title"><div><h2>${t("v49.templates.versions")}</h2><p>${t("v49.templates.versionsSub")}</p></div></div>
    <div class="template-version-list">${template.versions.map(v=>versionRow(template,v)).join("")}</div>
  </div>
  ${latest?`<div class="card card-pad"><div class="section-title"><div><h2>${t("v49.templates.clauseLibrary")}</h2><p>${t("v49.templates.clauseLibrarySub",{version:latest.code})}</p></div><span class="status ${statusClass(latest.status)}">${t(`v49.templateStatus.${latest.status}`)}</span></div><div class="template-clause-list">${latest.clauses.slice().sort((a,b)=>a.order-b.order).map(clauseRow).join("")}</div></div>`:""}`;
}
function versionRow(template:ContractTemplate,v:ContractTemplateVersion){return`<div class="template-version-row"><div class="template-version-code"><span>${v.language}</span><div><strong>${v.code}</strong><small>${v.note}</small></div></div><div><span>${t("v49.templates.effective")}</span><strong>${v.effectiveFrom}</strong></div><div><span>${t("v49.templates.approvedBy")}</span><strong>${v.approvedBy}</strong></div><div><span class="status ${statusClass(v.status)}">${t(`v49.templateStatus.${v.status}`)}</span></div><div class="toolbar"><button class="btn btn-soft" data-preview-version="${v.id}">${t("v49.templates.preview")}</button>${v.status!=="active"?`<button class="btn" data-activate-version="${v.id}" data-template="${template.id}">${t("v49.templates.activate")}</button>`:""}</div></div>`}
function clauseRow(c:ContractTemplateClause){return`<div class="template-clause-row"><div class="clause-order">${String(c.order/10).padStart(2,"0")}</div><div><div class="template-clause-meta"><span>${c.code}</span><span>${c.category}</span><span class="clause-kind ${c.mode}">${clauseModeLabel(c.mode)}</span></div><strong>${c.title}</strong><p>${c.text}</p></div><div class="clause-condition"><span>${t("v49.templates.condition")}</span><strong>${conditionLabel(c.condition)}</strong><small>${c.required?t("v49.templates.required"):t("v49.templates.conditional")}</small></div></div>`}

export function bindContractTemplates(){
  document.querySelector("#backContracts")?.addEventListener("click",()=>navigate("contracts"));
  document.querySelectorAll<HTMLElement>("[data-template-id]").forEach(el=>el.addEventListener("click",()=>navigate(`contract-templates?id=${el.dataset.templateId}`)));
  document.querySelectorAll<HTMLElement>("[data-preview-version]").forEach(el=>el.addEventListener("click",()=>previewVersion(el.dataset.previewVersion!)));
  document.querySelector("#previewTemplate")?.addEventListener("click",e=>previewVersion((e.currentTarget as HTMLElement).dataset.version!));
  document.querySelectorAll<HTMLElement>("[data-activate-version]").forEach(el=>el.addEventListener("click",()=>activateVersion(el.dataset.template!,el.dataset.activateVersion!)));
  document.querySelector("#newTemplateVersion")?.addEventListener("click",()=>openNewVersion());
  document.querySelector("#newTemplate")?.addEventListener("click",()=>openNewTemplate());
}
function versionById(id:string){for(const template of contractTemplates){const version=template.versions.find(v=>v.id===id);if(version)return{template,version}}}
function previewVersion(id:string){const found=versionById(id);if(!found)return;const v=found.version;openLocalizedModal(`${found.template.name} · ${v.version}`,`<div class="template-preview-head"><span>${v.code}</span><strong>${t(`v49.templateStatus.${v.status}`)}</strong><small>${t("v49.templates.approvedBy")}: ${v.approvedBy} · ${v.approvedAt??"—"}</small></div><div class="template-preview-doc">${v.clauses.slice().sort((a,b)=>a.order-b.order).map((c,i)=>`<section><b>${i+1}. ${c.title}</b><p>${c.text}</p>${c.mode==="conditional"?`<em>${t("v49.templates.condition")}: ${conditionLabel(c.condition)}</em>`:""}</section>`).join("")}</div>`,`<button class="btn" data-modal-close>${t("common.close")}</button>`)}
function activateVersion(templateId:string,versionId:string){const template=contractTemplates.find(x=>x.id===templateId);const version=template?.versions.find(x=>x.id===versionId);if(!template||!version)return;template.versions.filter(x=>x.language===version.language).forEach(x=>x.status=x.id===versionId?"active":"archived");version.approvedAt="22.09.2026";toastLocalized(t("v49.templates.activated",{code:version.code}));navigate(`contract-templates?id=${template.id}`)}
function openNewVersion(){const template=selectedTemplate();if(!template)return;const source=template.versions.find(v=>v.status==="active")??template.versions[0];openLocalizedModal(t("v49.templates.newVersion"),`<form id="templateVersionForm" class="form-grid"><div class="form-field"><label>${t("v49.templates.language")}</label><select name="language"><option>HY</option><option>RU</option><option>EN</option></select></div><div class="form-field"><label>${t("v49.templates.version")}</label><input name="version" value="v${(Number(source?.version.replace(/^v/,"")||4)+.1).toFixed(1)}" required></div><div class="form-field"><label>${t("v49.templates.effective")}</label><input type="date" name="effective" value="2026-09-22" required></div><div class="form-field"><label>${t("v49.templates.status")}</label><select name="status"><option value="draft">${t("v49.templateStatus.draft")}</option><option value="active">${t("v49.templateStatus.active")}</option></select></div><div class="form-field full"><label>${t("v49.templates.note")}</label><textarea name="note" required>${t("v49.templates.newVersionNote")}</textarea></div></form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveTemplateVersion">${t("common.save")}</button>`);setTimeout(()=>document.querySelector("#saveTemplateVersion")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#templateVersionForm")!;if(!f.reportValidity())return;const language=formValue(f,"language") as "HY"|"RU"|"EN",version=formValue(f,"version"),status=formValue(f,"status") as "draft"|"active";if(status==="active")template.versions.filter(x=>x.language===language).forEach(x=>x.status="archived");const clauses=(source?.clauses??[]).map((c,i)=>({...c,id:`${template.id}-${language}-${version}-${i+1}`}));template.versions.unshift({id:`TV-${Date.now()}`,code:`${template.id.replace("TPL-","")}-${language}-${version}`,version,language,effectiveFrom:formValue(f,"effective"),status,approvedBy:status==="active"?"Legal Director":"—",approvedAt:status==="active"?"22.09.2026":undefined,note:formValue(f,"note"),clauses});closeModal();toastLocalized(t("v49.templates.versionCreated"));navigate(`contract-templates?id=${template.id}`)}),0)}
function openNewTemplate(){openLocalizedModal(t("v49.templates.new"),`<form id="newTemplateForm" class="form-grid"><div class="form-field full"><label>${t("v49.templates.name")}</label><input name="name" required placeholder="${t("v49.templates.namePlaceholder")}"></div><div class="form-field full"><label>${t("v49.templates.type")}</label><select name="type"><option>Основной договор купли-продажи</option><option>Предварительный договор</option><option>Соглашение о бронировании</option><option>Договор рассрочки</option></select></div><div class="form-field"><label>${t("v49.templates.language")}</label><select name="language"><option>HY</option><option>RU</option><option>EN</option></select></div><div class="form-field"><label>${t("v49.templates.version")}</label><input name="version" value="v1.0" required></div><div class="form-field full"><label>${t("v49.templates.note")}</label><textarea name="description">${t("v49.templates.newTemplateDescription")}</textarea></div></form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveNewTemplate">${t("v49.templates.create")}</button>`);setTimeout(()=>document.querySelector("#saveNewTemplate")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#newTemplateForm")!;if(!f.reportValidity())return;const id=`TPL-CUSTOM-${contractTemplates.length+1}`,language=formValue(f,"language") as "HY"|"RU"|"EN",version=formValue(f,"version");contractTemplates.push({id,name:formValue(f,"name"),type:formValue(f,"type"),description:formValue(f,"description"),owner:"Legal Office",versions:[{id:`TV-${Date.now()}`,code:`CUSTOM-${language}-${version}`,version,language,effectiveFrom:"22.09.2026",status:"draft",approvedBy:"—",note:t("v49.templates.newVersionNote"),clauses:[]}]});closeModal();toastLocalized(t("v49.templates.created"));navigate(`contract-templates?id=${id}`)}),0)}
