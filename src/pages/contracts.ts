import { clients,contracts,deals,properties } from "../data/mock";
import { money,statusLabel } from "../utils";
import { navigate } from "../router";
import { closeModal,formValue,openLocalizedModal,toastLocalized } from "../components/layout";
import { t } from "../i18n";
import {demoText} from "../demo-i18n";
import {activeTemplateVersions,ensureContractManagement,signingProgress} from "../services/contract-management";

const contractClass:Record<string,string>={draft:"neutral","legal-review":"warning","client-review":"info",signature:"accent",signed:"success",notary:"warning",registered:"success"};
const typeKey:Record<string,string>={
  "Основной договор купли-продажи":"contractsPage.type.mainSale",
  "Предварительный договор":"contractsPage.type.preliminary",
  "Соглашение о бронировании":"contractsPage.type.reservation",
  "Договор рассрочки":"contractsPage.type.installment",
  "Соглашение о рассрочке":"contractsPage.type.installmentAgreement"
};
const contractTypeLabel=(value:string)=>typeKey[value]?t(typeKey[value]):value;

export function contractsPage(){
  contracts.forEach(c=>ensureContractManagement(c,deals.find(d=>d.id===c.dealId),clients.find(x=>x.id===c.clientId)));
  const signing=contracts.filter(x=>x.status==="signature");
  const signedPeople=signing.reduce((sum,c)=>sum+signingProgress(c).signed,0),requiredPeople=signing.reduce((sum,c)=>sum+signingProgress(c).total,0);
  return `<section class="page">
    <div class="page-header">
      <div class="page-title"><div class="eyebrow">${t("contractsPage.eyebrow")}</div><h1>${t("contractsPage.title")}</h1><p>${t("contractsPage.subtitle")}</p></div>
      <div class="toolbar"><button class="btn" id="contractTemplates">${t("contractsPage.templates")}</button><button class="btn btn-accent" id="newContract">${t("contractsPage.new")}</button></div>
    </div>
    <div class="grid grid-4 u-mb-16">
      ${metric(t("contractsPage.metric.legal"),contracts.filter(x=>x.status==="legal-review").length,t("contractsPage.metric.legalNote"))}
      ${metric(t("contractsPage.metric.client"),contracts.filter(x=>x.status==="client-review").length,t("contractsPage.metric.clientNote"))}
      ${metric(t("contractsPage.metric.signature"),signing.length,requiredPeople?`${signedPeople}/${requiredPeople} ${t("v49.contracts.signaturesCollected")}`:t("contractsPage.metric.signatureNote"))}
      ${metric(t("contractsPage.metric.signed"),contracts.filter(x=>["signed","notary","registered"].includes(x.status)).length,t("contractsPage.metric.signedNote"))}
    </div>
    <div class="contract-registry-callout"><div><span>${t("v49.contracts.templateControl")}</span><strong>${activeTemplateVersions().length} ${t("v49.contracts.activeVersions")}</strong><small>${t("v49.contracts.templateControlNote")}</small></div><button class="btn btn-soft" id="openTemplateWorkspace">${t("v49.contracts.manageTemplates")}</button></div>
    <div class="card">
      <div class="card-pad u-pb-10"><div class="toolbar">
        <input class="field u-minw-280" id="contractSearch" placeholder="${t("contractsPage.searchPlaceholder")}">
        <select class="field" id="contractType">
          <option value="">${t("contractsPage.allTypes")}</option>
          <option value="Основной договор купли-продажи">${t("contractsPage.type.mainSale")}</option>
          <option value="Предварительный договор">${t("contractsPage.type.preliminary")}</option>
          <option value="Соглашение о бронировании">${t("contractsPage.type.reservation")}</option>
          <option value="Договор рассрочки">${t("contractsPage.type.installment")}</option>
        </select>
        <select class="field" id="contractStatus"><option value="">${t("contractsPage.allStatuses")}</option>${Object.keys(contractClass).map(v=>`<option value="${v}">${statusLabel(v)}</option>`).join("")}</select>
      </div></div>
      <div class="table-wrap"><table class="table contract-registry-v49"><thead><tr>
        <th>${t("contractsPage.contract")}</th><th>${t("contractsPage.clientProperty")}</th><th>${t("contractsPage.type")}</th><th>${t("contractsPage.language")}</th><th>${t("contractsPage.status")}</th><th>${t("contractsPage.version")}</th><th>${t("v49.contracts.signing")}</th><th>${t("contractsPage.deviations")}</th><th>${t("contractsPage.amount")}</th><th>${t("contractsPage.owner")}</th>
      </tr></thead><tbody>${contracts.map(c=>{const sp=signingProgress(c);return`<tr data-contract="${c.id}" data-type="${c.type}" data-status="${c.status}">
        <td><strong>${c.id}</strong><div class="row-sub">${demoText(c.updatedAt)}</div><div class="row-sub template-code-mini">${c.template}</div></td>
        <td><strong>${c.clientName}</strong><div class="row-sub">${c.propertyLabel}</div>${c.propertyIds&&c.propertyIds.length>1?`<span class="chip accent u-mt-6">${t("v45.package.bundle")} · ${c.propertyIds.length}</span>`:""}</td>
        <td>${contractTypeLabel(c.type)}</td><td><span class="language-pill">${c.language}</span></td>
        <td><span class="status ${contractClass[c.status]}">${statusLabel(c.status)}</span></td>
        <td>${c.versions.at(-1)?.version??"—"}</td><td>${sp.total?`<div class="mini-sign-progress"><span><i style="width:${sp.percent}%"></i></span><b>${sp.signed}/${sp.total}</b></div>`:"—"}</td><td>${c.nonStandardClauses?`<span class="status warning">${c.nonStandardClauses}</span>`:"—"}</td><td>${money(c.amount,c.currency??"AMD")}</td><td>${c.owner}</td>
      </tr>`}).join("")}</tbody></table></div>
    </div>
  </section>`;
}

