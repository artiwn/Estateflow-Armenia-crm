import {properties} from "../data/mock";
import {money,propertyTypeLabel,statusLabel} from "../utils";
import {navigate} from "../router";
import {closeModal,formValue,openLocalizedModal,toastLocalized} from "../components/layout";
import {t} from "../i18n";
import type{PropertyStatus,PropertyType,Currency,PropertyLegalStatus}from"../models/types";

const propertyStatuses:PropertyStatus[]=["created","data-review","unavailable","available","offered","pre-reserved","reserved","application","approval","contract-preparation","contract","partially-paid","paid","registration","sold","handover","handed-over","suspended","cancelled","returned-to-sale"];
const propertyTypes:PropertyType[]=["apartment","house","parking","commercial","office","storage","land","auxiliary","property-right","other"];
const saleProcessStatuses=new Set<PropertyStatus>(["offered","pre-reserved","reserved","application","approval","contract-preparation","contract","partially-paid","paid","registration","handover"]);
const uniq=(values:string[])=>[...new Set(values)].sort((a,b)=>a.localeCompare(b));
const floorLabel=(floor:number)=>floor<0?t("v41.property.floorBasement",{floor:Math.abs(floor)}):t("propertiesPage.floor",{floor});
const availabilityStatuses=new Set<PropertyStatus>(["available","returned-to-sale"]);

