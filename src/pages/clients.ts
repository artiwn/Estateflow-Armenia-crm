import {clients} from "../data/mock";
import {clientDuplicateCases} from "../data/client360";
import {amd,badge,clientTypeLabel,escapeHtml,initials,statusLabel} from "../utils";
import {navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {importClients,readTabularFile} from "../services/importers";
import {t} from "../i18n";

export function clientsPage(route:string){
  const params=new URLSearchParams(route.split("?")[1]??"");
  const q=(params.get("search")??"").toLowerCase();
  const rows=clients.filter(c=>!q||[c.name,c.phone,c.email,c.id,c.personalNumber??"",c.taxId??""].some(v=>v.toLowerCase().includes(q)));
  const verified=clients.filter(c=>c.verification==="verified").length;
  const review=clients.filter(c=>c.verification!=="verified").length;
  const openDuplicates=clientDuplicateCases.filter(x=>x.status==="open").length;
  return `<section class="page" id="clientsRegistry">
    <div class="page-header">
      <div class="page-title"><h1>${t("clientsPage.title")}</h1><p>${t("v42.clients.subtitle")}</p></div>
      <div class="toolbar"><button class="btn duplicate-action-btn" id="reviewDuplicates"><span>${t("v42.duplicates.title")}</span>${openDuplicates?`<b>${openDuplicates}</b>`:""}</button><button class="btn" id="importClients">${t("clientsPage.import")}</button><button class="btn btn-primary" id="newClient">${t("clientsPage.new")}</button></div>
    </div>
    <div class="clients-health-strip">
      ${registryMetric(t("v42.clients.total"),clients.length,"people")}${registryMetric(t("v42.clients.verified"),verified,"verified")}${registryMetric(t("v42.clients.review"),review,"review")}${registryMetric(t("v42.clients.duplicates"),openDuplicates,"duplicate")}
    </div>
    <div class="card">
      <div class="card-pad u-pb-10"><div class="table-toolbar"><div class="toolbar">
        <input id="clientSearch" class="field u-minw-280" value="${escapeHtml(q)}" placeholder="${t("clientsPage.searchPlaceholder")}">
        <select class="field" id="clientType"><option value="">${t("v41.clients.allTypes")}</option><option value="individual">${clientTypeLabel("individual")}</option><option value="sole-proprietor">${clientTypeLabel("sole-proprietor")}</option><option value="company">${clientTypeLabel("company")}</option><option value="foreign-company">${clientTypeLabel("foreign-company")}</option></select>
        <select class="field" id="clientStatus"><option value="">${t("clientsPage.allStatuses")}</option><option value="verified">${statusLabel("verified")}</option><option value="review">${statusLabel("review")}</option><option value="pending">${statusLabel("pending")}</option></select>
      </div><div class="registry-quality-note"><span>◎</span><div><strong>${t("v42.clients.dataQuality")}</strong><small>${t("v42.clients.dataQualitySub")}</small></div></div></div></div>
      <div class="table-wrap"><table class="table clients-v42-table"><thead><tr>
        <th>${t("clientsPage.client")}</th><th>${t("v41.client.profileType")}</th><th>${t("clientsPage.verification")}</th><th>${t("v42.clients.profileCompleteness")}</th><th>${t("clientsPage.manager")}</th><th>${t("clientsPage.activeDeals")}</th><th>${t("clientsPage.debt")}</th>
      </tr></thead><tbody>
        ${rows.map(c=>clientRow(c)).join("")||`<tr><td colspan="7"><div class="empty">${t("clientsPage.empty")}</div></td></tr>`}
      </tbody></table></div>
    </div>
  </section>`;
}

function registryMetric(label:string,value:number,kind:string){return`<div class="card clients-health-card ${kind}"><div><span>${label}</span><strong>${value}</strong></div><i>${kind==="people"?"◎":kind==="verified"?"✓":kind==="review"?"!":"≋"}</i></div>`}
function clientRow(c:any){const duplicate=clientDuplicateCases.find(x=>x.canonicalClientId===c.id&&x.status==="open");const complete=profileCompleteness(c);return`<tr data-client="${c.id}" data-type="${c.type}" data-status="${c.verification}"><td><div class="person"><div class="avatar">${initials(c.name)}</div><div><strong>${c.name}</strong><span>${c.id} · ${c.phone} · ${c.email}</span>${duplicate?`<em class="duplicate-inline">${t("v42.duplicates.possible")} · ${duplicate.confidence}%</em>`:""}</div></div></td><td><strong>${clientTypeLabel(c.type)}</strong><div class="table-sub">${c.preferredLanguage??"—"} · ${c.countryOfRegistration??c.citizenship??"—"}</div></td><td>${badge(c.verification)}</td><td><div class="profile-completeness"><div><span style="width:${complete}%"></span></div><b>${complete}%</b></div></td><td>${c.manager}</td><td>${c.activeDeals}</td><td>${c.outstanding?`<strong>${amd(c.outstanding)}</strong>`:"—"}</td></tr>`}
function profileCompleteness(c:any){const company=["company","foreign-company"].includes(c.type);const values=company?[c.name,c.taxId,c.registrationNumber,c.registrationDate,c.countryOfRegistration,c.legalAddress,c.businessAddress,c.director,(c.bankAccounts?.length??0)>0,c.consentPersonalData]:[c.name,c.personalNumber,c.dateOfBirth,c.placeOfBirth,c.citizenship,c.taxResidency,c.registrationAddress,c.residenceAddress,(c.bankAccounts?.length??0)>0,c.consentPersonalData];return Math.round(values.filter(Boolean).length/values.length*100)}

export function bindClients(){
  document.querySelectorAll("[data-client]").forEach(el=>el.addEventListener("click",()=>navigate("client/"+(el as HTMLElement).dataset.client)));
  document.querySelector<HTMLInputElement>("#clientSearch")?.addEventListener("input",filterRows);
  document.querySelector("#clientType")?.addEventListener("change",filterRows);
  document.querySelector("#clientStatus")?.addEventListener("change",filterRows);
  document.querySelector("#newClient")?.addEventListener("click",()=>openClientForm());
  document.querySelector("#reviewDuplicates")?.addEventListener("click",()=>openDuplicateCenter());
  document.querySelector("#importClients")?.addEventListener("click",()=>{
    openLocalizedModal(t("clientsPage.importTitle"),`<div class="modal-note">${t("clientsPage.importNote")}</div>
      <form id="clientImportForm" class="form-grid u-mt-14">
        <div class="form-field full"><label>${t("clientsPage.file")}</label><input id="clientImportFile" type="file" accept=".csv,.xlsx,.xls" required></div>
        <div class="form-field full"><label>${t("clientsPage.duplicateRule")}</label><select id="clientDuplicateMode"><option value="skip">${t("clientsPage.skipDuplicate")}</option><option value="update">${t("clientsPage.updateDuplicate")}</option></select></div>
      </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="runClientImport">${t("clientsPage.importRun")}</button>`);
    setTimeout(()=>document.querySelector("#runClientImport")?.addEventListener("click",async()=>{
      const input=document.querySelector<HTMLInputElement>("#clientImportFile")!;
      const file=input.files?.[0];
      if(!file){toastLocalized(t("clientsPage.chooseFile"));return}
      try{
        const data=await readTabularFile(file);
        const mode=(document.querySelector<HTMLSelectElement>("#clientDuplicateMode")?.value??"skip") as "skip"|"update";
        const result=importClients(data,mode);
        closeModal();
        toastLocalized(t("clientsPage.importResult",{added:result.added,updated:result.updated,skipped:result.skipped,errors:result.errors.length}));
        navigate("dashboard");setTimeout(()=>navigate("clients"),20);
      }catch{toastLocalized(t("clientsPage.importError"))}
    }),0);
  });
}

function filterRows(){
  const q=(document.querySelector<HTMLInputElement>("#clientSearch")?.value??"").toLowerCase();
  const type=document.querySelector<HTMLSelectElement>("#clientType")?.value??"";
  const status=document.querySelector<HTMLSelectElement>("#clientStatus")?.value??"";
  document.querySelectorAll<HTMLTableRowElement>("tr[data-client]").forEach(r=>{
    const show=(!q||r.textContent!.toLowerCase().includes(q))&&(!type||r.dataset.type===type)&&(!status||r.dataset.status===status);
    r.style.display=show?"":"none";
  });
}

function openClientForm(){
  openLocalizedModal(t("clientsPage.createTitle"),`<form id="clientCreateForm" class="form-grid">
    <div class="form-field"><label>${t("clientsPage.type")}</label><select name="type"><option value="individual">${clientTypeLabel("individual")}</option><option value="sole-proprietor">${clientTypeLabel("sole-proprietor")}</option><option value="company">${clientTypeLabel("company")}</option><option value="foreign-company">${clientTypeLabel("foreign-company")}</option></select></div>
    <div class="form-field"><label>${t("clientsPage.responsible")}</label><select name="manager"><option>Անի Հակոբյան</option><option>Նարեկ Կարապետյան</option><option>Մարի Հովհաննիսյան</option></select></div>
    <div class="form-field full"><label>${t("clientsPage.name")}</label><input name="name" required placeholder="${t("clientsPage.namePlaceholder")}"></div>
    <div class="form-field"><label>${t("clientsPage.phone")}</label><input name="phone" required value="+374 "></div>
    <div class="form-field"><label>${t("common.email")}</label><input name="email" type="email" placeholder="client@example.am"></div>
    <div class="form-field"><label>${t("client.publicServiceNumber")}</label><input name="personalNumber" placeholder="${t("clientsPage.forIndividual")}"></div>
    <div class="form-field"><label>${t("client.taxId")}</label><input name="taxId" placeholder="${t("clientsPage.forCompany")}"></div>
    <div class="form-field"><label>${t("v41.client.language")}</label><select name="preferredLanguage"><option value="HY">HY</option><option value="RU">RU</option><option value="EN">EN</option></select></div>
    <div class="form-field"><label>${t("v41.client.country")}</label><input name="country" value="Armenia"></div>
  </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveClient">${t("clientsPage.create")}</button>`);
  setTimeout(()=>document.querySelector("#saveClient")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#clientCreateForm")!;if(!f.reportValidity())return;
    const id=`CL-${1000+clients.length+1}`;
    const type=formValue(f,"type") as any,country=formValue(f,"country")||"Armenia";
    clients.push({id,type,name:formValue(f,"name"),phone:formValue(f,"phone"),email:formValue(f,"email"),personalNumber:formValue(f,"personalNumber")||undefined,taxId:formValue(f,"taxId")||undefined,verification:"pending",manager:formValue(f,"manager"),activeDeals:0,outstanding:0,preferredLanguage:formValue(f,"preferredLanguage") as any,...(["company","foreign-company"].includes(type)?{countryOfRegistration:country}:{citizenship:country,taxResidency:country}),consentPersonalData:true,consentElectronicCommunication:true,consentDocumentDelivery:true});
    closeModal();toastLocalized(t("clientsPage.created"));navigate("client/"+id);
  }),0);
}

