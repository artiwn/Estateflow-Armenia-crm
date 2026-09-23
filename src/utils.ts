import{locale,t}from"./i18n";
import type{Currency}from"./models/types";
const currencySymbol:Record<Currency,string>={AMD:"֏",USD:"$",EUR:"€"};
export const money=(v:number,currency:Currency="AMD")=>{const digits=currency==="AMD"?0:2;return`${new Intl.NumberFormat(locale(),{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(v)} ${currencySymbol[currency]}`};
export const amd=(v:number)=>money(v,"AMD");
export const compactAmd=(v:number)=>v>=1e9?`${(v/1e9).toFixed(2)} ${t("abbr.billion")} ֏`:v>=1e6?`${(v/1e6).toFixed(1)} ${t("abbr.million")} ֏`:amd(v);
export const initials=(n:string)=>n.trim().split(/\s+/).slice(0,2).map(p=>p[0]??"").join("").toUpperCase();
export const escapeHtml=(v:string)=>v.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]!));

/**
 * Accepts both ISO timestamps and the human-readable legacy timestamps used by
 * prototype seed data (for example "14.09.2026 · 12:10"). Invalid values are
 * returned as undefined instead of ever reaching Intl.DateTimeFormat.
 */
export const parsePlatformDate=(value?:string)=>{
  if(!value)return undefined;
  const raw=value.trim();
  const native=new Date(raw);
  if(!Number.isNaN(native.getTime()))return native;
  const match=raw.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?(?:\s*[·,]\s*|\s+)?(\d{1,2})?:?(\d{2})?$/);
  if(!match)return undefined;
  const now=new Date(),day=Number(match[1]),month=Number(match[2]),year=Number(match[3]??now.getFullYear()),hour=Number(match[4]??0),minute=Number(match[5]??0);
  const parsed=new Date(year,month-1,day,hour,minute,0,0);
  if(parsed.getFullYear()!==year||parsed.getMonth()!==month-1||parsed.getDate()!==day)return undefined;
  return parsed;
};


/**
 * Domain values are stored in English-like machine codes (e.g. "reserved", "in-progress").
 * They must never be translated by matching the raw visible text. Instead they are resolved
 * through stable i18n keys such as status.reserved or enum.priority.high.
 */
const translated=(key:string,fallback:string)=>{const value=t(key);return value===key?fallback:value};
export const statusLabel=(status:string)=>translated(`status.${status}`,status);
export const enumLabel=(group:string,value:string)=>translated(`enum.${group}.${value}`,value);
export const clientTypeLabel=(value:string)=>enumLabel("clientType",value);
export const propertyTypeLabel=(value:string)=>enumLabel("propertyType",value);
export const financingTypeLabel=(value:string)=>enumLabel("financingType",value);
export const paymentSourceLabel=(value:string)=>enumLabel("paymentSource",value);
export const priorityLabel=(value:string)=>enumLabel("priority",value);
export const severityLabel=(value:string)=>enumLabel("severity",value);
export const channelLabel=(value:string)=>enumLabel("channel",value);

// Kept for backwards compatibility while pages are migrated one by one.
export const statusText:Record<string,string>=new Proxy({} as Record<string,string>,{get:(_target,prop:string)=>statusLabel(prop)});
export const statusClass:Record<string,string>={
  verified:"success",paid:"success",available:"success","returned-to-sale":"success",approved:"success",confirmed:"success",funded:"success",resolved:"success",qualified:"success",active:"success",clear:"success",valid:"success",accepted:"success",converted:"success",signed:"success",registered:"success",completed:"success","handed-over":"success",allocated:"success",refunded:"success",released:"success",
  pending:"warning",advance:"warning","partially-allocated":"warning",review:"warning",offered:"warning","pre-reserved":"warning",reserved:"warning",application:"warning",reservation:"warning",approval:"warning",due:"warning",documents:"warning",suggested:"warning",readiness:"warning",defects:"warning","waiting-client":"warning",expiring:"warning","additional-documents":"warning","legal-review":"warning","client-review":"warning",signature:"warning",notary:"warning",
  overdue:"danger",partial:"danger",returned:"danger",cancelled:"danger",suspended:"danger",revoked:"danger",rejected:"danger",declined:"danger",unmatched:"danger",open:"danger",blocked:"danger",expired:"danger",missing:"danger",
  contract:"info","contract-preparation":"info","partially-paid":"info",payment:"info",registration:"info",handover:"info","bank-review":"info",matched:"info",inspection:"info","ready-for-check":"info",new:"info",viewing:"info",submitted:"info",uploaded:"info",
  qualification:"neutral",offer:"neutral",draft:"neutral",future:"neutral",closed:"neutral",archived:"neutral",current:"neutral",preparation:"neutral",created:"neutral","data-review":"neutral",unavailable:"neutral",sold:"neutral",
  contracting:"accent",reinspection:"accent",acceptance:"accent",assigned:"accent"
};
export const badge=(s:string)=>`<span class="status ${statusClass[s]??"neutral"}">${statusLabel(s)}</span>`;