export function propertiesPage(){
  const projects=uniq(properties.map(p=>p.project)),phases=uniq(properties.map(p=>p.phase)),buildings=uniq(properties.map(p=>p.building)),entrances=uniq(properties.map(p=>p.entrance)),currencies=uniq(properties.map(p=>p.currency));
  const groups=uniq(properties.map(p=>`${p.project}|||${p.phase}|||${p.building}|||${p.entrance}`)).map(key=>{const[project,phase,building,entrance]=key.split("|||");return{key,project,phase,building,entrance,rows:properties.filter(p=>p.project===project&&p.phase===phase&&p.building===building&&p.entrance===entrance)}});
  const visibleTypes=propertyTypes.filter(type=>properties.some(p=>p.type===type));
  const totalValueByCurrency=currencies.map(currency=>({currency,value:properties.filter(p=>p.currency===currency).reduce((s,p)=>s+p.totalPrice,0)}));
  return `<section class="page property-inventory-page">
    <div class="page-header">
      <div class="page-title"><h1>${t("propertiesPage.title")}</h1><p>${t("v44.property.subtitle")}</p></div>
      <div class="toolbar"><button class="btn" id="priceLists">${t("propertiesPage.priceLists")}</button><button class="btn btn-primary" id="addProperty">${t("propertiesPage.add")}</button></div>
    </div>

    <div class="card inventory-command-center">
      <div class="inventory-command-copy"><span class="eyebrow">${t("v44.property.commandCenter")}</span><strong>${t("v41.property.inventoryStructureSub")}</strong><p>${t("v44.property.commandCenterText")}</p></div>
      <div class="inventory-command-actions">
        <div class="property-search"><span>⌕</span><input id="propSearch" placeholder="${t("v44.property.searchPlaceholder")}" aria-label="${t("v44.property.searchPlaceholder")}"></div>
        <div class="inventory-view-switch" role="group" aria-label="${t("v44.property.view")}"><button class="active" data-property-view="board">${t("v44.property.board")}</button><button data-property-view="list">${t("v44.property.list")}</button></div>
      </div>
    </div>

    <div class="grid grid-4 property-portfolio-kpis u-mb-16">
      <div class="card metric-card"><div class="metric-top"><span>${t("v44.property.portfolio")}</span><span class="metric-icon">▦</span></div><div><div class="metric-value">${properties.length}</div><div class="metric-note">${projects.length} ${t("propertiesPage.project").toLowerCase()} · ${visibleTypes.length} ${t("v41.property.type").toLowerCase()}</div></div></div>
      <div class="card metric-card"><div class="metric-top"><span>${t("propertiesPage.available")}</span><span class="metric-icon">✓</span></div><div><div class="metric-value">${properties.filter(p=>availabilityStatuses.has(p.status)).length}</div><div class="metric-note"><strong>${Math.round(properties.filter(p=>availabilityStatuses.has(p.status)).length/properties.length*100)}%</strong> ${t("v44.property.ofPortfolio")}</div></div></div>
      <div class="card metric-card"><div class="metric-top"><span>${t("v44.property.inProcess")}</span><span class="metric-icon">→</span></div><div><div class="metric-value">${properties.filter(p=>saleProcessStatuses.has(p.status)).length}</div><div class="metric-note">${t("v44.property.activeCommercialFlow")}</div></div></div>
      <div class="card metric-card"><div class="metric-top"><span>${t("v44.property.portfolioValue")}</span><span class="metric-icon">¤</span></div><div><div class="property-value-lines">${totalValueByCurrency.map(x=>`<strong>${money(x.value,x.currency as Currency)}</strong>`).join("")}</div><div class="metric-note">${t("v44.property.currentListValue")}</div></div></div>
    </div>

    <div class="card property-type-overview u-mb-16">
      <div class="section-title"><div><h2>${t("v44.property.inventoryMix")}</h2><p>${t("v44.property.inventoryMixSub")}</p></div><span class="chip">${visibleTypes.length} ${t("v41.property.type").toLowerCase()}</span></div>
      <div class="property-type-strip">${visibleTypes.map(type=>{const rows=properties.filter(p=>p.type===type),free=rows.filter(p=>availabilityStatuses.has(p.status)).length;return`<button data-quick-type="${type}"><span>${propertyTypeLabel(type)}</span><strong>${rows.length}</strong><small>${free} ${t("propertiesPage.available").toLowerCase()}</small><i style="--fill:${Math.round(free/rows.length*100)}%"></i></button>`}).join("")}</div>
    </div>

    <div class="inventory-layout inventory-layout-v44">
      <aside class="card filter-panel property-filter-panel">
        <div class="filter-panel-head"><strong>${t("propertiesPage.filters")}</strong><span id="visiblePropertyCount">${properties.length}</span></div>
        <label>${t("propertiesPage.project")}</label><select class="field" id="propProject"><option value="">${t("propertiesPage.allProjects")}</option>${projects.map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("v41.property.phase")}</label><select class="field" id="propPhase"><option value="">${t("v41.property.allPhases")}</option>${phases.map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("propertiesPage.building")}</label><select class="field" id="propBuilding"><option value="">${t("propertiesPage.allBuildings")}</option>${buildings.map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("v41.property.entrance")}</label><select class="field" id="propEntrance"><option value="">${t("v41.property.allEntrances")}</option>${entrances.map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("v41.property.type")}</label><select class="field" id="propType"><option value="">${t("v41.property.allTypes")}</option>${visibleTypes.map(type=>`<option value="${type}">${propertyTypeLabel(type)}</option>`).join("")}</select>
        <label>${t("propertiesPage.rooms")}</label><select class="field" id="propRooms"><option value="">${t("propertiesPage.all")}</option>${uniq(properties.filter(p=>p.rooms>0).map(p=>String(p.rooms))).map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("propertiesPage.status")}</label><select class="field" id="propStatus"><option value="">${t("propertiesPage.all")}</option>${propertyStatuses.filter(st=>properties.some(p=>p.status===st)).map(st=>`<option value="${st}">${statusLabel(st)}</option>`).join("")}</select>
        <label>${t("v41.property.currency")}</label><select class="field" id="propCurrency"><option value="">${t("v41.property.allCurrencies")}</option>${currencies.map(v=>`<option>${v}</option>`).join("")}</select>
        <label>${t("propertiesPage.maxPrice")}</label><input class="field" id="propMax" value="999999999" inputmode="numeric" aria-label="${t("propertiesPage.maxPriceAria")}">
        <button class="btn btn-primary u-full u-mt-16" id="applyPropertyFilter">${t("propertiesPage.apply")}</button>
        <button class="btn btn-ghost u-full u-mt-6" id="resetPropertyFilter">${t("propertiesPage.reset")}</button>
      </aside>

      <div class="inventory-groups">
        <div class="card card-pad inventory-legend">
          <div class="section-title"><div><h2>${t("v44.property.availabilityBoard")}</h2><p>${t("v44.property.availabilityBoardSub")}</p></div></div>
          <div class="inventory-status-legend">${["available","offered","reserved","application","contract","registration","sold"].map(st=>`<button class="status ${statusClassFor(st)}" data-quick-status="${st}">${statusLabel(st)}</button>`).join("")}<button class="chip" data-clear-status>${t("v44.property.showAll")}</button></div>
        </div>

        <div id="propertyBoardView">${groups.map(group=>inventoryGroup(group)).join("")}</div>
        <div id="propertyListView" hidden>${propertyList()}</div>
        <div class="card card-pad inventory-no-results" id="inventoryNoResults" hidden><div class="empty">${t("v44.property.noResults")}</div></div>
      </div>
    </div>
  </section>`;
}

