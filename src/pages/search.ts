import { approvals, bankStatementLines, clients, contracts, deals, leads, payments, properties } from "../data/mock";
import { amd, badge, escapeHtml } from "../utils";
import { navigate } from "../router";
import { t } from "../i18n";
import { demoText } from "../demo-i18n";
import {canAccessRoute,isSensitiveAllowed} from "../services/permissions";

type Result={groupKey:string;title:string;subtitle:string;route:string;meta?:string;status?:string};
const includes=(value:unknown,q:string)=>String(value??"").toLowerCase().includes(q);

function collect(q:string):Result[]{
  const out:Result[]=[];
  clients.filter(x=>[x.id,x.name,x.phone,x.email,x.taxId,x.personalNumber].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.clients",title:x.name,subtitle:isSensitiveAllowed("personal")?`${x.id} · ${x.phone} · ${x.email}`:`${x.id} · ${t("v54.scope.personal")}`,route:`client/${x.id}`,meta:x.manager,status:x.verification}));
  leads.filter(x=>[x.id,x.name,x.phone,x.email,x.source,x.district].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.leads",title:x.name,subtitle:`${x.id} · ${demoText(x.source)} · ${t("searchPage.roomsShort",{count:x.rooms})} · ${demoText(x.district)}`,route:`lead/${x.id}`,meta:t("search.scoreValue",{score:x.score}),status:x.stage}));
  deals.filter(x=>[x.id,x.clientName,x.propertyLabel,x.manager].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.deals",title:`${x.id} · ${x.clientName}`,subtitle:x.propertyLabel,route:`deal/${x.id}`,meta:amd(x.amount),status:x.status}));
  properties.filter(x=>[x.id,x.project,x.building,x.unit].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.properties",title:`${x.project} · ${x.unit}`,subtitle:`${t("searchPage.building",{building:x.building})} · ${t("searchPage.floor",{floor:x.floor})} · ${x.area} m²`,route:`property/${x.id}`,meta:amd(x.totalPrice),status:x.status}));
  contracts.filter(x=>[x.id,x.clientName,x.propertyLabel,x.type,x.template].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.contracts",title:`${x.id} · ${x.clientName}`,subtitle:`${demoText(x.type)} · ${x.propertyLabel}`,route:`contract/${x.id}`,meta:x.template,status:x.status}));
  payments.filter(x=>[x.id,x.dealId,x.clientName,x.dueDate].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.payments",title:`${x.id} · ${x.clientName}`,subtitle:`${x.dealId} · ${t("searchPage.due",{date:x.dueDate})}`,route:"payments",meta:amd(x.amount),status:x.status}));
  approvals.filter(x=>[x.id,x.dealId,x.clientName,x.reason,x.requestedValue].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.approvals",title:`${x.id} · ${x.clientName}`,subtitle:`${x.dealId} · ${demoText(x.reason)}`,route:"approvals",meta:demoText(x.requestedValue),status:x.status}));
  bankStatementLines.filter(x=>[x.id,x.payer,x.purpose,x.reference,x.matchedDealId].some(v=>includes(v,q))).forEach(x=>out.push({groupKey:"searchPage.group.bank",title:`${x.id} · ${x.payer}`,subtitle:`${x.reference} · ${demoText(x.purpose)}`,route:"reconciliation",meta:amd(x.amount),status:x.status}));
  return out.filter(r=>canAccessRoute(r.route));
}

export function searchPage(route:string){
  const params=new URLSearchParams(route.split("?")[1]??""),raw=params.get("q")??"",q=raw.trim().toLowerCase(),results=q?collect(q):[],groups=[...new Set(results.map(x=>x.groupKey))];
  return`<section class="page"><div class="page-header"><div class="page-title"><div class="eyebrow">${t("searchPage.eyebrow")}</div><h1>${t("searchPage.title")}</h1><p>${q?t("searchPage.resultsFor",{query:escapeHtml(raw)}):t("searchPage.enterQuery")}</p></div><span class="chip accent">${t("searchPage.resultsCount",{count:results.length})}</span></div>${groups.length?groups.map(groupKey=>`<div class="card card-pad search-group"><div class="section-title"><div><h2>${t(groupKey)}</h2><p>${t("searchPage.matchesCount",{count:results.filter(x=>x.groupKey===groupKey).length})}</p></div></div><div class="search-result-list">${results.filter(x=>x.groupKey===groupKey).map(r=>`<button class="search-result" data-search-route="${r.route}"><div><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.subtitle)}</span></div><div class="search-result-meta">${r.meta?`<b>${escapeHtml(r.meta)}</b>`:""}${r.status?badge(r.status):""}<span>↗</span></div></button>`).join("")}</div></div>`).join(""):`<div class="card card-pad"><div class="empty">${q?t("searchPage.noMatches"):t("searchPage.help")}</div></div>`}</section>`;
}
export function bindSearch(){document.querySelectorAll<HTMLElement>("[data-search-route]").forEach(el=>el.addEventListener("click",()=>navigate(el.dataset.searchRoute!)))}
