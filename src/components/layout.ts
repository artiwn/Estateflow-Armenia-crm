import{getLang,setLang,t,type Lang}from"../i18n";
import{navigate,currentRoute}from"../router";
import{renderApp}from"../main";
import{notificationStats}from"../services/notifications";
import{currentRole,platformRoles,roleLabelKey,getRolePolicy,moduleForRoute,canViewModule,landingRoute,setCurrentRole}from"../services/permissions";
import{applyPermissionUi}from"../services/permission-ui";
import{recordAudit}from"../services/audit";

const nav=[
  ["dashboard","home"],["leads","spark"],["clients","users"],["properties","building"],["deals","deal"],["payments","wallet"],["approvals","check"],["tasks","tasks"],
  ["notifications","bell"],["contracts","file"],["legal","legal"],["finance","finance"],["mortgages","mortgage"],["handover","key"],["service","service"],["reports","chart"],["audit","audit"],["admin","admin"]
]as const;

const icon=(name:string)=>{
  const paths:Record<string,string>={
    home:'<path d="M3 10.5 10 4l7 6.5"/><path d="M5 9.5V17h10V9.5"/><path d="M8 17v-5h4v5"/>',
    spark:'<path d="M10 2l1.2 4.2L15 8l-3.8 1.8L10 14l-1.2-4.2L5 8l3.8-1.8L10 2Z"/><path d="M16 12l.7 2.3L19 15l-2.3.7L16 18l-.7-2.3L13 15l2.3-.7L16 12Z"/>',
    users:'<path d="M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2 17c.6-3 2.5-4.5 5.5-4.5S12.4 14 13 17"/><path d="M13 4.5a2.5 2.5 0 0 1 0 5"/><path d="M15 12.5c1.8.5 2.8 1.8 3 4"/>',
    building:'<path d="M4 18V4h8v14"/><path d="M12 8h4v10"/><path d="M7 7h2M7 10h2M7 13h2M14 11h1M14 14h1"/>',
    deal:'<path d="M5 6h10l2 4-7 8-7-8 2-4Z"/><path d="m7 6 3 12 3-12"/>',
    wallet:'<path d="M3 6h12a2 2 0 0 1 2 2v7H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"/><path d="M13 10h4"/>',
    check:'<path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="m6.5 10 2.2 2.2 4.8-5"/>',
    file:'<path d="M5 2h7l3 3v13H5V2Z"/><path d="M12 2v4h4M8 10h5M8 13h5"/>',
    legal:'<path d="M10 2v16M5 5h10"/><path d="m5 5-3 5h6L5 5Zm10 0-3 5h6l-3-5Z"/><path d="M6 18h8"/>',
    key:'<path d="M7.5 13a4.5 4.5 0 1 1 3.7-1.9L9 13.3V16H6.5v2H4v-3.2L7.5 13Z"/>',
    service:'<path d="M10 3a7 7 0 1 0 7 7"/><path d="M10 6v4l2.5 1.5M14 3h3v3"/>',
    finance:'<path d="M3 15.5V9l4-3 4 2 6-5v12.5"/><path d="M3 18h14M5 13h2m3-2h2m3-4h2"/>',
    mortgage:'<path d="M3 10 10 4l7 6"/><path d="M5 9v8h10V9"/><path d="M8 13h4M10 11v4"/>',
    tasks:'<path d="M5 3h10v14H5V3Z"/><path d="M8 3V2h4v1M8 7h4M8 10h4M8 13h4"/><path d="m6.5 7 .6.6 1.1-1.2m-1.7 4 .6.6 1.1-1.2m-1.7 4 .6.6 1.1-1.2"/>',
    chart:'<path d="M3 17V9h3v8H3ZM9 17V4h3v13H9ZM15 17v-6h3v6h-3Z"/>',
    bell:'<path d="M5 14h10l-1.2-2V8a3.8 3.8 0 0 0-7.6 0v4L5 14Z"/><path d="M8.5 16h3"/>',
    audit:'<path d="M4 3h12v14H4V3Z"/><path d="M7 7h6M7 10h6M7 13h4"/><circle cx="14" cy="13" r="2"/>',
    admin:'<path d="M10 2.5 16 5v4.5c0 3.8-2.3 6.4-6 8-3.7-1.6-6-4.2-6-8V5l6-2.5Z"/><path d="M7.5 10 9 11.5l3.5-3.5"/>'
  };
  return `<svg viewBox="0 0 20 20" aria-hidden="true">${paths[name]??paths.home}</svg>`;
};

