export interface ClientDocument {
  id: string;
  clientId: string;
  type: string;
  number: string;
  issuedAt: string;
  expiresAt?: string;
  issuer?: string;
  issueCountry?: string;
  fileName?: string;
  status: "valid" | "expiring" | "missing" | "review";
  source: string;
}

export interface RelatedPerson {
  id: string;
  clientId: string;
  name: string;
  role: string;
  phone: string;
  verification: "verified" | "review" | "expired";
  note: string;
}

export interface ClientInterest {
  id: string;
  clientId: string;
  project: string;
  type: string;
  rooms: string;
  budget: string;
  districts: string;
  payment: string;
  priority: "hot" | "warm" | "cold";
}

export interface ClientOffer {
  id: string;
  clientId: string;
  createdAt: string;
  validUntil: string;
  objects: string[];
  total: number;
  status: "draft" | "sent" | "viewed" | "accepted" | "expired";
}

export interface ClientReservation {
  id: string;
  clientId: string;
  dealId?: string;
  property: string;
  from: string;
  until: string;
  fee: number;
  paid: boolean;
  status: "active" | "expired" | "converted";
}

export interface CommunicationItem {
  id: string;
  clientId: string;
  type: "call" | "email" | "meeting" | "sms" | "note";
  at: string;
  title: string;
  text: string;
  owner: string;
}

export type KycCheckStatus="passed"|"review"|"pending"|"failed";
export interface KycChecklistItem{
  id:string;
  clientId:string;
  code:string;
  status:KycCheckStatus;
  mandatory:boolean;
  owner:string;
  updatedAt:string;
  note:string;
  evidence:string;
}
export interface ClientKycProfile{
  clientId:string;
  status:"clear"|"review"|"blocked";
  risk:"low"|"medium"|"high";
  score:number;
  reviewedAt:string;
  reviewedBy:string;
  sourceOfFunds:string;
  riskNote:string;
}

export interface ClientDuplicateCase{
  id:string;
  canonicalClientId:string;
  candidateId:string;
  source:string;
  candidateName:string;
  candidatePhone:string;
  candidateEmail:string;
  candidateIdentifier:string;
  confidence:number;
  matchedFields:string[];
  status:"open"|"merged"|"kept-separate";
  createdAt:string;
  resolvedAt?:string;
}