function statusClassFor(status:string){return status==="available"?"success":status==="reserved"||status==="offered"||status==="application"?"warning":status==="contract"?"info":status==="registration"?"accent":"neutral"}

function inventoryGroup(group:{key:string;project:string;phase:string;building:string;entrance:string;rows:typeof properties}){
  const floors=[...new Set(group.rows.map(p=>p.floor))].sort((a,b)=>b-a);
  const free=group.rows.filter(p=>availabilityStatuses.has(p.status)).length;
  return `<section class="card card-pad inventory-group" data-inventory-group="${group.key}">
    <div class="inventory-group-head"><div><span class="inventory-hierarchy-path">${group.project}<b>›</b>${group.phase}<b>›</b>${group.building}<b>›</b>${group.entrance}</span><h2>${group.building} · ${group.entrance}</h2><small>${free} ${t("propertiesPage.available").toLowerCase()} / ${group.rows.length}</small></div><div class="inventory-group-count">${group.rows.length}</div></div>
    ${floors.map(f=>`<div class="floor-row" data-floor="${f}"><div class="floor-label">${floorLabel(f)}</div><div class="property-grid">${group.rows.filter(p=>p.floor===f).map(propertyButton).join("")}</div></div>`).join("")}
  </section>`;
}

function propertyButton(p:(typeof properties)[number]){
  return `<button class="unit ${p.status}" data-unit="${p.id}" data-search="${[p.id,p.unit,p.internalCode,p.cadastralCode,p.address,p.project].join(" ").toLowerCase()}" data-project="${p.project}" data-phase="${p.phase}" data-building="${p.building}" data-entrance="${p.entrance}" data-type="${p.type}" data-rooms="${p.rooms}" data-status="${p.status}" data-currency="${p.currency}" data-price="${p.totalPrice}" title="${p.unit} · ${propertyTypeLabel(p.type)} · ${p.area} m² · ${money(p.totalPrice,p.currency)}"><div class="unit-topline"><strong>${p.unit}</strong><em>${p.currency}</em></div><span>${propertyTypeLabel(p.type)}</span><small>${p.rooms>0?`${p.rooms} · `:""}${p.area} m²</small><div class="unit-progress"><i style="width:${p.constructionReadiness??0}%"></i></div></button>`;
}