export function layout(content:string){
  const rawRoute=currentRoute().split("?")[0].split("/")[0]||"dashboard";const route=({"client":"clients","property":"properties","deal":"deals","contract":"contracts","mortgage":"mortgages","handover-case":"handover","inspection":"handover","warranty":"service","price-lists":"properties","poa":"legal","securities":"finance","admin":"admin"}as Record<string,string>)[rawRoute]??rawRoute;
  const role=currentRole(),notificationState=notificationStats(role),policy=getRolePolicy(role),activeModule=moduleForRoute(currentRoute()),access=policy.modules[activeModule];
  const visibleNav=nav.filter(([k])=>canViewModule(moduleForRoute(k),role));
  const salesNav=visibleNav.filter(([k])=>["dashboard","leads","clients","properties","deals","payments","approvals","tasks","notifications"].includes(k));
  const operationsNav=visibleNav.filter(([k])=>!["dashboard","leads","clients","properties","deals","payments","approvals","tasks","notifications","audit","admin"].includes(k));
  const adminNav=visibleNav.filter(([k])=>["audit","admin"].includes(k));
  return`<div class="app-shell">
    <aside class="sidebar" id="sidebarNav" aria-label="${t("nav.mobileMenu")}">
      <div class="brand"><div class="brand-mark">EF</div><div class="brand-copy"><strong>EstateFlow</strong><span>${t("brand.subtitle")}</span></div><button type="button" class="icon-btn sidebar-close" id="sidebarClose" aria-label="${t("nav.closeMenu")}">×</button></div>
      ${salesNav.length?`<div class="nav-group"><div class="nav-label">${t("nav.sales")}</div>${salesNav.map(([k,i])=>`<a class="nav-link ${route===k?"active":""}" href="#/${k}" data-route="${k}" ${route===k?'aria-current="page"':""}><span class="nav-icon">${icon(i)}</span><span>${t(k)}</span></a>`).join("")}</div>`:""}
      ${operationsNav.length?`<div class="nav-group"><div class="nav-label">${t("nav.operations")}</div>${operationsNav.map(([k,i])=>`<a class="nav-link ${route===k?"active":""}" href="#/${k}" data-route="${k}" ${route===k?'aria-current="page"':""}><span class="nav-icon">${icon(i)}</span><span>${t(k)}</span></a>`).join("")}</div>`:""}
      ${adminNav.length?`<div class="nav-group nav-admin-group"><div class="nav-label">${t("v55.audit.governance")}</div>${adminNav.map(([k,i])=>`<a class="nav-link ${route===k?"active":""}" href="#/${k}" data-route="${k}" ${route===k?'aria-current="page"':""}><span class="nav-icon">${icon(i)}</span><span>${k==="audit"?t("v55.audit.nav"):t("v54.module.administration")}</span></a>`).join("")}</div>`:""}
      <div class="sidebar-footer"><div class="demo-chip">${t("sidebar.demo")}</div><br>${t("sidebar.platform")}<br>${t("sidebar.market")}</div>
    </aside>
    <main class="main">
      <header class="topbar">
        <button type="button" class="icon-btn mobile-menu-toggle" id="mobileMenuToggle" aria-label="${t("nav.openMenu")}" aria-controls="sidebarNav" aria-expanded="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg></button>
        <div class="search"><span><svg viewBox="0 0 20 20"><circle cx="9" cy="9" r="5"/><path d="m13 13 4 4"/></svg></span><input id="globalSearch" aria-label="${t("search")}" placeholder="${t("search")}"></div>
        <div class="topbar-actions">
          <span class="current-access-chip ${access}"><i>${access==="manage"?"⌘":access==="edit"?"✎":access==="view"?"◉":"×"}</i><span><small>${t("v54.currentAccess")}</small><strong>${t(`v54.access.${access}`)}</strong></span></span>
          <select id="roleSelect" class="field compact role-select" aria-label="${t("role.label")}">${platformRoles.map(r=>`<option value="${r}" ${role===r?"selected":""}>${roleLabel(r)}</option>`).join("")}</select>
          <select id="langSelect" class="field compact" aria-label="${t("language.label")}"><option value="ru" ${getLang()==="ru"?"selected":""}>RU</option><option value="hy" ${getLang()==="hy"?"selected":""}>HY</option><option value="en" ${getLang()==="en"?"selected":""}>EN</option></select>
          <button class="icon-btn" id="notifications" aria-label="${t("notifications.label")}" title="${t("notifications.label")}"><svg viewBox="0 0 20 20"><path d="M5 14h10l-1.2-2V8a3.8 3.8 0 0 0-7.6 0v4L5 14Z"/><path d="M8.5 16h3"/></svg>${notificationState.unread?`<span class="topbar-notification-badge ${notificationState.critical?"critical":""}">${notificationState.unread>99?"99+":notificationState.unread}</span>`:""}</button><button class="icon-btn" id="logoutButton" aria-label="${t("logout.label")}" title="${t("logout.label")}"><svg viewBox="0 0 20 20"><path d="M8 4H4v12h4"/><path d="M11 7l4 3-4 3M15 10H7"/></svg></button>
          <div class="user-chip"><div class="user-avatar">AH</div><div class="user-copy"><strong class="user-name">Անի Հակոբյան</strong><div class="user-role">${roleLabel(role)}</div></div></div>
        </div>
      </header>${content}
    </main><button type="button" class="sidebar-backdrop" id="sidebarBackdrop" aria-label="${t("nav.closeMenu")}" tabindex="-1"></button><div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div><div id="modalRoot" class="modal-root" aria-hidden="true" inert></div>
  </div>`
}