function openDuplicateCenter(){const open=clientDuplicateCases.filter(x=>x.status==="open");openLocalizedModal(t("v42.duplicates.title"),`<div class="duplicate-center-head"><div><span>${t("v42.duplicates.eyebrow")}</span><strong>${t("v42.duplicates.subtitle")}</strong></div><b>${open.length}</b></div>${open.length?`<div class="duplicate-case-list">${open.map(x=>{const c=clients.find(y=>y.id===x.canonicalClientId);return`<button class="duplicate-case" data-duplicate-case="${x.id}"><div class="duplicate-confidence"><strong>${x.confidence}%</strong><span>${t("v42.duplicates.match")}</span></div><div><strong>${c?.name??x.canonicalClientId}</strong><span>${x.candidateName} · ${x.source}</span><small>${x.matchedFields.map(fieldLabel).join(" · ")}</small></div><i>→</i></button>`}).join("")}</div>`:`<div class="empty compact-empty">${t("v42.duplicates.empty")}</div>`}`,`<button class="btn" data-modal-close>${t("modal.close")}</button>`);setTimeout(()=>document.querySelectorAll<HTMLElement>("[data-duplicate-case]").forEach(el=>el.addEventListener("click",()=>openDuplicateCompare(el.dataset.duplicateCase!))),0)}
function openDuplicateCompare(id:string){const d=clientDuplicateCases.find(x=>x.id===id),c=d&&clients.find(x=>x.id===d.canonicalClientId);if(!d||!c)return;openLocalizedModal(t("v42.duplicates.compareTitle"),`<div class="duplicate-compare-score"><div><span>${t("v42.duplicates.confidence")}</span><strong>${d.confidence}%</strong></div><p>${t("v42.duplicates.compareNote")}</p></div><div class="duplicate-compare-grid"><div class="duplicate-side canonical"><span>${t("v42.duplicates.canonical")}</span><h3>${c.name}</h3>${compareField(t("clientDetail.phone"),c.phone,d.candidatePhone)}${compareField(t("common.email"),c.email,d.candidateEmail)}${compareField(t("v42.duplicates.identifier"),c.personalNumber??c.taxId??"—",d.candidateIdentifier)}<small>${c.id} · EstateFlow</small></div><div class="duplicate-side candidate"><span>${t("v42.duplicates.candidate")}</span><h3>${d.candidateName}</h3>${compareField(t("clientDetail.phone"),d.candidatePhone,c.phone)}${compareField(t("common.email"),d.candidateEmail,c.email)}${compareField(t("v42.duplicates.identifier"),d.candidateIdentifier,c.personalNumber??c.taxId??"—")}<small>${d.candidateId} · ${d.source}</small></div></div><div class="duplicate-match-summary"><strong>${t("v42.duplicates.matchedFields")}</strong><div>${d.matchedFields.map(x=>`<span>✓ ${fieldLabel(x)}</span>`).join("")}</div></div>`,`<button class="btn" id="keepSeparate">${t("v42.duplicates.keepSeparate")}</button><button class="btn btn-accent" id="mergeDuplicate">${t("v42.duplicates.merge")}</button>`);setTimeout(()=>{document.querySelector("#mergeDuplicate")?.addEventListener("click",()=>resolveDuplicate(d,"merged"));document.querySelector("#keepSeparate")?.addEventListener("click",()=>resolveDuplicate(d,"kept-separate"))},0)}
function compareField(label:string,value:string,other:string){const same=normalize(value)===normalize(other)&&value!=="—";return`<div class="duplicate-field ${same?"match":""}"><span>${label}</span><strong>${value||"—"}</strong>${same?`<b>✓</b>`:""}</div>`}
function normalize(v:string){return(v??"").toLowerCase().replace(/\s|\+|-|\./g,"")}
function fieldLabel(v:string){const map:Record<string,string>={phone:t("clientDetail.phone"),email:t("common.email"),name:t("clientsPage.name"),taxId:t("client.taxId"),personalNumber:t("client.publicServiceNumber")};return map[v]??v}
function resolveDuplicate(d:any,status:"merged"|"kept-separate"){d.status=status;d.resolvedAt="22.09.2026 · 14:35";closeModal();toastLocalized(status==="merged"?t("v42.duplicates.mergedToast"):t("v42.duplicates.separateToast"));navigate("dashboard");setTimeout(()=>navigate("clients"),20)}