export const clientDocuments: ClientDocument[] = [
  {id:"DOC-1001-01",clientId:"CL-1001",type:"idCard",number:"AN 0482217",issuedAt:"12.03.2023",expiresAt:"12.03.2033",issuer:"Police Passport and Visa Department",issueCountry:"Armenia",fileName:"AN0482217.pdf",status:"valid",source:"OCR + manual verification"},
  {id:"DOC-1001-02",clientId:"CL-1001",type:"maritalCertificate",number:"FM-2026-881",issuedAt:"08.09.2026",issuer:"Civil Registry",issueCountry:"Armenia",fileName:"family-status.pdf",status:"valid",source:"Uploaded"},
  {id:"DOC-1001-03",clientId:"CL-1001",type:"incomeCertificate",number:"INC-260914",issuedAt:"14.09.2026",issuer:"Employer",issueCountry:"Armenia",fileName:"income-2026.pdf",status:"review",source:"Mortgage package"},
  {id:"DOC-1002-01",clientId:"CL-1002",type:"passport",number:"AM 0611432",issuedAt:"25.06.2021",expiresAt:"25.06.2031",issuer:"Police Passport and Visa Department",issueCountry:"Armenia",fileName:"AM0611432.pdf",status:"valid",source:"ID reader"},
  {id:"DOC-1002-02",clientId:"CL-1002",type:"spouseConsent",number:"CONS-0911",issuedAt:"11.09.2026",issuer:"Notary office 12",issueCountry:"Armenia",fileName:"spouse-consent.pdf",status:"valid",source:"Notary scan"},
  {id:"DOC-1003-01",clientId:"CL-1003",type:"stateRegistration",number:"286.110.1299441",issuedAt:"19.04.2020",issuer:"State Register of Legal Entities",issueCountry:"Armenia",fileName:"registration.pdf",status:"valid",source:"State register"},
  {id:"DOC-1003-02",clientId:"CL-1003",type:"charter",number:"CHARTER-v3",issuedAt:"04.02.2025",issuer:"Ararat Development LLC",issueCountry:"Armenia",fileName:"charter-v3.pdf",status:"valid",source:"SharePoint"},
  {id:"DOC-1003-03",clientId:"CL-1003",type:"majorTransactionApproval",number:"BOARD-26/18",issuedAt:"16.09.2026",issuer:"Board of participants",issueCountry:"Armenia",fileName:"board-26-18.pdf",status:"review",source:"Uploaded"},
  {id:"DOC-1003-04",clientId:"CL-1003",type:"directorAppointment",number:"DEC-19/04",issuedAt:"18.04.2019",issuer:"Founders meeting",issueCountry:"Armenia",fileName:"director-appointment.pdf",status:"valid",source:"Archive"},
  {id:"DOC-1004-01",clientId:"CL-1004",type:"idCard",number:"AN 0557711",issuedAt:"05.05.2024",expiresAt:"05.05.2034",issuer:"Police Passport and Visa Department",issueCountry:"Armenia",fileName:"AN0557711.pdf",status:"valid",source:"OCR"},
  {id:"DOC-1005-01",clientId:"CL-1005",type:"passport",number:"AM 0478219",issuedAt:"13.11.2019",expiresAt:"13.11.2029",issuer:"Police Passport and Visa Department",issueCountry:"Armenia",fileName:"AM0478219.pdf",status:"valid",source:"Archive"},
  {id:"DOC-1006-01",clientId:"CL-1006",type:"soleProprietorRegistration",number:"SP-28177406",issuedAt:"21.07.2017",issuer:"State Register",issueCountry:"Armenia",fileName:"sp-registration.pdf",status:"valid",source:"Archive"},
  {id:"DOC-1007-01",clientId:"CL-1007",type:"stateRegistration",number:"DMCC-884310",issuedAt:"12.02.2021",issuer:"DMCC",issueCountry:"UAE",fileName:"dmcc-certificate.pdf",status:"valid",source:"Uploaded"},
  {id:"DOC-1007-02",clientId:"CL-1007",type:"uboDeclaration",number:"UBO-2026-04",issuedAt:"02.09.2026",issuer:"Caspian Holdings LLC",issueCountry:"UAE",fileName:"ubo-declaration.pdf",status:"review",source:"Uploaded"}
];

export const relatedPeople: RelatedPerson[] = [
  {id:"RP-1001-01",clientId:"CL-1001",name:"Կարեն Պետրոսյան",role:"representative",phone:"+374 93 440 118",verification:"verified",note:"Подписание договора, нотариальные и регистрационные действия"},
  {id:"RP-1001-02",clientId:"CL-1001",name:"Աննա Մկրտչյան",role:"spouse",phone:"+374 99 220 440",verification:"verified",note:"Созаемщик по ипотеке"},
  {id:"RP-1002-01",clientId:"CL-1002",name:"Վահե Սարգսյան",role:"spouse",phone:"+374 91 552 018",verification:"verified",note:"Согласие на приобретение объекта получено"},
  {id:"RP-1003-01",clientId:"CL-1003",name:"Լուսինե Մանուկյան",role:"representative",phone:"+374 55 617 240",verification:"review",note:"Полномочия действуют до 30.09.2026"},
  {id:"RP-1003-02",clientId:"CL-1003",name:"Արամ Մելիքյան",role:"directorSignatory",phone:"+374 91 100 301",verification:"verified",note:"Право подписи по уставу"},
  {id:"RP-1003-03",clientId:"CL-1003",name:"Նարեկ Ավագյան",role:"founder",phone:"+374 93 005 911",verification:"verified",note:"Доля участия 40%"},
  {id:"RP-1005-01",clientId:"CL-1005",name:"Լիլիթ Մկրտչյան",role:"representative",phone:"+374 91 778 041",verification:"expired",note:"Доверенность завершилась 04.08.2026"},
  {id:"RP-1007-01",clientId:"CL-1007",name:"David Kareem",role:"beneficialOwner",phone:"+971 50 224 9011",verification:"review",note:"Beneficial ownership declaration under review"}
];