function propertyList(){
  return `<div class="card table-wrap property-list-card"><table class="table property-list-table"><thead><tr><th>${t("v44.property.asset")}</th><th>${t("v41.property.type")}</th><th>${t("v44.property.location")}</th><th>${t("propertyDetail.area")}</th><th>${t("v44.property.readiness")}</th><th>${t("propertiesPage.status")}</th><th>${t("v44.property.price")}</th></tr></thead><tbody>${properties.map(p=>`<tr data-property-row="${p.id}" data-search="${[p.id,p.unit,p.internalCode,p.cadastralCode,p.address,p.project].join(" ").toLowerCase()}" data-project="${p.project}" data-phase="${p.phase}" data-building="${p.building}" data-entrance="${p.entrance}" data-type="${p.type}" data-rooms="${p.rooms}" data-status="${p.status}" data-currency="${p.currency}" data-price="${p.totalPrice}"><td><strong>${p.unit}</strong><small>${p.internalCode??p.id}</small></td><td>${propertyTypeLabel(p.type)}</td><td><strong>${p.project}</strong><small>${p.phase} · ${p.building} · ${p.entrance} · ${floorLabel(p.floor)}</small></td><td>${p.area} m²</td><td><div class="readiness-mini"><span>${p.constructionReadiness??0}%</span><i><b style="width:${p.constructionReadiness??0}%"></b></i></div></td><td><span class="status ${statusClassFor(p.status)}">${statusLabel(p.status)}</span></td><td><strong>${money(p.totalPrice,p.currency)}</strong><small>${money(p.pricePerSqm,p.currency)} / m²</small></td></tr>`).join("")}</tbody></table></div>`;
}

export function bindProperties(){
  document.querySelectorAll("[data-unit]").forEach(el=>el.addEventListener("click",()=>navigate("property/"+(el as HTMLElement).dataset.unit)));
  document.querySelectorAll("[data-property-row]").forEach(el=>el.addEventListener("click",()=>navigate("property/"+(el as HTMLElement).dataset.propertyRow)));
  document.querySelector("#applyPropertyFilter")?.addEventListener("click",applyFilters);
  ["propProject","propPhase","propBuilding","propEntrance","propType","propRooms","propStatus","propCurrency"].forEach(id=>document.querySelector("#"+id)?.addEventListener("change",applyFilters));
  document.querySelector("#propSearch")?.addEventListener("input",applyFilters);
  document.querySelectorAll("[data-quick-type]").forEach(el=>el.addEventListener("click",()=>{const select=document.querySelector<HTMLSelectElement>("#propType");if(select)select.value=(el as HTMLElement).dataset.quickType??"";applyFilters()}));
  document.querySelectorAll("[data-quick-status]").forEach(el=>el.addEventListener("click",()=>{const select=document.querySelector<HTMLSelectElement>("#propStatus");if(select)select.value=(el as HTMLElement).dataset.quickStatus??"";applyFilters()}));
  document.querySelector("[data-clear-status]")?.addEventListener("click",()=>{const select=document.querySelector<HTMLSelectElement>("#propStatus");if(select)select.value="";applyFilters()});
  document.querySelectorAll("[data-property-view]").forEach(el=>el.addEventListener("click",()=>switchView((el as HTMLElement).dataset.propertyView??"board")));
  document.querySelector("#resetPropertyFilter")?.addEventListener("click",()=>{["propProject","propPhase","propBuilding","propEntrance","propType","propRooms","propStatus","propCurrency"].forEach(id=>(document.querySelector<HTMLSelectElement>("#"+id)!).value="");(document.querySelector<HTMLInputElement>("#propMax")!).value="999999999";const search=document.querySelector<HTMLInputElement>("#propSearch");if(search)search.value="";applyFilters()});
  document.querySelector("#addProperty")?.addEventListener("click",openPropertyForm);
  document.querySelector("#priceLists")?.addEventListener("click",()=>navigate("price-lists"));
}

function switchView(view:string){
  const board=document.querySelector<HTMLElement>("#propertyBoardView"),list=document.querySelector<HTMLElement>("#propertyListView");if(!board||!list)return;
  board.hidden=view!=="board";list.hidden=view!=="list";
  document.querySelectorAll("[data-property-view]").forEach(x=>x.classList.toggle("active",(x as HTMLElement).dataset.propertyView===view));
  applyFilters();
}