const roleLabel=(role:any)=>t(roleLabelKey(role));
let mobileNavKeyHandler:((event:KeyboardEvent)=>void)|null=null;
const setMobileNav=(open:boolean)=>{
  const sidebar=document.querySelector<HTMLElement>("#sidebarNav"),backdrop=document.querySelector<HTMLElement>("#sidebarBackdrop"),toggle=document.querySelector<HTMLButtonElement>("#mobileMenuToggle");
  sidebar?.classList.toggle("open",open);backdrop?.classList.toggle("open",open);toggle?.setAttribute("aria-expanded",String(open));document.body.classList.toggle("nav-open",open);
  if(open)requestAnimationFrame(()=>document.querySelector<HTMLElement>("#sidebarNav .nav-link.active,#sidebarNav .nav-link")?.focus({preventScroll:true}));
};
export function bindLayoutEvents(){
  document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();setMobileNav(false);navigate((el as HTMLElement).dataset.route!)}));
  document.querySelector("#mobileMenuToggle")?.addEventListener("click",()=>setMobileNav(true));
  document.querySelector("#sidebarClose")?.addEventListener("click",()=>setMobileNav(false));
  document.querySelector("#sidebarBackdrop")?.addEventListener("click",()=>setMobileNav(false));
  mobileNavKeyHandler=(event:KeyboardEvent)=>{if(event.key==="Escape"&&document.querySelector("#sidebarNav.open")){event.preventDefault();setMobileNav(false);document.querySelector<HTMLButtonElement>("#mobileMenuToggle")?.focus()}};
  document.addEventListener("keydown",mobileNavKeyHandler);
  document.querySelector<HTMLSelectElement>("#langSelect")?.addEventListener("change",e=>{setLang((e.target as HTMLSelectElement).value as Lang);renderApp()});
  document.querySelector<HTMLSelectElement>("#roleSelect")?.addEventListener("change",e=>{const role=(e.target as HTMLSelectElement).value as any,previous=currentRole();recordAudit({module:"administration",action:"access",entityType:"role",entityId:String(role),entityLabel:`Role · ${role}`,route:"audit",field:"Active role",oldValue:previous,newValue:role,note:"Demo workspace role switched.",actorRole:previous,severity:"info"});setCurrentRole(role);toastLocalized(t("toast.roleMode",{role:roleLabel(role)}));navigate(landingRoute(role))});
  document.querySelector("#notifications")?.addEventListener("click",()=>navigate("notifications"));
  document.querySelector("#logoutButton")?.addEventListener("click",()=>{sessionStorage.removeItem("estateflowAuthenticated");renderApp()});
  document.querySelector<HTMLInputElement>("#globalSearch")?.addEventListener("keydown",e=>{if(e.key==="Enter"){const q=(e.target as HTMLInputElement).value.trim();if(q)navigate("search?q="+encodeURIComponent(q))}})
}