export const clientKycProfiles:ClientKycProfile[]=[
  {clientId:"CL-1001",status:"clear",risk:"low",score:96,reviewedAt:"18.09.2026 · 11:20",reviewedBy:"Անահիտ Մարտիրոսյան",sourceOfFunds:"Salary + mortgage financing",riskNote:"No material risk flags. Representative authority verified."},
  {clientId:"CL-1002",status:"clear",risk:"low",score:94,reviewedAt:"17.09.2026 · 09:15",reviewedBy:"Անահիտ Մարտիրոսյան",sourceOfFunds:"Savings + mortgage financing",riskNote:"Spouse consent received and verified."},
  {clientId:"CL-1003",status:"review",risk:"medium",score:78,reviewedAt:"18.09.2026 · 15:40",reviewedBy:"Վահե Խաչատրյան",sourceOfFunds:"Corporate operating funds",riskNote:"Beneficial owner review and large-transaction approval are still open."},
  {clientId:"CL-1004",status:"review",risk:"medium",score:71,reviewedAt:"16.09.2026 · 16:10",reviewedBy:"Անահիտ Մարտիրոսյան",sourceOfFunds:"Salary + bank financing",riskNote:"Funding-source document and payment delay require follow-up."},
  {clientId:"CL-1005",status:"clear",risk:"low",score:92,reviewedAt:"10.09.2026 · 13:00",reviewedBy:"Անահիտ Մարտիրոսյան",sourceOfFunds:"Personal savings",riskNote:"No active transaction risk flags."},
  {clientId:"CL-1006",status:"clear",risk:"low",score:90,reviewedAt:"12.09.2026 · 10:45",reviewedBy:"Անահիտ Մարտիրոսյան",sourceOfFunds:"Business income",riskNote:"Sole proprietor registration and tax data verified."},
  {clientId:"CL-1007",status:"review",risk:"high",score:63,reviewedAt:"18.09.2026 · 17:05",reviewedBy:"Վահե Խաչատրյան",sourceOfFunds:"Foreign corporate funds",riskNote:"Foreign UBO evidence and enhanced legal review required."}
];