function activeFilters(){
  const get=(id:string)=>document.querySelector<HTMLSelectElement>("#"+id)?.value??"";
  return{project:get("propProject"),phase:get("propPhase"),building:get("propBuilding"),entrance:get("propEntrance"),type:get("propType"),rooms:get("propRooms"),status:get("propStatus"),currency:get("propCurrency"),max:Number((document.querySelector<HTMLInputElement>("#propMax")?.value??"").replace(/[^0-9.]/g,""))||Infinity,search:(document.querySelector<HTMLInputElement>("#propSearch")?.value??"").trim().toLowerCase()};
}
function elementMatches(x:HTMLElement,f:ReturnType<typeof activeFilters>){return(!f.project||x.dataset.project===f.project)&&(!f.phase||x.dataset.phase===f.phase)&&(!f.building||x.dataset.building===f.building)&&(!f.entrance||x.dataset.entrance===f.entrance)&&(!f.type||x.dataset.type===f.type)&&(!f.rooms||x.dataset.rooms===f.rooms)&&(!f.status||x.dataset.status===f.status)&&(!f.currency||x.dataset.currency===f.currency)&&Number(x.dataset.price)<=f.max&&(!f.search||(x.dataset.search??"").includes(f.search))}
function applyFilters(){
  const f=activeFilters();let visible=0;
  document.querySelectorAll<HTMLElement>("[data-unit]").forEach(x=>{const show=elementMatches(x,f);x.style.display=show?"":"none";if(show)visible++});
  document.querySelectorAll<HTMLElement>("[data-property-row]").forEach(x=>{x.style.display=elementMatches(x,f)?"":"none"});
  document.querySelectorAll<HTMLElement>("[data-floor]").forEach(row=>{row.style.display=Array.from(row.querySelectorAll<HTMLElement>("[data-unit]")).some(x=>x.style.display!=="none")?"":"none"});
  document.querySelectorAll<HTMLElement>("[data-inventory-group]").forEach(g=>{g.style.display=Array.from(g.querySelectorAll<HTMLElement>("[data-unit]")).some(x=>x.style.display!=="none")?"":"none"});
  const count=document.querySelector<HTMLElement>("#visiblePropertyCount");if(count)count.textContent=String(visible);
  const empty=document.querySelector<HTMLElement>("#inventoryNoResults");if(empty)empty.hidden=visible>0;
}

