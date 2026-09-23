import{getLang,setLang,t,type Lang}from"../i18n";

export function loginPage(){return`<main class="login-shell">
  <section class="login-visual" aria-hidden="true">
    <div class="login-orbit orbit-one"></div><div class="login-orbit orbit-two"></div>
    <div class="login-brand"><div class="login-brand-mark">EF</div><div><strong>EstateFlow</strong><span>${t("brand.subtitle")}</span></div></div>
    <div class="login-story">
      <span class="login-kicker">${t("login.eyebrow")}</span>
      <h1>${t("login.workspaceLine1")}<br><em>${t("login.workspaceLine2")}</em></h1>
      <p>${t("login.story")}</p>
      <div class="login-preview-grid"><div><span>01</span><strong>${t("login.crm360")}</strong><small>${t("clients")} · ${t("deals")} · ${t("contracts")}</small></div><div><span>02</span><strong>${t("login.finance")}</strong><small>${t("payments")} · ${t("mortgages")}</small></div><div><span>03</span><strong>${t("login.operations")}</strong><small>${t("handover")} · ${t("service")}</small></div></div>
    </div>
    <div class="login-visual-footer">EstateFlow · ${t("login.country")} · 2026</div>
  </section>
  <section class="login-panel">
    <div class="login-lang"><span>${t("login.lang")}</span><div class="login-lang-switch">${(["hy","ru","en"] as Lang[]).map(l=>`<button type="button" data-login-lang="${l}" class="${getLang()===l?"active":""}">${l.toUpperCase()}</button>`).join("")}</div></div>
    <div class="login-card-wrap">
      <div class="login-card">
        <div class="login-mobile-brand"><div class="login-brand-mark">EF</div><strong>EstateFlow</strong></div>
        <span class="eyebrow">${t("login.eyebrow")}</span><h2>${t("login.title")}</h2><p class="login-subtitle">${t("login.subtitle")}</p>
        <form id="loginForm" class="login-form" novalidate>
          <label><span>${t("login.email")}</span><div class="login-input"><svg viewBox="0 0 20 20"><path d="M3 5h14v10H3V5Z"/><path d="m4 6 6 5 6-5"/></svg><input name="email" type="email" autocomplete="username" value="demo@estateflow.am" required></div></label>
          <label><span>${t("login.password")}</span><div class="login-input"><svg viewBox="0 0 20 20"><rect x="4" y="8" width="12" height="9" rx="2"/><path d="M7 8V6a3 3 0 0 1 6 0v2"/></svg><input id="loginPassword" name="password" type="password" autocomplete="current-password" value="demo2026" required><button type="button" class="password-toggle" id="passwordToggle" aria-label="${t("login.showPassword")}">⌁</button></div></label>
          <label class="login-check"><input type="checkbox" checked><span>${t("login.remember")}</span></label>
          <div id="loginError" class="login-error" role="alert" aria-live="polite"></div>
          <button class="login-submit" type="submit"><span>${t("login.submit")}</span><span>→</span></button>
        </form>
        <div class="demo-access"><div class="demo-access-icon">D</div><div><strong>${t("login.demoTitle")}</strong><p>${t("login.demoText")}</p><code>${t("login.demoEmail")}</code><code>${t("login.demoPassword")}</code></div></div>
      </div>
      <div class="login-security"><span>◉</span>${t("login.security")}</div>
    </div>
  </section>
</main>`}

export function bindLogin(onSuccess:()=>void,onLanguage:()=>void){
  document.querySelectorAll<HTMLElement>("[data-login-lang]").forEach(el=>el.addEventListener("click",()=>{setLang(el.dataset.loginLang as Lang);onLanguage()}));
  const pass=document.querySelector<HTMLInputElement>("#loginPassword");const toggle=document.querySelector<HTMLButtonElement>("#passwordToggle");
  toggle?.addEventListener("click",()=>{if(!pass)return;const reveal=pass.type==="password";pass.type=reveal?"text":"password";toggle.setAttribute("aria-label",t(reveal?"login.hidePassword":"login.showPassword"));toggle.textContent=reveal?"×":"⌁"});
  document.querySelector<HTMLFormElement>("#loginForm")?.addEventListener("submit",e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement;const data=new FormData(form);const email=String(data.get("email")??"").trim().toLowerCase();const password=String(data.get("password")??"");const error=document.querySelector<HTMLElement>("#loginError");if(email==="demo@estateflow.am"&&password==="demo2026"){sessionStorage.setItem("estateflowAuthenticated","1");onSuccess();return}if(error)error.textContent=t("login.error")});
}