function metric(label:string,value:number,note:string){return `<div class="card metric-card"><div class="metric-top"><span>${label}</span></div><div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div></div>`}

export function bindContracts(){
  document.querySelectorAll("[data-contract]").forEach(el=>el.addEventListener("click",()=>navigate("contract/"+(el as HTMLElement).dataset.contract)));
  document.querySelector("#contractSearch")?.addEventListener("input",filterContracts);
  document.querySelector("#contractType")?.addEventListener("change",filterContracts);
  document.querySelector("#contractStatus")?.addEventListener("change",filterContracts);
  document.querySelector("#newContract")?.addEventListener("click",openContractForm);
  document.querySelector("#contractTemplates")?.addEventListener("click",()=>navigate("contract-templates"));
  document.querySelector("#openTemplateWorkspace")?.addEventListener("click",()=>navigate("contract-templates"));
}

function filterContracts(){
  const q=(document.querySelector<HTMLInputElement>("#contractSearch")?.value??"").toLowerCase(),type=document.querySelector<HTMLSelectElement>("#contractType")?.value??"",status=document.querySelector<HTMLSelectElement>("#contractStatus")?.value??"";
  document.querySelectorAll<HTMLTableRowElement>("tr[data-contract]").forEach(r=>r.style.display=(!q||r.textContent!.toLowerCase().includes(q))&&(!type||r.dataset.type===type)&&(!status||r.dataset.status===status)?"":"none");
}