function openPropertyForm(){
  openLocalizedModal(t("propertiesPage.addTitle"),`<form id="propertyCreateForm" class="form-grid property-create-form">
    <div class="form-field"><label>${t("propertiesPage.project")}</label><input name="project" value="Norq Residence" required></div>
    <div class="form-field"><label>${t("v41.create.phase")}</label><input name="phase" value="Phase 1" required></div>
    <div class="form-field"><label>${t("propertiesPage.building")}</label><input name="building" value="B" required></div>
    <div class="form-field"><label>${t("v41.create.entrance")}</label><input name="entrance" value="2" required></div>
    <div class="form-field"><label>${t("propertiesPage.floorLabel")}</label><input name="floor" type="number" value="15" required></div>
    <div class="form-field"><label>${t("propertiesPage.unitNumber")}</label><input name="unit" placeholder="B-1501" required></div>
    <div class="form-field"><label>${t("v41.create.type")}</label><select name="type">${propertyTypes.map(type=>`<option value="${type}" ${type==="apartment"?"selected":""}>${propertyTypeLabel(type)}</option>`).join("")}</select></div>
    <div class="form-field"><label>${t("propertiesPage.rooms")}</label><input name="rooms" type="number" min="0" value="2" required></div>
    <div class="form-field"><label>${t("propertiesPage.area")}</label><input name="area" type="number" step="0.1" value="70" required></div>
    <div class="form-field"><label>${t("v44.property.usableArea")}</label><input name="usableArea" type="number" step="0.1" value="63.7"></div>
    <div class="form-field"><label>${t("v44.property.ceilingHeight")}</label><input name="ceilingHeight" type="number" step="0.1" value="3.0"></div>
    <div class="form-field"><label>${t("v44.property.bathrooms")}</label><input name="bathrooms" type="number" min="0" value="1"></div>
    <div class="form-field"><label>${t("v41.property.priceNative")}</label><input name="price" type="number" value="760000" required></div>
    <div class="form-field"><label>${t("v41.create.currency")}</label><select name="currency"><option>AMD</option><option>USD</option><option>EUR</option></select></div>
    <div class="form-field"><label>${t("propertiesPage.status")}</label><select name="status">${propertyStatuses.map(st=>`<option value="${st}" ${st==="created"?"selected":""}>${statusLabel(st)}</option>`).join("")}</select></div>
    <div class="form-field"><label>${t("v41.create.orientation")}</label><input name="orientation" value="South"></div>
    <div class="form-field"><label>${t("v41.create.finishing")}</label><input name="finishing" value="Shell & core"></div>
    <div class="form-field"><label>${t("v41.create.cadastral")}</label><input name="cadastral" value="01-006-015-1501"></div>
    <div class="form-field"><label>${t("v41.create.legalStatus")}</label><select name="legalStatus"><option value="project-right">${t("v41.property.legalStatus.project-right")}</option><option value="registered">${t("v41.property.legalStatus.registered")}</option><option value="pending-registration">${t("v41.property.legalStatus.pending-registration")}</option><option value="restricted">${t("v41.property.legalStatus.restricted")}</option></select></div>
    <div class="form-field"><label>${t("v44.property.readiness")}</label><input name="readiness" type="number" min="0" max="100" value="70"></div>
    <div class="form-field"><label>${t("v44.property.plannedHandover")}</label><input name="handover" value="Q3 2027"></div>
    <div class="form-field full"><label>${t("v41.create.address")}</label><input name="address" value="Yerevan · Nor Nork · Norq Residence"></div>
    <div class="form-field full"><label>${t("v44.property.technicalNote")}</label><textarea name="technicalNote">${t("v44.property.defaultTechnicalNote")}</textarea></div>
    <div class="form-field full checkbox-field"><label><input type="checkbox" name="vatIncluded" checked> ${t("v41.create.vatIncluded")}</label></div>
  </form>`,`<button class="btn" data-modal-close>${t("common.cancel")}</button><button class="btn btn-accent" id="saveProperty">${t("propertiesPage.addAction")}</button>`);
  setTimeout(()=>document.querySelector("#saveProperty")?.addEventListener("click",()=>{const f=document.querySelector<HTMLFormElement>("#propertyCreateForm")!;if(!f.reportValidity())return;const unit=formValue(f,"unit"),area=Number(formValue(f,"area")),price=Number(formValue(f,"price")),id="PR-"+unit.replace(/[^A-Za-z0-9]/g,"");const status=formValue(f,"status") as PropertyStatus;properties.push({id,internalCode:`NR-${unit}`,project:formValue(f,"project"),phase:formValue(f,"phase"),building:formValue(f,"building"),entrance:formValue(f,"entrance"),floor:Number(formValue(f,"floor")),unit,type:formValue(f,"type") as PropertyType,rooms:Number(formValue(f,"rooms")),area,usableArea:Number(formValue(f,"usableArea"))||area,bathrooms:Number(formValue(f,"bathrooms"))||0,balconies:0,balconyArea:0,ceilingHeight:Number(formValue(f,"ceilingHeight"))||0,position:formValue(f,"orientation"),pricePerSqm:price,totalPrice:Math.round(area*price),initialPricePerSqm:price,initialPrice:Math.round(area*price),currency:formValue(f,"currency") as Currency,vatIncluded:formValue(f,"vatIncluded")==="on",status,orientation:formValue(f,"orientation"),finishing:formValue(f,"finishing"),cadastralCode:formValue(f,"cadastral"),legalStatus:formValue(f,"legalStatus") as PropertyLegalStatus,restrictions:[],restrictionDetails:[],address:formValue(f,"address"),constructionReadiness:Number(formValue(f,"readiness"))||0,plannedHandover:formValue(f,"handover"),availabilityFrom:"According to current sales stage",technicalNote:formValue(f,"technicalNote"),floorPlan:`${unit}_floor-plan.pdf`,photoCount:0,documents:[],statusHistory:[{id:`PSE-${id}-1`,status,at:"22.09.2026 · 15:30",actor:"Commercial Office",note:"Created in inventory"}]});closeModal();toastLocalized(t("propertiesPage.added"));navigate("property/"+id)}),0);
}
