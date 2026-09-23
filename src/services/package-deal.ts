import type { Deal, DealAssetLine, PropertyUnit } from "../models/types";

export function dealPropertyIds(deal:Pick<Deal,"propertyId"|"propertyIds">){
  return deal.propertyIds?.length?deal.propertyIds:[deal.propertyId];
}

export function dealProperties(deal:Pick<Deal,"propertyId"|"propertyIds">,properties:PropertyUnit[]){
  return dealPropertyIds(deal).map(id=>properties.find(p=>p.id===id)).filter(Boolean) as PropertyUnit[];
}

export function packageListTotal(rows:PropertyUnit[]){return rows.reduce((sum,p)=>sum+p.totalPrice,0)}

export function normalizedAssetLines(deal:Deal,properties:PropertyUnit[]):DealAssetLine[]{
  const rows=dealProperties(deal,properties),listTotal=packageListTotal(rows);
  if(deal.assetLines?.length){
    return rows.map(p=>deal.assetLines!.find(x=>x.propertyId===p.id)??fallbackLine(p,deal.amount,listTotal));
  }
  return rows.map(p=>fallbackLine(p,deal.amount,listTotal));
}

function fallbackLine(p:PropertyUnit,dealAmount:number,listTotal:number):DealAssetLine{
  const ratio=listTotal?dealAmount/listTotal:1,dealPrice=Math.round(p.totalPrice*ratio),discountPercent=p.totalPrice?Math.max(0,(1-dealPrice/p.totalPrice)*100):0;
  return{propertyId:p.id,listPrice:p.totalPrice,dealPrice,discountPercent:Number(discountPercent.toFixed(2)),contractMode:"shared",paymentSharePercent:listTotal?Number((p.totalPrice/listTotal*100).toFixed(2)):0};
}

export function syncDealAmountFromAssets(deal:Deal){
  if(deal.assetLines?.length){
    deal.amount=deal.assetLines.reduce((sum,x)=>sum+x.dealPrice,0);
    const list=deal.assetLines.reduce((sum,x)=>sum+x.listPrice,0);
    deal.discount=list?Number(((1-deal.amount/list)*100).toFixed(2)):0;
  }
}

export function allocateAmount(amount:number,lines:DealAssetLine[]){
  if(!lines.length)return[];
  const total=lines.reduce((sum,x)=>sum+x.dealPrice,0)||1;
  let assigned=0;
  return lines.map((line,index)=>{
    const value=index===lines.length-1?amount-assigned:Math.round(amount*(line.dealPrice/total));
    assigned+=value;return{propertyId:line.propertyId,amount:value};
  });
}
