import {deals,exchangeRates,financialSecurities,handoverCases,paymentReceipts,paymentSchedule} from "../data/mock";
import type {BankStatementLine,Currency,PaymentReceipt,PaymentReceiptAllocation,PaymentScheduleItem} from "../models/types";

export const DEMO_FINANCE_DATE=new Date(2026,8,22,12,0,0);
const parseDMY=(value:string)=>{const [d,m,y]=value.slice(0,10).split(".").map(Number);return new Date(y,m-1,d,12,0,0)};
const roundMoney=(value:number,currency:Currency)=>currency==="AMD"?Math.round(value):Math.round(value*100)/100;

export function activeExchangeRate(currency:Currency){return exchangeRates.find(x=>x.currency===currency&&x.status==="active")?.rateToAMD??1}
export function convertCurrency(amount:number,from:Currency,to:Currency,sourceRate?:number){if(from===to)return roundMoney(amount,to);const fromRate=from==="AMD"?1:(sourceRate??activeExchangeRate(from));const amd=amount*fromRate;const toRate=to==="AMD"?1:activeExchangeRate(to);return roundMoney(amd/toRate,to)}
export const toAMD=(amount:number,currency:Currency,sourceRate?:number)=>Math.round(amount*(currency==="AMD"?1:(sourceRate??activeExchangeRate(currency))));
export const scheduleCurrency=(row:PaymentScheduleItem):Currency=>row.currency??deals.find(d=>d.id===row.dealId)?.currency??"AMD";
export const exchangeRuleLabelKey=(rule?:PaymentScheduleItem["exchangeRateRule"])=>`v50.fxRule.${rule??"payment-date"}`;

export function penaltyFor(row:PaymentScheduleItem){
  const outstanding=Math.max(0,row.amount-row.paid),rate=row.penaltyRateDaily??0,grace=row.penaltyGraceDays??0;
  if(!outstanding||!rate)return{days:0,chargeableDays:0,rate,principal:outstanding,amount:0};
  const due=parseDMY(row.dueDate),days=Math.max(0,Math.floor((DEMO_FINANCE_DATE.getTime()-due.getTime())/86400000));
  const chargeableDays=Math.max(0,days-grace),currency=scheduleCurrency(row);
  return{days,chargeableDays,rate,principal:outstanding,amount:roundMoney(outstanding*(rate/100)*chargeableDays,currency)};
}
export function dealFinancialSummary(dealId:string){
  const rows=paymentSchedule.filter(x=>x.dealId===dealId),deal=deals.find(x=>x.id===dealId),currency=deal?.currency??"AMD";
  const scheduled=rows.reduce((s,x)=>s+convertCurrency(x.amount,scheduleCurrency(x),currency),0);
  const paid=rows.reduce((s,x)=>s+convertCurrency(x.paid,scheduleCurrency(x),currency),0);
  const penalty=rows.reduce((s,x)=>s+convertCurrency(penaltyFor(x).amount,scheduleCurrency(x),currency),0);
  const advance=paymentReceipts.filter(x=>x.dealId===dealId&&x.accountingStatus==="confirmed").reduce((s,x)=>s+convertCurrency(x.unallocatedAmount,x.dealCurrency,currency),0);
  return{currency,scheduled,paid,balance:Math.max(0,scheduled-paid),penalty,advance,completion:scheduled?Math.round(paid/scheduled*100):0};
}
export function portfolioFinanceSummary(){
  const scheduledAMD=paymentSchedule.reduce((s,x)=>s+toAMD(x.amount,scheduleCurrency(x)),0);
  const paidAMD=paymentSchedule.reduce((s,x)=>s+toAMD(x.paid,scheduleCurrency(x)),0);
  const penaltyAMD=paymentSchedule.reduce((s,x)=>s+toAMD(penaltyFor(x).amount,scheduleCurrency(x)),0);
  const advancesAMD=paymentReceipts.filter(x=>x.accountingStatus==="confirmed").reduce((s,x)=>s+toAMD(x.unallocatedAmount,x.dealCurrency),0);
  const securityAMD=financialSecurities.filter(x=>["active","expiring"].includes(x.status)).reduce((s,x)=>s+toAMD(x.amount,x.currency),0);
  return{scheduledAMD,paidAMD,openAMD:Math.max(0,scheduledAMD-paidAMD),penaltyAMD,advancesAMD,securityAMD,completion:scheduledAMD?Math.round(paidAMD/scheduledAMD*100):0};
}

function updateDealClearance(dealId:string){const rows=paymentSchedule.filter(x=>x.dealId===dealId),cleared=rows.length>0&&rows.every(x=>x.paid>=x.amount);const h=handoverCases.find((x:any)=>x.dealId===dealId);if(h)h.financialClearance=cleared;const d=deals.find(x=>x.id===dealId);if(d&&cleared)d.nextAction="i18n:dealDetail.next.financialObligationsCompleted"}

