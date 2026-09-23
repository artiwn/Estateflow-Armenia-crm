export type OfferPaymentPlan="30-70"|"installment12"|"mortgage";
export type OfferLifecycleStatus="draft"|"approved"|"sent"|"viewed"|"accepted"|"rejected"|"expired"|"cancelled";
export type ReservationLifecycleStatus="draft"|"active"|"cancelled"|"released"|"expired"|"converted";

export interface SalesFlowEvent{
  id:string;
  at:string;
  actor:string;
  kind:"offer"|"reservation";
  status:string;
  note:string;
}

export interface LeadSalesFlowState{
  selectedPropertyIds:string[];
  paymentPlan:OfferPaymentPlan;
  discountPercent:number;
  offerSent:boolean;
  offerStatus:OfferLifecycleStatus;
  offerCreatedAt:string;
  offerValidUntil:string;
  offerViewedAt?:string;
  offerAcceptedAt?:string;
  offerClosedReason?:string;
  reservationPaid:boolean;
  reservedPropertyIds:string[];
  reservationStatus:ReservationLifecycleStatus;
  reservationCreatedAt?:string;
  reservationExpiresAt?:string;
  reservationExtensionCount:number;
  reservationClosedReason?:string;
  history:SalesFlowEvent[];
}

const states=new Map<string,LeadSalesFlowState>();
const isoAfter=(hours:number)=>new Date(Date.now()+hours*60*60*1000).toISOString();
const makeId=()=>`EV-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

function addEvent(state:LeadSalesFlowState,kind:"offer"|"reservation",status:string,note:string,actor="Sales Manager"){
  state.history.unshift({id:makeId(),at:new Date().toISOString(),actor,kind,status,note});
}

export function getSalesFlowState(leadId:string,suggestedPropertyIds:string[]=[],initialLeadStage?:string){
  let state=states.get(leadId);
  if(!state){
    const seededOffer=initialLeadStage==="offer"||initialLeadStage==="reservation";
    const seededReservation=initialLeadStage==="reservation";
    const now=new Date().toISOString();
    state={
      selectedPropertyIds:[...suggestedPropertyIds],paymentPlan:"30-70",discountPercent:3,
      offerSent:seededOffer,offerStatus:seededReservation?"accepted":seededOffer?"sent":"draft",offerCreatedAt:now,offerValidUntil:isoAfter(120),
      offerViewedAt:undefined,offerAcceptedAt:seededReservation?now:undefined,
      reservationPaid:false,reservedPropertyIds:[],reservationStatus:"draft",reservationCreatedAt:seededReservation?now:undefined,reservationExpiresAt:seededReservation?isoAfter(48):undefined,reservationExtensionCount:0,history:[]
    };
    addEvent(state,"offer","draft","Commercial offer draft created");
    if(initialLeadStage==="offer")addEvent(state,"offer","sent","Existing lead restored at commercial-offer stage","System");
    if(seededReservation){addEvent(state,"offer","accepted","Existing lead restored with accepted commercial offer","System");addEvent(state,"reservation","draft","Reservation window restored; reservation fee is awaiting confirmation","System")}
    states.set(leadId,state);
  }else if(!state.selectedPropertyIds.length&&suggestedPropertyIds.length){
    state.selectedPropertyIds=[...suggestedPropertyIds];
  }
  normalizeSalesFlowState(state);
  return state;
}

export function normalizeSalesFlowState(state:LeadSalesFlowState){
  const now=Date.now();
  if(["sent","viewed"].includes(state.offerStatus)&&new Date(state.offerValidUntil).getTime()<=now){
    state.offerStatus="expired";state.offerSent=true;addEvent(state,"offer","expired","Offer validity period expired","System");
  }
  if(["draft","active"].includes(state.reservationStatus)&&state.reservationExpiresAt&&new Date(state.reservationExpiresAt).getTime()<=now){
    state.reservationStatus="expired";state.reservationPaid=false;addEvent(state,"reservation","expired","Reservation period expired","System");
  }
  return state;
}

export function updateOfferTerms(leadId:string,discountPercent:number,validDays:number){
  const state=getSalesFlowState(leadId);state.discountPercent=Math.max(0,Math.min(30,discountPercent));state.offerValidUntil=isoAfter(Math.max(1,validDays)*24);state.offerStatus="draft";state.offerSent=false;state.offerViewedAt=undefined;state.offerAcceptedAt=undefined;state.offerClosedReason=undefined;
  addEvent(state,"offer","draft",`Offer terms updated: ${state.discountPercent}% discount, ${Math.max(1,validDays)} day validity`);
  return state;
}

export function markOfferSent(leadId:string){const state=getSalesFlowState(leadId);state.offerSent=true;if(state.discountPercent<=3)addEvent(state,"offer","approved","Commercial terms approved within manager limit","System");state.offerStatus="sent";addEvent(state,"offer","sent","Commercial offer sent to client");return state}
export function markOfferViewed(leadId:string){const state=getSalesFlowState(leadId);if(state.offerStatus==="sent"){state.offerStatus="viewed";state.offerViewedAt=new Date().toISOString();addEvent(state,"offer","viewed","Client viewed the commercial offer","Client")};return state}
export function markOfferAccepted(leadId:string){const state=getSalesFlowState(leadId);if(["sent","viewed"].includes(state.offerStatus)){state.offerStatus="accepted";state.offerAcceptedAt=new Date().toISOString();state.offerClosedReason=undefined;state.reservationStatus="draft";state.reservationCreatedAt=new Date().toISOString();state.reservationExpiresAt=isoAfter(48);state.reservationClosedReason=undefined;addEvent(state,"offer","accepted","Client accepted the commercial offer","Client");addEvent(state,"reservation","draft","Reservation window opened after offer acceptance")};return state}
export function closeOffer(leadId:string,status:"rejected"|"cancelled",reason:string){const state=getSalesFlowState(leadId);state.offerStatus=status;state.offerClosedReason=reason;addEvent(state,"offer",status,reason||status);return state}

export function activateReservation(leadId:string,propertyIds:string[]){const state=getSalesFlowState(leadId);state.reservationPaid=true;state.reservedPropertyIds=[...propertyIds];state.reservationStatus="active";if(!state.reservationCreatedAt)state.reservationCreatedAt=new Date().toISOString();if(!state.reservationExpiresAt)state.reservationExpiresAt=isoAfter(48);state.reservationClosedReason=undefined;addEvent(state,"reservation","active","Reservation fee confirmed and assets reserved","Finance");return state}
export function extendReservation(leadId:string,hours:number,reason:string){const state=getSalesFlowState(leadId);const base=Math.max(Date.now(),state.reservationExpiresAt?new Date(state.reservationExpiresAt).getTime():Date.now());state.reservationExpiresAt=new Date(base+Math.max(1,hours)*60*60*1000).toISOString();state.reservationExtensionCount+=1;addEvent(state,"reservation","active",`Reservation extended by ${hours}h${reason?`: ${reason}`:""}`);return state}
export function closeReservation(leadId:string,status:"cancelled"|"released",reason:string){const state=getSalesFlowState(leadId);state.reservationStatus=status;state.reservationPaid=false;state.reservationClosedReason=reason;state.reservedPropertyIds=[];addEvent(state,"reservation",status,reason||status);return state}
export function restartReservation(leadId:string){const state=getSalesFlowState(leadId);state.reservationStatus="draft";state.reservationPaid=false;state.reservedPropertyIds=[];state.reservationCreatedAt=new Date().toISOString();state.reservationExpiresAt=isoAfter(48);state.reservationClosedReason=undefined;addEvent(state,"reservation","draft","Reservation recreated after release/cancellation");return state}
export function convertReservation(leadId:string){const state=getSalesFlowState(leadId);state.reservationStatus="converted";addEvent(state,"reservation","converted","Reservation converted to purchase application");return state}

export function resetReservationPayment(leadId:string){
  const state=states.get(leadId);
  if(state){state.reservationPaid=false;state.reservedPropertyIds=[];if(state.reservationStatus==="active")state.reservationStatus="draft"}
}
