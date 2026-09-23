import{deals,payments,properties}from"../data/mock";import{compactAmd}from"../utils";import{navigate}from"../router";import{locale,t}from"../i18n";

export function dashboardPage(){
  const available=properties.filter(p=>p.status==="available").length;
  const reserved=properties.filter(p=>p.status==="reserved").length;
  const overdue=payments.filter(p=>p.status==="overdue").reduce((s,p)=>s+(p.amount-p.paid),0);
  const funnel:[[string,number],[string,number],[string,number],[string,number],[string,number],[string,number],[string,number]]=[
    [t("dashboard.stage.new"),128],[t("dashboard.stage.qualified"),83],[t("dashboard.stage.viewing"),54],[t("dashboard.stage.offer"),39],[t("dashboard.stage.reservation"),27],[t("dashboard.stage.contract"),19],[t("dashboard.stage.sold"),14]
  ];
  const max=Math.max(...funnel.map(x=>x[1]));
  const today=new Intl.DateTimeFormat(locale(),{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date());
  return`<section class="page">
    <div class="hero"><div><h2>${t("dashboard.greeting")}</h2><p>${t("dashboard.hero")}</p></div><div class="hero-tag">${today} · ${t("dashboard.city")}</div></div>
    <div class="grid grid-4">
      ${metric(t("dashboard.revenue"),compactAmd(1_840_000_000),t("dashboard.revenueNote"),"₳")}
      ${metric(t("dashboard.activeDeals"),String(deals.length),t("dashboard.attentionCount"),"◇")}
      ${metric(t("dashboard.availableUnits"),String(available),t("dashboard.reservedCount",{count:reserved}),"▦")}
      ${metric(t("dashboard.overdue"),compactAmd(overdue),t("dashboard.overdueCount"),"!")}
    </div>
    <div class="split">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dashboard.funnel")}</h2><p>${t("dashboard.funnelSub")}</p></div><button class="btn btn-soft" data-goto="deals">${t("dashboard.openDeals")}</button></div><div class="chart-bars">${funnel.map(([l,v])=>`<div class="bar-row"><div class="bar-label">${l}</div><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><div class="bar-value">${v}</div></div>`).join("")}</div></div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dashboard.attention")}</h2><p>${t("dashboard.attentionSub")}</p></div><button class="btn btn-soft" data-goto="tasks">${t("tasks")}</button></div><div class="attention-list">
        ${attention("5",t("dashboard.discountApprovals"),t("dashboard.commercialDirector"),"approvals")}
        ${attention("3",t("dashboard.legalReviewContracts"),t("dashboard.legalReview"),"approvals")}
        ${attention("11",t("dashboard.paymentsWeek"),"20–23.09","payments")}
        ${attention("4",t("dashboard.overduePayments"),compactAmd(overdue),"payments")}
        ${attention("7",t("dashboard.reservationsExpire"),t("dashboard.until"),"properties")}
      </div></div>
    </div>
    <div class="grid grid-2 u-mt-16">
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dashboard.recentDeals")}</h2><p>${t("dashboard.recentDealsSub")}</p></div></div><div class="table-wrap"><table class="table"><thead><tr><th>${t("dashboard.col.deal")}</th><th>${t("dashboard.col.client")}</th><th>${t("dashboard.col.property")}</th><th>${t("dashboard.col.amount")}</th></tr></thead><tbody>${deals.map(d=>`<tr data-deal="${d.id}"><td><strong>${d.id}</strong></td><td>${d.clientName}</td><td>${d.propertyLabel}</td><td>${compactAmd(d.amount)}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="card card-pad"><div class="section-title"><div><h2>${t("dashboard.inventory")}</h2><p>${t("dashboard.inventorySub")}</p></div></div><div class="grid grid-2">
        ${inventoryStat(t("dashboard.free"),properties.filter(p=>p.status==="available").length,"success")}
        ${inventoryStat(t("dashboard.reserved"),reserved,"warning")}
        ${inventoryStat(t("dashboard.inContract"),properties.filter(p=>p.status==="contract").length,"info")}
        ${inventoryStat(t("dashboard.sold"),properties.filter(p=>p.status==="sold").length,"neutral")}
      </div></div>
    </div>
  </section>`
}
function metric(l:string,v:string,n:string,i:string){return`<div class="card metric-card"><div class="metric-top"><span>${l}</span><div class="metric-icon">${i}</div></div><div><div class="metric-value">${v}</div><div class="metric-note">${n}</div></div></div>`}
function attention(n:string,title:string,sub:string,route:string){return`<button data-attention="${route}" class="u-reset-button-block"><div class="attention-item"><div class="attention-badge">${n}</div><div class="attention-copy"><strong>${title}</strong><span>${sub}</span></div><div>›</div></div></button>`}
function inventoryStat(label:string,value:number,status:string){return`<div class="meta-box"><span>${label}</span><strong class="u-fs-22">${value}</strong><div class="u-mt-8"><span class="status ${status}">${label}</span></div></div>`}
export function bindDashboard(){document.querySelectorAll("[data-attention]").forEach(el=>el.addEventListener("click",()=>navigate((el as HTMLElement).dataset.attention!)));document.querySelectorAll("[data-goto]").forEach(el=>el.addEventListener("click",()=>navigate((el as HTMLElement).dataset.goto!)));document.querySelectorAll("[data-deal]").forEach(el=>el.addEventListener("click",()=>navigate("deal/"+(el as HTMLElement).dataset.deal)))}