function openContractForm(){
  const templates=activeTemplateVersions();
  openLocalizedModal(t("contractsPage.createTitle"),`<form id="contractCreateForm" class="form-grid">
    <div class="form-field full"><label>${t("contractsPage.deal")}</label><select name="dealId" required><option value="">${t("contractsPage.chooseDeal")}</option>${deals.map(d=>`<option value="${d.id}">${d.id} · ${d.clientName} · ${d.propertyLabel}</option>`).join("")}</select></div>
    <div class="form-field"><label>${t("contractsPage.type")}</label><select name="type" id="newContractType"><option value="Основной договор купли-продажи">${t("contractsPage.type.mainSale")}</option><option value="Предварительный договор">${t("contractsPage.type.preliminary")}</option><option value="Соглашение о бронировании">${t("contractsPage.type.reservation")}</option><option value="Договор рассрочки">${t("contractsPage.type.installment")}</option></select></div>
    <div class="form-field"><label>${t("contractsPage.language")}</label><select name="language" id="newContractLanguage"><option>HY</option><option>RU</option><option>EN</option></select></div>
    <div class="form-field full"><label>${t("contractsPage.template")}</label><select name="template" id="newContractTemplate" required>${templates.map(x=>`<option value="${x.version.code}" data-type="${x.template.type}" data-lang="${x.version.language}">${x.version.code} · ${x.template.name}</option>`).join("")}</select><small>${t("v49.contracts.templateSnapshotHelp")}</small></div>
    <div class="form-field"><label>${t("contractsPage.lawyer")}</label><select name="owner"><option>Անի Մարտիրոսյան</option><option>Դավիթ Հովսեփյան</option></select></div>
  </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveContract">${t("contractsPage.createDraft")}</button>`);
  const syncTemplate=()=>{const type=(document.querySelector<HTMLSelectElement>("#newContractType")?.value??""),lang=(document.querySelector<HTMLSelectElement>("#newContractLanguage")?.value??"");const select=document.querySelector<HTMLSelectElement>("#newContractTemplate");if(!select)return;let first="";[...select.options].forEach(o=>{const visible=o.dataset.type===type&&o.dataset.lang===lang;o.hidden=!visible;o.disabled=!visible;if(visible&&!first)first=o.value});if(first)select.value=first};
  setTimeout(()=>{document.querySelector("#newContractType")?.addEventListener("change",syncTemplate);document.querySelector("#newContractLanguage")?.addEventListener("change",syncTemplate);syncTemplate();document.querySelector("#saveContract")?.addEventListener("click",()=>{
    const f=document.querySelector<HTMLFormElement>("#contractCreateForm")!;if(!f.reportValidity())return;
    const d=deals.find(x=>x.id===formValue(f,"dealId"))!,c=clients.find(x=>x.id===d.clientId)!,p=properties.find(x=>x.id===d.propertyId)!,id=`CT-2026-${String(100+contracts.length+1).padStart(4,"0")}`;
    const ids=d.propertyIds?.length?d.propertyIds:[d.propertyId],assets=ids.map(pid=>properties.find(x=>x.id===pid)).filter(Boolean) as typeof properties;const templateCode=formValue(f,"template");
    const created={id,dealId:d.id,clientId:c.id,clientName:c.name,propertyId:p.id,propertyIds:[...ids],propertyLabel:assets.map(x=>x.unit).join(" + "),packageMode:d.assetLines?.some(x=>x.contractMode==="separate")?"separate" as const:"shared" as const,type:formValue(f,"type"),language:formValue(f,"language") as "HY"|"RU"|"EN",status:"draft" as const,template:templateCode,amount:d.amount,currency:d.currency,createdAt:"23.09.2026",updatedAt:"23.09.2026 · сейчас",owner:formValue(f,"owner"),nonStandardClauses:0,versions:[{id:id+"-V1",version:"v1.0",createdAt:"23.09.2026 · сейчас",author:formValue(f,"owner"),note:"i18n:contractsPage.version.createdFromApprovedTemplate",status:"current" as const}]};ensureContractManagement(created,d,c);contracts.push(created);
    closeModal();toastLocalized(t("contractsPage.created"));navigate("contract/"+id);
  })},0);
}
