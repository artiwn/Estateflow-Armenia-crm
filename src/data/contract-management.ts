import type {ContractTemplate,ContractTemplateClause} from "../models/types";

const clauseCopy={
  EN:[
    ["PARTIES","Parties and authority","The parties, their identification data and signing authority are defined from the approved deal record.","Parties","standard","always",true],
    ["SUBJECT","Subject and property","The seller transfers and the buyer acquires the property or property package specified in the contract annex.","Property","standard","always",true],
    ["PRICE","Price and taxes","The contract price, applicable taxes and currency are taken from the approved commercial terms of the deal.","Commercial","standard","always",true],
    ["PAYMENT","Payment terms","Payments are made according to the approved payment schedule linked to the deal.","Finance","standard","always",true],
    ["HANDOVER","Property handover","The property is handed over after fulfilment of the contractual financial and registration conditions.","Handover","standard","always",true],
    ["REGISTRATION","Notary and state registration","The parties cooperate on notarial actions and state registration according to the agreed sequence.","Registration","standard","always",true],
    ["INSTALLMENT","Installment schedule","The installment schedule, due dates and consequences of late payment form an integral part of the contract.","Finance","conditional","installment",false],
    ["MORTGAGE","Mortgage financing","The buyer may fulfil part of the price through approved mortgage financing; bank disbursement is tracked separately.","Finance","conditional","mortgage",false],
    ["REPRESENTATIVE","Representation by power of attorney","Actions performed by a representative are valid only within the verified scope and validity period of the power of attorney.","Authority","conditional","representative",false],
    ["CORPORATE","Corporate buyer authority","The corporate buyer confirms authority of its director or authorized signatory and required corporate approvals.","Authority","conditional","corporate",false],
    ["PACKAGE","Multiple-property annex","All properties included in the transaction are listed in a single annex with individual commercial values.","Property","conditional","package",false],
    ["VAT","Tax treatment","The price reflects the tax treatment approved for the transaction and shown in the commercial terms.","Commercial","conditional","vat",false]
  ],
  RU:[
    ["PARTIES","Стороны и полномочия","Стороны, их идентификационные данные и полномочия подписантов определяются по утвержденной карточке сделки.","Стороны","standard","always",true],
    ["SUBJECT","Предмет и объект недвижимости","Продавец передает, а покупатель приобретает объект или пакет объектов, указанный в приложении к договору.","Недвижимость","standard","always",true],
    ["PRICE","Цена и налоги","Цена договора, применимые налоги и валюта определяются утвержденными коммерческими условиями сделки.","Коммерция","standard","always",true],
    ["PAYMENT","Порядок расчетов","Платежи производятся в соответствии с утвержденным графиком платежей, связанным со сделкой.","Финансы","standard","always",true],
    ["HANDOVER","Передача объекта","Объект передается после выполнения предусмотренных договором финансовых и регистрационных условий.","Передача","standard","always",true],
    ["REGISTRATION","Нотариат и государственная регистрация","Стороны обеспечивают нотариальные действия и государственную регистрацию в согласованной последовательности.","Регистрация","standard","always",true],
    ["INSTALLMENT","График рассрочки","График рассрочки, сроки платежей и последствия просрочки являются неотъемлемой частью договора.","Финансы","conditional","installment",false],
    ["MORTGAGE","Ипотечное финансирование","Часть цены может быть оплачена за счет одобренного ипотечного финансирования с отдельным учетом банковского транша.","Финансы","conditional","mortgage",false],
    ["REPRESENTATIVE","Представительство по доверенности","Действия представителя действительны только в пределах проверенного объема и срока действия доверенности.","Полномочия","conditional","representative",false],
    ["CORPORATE","Полномочия юридического лица","Покупатель-юрлицо подтверждает полномочия директора или подписанта и необходимые корпоративные решения.","Полномочия","conditional","corporate",false],
    ["PACKAGE","Приложение по нескольким объектам","Все объекты пакетной сделки перечисляются в едином приложении с индивидуальными стоимостями.","Недвижимость","conditional","package",false],
    ["VAT","Налоговый режим","Цена отражает утвержденный для сделки налоговый режим и коммерческие условия.","Коммерция","conditional","vat",false]
  ],
  HY:[
    ["PARTIES","Կողմերը և լիազորությունները","Կողմերի նույնականացման տվյալները և ստորագրողների լիազորությունները սահմանվում են հաստատված գործարքի քարտի հիման վրա։","Կողմեր","standard","always",true],
    ["SUBJECT","Պայմանագրի առարկան և գույքը","Վաճառողը փոխանցում է, իսկ գնորդը ձեռք է բերում պայմանագրի հավելվածում նշված գույքը կամ գույքերի փաթեթը։","Գույք","standard","always",true],
    ["PRICE","Գին և հարկեր","Պայմանագրի գինը, կիրառվող հարկերը և արժույթը վերցվում են գործարքի հաստատված առևտրային պայմաններից։","Առևտրային","standard","always",true],
    ["PAYMENT","Վճարման կարգ","Վճարումները կատարվում են գործարքին կապված հաստատված վճարացուցակի համաձայն։","Ֆինանսներ","standard","always",true],
    ["HANDOVER","Գույքի հանձնում","Գույքը հանձնվում է պայմանագրով նախատեսված ֆինանսական և գրանցման պայմանների կատարումից հետո։","Հանձնում","standard","always",true],
    ["REGISTRATION","Նոտար և պետական գրանցում","Կողմերը ապահովում են նոտարական գործողություններն ու պետական գրանցումը համաձայնեցված հերթականությամբ։","Գրանցում","standard","always",true],
    ["INSTALLMENT","Տարաժամկետ վճարման ժամանակացույց","Տարաժամկետ վճարացուցակը, վերջնաժամկետները և ուշացման հետևանքները պայմանագրի անբաժանելի մասն են։","Ֆինանսներ","conditional","installment",false],
    ["MORTGAGE","Հիփոթեքային ֆինանսավորում","Գնի մի մասը կարող է վճարվել հաստատված հիփոթեքային ֆինանսավորմամբ՝ բանկային փոխանցման առանձին հաշվառմամբ։","Ֆինանսներ","conditional","mortgage",false],
    ["REPRESENTATIVE","Ներկայացուցչություն լիազորագրով","Ներկայացուցչի գործողությունները վավեր են միայն ստուգված լիազորությունների և լիազորագրի գործողության ժամկետի սահմաններում։","Լիազորություններ","conditional","representative",false],
    ["CORPORATE","Իրավաբանական անձի լիազորություններ","Իրավաբանական անձ գնորդը հաստատում է տնօրենի կամ ստորագրողի լիազորությունները և անհրաժեշտ կորպորատիվ որոշումները։","Լիազորություններ","conditional","corporate",false],
    ["PACKAGE","Մի քանի գույքի հավելված","Փաթեթային գործարքում ներառված բոլոր գույքերը նշվում են մեկ հավելվածում՝ անհատական առևտրային արժեքներով։","Գույք","conditional","package",false],
    ["VAT","Հարկային ռեժիմ","Գինը արտացոլում է գործարքի համար հաստատված հարկային ռեժիմը և առևտրային պայմանները։","Առևտրային","conditional","vat",false]
  ]
} as const;
const baseClauses=(prefix:string,language:"HY"|"RU"|"EN"):ContractTemplateClause[]=>clauseCopy[language].map((row,index)=>({id:`${prefix}-${String(index+1).padStart(2,"0")}`,code:row[0],title:row[1],text:row[2],category:row[3],mode:row[4],condition:row[5],required:row[6],order:(index+1)*10}));

