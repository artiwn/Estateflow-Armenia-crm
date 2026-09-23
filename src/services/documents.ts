import type { Contract } from "../models/types";
import type { Client, PropertyUnit } from "../models/types";
import { amd, escapeHtml, statusLabel } from "../utils";
import { t } from "../i18n";
import { demoText } from "../demo-i18n";

const enc=new TextEncoder();
const u16=(v:number)=>new Uint8Array([v&255,(v>>>8)&255]);
const u32=(v:number)=>new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]);
const concat=(parts:Uint8Array[])=>{const total=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(total);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out};
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=(data:Uint8Array)=>{let c=0xffffffff;for(const b of data)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0};

function zipStore(files:{name:string;data:Uint8Array}[]){
  const local:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
  for(const file of files){const name=enc.encode(file.name),crc=crc32(file.data);const head=concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(file.data.length),u32(file.data.length),u16(name.length),u16(0),name]);local.push(head,file.data);const ch=concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(file.data.length),u32(file.data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);central.push(ch);offset+=head.length+file.data.length}
  const centralBytes=concat(central),localBytes=concat(local),end=concat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralBytes.length),u32(localBytes.length),u16(0)]);return concat([localBytes,centralBytes,end]);
}

const xmlEscape=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const p=(text:string,bold=false)=>`<w:p><w:r>${bold?"<w:rPr><w:b/></w:rPr>":""}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;

function contractLines(c:Contract,client?:Client,propertyOrProperties?:PropertyUnit|PropertyUnit[]){
  const properties=Array.isArray(propertyOrProperties)?propertyOrProperties:propertyOrProperties?[propertyOrProperties]:[];
  const property=properties[0];
  const assetLines=properties.length>1?[`${t("v45.package.packageComposition")}: ${properties.map(p=>p.unit).join(" + ")}`,...properties.map((p,i)=>`${i+1}. ${p.project} · ${p.unit} · ${p.area} m² · ${amd(p.totalPrice)}`)]:[];
  return [
    t("document.contract.title"),
    `${demoText(c.type)} · ${c.id}`,
    `${t("document.contract.template")}: ${c.template} · ${t("document.contract.language")}: ${c.language}`,
    "",
    `${t("document.contract.buyer")}: ${client?.name??c.clientName}`,
    `${t("document.contract.phone")}: ${client?.phone??"—"}`,
    `${t("document.contract.property")}: ${property?`${property.project} · ${property.unit}`:c.propertyLabel}`,
    `${t("document.contract.area")}: ${properties.length?properties.reduce((sum,p)=>sum+p.area,0).toFixed(1)+" m²":"—"}`,
    ...assetLines,
    `${t("document.contract.amount")}: ${amd(c.amount)}`,
    `${t("document.contract.status")}: ${statusLabel(c.status)}`,
    `${t("document.contract.lawyer")}: ${c.owner}`,
    "",
    t("document.contract.keyTerms"),
    ...((c.clauses??[]).filter(x=>x.included).map((x,i)=>`${i+1}. ${x.title}: ${x.text}`)),
    ...(!(c.clauses?.length)?[t("document.contract.term.subject"),t("document.contract.term.payment"),t("document.contract.term.handover"),t("document.contract.term.registration")]:[]),
    "",
    ...(c.deviations?.length?[`${t("v49.contract.deviations")}: ${c.deviations.length}`,...c.deviations.map((d,i)=>`${i+1}. ${d.title}: ${d.proposedText} (${d.status})`)]:[]),
    ...(c.signers?.length?["",t("v49.signing.title"),...c.signers.map((s,i)=>`${i+1}. ${s.name} · ${t(`v49.signerRole.${s.role}`)} · ${t(`v49.signerStatus.${s.status}`)} · ${t(`v49.signatureMethod.${s.method}`)}`)]:[]),
    "",
    `${t("document.contract.version")}: ${c.versions.at(-1)?.version??"v1.0"} · ${demoText(c.updatedAt)}`,
    t("document.contract.generatedBy")
  ];
}

export function downloadContractDocx(c:Contract,client?:Client,property?:PropertyUnit|PropertyUnit[]){
  const lines=contractLines(c,client,property);
  const document=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${lines.map((x,i)=>p(x,i<2)).join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const files=[
    {name:"[Content_Types].xml",data:enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`)},
    {name:"_rels/.rels",data:enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`)},
    {name:"word/document.xml",data:enc.encode(document)}
  ];
  downloadBlob(new Blob([zipStore(files)],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),`${c.id}-${c.versions.at(-1)?.version??"current"}.docx`);
}

async function canvasPage(lines:string[]){
  const canvas=document.createElement("canvas");canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext("2d")!;ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#151a1f";ctx.textBaseline="top";ctx.font='28px Arial, "Noto Sans Armenian", sans-serif';let y=95;
  for(let i=0;i<lines.length;i++){const line=lines[i];ctx.font=i===0?'bold 34px Arial, "Noto Sans Armenian", sans-serif':i===1?'bold 27px Arial, "Noto Sans Armenian", sans-serif':'24px Arial, "Noto Sans Armenian", sans-serif';const max=1050,words=line.split(" ");let current="";const chunks:string[]=[];for(const word of words){const test=current?current+" "+word:word;if(ctx.measureText(test).width>max&&current){chunks.push(current);current=word}else current=test}chunks.push(current);for(const chunk of chunks){ctx.fillText(chunk,95,y);y+=chunk?42:24}}
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Canvas export failed")),"image/jpeg",.92));return new Uint8Array(await blob.arrayBuffer());
}

function pdfFromJpegs(images:{bytes:Uint8Array;width:number;height:number}[]){
  const chunks:Uint8Array[]=[];let offset=0;const offsets:number[]=[0];const push=(x:string|Uint8Array)=>{const b=typeof x==="string"?enc.encode(x):x;chunks.push(b);offset+=b.length};
  push("%PDF-1.4\n%âãÏÓ\n");
  const obj=(id:number,body:()=>void)=>{offsets[id]=offset;push(`${id} 0 obj\n`);body();push("\nendobj\n")};
  const pageIds=images.map((_,i)=>3+i*3),imageIds=images.map((_,i)=>4+i*3),contentIds=images.map((_,i)=>5+i*3);
  obj(1,()=>push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2,()=>push(`<< /Type /Pages /Count ${images.length} /Kids [${pageIds.map(id=>`${id} 0 R`).join(" ")}] >>`));
  images.forEach((img,i)=>{
    obj(pageIds[i],()=>push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageIds[i]} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`));
    obj(imageIds[i],()=>{push(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`);push(img.bytes);push("\nendstream")});
    const stream=enc.encode("q 595 0 0 842 0 0 cm /Im0 Do Q");obj(contentIds[i],()=>{push(`<< /Length ${stream.length} >>\nstream\n`);push(stream);push("\nendstream")});
  });
  const xref=offset,totalObjects=2+images.length*3;push(`xref\n0 ${totalObjects+1}\n0000000000 65535 f \n`);for(let i=1;i<=totalObjects;i++)push(`${String(offsets[i]??0).padStart(10,"0")} 00000 n \n`);push(`trailer\n<< /Size ${totalObjects+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return concat(chunks);
}

export async function downloadContractPdf(c:Contract,client?:Client,property?:PropertyUnit|PropertyUnit[]){
  const lines=contractLines(c,client,property),perPage=29,pages:string[][]=[];for(let i=0;i<lines.length;i+=perPage)pages.push(lines.slice(i,i+perPage));const imgs=[];for(const pageLines of pages)imgs.push({bytes:await canvasPage(pageLines),width:1240,height:1754});downloadBlob(new Blob([pdfFromJpegs(imgs)],{type:"application/pdf"}),`${c.id}-${c.versions.at(-1)?.version??"current"}.pdf`);
}

export function contractDiffHtml(c:Contract){
  const versions=c.versions.slice(-2);
  if(versions.length<2)return`<div class="empty compact-empty">${t("document.diff.needPrevious")}</div>`;
  const prev=versions[0],curr=versions[1];
  return`<div class="diff-summary"><div><span>${t("document.diff.previous")}</span><strong>${escapeHtml(prev.version)}</strong><small>${escapeHtml(demoText(prev.createdAt))} · ${escapeHtml(prev.author)}</small></div><div class="diff-arrow">→</div><div><span>${t("document.diff.current")}</span><strong>${escapeHtml(curr.version)}</strong><small>${escapeHtml(demoText(curr.createdAt))} · ${escapeHtml(curr.author)}</small></div></div><div class="diff-block"><div class="diff-old"><span>− ${t("document.diff.previous")}</span><p>${escapeHtml(demoText(prev.note))}</p><p>${t("document.diff.oldHandover")}</p></div><div class="diff-new"><span>+ ${t("document.diff.current")}</span><p>${escapeHtml(demoText(curr.note))}</p><p>${t(c.nonStandardClauses?"document.diff.newHandover":"document.diff.noMaterialDeviation")}</p></div></div><div class="modal-note">${t("document.diff.note")}</div>`;
}

export function downloadBlob(blob:Blob,fileName:string){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
