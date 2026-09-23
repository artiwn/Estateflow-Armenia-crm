import { bankStatementLines, clients, deals, leads } from "../data/mock";
import type { BankStatementLine, Client, Lead } from "../models/types";

export type TabularRow=Record<string,unknown>;
const str=(v:unknown)=>String(v??"").trim();
const num=(v:unknown)=>Number(String(v??"").replace(/[^0-9.\-]/g,""))||0;
const norm=(s:string)=>s.trim().toLowerCase().replace(/[\s_.\-\/]+/g,"");
const pick=(row:TabularRow,keys:string[])=>{const map=new Map(Object.entries(row).map(([k,v])=>[norm(k),v]));for(const k of keys){const v=map.get(norm(k));if(v!==undefined&&str(v)!=="")return v}return""};

function parseCsv(text:string){
  const rows:string[][]=[];let row:string[]=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(ch===','&&!quoted){row.push(field);field=""}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);field="";if(row.some(x=>x.trim()))rows.push(row);row=[]}else field+=ch}row.push(field);if(row.some(x=>x.trim()))rows.push(row);if(!rows.length)return[];const headers=rows[0].map(h=>h.trim());return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
}

export async function readTabularFile(file:File):Promise<TabularRow[]>{
  const ext=file.name.split(".").pop()?.toLowerCase();
  if(ext==="csv"||ext==="txt")return parseCsv(await file.text());
  if(ext==="xlsx"||ext==="xls"){
    const XLSX=await import("xlsx");const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:false});const first=wb.SheetNames?.[0];if(!first)throw new Error("В книге нет листов");return XLSX.utils.sheet_to_json(wb.Sheets[first],{defval:""}) as TabularRow[];
  }
  throw new Error("Поддерживаются CSV, XLSX и XLS");
}

export function normalizeClient(row:TabularRow):Omit<Client,"id"|"activeDeals"|"outstanding">{
  const typeRaw=str(pick(row,["type","client type","тип","տեսակ"])).toLowerCase();
  const type:Client["type"]=typeRaw.includes("foreign")||typeRaw.includes("иностран")||typeRaw.includes("օտար")?"foreign-company":typeRaw.includes("sole")||typeRaw.includes("ип")||typeRaw.includes("անհատ ձեռ")?"sole-proprietor":typeRaw.includes("company")||typeRaw.includes("юр")||typeRaw.includes("ընկեր")||typeRaw.includes("իրավաբ")?"company":"individual";
  const language=(str(pick(row,["language","preferred language","язык","լեզու"])).toUpperCase()||"HY") as Client["preferredLanguage"];
  const country=str(pick(row,["country","citizenship","registration country","страна","гражданство","երկիր","քաղաքացիություն"]))||undefined;
  return{type,name:str(pick(row,["name","client","full name","фио","название","անուն","անվանում"])),phone:str(pick(row,["phone","телефон","հեռախոս"])),email:str(pick(row,["email","e-mail","эл. почта","էլփոստ"])),personalNumber:str(pick(row,["personal number","psn","public service number","соц номер","հանրային ծառայությունների համարանիշ"]))||undefined,taxId:str(pick(row,["tax id","tin","հվհհ","инн"] ))||undefined,verification:"pending",manager:str(pick(row,["manager","responsible","менеджер","պատասխանատու"]))||"Անի Հակոբյան",preferredLanguage:["HY","RU","EN"].includes(language??"")?language:"HY",...(type==="company"||type==="foreign-company"?{countryOfRegistration:country}:{citizenship:country,taxResidency:country}),consentPersonalData:true};
}

export function importClients(rows:TabularRow[],duplicateMode:"skip"|"update"="skip"){
  let added=0,updated=0,skipped=0;const errors:string[]=[];
  rows.forEach((row,index)=>{const c=normalizeClient(row);if(!c.name||!c.phone){errors.push(`Строка ${index+2}: отсутствует имя или телефон`);return}const duplicate=clients.find(x=>(c.phone&&x.phone.replace(/\s/g,"")===c.phone.replace(/\s/g,""))||(c.email&&x.email.toLowerCase()===c.email.toLowerCase()));if(duplicate){if(duplicateMode==="update"){Object.assign(duplicate,c);updated++}else skipped++;return}clients.push({...c,id:`CL-${1000+clients.length+1}`,activeDeals:0,outstanding:0});added++});return{added,updated,skipped,errors};
}