const keyboardClickableSelector=[
  ".lead-card[data-lead]","tr[data-client]","tr[data-deal]","tr[data-contract]","tr[data-handover]","tr[data-warranty]","tr[data-mortgage-row]",
  ".legal-case[data-deal]",".legal-case[data-legal-case]","tr[data-poa-id]",".legal-module-card[id]",".finance-list-row[data-deal-fin]",".finance-list-row[data-mortgage]"
].join(",");
export function bindUiEnhancements(){
  document.querySelectorAll<HTMLElement>(keyboardClickableSelector).forEach(el=>{
    if(!el.hasAttribute("tabindex"))el.tabIndex=0;if(!el.hasAttribute("role"))el.setAttribute("role","link");el.classList.add("keyboard-clickable");
    el.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      const target=event.target as HTMLElement;if(target.closest("button,a,input,select,textarea,label"))return;
      event.preventDefault();el.click();
    });
  });
  applyPermissionUi();
}
let toastTimer:number|undefined;
function showToast(message:string){const el=document.querySelector<HTMLElement>("#toast");if(!el)return;el.textContent=message;el.classList.add("show");if(toastTimer)window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el.classList.remove("show"),2200)}
/** All UI callers must pass an already-localized string (normally t("...")). */
export function toastLocalized(message:string){showToast(message)}

let lastFocusedElement:HTMLElement|null=null;
let modalKeyHandler:((event:KeyboardEvent)=>void)|null=null;
const focusableSelector='button:not([disabled]),a[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function openModal(title:string,body:string,footer:string=""){
 const root=document.querySelector<HTMLElement>("#modalRoot");if(!root)return;
 if(root.classList.contains("open"))closeModal(false);
 lastFocusedElement=document.activeElement instanceof HTMLElement?document.activeElement:null;
 root.innerHTML=`<div class="modal-backdrop" data-modal-close></div><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><div><span class="eyebrow">${t("modal.demoAction")}</span><h2 id="modalTitle">${title}</h2></div><button type="button" class="icon-btn" data-modal-close aria-label="${t("modal.close")}">×</button></header><div class="modal-body">${body}</div>${footer?`<footer class="modal-footer">${footer}</footer>`:""}</section>`;
 root.inert=false;root.removeAttribute("inert");root.setAttribute("aria-hidden","false");root.classList.add("open");document.body.classList.add("modal-open");
 root.querySelectorAll("[data-modal-close]").forEach(el=>el.addEventListener("click",()=>closeModal()));
 modalKeyHandler=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();closeModal();return}
   if(event.key!=="Tab")return;
   const items=[...root.querySelectorAll<HTMLElement>(focusableSelector)].filter(el=>el.offsetParent!==null&&!el.hasAttribute("disabled"));
   if(!items.length){event.preventDefault();return}
   const first=items[0],last=items[items.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 };
 document.addEventListener("keydown",modalKeyHandler);
 requestAnimationFrame(()=>{const target=root.querySelector<HTMLElement>('[autofocus],input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled])');target?.focus({preventScroll:true})});
}

/** Semantic alias: title/body/footer must already be localized. */
export function openLocalizedModal(title:string,body:string,footer:string=""){return openModal(title,body,footer)}
export function closeModal(restoreFocus=true){
 const root=document.querySelector<HTMLElement>("#modalRoot");if(!root)return;
 if(modalKeyHandler){document.removeEventListener("keydown",modalKeyHandler);modalKeyHandler=null}
 if(root.contains(document.activeElement)){
   const fallback=restoreFocus&&lastFocusedElement?.isConnected?lastFocusedElement:document.querySelector<HTMLElement>(".nav-link.active");
   fallback?.focus({preventScroll:true});
   if(root.contains(document.activeElement))(document.activeElement as HTMLElement|null)?.blur();
 }
 root.classList.remove("open");root.inert=true;root.setAttribute("inert","");root.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");
 lastFocusedElement=null;
 setTimeout(()=>{if(!root.classList.contains("open"))root.innerHTML=""},180)
}
export function formValue(form:HTMLFormElement,name:string){return String(new FormData(form).get(name)??"").trim()}

export function cleanupTransientUi(){if(document.querySelector<HTMLElement>("#modalRoot")?.classList.contains("open"))closeModal(false);if(mobileNavKeyHandler){document.removeEventListener("keydown",mobileNavKeyHandler);mobileNavKeyHandler=null}document.body.classList.remove("nav-open","modal-open");if(toastTimer){window.clearTimeout(toastTimer);toastTimer=undefined}}