export const contractTemplates:ContractTemplate[]=[
  {id:"TPL-SALE-APT",name:"Main sale and purchase agreement",type:"Основной договор купли-продажи",description:"Core sale agreement for residential and mixed property packages.",owner:"Legal Office",versions:[
    {id:"TV-SALE-HY-42",code:"SALE-APT-HY-v4.2",version:"v4.2",language:"HY",effectiveFrom:"05.09.2026",status:"active",approvedBy:"Legal Director",approvedAt:"05.09.2026",note:"Current Armenian wording",clauses:baseClauses("SALE-HY-42","HY")},
    {id:"TV-SALE-RU-41",code:"SALE-APT-RU-v4.1",version:"v4.1",language:"RU",effectiveFrom:"01.09.2026",status:"active",approvedBy:"Legal Director",approvedAt:"01.09.2026",note:"Current Russian wording",clauses:baseClauses("SALE-RU-41","RU")},
    {id:"TV-SALE-EN-39",code:"SALE-APT-EN-v3.9",version:"v3.9",language:"EN",effectiveFrom:"20.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"20.08.2026",note:"Current English wording",clauses:baseClauses("SALE-EN-39","EN")},
    {id:"TV-SALE-HY-41",code:"SALE-APT-HY-v4.1",version:"v4.1",language:"HY",effectiveFrom:"10.07.2026",status:"archived",approvedBy:"Legal Director",approvedAt:"10.07.2026",note:"Previous Armenian version",clauses:baseClauses("SALE-HY-41","HY")}
  ]},
  {id:"TPL-PRE-SALE",name:"Preliminary sale agreement",type:"Предварительный договор",description:"Preliminary commitment before the main sale agreement.",owner:"Legal Office",versions:[
    {id:"TV-PRE-HY-38",code:"PRE-SALE-CORP-HY-v3.8",version:"v3.8",language:"HY",effectiveFrom:"28.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"28.08.2026",note:"Corporate and individual buyers",clauses:baseClauses("PRE-HY-38","HY")},
    {id:"TV-PRE-RU-37",code:"PRE-SALE-RU-v3.7",version:"v3.7",language:"RU",effectiveFrom:"18.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"18.08.2026",note:"Current Russian wording",clauses:baseClauses("PRE-RU-37","RU")},
    {id:"TV-PRE-EN-35",code:"PRE-SALE-EN-v3.5",version:"v3.5",language:"EN",effectiveFrom:"18.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"18.08.2026",note:"Current English wording",clauses:baseClauses("PRE-EN-35","EN")}
  ]},
  {id:"TPL-RESERVATION",name:"Reservation agreement",type:"Соглашение о бронировании",description:"Reservation fee, validity period, cancellation and release rules.",owner:"Sales Legal",versions:[
    {id:"TV-RES-RU-26",code:"RESERVATION-RU-v2.6",version:"v2.6",language:"RU",effectiveFrom:"12.09.2026",status:"active",approvedBy:"Legal Director",approvedAt:"12.09.2026",note:"Updated reservation release clause",clauses:baseClauses("RES-RU-26","RU")},
    {id:"TV-RES-HY-25",code:"RESERVATION-HY-v2.5",version:"v2.5",language:"HY",effectiveFrom:"15.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"15.08.2026",note:"Current Armenian wording",clauses:baseClauses("RES-HY-25","HY")},
    {id:"TV-RES-EN-24",code:"RESERVATION-EN-v2.4",version:"v2.4",language:"EN",effectiveFrom:"15.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"15.08.2026",note:"Current English wording",clauses:baseClauses("RES-EN-24","EN")}
  ]},
  {id:"TPL-INSTALLMENT",name:"Installment agreement",type:"Договор рассрочки",description:"Payment schedule, overdue consequences and schedule change controls.",owner:"Legal + Finance",versions:[
    {id:"TV-INST-HY-31",code:"INSTALLMENT-HY-v3.1",version:"v3.1",language:"HY",effectiveFrom:"01.09.2026",status:"active",approvedBy:"Legal Director",approvedAt:"01.09.2026",note:"Current installment terms",clauses:baseClauses("INST-HY-31","HY")},
    {id:"TV-INST-RU-30",code:"INSTALLMENT-RU-v3.0",version:"v3.0",language:"RU",effectiveFrom:"01.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"01.08.2026",note:"Current Russian wording",clauses:baseClauses("INST-RU-30","RU")},
    {id:"TV-INST-EN-29",code:"INSTALLMENT-EN-v2.9",version:"v2.9",language:"EN",effectiveFrom:"01.08.2026",status:"active",approvedBy:"Legal Director",approvedAt:"01.08.2026",note:"Current English wording",clauses:baseClauses("INST-EN-29","EN")}
  ]}
];
