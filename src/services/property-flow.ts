import type{PropertyStatus,PropertyUnit,Deal,Contract,PaymentScheduleItem,RegistrationCase}from"../models/types";

const transitions:Record<PropertyStatus,PropertyStatus[]>={
  "created":["data-review"],
  "data-review":["available","unavailable"],
  "unavailable":["available","cancelled"],
  "available":["offered","pre-reserved","reserved","unavailable"],
  "offered":["pre-reserved","reserved","available","cancelled"],
  "pre-reserved":["reserved","available","cancelled"],
  "reserved":["application","available","cancelled"],
  "application":["approval","reserved","cancelled"],
  "approval":["contract-preparation","application","cancelled"],
  "contract-preparation":["contract","approval","cancelled"],
  "contract":["partially-paid","paid","registration","cancelled"],
  "partially-paid":["paid","cancelled"],
  "paid":["registration"],
  "registration":["sold"],
  "sold":["handover"],
  "handover":["handed-over"],
  "handed-over":[],
  "suspended":["available","cancelled"],
  "cancelled":["returned-to-sale"],
  "returned-to-sale":["offered","pre-reserved","reserved","unavailable"]
};

export const allowedPropertyTransitions=(status:PropertyStatus)=>transitions[status]??[];

export function validatePropertyTransition(property:PropertyUnit,target:PropertyStatus,context:{deals:Deal[];contracts:Contract[];schedule:PaymentScheduleItem[];registrations:RegistrationCase[]}){
  if(!allowedPropertyTransitions(property.status).includes(target))return{ok:false,code:"not-allowed"};
  const relatedDeals=context.deals.filter(d=>(d.propertyIds?.length?d.propertyIds:[d.propertyId]).includes(property.id));
  const latest=relatedDeals[0];
  if(target==="contract"){
    if(!latest||!["contract","payment","registration","handover"].includes(latest.status))return{ok:false,code:"deal-not-contract"};
    const contract=context.contracts.find(c=>c.dealId===latest.id);
    if(!contract)return{ok:false,code:"contract-missing"};
  }
  if(target==="paid"){
    if(!latest)return{ok:false,code:"deal-missing"};
    const rows=context.schedule.filter(r=>r.dealId===latest.id);
    if(rows.length&&rows.some(r=>r.paid<r.amount))return{ok:false,code:"payment-incomplete"};
  }
  if(target==="registration"){
    if(!latest)return{ok:false,code:"deal-missing"};
    const contract=context.contracts.find(c=>c.dealId===latest.id);
    if(!contract||!["signed","notary","registered"].includes(contract.status))return{ok:false,code:"contract-not-signed"};
  }
  if(target==="sold"){
    if(!latest)return{ok:false,code:"deal-missing"};
    const registration=context.registrations.find(r=>r.dealId===latest.id);
    if(!registration||registration.status!=="registered")return{ok:false,code:"registration-incomplete"};
  }
  return{ok:true,code:"ok"};
}