export function allocateDealAmount(dealId:string,amount:number,currency:Currency,receipt?:PaymentReceipt){
  let rest=amount;const allocations:PaymentReceiptAllocation[]=[];
  const rows=paymentSchedule.filter(p=>p.dealId===dealId&&p.paid<p.amount).sort((a,b)=>a.sequence-b.sequence);
  for(const row of rows){if(rest<=0)break;const rowCurrency=scheduleCurrency(row);const availableRowCurrency=convertCurrency(rest,currency,rowCurrency);const open=row.amount-row.paid;const add=Math.min(open,availableRowCurrency);if(add<=0)continue;row.paid=roundMoney(row.paid+add,rowCurrency);row.status=row.paid>=row.amount?"paid":row.paid>0?"partial":row.status;const usedInSource=convertCurrency(add,rowCurrency,currency);rest=Math.max(0,roundMoney(rest-usedInSource,currency));allocations.push({id:`RCA-${Date.now()}-${allocations.length+1}`,scheduleItemId:row.id,dealId:row.dealId,amount:add,currency:rowCurrency})}
  if(receipt){receipt.allocations.push(...allocations);const allocatedInReceiptCurrency=amount-rest;receipt.allocatedAmount=roundMoney(receipt.allocatedAmount+allocatedInReceiptCurrency,receipt.dealCurrency);receipt.unallocatedAmount=roundMoney(rest,receipt.dealCurrency);receipt.status=receipt.unallocatedAmount>0?(receipt.allocatedAmount>0?"partially-allocated":"advance"):"allocated"}
  updateDealClearance(dealId);return{rest,allocations};
}

export function confirmBankReceipt(line:BankStatementLine){
  if(!line.matchedDealId)throw new Error("deal-required");
  if(line.status==="confirmed"&&line.receiptId)return paymentReceipts.find(x=>x.id===line.receiptId)??null;
  const deal=deals.find(x=>x.id===line.matchedDealId);if(!deal)throw new Error("deal-not-found");
  const rate=line.currency==="AMD"?1:(line.exchangeRate??activeExchangeRate(line.currency));
  const dealAmount=convertCurrency(line.amount,line.currency,deal.currency,rate);
  const receipt:PaymentReceipt={id:`RCPT-${line.id.replace("BNK-","")}`,bankLineId:line.id,dealId:deal.id,receivedAt:line.bookingDate,payer:line.payer,bank:line.bank,reference:line.reference,sourceAmount:line.amount,sourceCurrency:line.currency,dealAmount,dealCurrency:deal.currency,exchangeRate:rate,allocatedAmount:0,unallocatedAmount:dealAmount,status:"advance",accountingStatus:"confirmed",allocations:[],note:line.purpose};
  paymentReceipts.push(receipt);allocateDealAmount(deal.id,dealAmount,deal.currency,receipt);line.status="confirmed";line.accountingStatus="confirmed";line.receiptId=receipt.id;return receipt;
}

export function candidateSchedulesForAdvance(receiptId:string){
  const receipt=paymentReceipts.find(x=>x.id===receiptId);if(!receipt)return[];const origin=deals.find(x=>x.id===receipt.dealId);if(!origin)return[];
  const clientDealIds=new Set(deals.filter(x=>x.clientId===origin.clientId).map(x=>x.id));
  return paymentSchedule.filter(x=>clientDealIds.has(x.dealId)&&x.paid<x.amount).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
}
export function allocateAdvance(receiptId:string,scheduleItemId:string,targetAmount:number){
  const receipt=paymentReceipts.find(x=>x.id===receiptId),row=paymentSchedule.find(x=>x.id===scheduleItemId);if(!receipt||!row||targetAmount<=0)return false;
  const rowCurrency=scheduleCurrency(row),needed=Math.max(0,row.amount-row.paid),add=Math.min(targetAmount,needed);const costInReceiptCurrency=convertCurrency(add,rowCurrency,receipt.dealCurrency);
  if(costInReceiptCurrency>receipt.unallocatedAmount+0.0001)return false;
  row.paid=roundMoney(row.paid+add,rowCurrency);row.status=row.paid>=row.amount?"paid":"partial";receipt.allocations.push({id:`RCA-${Date.now()}-${receipt.allocations.length+1}`,scheduleItemId:row.id,dealId:row.dealId,amount:add,currency:rowCurrency});receipt.allocatedAmount=roundMoney(receipt.allocatedAmount+costInReceiptCurrency,receipt.dealCurrency);receipt.unallocatedAmount=roundMoney(Math.max(0,receipt.unallocatedAmount-costInReceiptCurrency),receipt.dealCurrency);receipt.status=receipt.unallocatedAmount>0?"partially-allocated":"allocated";updateDealClearance(row.dealId);return true;
}
export function refundAdvance(receiptId:string,amount:number){const receipt=paymentReceipts.find(x=>x.id===receiptId);if(!receipt||amount<=0||amount>receipt.unallocatedAmount)return false;receipt.unallocatedAmount=roundMoney(receipt.unallocatedAmount-amount,receipt.dealCurrency);receipt.refundedAmount=roundMoney((receipt.refundedAmount??0)+amount,receipt.dealCurrency);receipt.status=receipt.unallocatedAmount>0?"advance":receipt.allocatedAmount>0?"allocated":"refunded";receipt.note=`${receipt.note??""}${receipt.note?" · ":""}Refund recorded`;return true}

export function updateExchangeRate(currency:Currency,rateToAMD:number,source:string){if(currency==="AMD")return false;const current=exchangeRates.find(x=>x.currency===currency&&x.status==="active");if(current){current.status="archived"}exchangeRates.push({id:`FX-${currency}-${Date.now()}`,currency,rateToAMD,effectiveDate:"23.09.2026",source,status:"active",updatedBy:"Finance"});return true}