export function normalizeLead(row:TabularRow):Omit<Lead,"id">{
  return{name:str(pick(row,["name","lead","client","фио","անուն"])),phone:str(pick(row,["phone","телефон","հեռախոս"])),email:str(pick(row,["email","e-mail"])),source:str(pick(row,["source","источник","աղբյուր"]))||"i18n:leads.source.import",stage:"new",manager:str(pick(row,["manager","менеджер"]))||"Անի Հակոբյան",budgetFrom:num(pick(row,["budget from","budgetfrom","бюджет от","min budget"]))||40000000,budgetTo:num(pick(row,["budget to","budgetto","бюджет до","max budget"]))||70000000,rooms:str(pick(row,["rooms","комнат","սենյակ"]))||"2–3",district:str(pick(row,["district","район","շրջան"]))||"Yerevan",score:65,lastActivity:"i18n:leads.activity.importNow",nextAction:"i18n:leads.nextAction.initialCall",language:(str(pick(row,["language","язык","լեզու"])).toUpperCase()||"HY") as Lead["language"],notes:str(pick(row,["notes","comment","комментарий","նշում"]))};
}

export function importLeads(rows:TabularRow[],duplicateMode:"skip"|"update"="skip"){
  let added=0,updated=0,skipped=0;const errors:string[]=[];
  rows.forEach((row,index)=>{const l=normalizeLead(row);if(!l.name||!l.phone){errors.push(`Строка ${index+2}: отсутствует имя или телефон`);return}const duplicate=leads.find(x=>x.phone.replace(/\s/g,"")===l.phone.replace(/\s/g,"")||(l.email&&x.email.toLowerCase()===l.email.toLowerCase()));if(duplicate){if(duplicateMode==="update"){Object.assign(duplicate,l);updated++}else skipped++;return}leads.push({...l,id:`LD-2026-${String(100+leads.length+1).padStart(4,"0")}`});added++});return{added,updated,skipped,errors};
}

export function importBankStatement(rows:TabularRow[]){
  let added=0,skipped=0;const errors:string[]=[];
  rows.forEach((row,index)=>{const reference=str(pick(row,["reference","ref","референс","номер","transaction id"]));const amount=num(pick(row,["amount","sum","сумма","գումար"]));const payer=str(pick(row,["payer","sender","плательщик","վճարող"]));if(!reference||!amount||!payer){errors.push(`Строка ${index+2}: нужны reference, amount и payer`);return}if(bankStatementLines.some(x=>x.reference===reference)){skipped++;return}const purpose=str(pick(row,["purpose","description","назначение","նպատակ"]));const explicitDeal=deals.find(d=>purpose.includes(d.id)||purpose.includes(d.propertyLabel.split("·").pop()?.trim()??"__none__"));const rawCurrency=str(pick(row,["currency","ccy","валюта","արժույթ"])).toUpperCase();const currency=(rawCurrency==="USD"||rawCurrency==="EUR"?rawCurrency:"AMD") as BankStatementLine["currency"];const exchangeRate=num(pick(row,["exchange rate","rate","курс","փոխարժեք"]))||undefined;const line:BankStatementLine={id:`BNK-${55020+bankStatementLines.length+1}`,bank:str(pick(row,["bank","банк","բանկ"]))||"i18n:reconciliation.importedBank",bookingDate:str(pick(row,["date","booking date","дата","ամսաթիվ"]))||"i18n:reconciliation.importDate",amount,currency,payer,purpose,reference,matchedDealId:explicitDeal?.id,confidence:explicitDeal?94:0,status:explicitDeal?"suggested":"unmatched",exchangeRate,accountingStatus:"unreviewed"};bankStatementLines.push(line);added++});return{added,skipped,errors};
}