export const kycChecklist:KycChecklistItem[]=[
  {id:"KYC-1001-01",clientId:"CL-1001",code:"identity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"18.09.2026",note:"Identity confirmed against ID document.",evidence:"AN 0482217"},
  {id:"KYC-1001-02",clientId:"CL-1001",code:"documentValidity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"18.09.2026",note:"ID valid through 2033.",evidence:"DOC-1001-01"},
  {id:"KYC-1001-03",clientId:"CL-1001",code:"taxResidency",status:"passed",mandatory:true,owner:"KYC",updatedAt:"18.09.2026",note:"Armenia tax residency recorded.",evidence:"Client declaration"},
  {id:"KYC-1001-04",clientId:"CL-1001",code:"sourceOfFunds",status:"passed",mandatory:true,owner:"Finance",updatedAt:"18.09.2026",note:"Salary and mortgage source documented.",evidence:"INC-260914"},
  {id:"KYC-1001-05",clientId:"CL-1001",code:"authority",status:"passed",mandatory:false,owner:"Legal",updatedAt:"18.09.2026",note:"Representative authority valid for current deal.",evidence:"POA-118/26"},
  {id:"KYC-1001-06",clientId:"CL-1001",code:"riskScreening",status:"passed",mandatory:true,owner:"Compliance",updatedAt:"18.09.2026",note:"No material flags in demo screening.",evidence:"Review #441"},

  {id:"KYC-1002-01",clientId:"CL-1002",code:"identity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"17.09.2026",note:"Passport verified.",evidence:"AM 0611432"},
  {id:"KYC-1002-02",clientId:"CL-1002",code:"documentValidity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"17.09.2026",note:"Passport valid through 2031.",evidence:"DOC-1002-01"},
  {id:"KYC-1002-03",clientId:"CL-1002",code:"spouseConsent",status:"passed",mandatory:true,owner:"Legal",updatedAt:"17.09.2026",note:"Notarial spouse consent received.",evidence:"CONS-0911"},
  {id:"KYC-1002-04",clientId:"CL-1002",code:"sourceOfFunds",status:"passed",mandatory:true,owner:"Finance",updatedAt:"17.09.2026",note:"Funding structure documented.",evidence:"Mortgage application"},
  {id:"KYC-1002-05",clientId:"CL-1002",code:"riskScreening",status:"passed",mandatory:true,owner:"Compliance",updatedAt:"17.09.2026",note:"No material flags.",evidence:"Review #438"},

  {id:"KYC-1003-01",clientId:"CL-1003",code:"companyExistence",status:"passed",mandatory:true,owner:"Legal",updatedAt:"18.09.2026",note:"Registration data confirmed.",evidence:"286.110.1299441"},
  {id:"KYC-1003-02",clientId:"CL-1003",code:"directorAuthority",status:"passed",mandatory:true,owner:"Legal",updatedAt:"18.09.2026",note:"Director authority confirmed by charter and appointment decision.",evidence:"DEC-19/04"},
  {id:"KYC-1003-03",clientId:"CL-1003",code:"beneficialOwners",status:"review",mandatory:true,owner:"Compliance",updatedAt:"18.09.2026",note:"UBO record requires final reviewer confirmation.",evidence:"UBO declaration"},
  {id:"KYC-1003-04",clientId:"CL-1003",code:"majorTransaction",status:"review",mandatory:true,owner:"Legal",updatedAt:"18.09.2026",note:"Board approval uploaded and waiting for validation.",evidence:"BOARD-26/18"},
  {id:"KYC-1003-05",clientId:"CL-1003",code:"sourceOfFunds",status:"passed",mandatory:true,owner:"Finance",updatedAt:"18.09.2026",note:"Corporate account source documented.",evidence:"ACBA account"},
  {id:"KYC-1003-06",clientId:"CL-1003",code:"riskScreening",status:"passed",mandatory:true,owner:"Compliance",updatedAt:"18.09.2026",note:"No blocking flags; enhanced review kept due to corporate structure.",evidence:"Review #449"},

  {id:"KYC-1004-01",clientId:"CL-1004",code:"identity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"16.09.2026",note:"Identity document verified.",evidence:"AN 0557711"},
  {id:"KYC-1004-02",clientId:"CL-1004",code:"documentValidity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"16.09.2026",note:"ID valid through 2034.",evidence:"DOC-1004-01"},
  {id:"KYC-1004-03",clientId:"CL-1004",code:"sourceOfFunds",status:"pending",mandatory:true,owner:"Finance",updatedAt:"16.09.2026",note:"Updated funding evidence requested.",evidence:"—"},
  {id:"KYC-1004-04",clientId:"CL-1004",code:"riskScreening",status:"review",mandatory:true,owner:"Compliance",updatedAt:"16.09.2026",note:"Payment delay is under review; no blocking flag.",evidence:"Review #433"},

  {id:"KYC-1005-01",clientId:"CL-1005",code:"identity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"10.09.2026",note:"Passport verified.",evidence:"AM 0478219"},
  {id:"KYC-1005-02",clientId:"CL-1005",code:"documentValidity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"10.09.2026",note:"Passport valid through 2029.",evidence:"DOC-1005-01"},
  {id:"KYC-1005-03",clientId:"CL-1005",code:"riskScreening",status:"passed",mandatory:true,owner:"Compliance",updatedAt:"10.09.2026",note:"No material flags.",evidence:"Review #401"},

  {id:"KYC-1006-01",clientId:"CL-1006",code:"identity",status:"passed",mandatory:true,owner:"KYC",updatedAt:"12.09.2026",note:"Owner identity verified.",evidence:"Personal ID"},
  {id:"KYC-1006-02",clientId:"CL-1006",code:"soleProprietor",status:"passed",mandatory:true,owner:"Legal",updatedAt:"12.09.2026",note:"Sole proprietor registration confirmed.",evidence:"SP-28177406"},
  {id:"KYC-1006-03",clientId:"CL-1006",code:"sourceOfFunds",status:"passed",mandatory:true,owner:"Finance",updatedAt:"12.09.2026",note:"Business-income source recorded.",evidence:"Business account"},
  {id:"KYC-1006-04",clientId:"CL-1006",code:"riskScreening",status:"passed",mandatory:true,owner:"Compliance",updatedAt:"12.09.2026",note:"No material flags.",evidence:"Review #420"},

  {id:"KYC-1007-01",clientId:"CL-1007",code:"companyExistence",status:"passed",mandatory:true,owner:"Legal",updatedAt:"18.09.2026",note:"Foreign company certificate reviewed.",evidence:"DMCC-884310"},
  {id:"KYC-1007-02",clientId:"CL-1007",code:"directorAuthority",status:"passed",mandatory:true,owner:"Legal",updatedAt:"18.09.2026",note:"Director authority documented.",evidence:"Corporate resolution"},
  {id:"KYC-1007-03",clientId:"CL-1007",code:"beneficialOwners",status:"review",mandatory:true,owner:"Compliance",updatedAt:"18.09.2026",note:"Foreign UBO evidence requires enhanced review.",evidence:"UBO-2026-04"},
  {id:"KYC-1007-04",clientId:"CL-1007",code:"sourceOfFunds",status:"pending",mandatory:true,owner:"Finance",updatedAt:"18.09.2026",note:"Bank evidence is requested.",evidence:"—"},
  {id:"KYC-1007-05",clientId:"CL-1007",code:"riskScreening",status:"review",mandatory:true,owner:"Compliance",updatedAt:"18.09.2026",note:"Enhanced foreign-corporate review required.",evidence:"Review #452"}
];

export const clientDuplicateCases:ClientDuplicateCase[]=[
  {id:"DUP-2026-031",canonicalClientId:"CL-1001",candidateId:"AMO-88421",source:"amoCRM",candidateName:"Arman Petrosyan",candidatePhone:"+374 91 240 681",candidateEmail:"arman.pet@example.am",candidateIdentifier:"—",confidence:97,matchedFields:["phone","email","name"],status:"open",createdAt:"18.09.2026 · 09:10"},
  {id:"DUP-2026-032",canonicalClientId:"CL-1003",candidateId:"SP-LIST-1908",source:"SharePoint",candidateName:"Արարատ Դեվելոփմենթ",candidatePhone:"+374 10 447 300",candidateEmail:"office@araratdev.am",candidateIdentifier:"02645178",confidence:99,matchedFields:["phone","email","taxId","name"],status:"open",createdAt:"18.09.2026 · 09:18"},
  {id:"DUP-2026-029",canonicalClientId:"CL-1002",candidateId:"LEGACY-1491",source:"Legacy import",candidateName:"Mariam Sargsyan",candidatePhone:"+374 55 118 904",candidateEmail:"m.sargsyan@example.am",candidateIdentifier:"4592287145",confidence:96,matchedFields:["phone","email","personalNumber"],status:"merged",createdAt:"16.09.2026 · 12:03",resolvedAt:"16.09.2026 · 12:18"}
];

export const clientInterests: ClientInterest[] = [
  {id:"INT-1001",clientId:"CL-1001",project:"Norq Residence",type:"Квартира",rooms:"3",budget:"60–72M ֏",districts:"Nor Nork / Norq",payment:"30% + ипотека",priority:"hot"},
  {id:"INT-1002",clientId:"CL-1002",project:"Norq Residence",type:"Квартира + parking",rooms:"3",budget:"65–80M ֏",districts:"Nor Nork",payment:"Ипотека",priority:"hot"},
  {id:"INT-1003",clientId:"CL-1003",project:"Norq Residence",type:"Коммерческий пакет",rooms:"—",budget:"60–120M ֏",districts:"Yerevan",payment:"Corporate financing",priority:"warm"},
  {id:"INT-1004",clientId:"CL-1004",project:"Norq Residence",type:"Квартира",rooms:"1–2",budget:"35–45M ֏",districts:"Norq",payment:"30% + ипотека",priority:"hot"},
  {id:"INT-1005",clientId:"CL-1005",project:"Norq Residence",type:"Инвестиционная квартира",rooms:"1",budget:"30–40M ֏",districts:"Any",payment:"100%",priority:"cold"}
];

export const clientOffers: ClientOffer[] = [
  {id:"OF-2026-214",clientId:"CL-1001",createdAt:"13.09.2026 · 12:10",validUntil:"20.09.2026",objects:["B-1204","B-1301","B-1403"],total:68376000,status:"accepted"},
  {id:"OF-2026-209",clientId:"CL-1002",createdAt:"12.09.2026 · 16:40",validUntil:"19.09.2026",objects:["B-1303","B-1401"],total:67874500,status:"accepted"},
  {id:"OF-2026-201",clientId:"CL-1003",createdAt:"10.09.2026 · 11:25",validUntil:"22.09.2026",objects:["B-1206","P-043","S-118"],total:71248740,status:"accepted"},
  {id:"OF-2026-198",clientId:"CL-1004",createdAt:"09.09.2026 · 14:18",validUntil:"17.09.2026",objects:["B-1404","B-1207"],total:37000000,status:"accepted"},
  {id:"OF-2026-176",clientId:"CL-1005",createdAt:"28.08.2026 · 10:35",validUntil:"04.09.2026",objects:["B-1207"],total:34920000,status:"expired"}
];

export const clientReservations: ClientReservation[] = [
  {id:"RSV-2026-376",clientId:"CL-1003",dealId:"DL-2026-00469",property:"Norq Residence · B-1206 + P-043 + S-118",from:"11.09.2026",until:"16.09.2026 · 18:00",fee:1500000,paid:true,status:"converted"},
  {id:"RSV-2026-388",clientId:"CL-1001",dealId:"DL-2026-00481",property:"Norq Residence · B-1204",from:"14.09.2026",until:"19.09.2026 · 18:00",fee:3000000,paid:true,status:"converted"},
  {id:"RSV-2026-381",clientId:"CL-1002",dealId:"DL-2026-00477",property:"Norq Residence · B-1303",from:"13.09.2026",until:"18.09.2026 · 18:00",fee:5000000,paid:true,status:"active"},
  {id:"RSV-2026-372",clientId:"CL-1004",dealId:"DL-2026-00462",property:"Norq Residence · B-1404",from:"10.09.2026",until:"15.09.2026 · 18:00",fee:2000000,paid:true,status:"converted"},
  {id:"RSV-2026-301",clientId:"CL-1005",dealId:"DL-2026-00439",property:"Norq Residence · B-1207",from:"20.08.2026",until:"25.08.2026 · 18:00",fee:1500000,paid:true,status:"converted"}
];

export const clientCommunications: CommunicationItem[] = [
  {id:"COM-001",clientId:"CL-1001",type:"call",at:"17.09.2026 · 10:24",title:"Звонок по срокам договора",text:"Клиент подтвердил готовность подписать после финального legal review.",owner:"Անի Հակոբյան"},
  {id:"COM-002",clientId:"CL-1001",type:"email",at:"16.09.2026 · 16:18",title:"Отправлен пакет ипотечных документов",text:"Переданы предварительный договор, технические данные объекта и график оплаты.",owner:"Լուսինե Մկրտչյան"},
  {id:"COM-003",clientId:"CL-1001",type:"meeting",at:"14.09.2026 · 15:00",title:"Встреча в офисе продаж",text:"Согласованы B-1204, структура финансирования и представители.",owner:"Անի Հակոբյան"},
  {id:"COM-101",clientId:"CL-1002",type:"meeting",at:"17.09.2026 · 09:30",title:"Подготовка к регистрации",text:"Проверен комплект документов, следующий шаг — госрегистрация.",owner:"Անահիտ Մարտիրոսյան"},
  {id:"COM-201",clientId:"CL-1003",type:"email",at:"17.09.2026 · 11:12",title:"Комментарии к договору",text:"Получены замечания юридического отдела покупателя.",owner:"Վահե Խաչատրյան"},
  {id:"COM-301",clientId:"CL-1004",type:"call",at:"17.09.2026 · 13:42",title:"Просрочка платежа",text:"Клиент ожидает решение банка; инициирована реструктуризация графика.",owner:"Մարի Հովհաննիսյան"},
  {id:"COM-401",clientId:"CL-1005",type:"note",at:"16.09.2026 · 09:12",title:"Warranty case создан",text:"Клиент сообщил о шуме внутреннего блока кондиционирования.",owner:"Սերվիս թիմ"}
];
