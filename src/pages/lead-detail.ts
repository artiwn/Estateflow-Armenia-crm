import { leads, properties } from "../data/mock";
import { amd, statusLabel } from "../utils";
import { currentRoute, navigate } from "../router";
import { closeModal, formValue, openLocalizedModal, toastLocalized } from "../components/layout";
import { t } from "../i18n";
import { leadDistrict, leadLastActivity, leadNextAction, leadNotes, leadSource } from "./lead-i18n";

export function leadDetailPage(id:string){
  const l=leads.find(x=>x.id===id);
  if(!l)return `<section class="page"><div class="card card-pad">${t("leadDetail.notFound")}</div></section>`;
  const recommended=properties.filter(p=>p.status==="available" && p.totalPrice>=l.budgetFrom*.85 && p.totalPrice<=l.budgetTo*1.1).slice(0,3);
  return `<section class="page">
    <div class="breadcrumbs"><span>${t("leads")}</span><span>›</span><span>${l.id}</span></div>
    <div class="detail-header">
      <div class="detail-title"><small>${l.id} · ${leadSource(l.source)}</small><h1>${l.name}</h1><div class="toolbar"><span class="chip accent">${t("leads.score",{score:l.score})}</span><span class="chip">${l.language}</span></div></div>
      <div class="toolbar"><button class="btn" id="backLeads">← ${t("leadDetail.pipeline")}</button><button class="btn" id="scheduleLeadCall">${t("leadDetail.scheduleCall")}</button><button class="btn btn-accent" id="createOffer">${t("leadDetail.createOffer")}</button></div>
    </div>

    <div class="journey u-mb-16">
      ${journey("01",t("leadDetail.journey.contact"),true,true)}
      ${journey("02",t("leadDetail.journey.qualification"),l.stage!=="new",l.stage==="qualified")}
      ${journey("03",t("leadDetail.journey.selection"),["viewing","offer","reservation"].includes(l.stage),l.stage==="viewing")}
      ${journey("04",t("leadDetail.journey.offer"),["offer","reservation"].includes(l.stage),l.stage==="offer")}
      ${journey("05",t("leadDetail.journey.reservation"),l.stage==="reservation",l.stage==="reservation")}
    </div>

    <div class="client-summary">
      <div class="card card-pad">
        <div class="section-title"><div><h2>${t("leadDetail.needProfile")}</h2><p>${t("leadDetail.needProfileSub")}</p></div><button class="btn btn-soft" id="editLead">${t("common.edit")}</button></div>
        <div class="info-list">
          <div class="info-box"><span>${t("leadDetail.phone")}</span><strong>${l.phone}</strong></div>
          <div class="info-box"><span>${t("leadDetail.email")}</span><strong>${l.email}</strong></div>
          <div class="info-box"><span>${t("leadDetail.budget")}</span><strong>${amd(l.budgetFrom)} — ${amd(l.budgetTo)}</strong></div>
          <div class="info-box"><span>${t("leadDetail.rooms")}</span><strong>${l.rooms}</strong></div>
          <div class="info-box"><span>${t("leadDetail.district")}</span><strong>${leadDistrict(l.district)}</strong></div>
          <div class="info-box"><span>${t("leadDetail.owner")}</span><strong>${l.manager}</strong></div>
        </div>
        <div class="divider"></div>
        <div class="u-copy-soft">${leadNotes(l.notes)}</div>
      </div>

      <div class="card card-pad">
        <div class="section-title"><div><h2>${t("leadDetail.nextAction")}</h2><p>${t("leadDetail.contactControl")}</p></div></div>
        <div class="u-heading-18">${leadNextAction(l.nextAction)}</div>
        <div class="u-subtle-115 u-mt-8">${t("leadDetail.lastActivity",{value:leadLastActivity(l.lastActivity)})}</div>
        <div class="divider"></div>
        <div class="activity-feed">
          ${activity("☎",t("leadDetail.activity.call"),t("leadDetail.activity.callText"))}
          ${activity("✉",t("leadDetail.activity.message"),t("leadDetail.activity.messageText"))}
          ${activity("✓",t("leadDetail.activity.qualification"),t("leadDetail.activity.qualificationText"))}
        </div>
      </div>
    </div>

    <div class="card card-pad u-mt-16">
      <div class="section-title"><div><h2>${t("leadDetail.recommended")}</h2><p>${t("leadDetail.recommendedSub")}</p></div><button class="btn btn-soft" id="openInventory">${t("leadDetail.openInventory")}</button></div>
      <div class="grid grid-3">
        ${recommended.map(p=>`<div class="card interactive card-pad u-no-shadow" data-rec="${p.id}"><div class="toolbar u-between"><span class="chip success">${statusLabel("available")}</span><span class="u-meta-11">${t("leadDetail.floor",{floor:p.floor})}</span></div><div class="u-section-total">${p.unit}</div><div class="u-subtle-115 u-mt-4">${t("leadDetail.propertyMeta",{rooms:p.rooms,area:p.area,building:p.building})}</div><div class="u-mt-16 u-fw-750">${amd(p.totalPrice)}</div></div>`).join("")}
      </div>
    </div>
  </section>`;
}
function journey(num:string,title:string,done:boolean,active:boolean){return `<div class="journey-step ${active?"active":done?"done":""}"><span>${num}</span><strong>${title}</strong></div>`}
function activity(icon:string,title:string,text:string){return `<div class="activity-row"><div class="activity-icon">${icon}</div><div><strong>${title}</strong><p>${text}</p></div></div>`}

