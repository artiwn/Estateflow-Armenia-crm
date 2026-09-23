import type {Deal,PowerOfAttorney,PowerOfAttorneyAction,PropertyUnit} from "../models/types";
import {t} from "../i18n";

export const POA_ACTIONS:PowerOfAttorneyAction[]=["sign-contract","notary","registration","submit-documents","handover","payment-schedule","price-change","receive-funds"];

export const poaActionLabel=(action:PowerOfAttorneyAction)=>t(`v43.poa.action.${action}`);
export const poaUsable=(poa:PowerOfAttorney)=>["active","expiring"].includes(poa.status)&&poa.verificationStatus==="verified";

export type AuthorityResult={ok:boolean;title:string;message:string;poa?:PowerOfAttorney;missingAction?:boolean;missingProperties?:string[]};
export function validateAuthority(deal:Deal|undefined,poa:PowerOfAttorney|undefined,action:PowerOfAttorneyAction,propertyIds?:string[]):AuthorityResult{
  if(!deal)return{ok:false,title:t("v43.authority.noDeal"),message:t("v43.authority.noDealText")};
  if(!poa)return{ok:true,title:t("v43.authority.inPerson"),message:t("v43.authority.inPersonText")};
  if(!poaUsable(poa))return{ok:false,title:t("v43.authority.invalid"),message:t("v43.authority.invalidText",{status:t(`status.${poa.status}`) }),poa};
  if(!poa.allowedActions.includes(action))return{ok:false,title:t("v43.authority.insufficient"),message:t("v43.authority.missingAction",{action:poaActionLabel(action)}),poa,missingAction:true};
  const targets=propertyIds?.length?propertyIds:(deal.propertyIds?.length?deal.propertyIds:[deal.propertyId]);
  const missing=targets.filter(id=>!poa.allowedPropertyIds.includes(id));
  if(missing.length)return{ok:false,title:t("v43.authority.insufficient"),message:t("v43.authority.missingProperty"),poa,missingProperties:missing};
  return{ok:true,title:t("v43.authority.valid"),message:t("v43.authority.validText",{action:poaActionLabel(action)}),poa};
}

export function authorityCoverage(poa:PowerOfAttorney,properties:PropertyUnit[]){
  return poa.allowedPropertyIds.map(id=>properties.find(p=>p.id===id)).filter(Boolean) as PropertyUnit[];
}