export function bindLeadDetail(){
  document.querySelector("#backLeads")?.addEventListener("click",()=>navigate("leads"));
  document.querySelector("#createOffer")?.addEventListener("click",()=>navigate("offer/"+currentRoute().split("/")[1]));
  document.querySelector("#openInventory")?.addEventListener("click",()=>navigate("properties"));
  document.querySelectorAll("[data-rec]").forEach(el=>el.addEventListener("click",()=>navigate("property/"+(el as HTMLElement).dataset.rec)));
  document.querySelector("#scheduleLeadCall")?.addEventListener("click",()=>{
    const l=leads.find(x=>x.id===currentRoute().split("/")[1]);
    if(l){l.nextAction="i18n:leads.nextAction.callToday1730";l.lastActivity="i18n:leads.activity.now"}
    toastLocalized(t("leadDetail.callScheduled"));
  });
  document.querySelector("#editLead")?.addEventListener("click",()=>{
    const id=currentRoute().split("/")[1],l=leads.find(x=>x.id===id);if(!l)return;
    openLocalizedModal(t("leadDetail.edit.title"),`<form id="editLeadForm" class="form-grid"><div class="form-field full"><label>${t("leadDetail.edit.name")}</label><input name="name" value="${l.name}" required></div><div class="form-field"><label>${t("leadDetail.edit.budgetFrom")}</label><input name="budgetFrom" type="number" value="${l.budgetFrom}"></div><div class="form-field"><label>${t("leadDetail.edit.budgetTo")}</label><input name="budgetTo" type="number" value="${l.budgetTo}"></div><div class="form-field"><label>${t("leadDetail.edit.rooms")}</label><input name="rooms" value="${l.rooms}"></div><div class="form-field"><label>${t("leadDetail.edit.district")}</label><input name="district" value="${leadDistrict(l.district)}"></div><div class="form-field full"><label>${t("leadDetail.edit.comment")}</label><textarea name="notes">${leadNotes(l.notes)}</textarea></div></form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveLeadEdit">${t("common.save")}</button>`);
    setTimeout(()=>document.querySelector("#saveLeadEdit")?.addEventListener("click",()=>{
      const f=document.querySelector<HTMLFormElement>("#editLeadForm")!;if(!f.reportValidity())return;
      l.name=formValue(f,"name");l.budgetFrom=Number(formValue(f,"budgetFrom"));l.budgetTo=Number(formValue(f,"budgetTo"));l.rooms=formValue(f,"rooms");l.district=formValue(f,"district");l.notes=formValue(f,"notes");l.lastActivity="i18n:leads.activity.now";
      closeModal();toastLocalized(t("leadDetail.updated"));navigate("leads");setTimeout(()=>navigate("lead/"+id),20);
    }),0);
  });
}
