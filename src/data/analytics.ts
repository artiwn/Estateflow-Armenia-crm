export const monthlySales = [
  {month:"Jan",revenue:620,units:9,target:700},
  {month:"Feb",revenue:710,units:11,target:720},
  {month:"Mar",revenue:805,units:12,target:760},
  {month:"Apr",revenue:760,units:11,target:800},
  {month:"May",revenue:940,units:14,target:850},
  {month:"Jun",revenue:1010,units:15,target:900},
  {month:"Jul",revenue:1120,units:17,target:980},
  {month:"Aug",revenue:1260,units:18,target:1100},
  {month:"Sep",revenue:1840,units:24,target:1500}
];

export const cashflowForecast = [
  {month:"Sep",actual:128,forecast:52,mortgage:47},
  {month:"Oct",actual:0,forecast:164,mortgage:118},
  {month:"Nov",actual:0,forecast:141,mortgage:94},
  {month:"Dec",actual:0,forecast:177,mortgage:122},
  {month:"Jan",actual:0,forecast:116,mortgage:73},
  {month:"Feb",actual:0,forecast:98,mortgage:61}
];

export const projectPortfolio = [
  {id:"PRJ-NRQ",name:"Norq Residence",location:"Nor Nork",units:186,sold:104,reserved:24,contract:18,available:40,revenue:6.92,target:7.40,avgSqm:748000,collection:92},
  {id:"PRJ-ARB",name:"Arabkir Heights",location:"Arabkir",units:128,sold:79,reserved:15,contract:12,available:22,revenue:5.31,target:5.60,avgSqm:965000,collection:88},
  {id:"PRJ-CYD",name:"Cascade Yard",location:"Kentron",units:74,sold:51,reserved:8,contract:6,available:9,revenue:4.86,target:5.10,avgSqm:1320000,collection:95}
];

export const leadSources = [
  {name:"Website",leads:312,qualified:176,deals:38,cac:119000},
  {name:"Instagram",leads:268,qualified:139,deals:31,cac:142000},
  {name:"Referral",leads:91,qualified:67,deals:24,cac:64000},
  {name:"Call center",leads:184,qualified:88,deals:18,cac:181000},
  {name:"Partners",leads:73,qualified:54,deals:17,cac:97000}
];

export const managerPerformance = [
  {name:"Անի Հակոբյան",leads:86,meetings:29,deals:14,revenue:968,conversion:16.3,discount:5.8,cycle:24},
  {name:"Նարեկ Կարապետյան",leads:79,meetings:31,deals:13,revenue:887,conversion:16.5,discount:3.2,cycle:21},
  {name:"Մարի Հովհաննիսյան",leads:71,meetings:24,deals:10,revenue:644,conversion:14.1,discount:2.6,cycle:27},
  {name:"Գոռ Ավագյան",leads:64,meetings:21,deals:9,revenue:601,conversion:14.0,discount:4.1,cycle:25}
];

export const discountBands = [
  {label:"0–2%",deals:31,value:1740},
  {label:"2–5%",deals:18,value:1260},
  {label:"5–7%",deals:8,value:604},
  {label:"7–10%",deals:4,value:288},
  {label:">10%",deals:1,value:71}
];

export const inventoryHeatmap = [
  {floor:18,units:["sold","sold","reserved","available","available","contract"]},
  {floor:17,units:["sold","contract","sold","available","reserved","available"]},
  {floor:16,units:["sold","sold","sold","contract","available","available"]},
  {floor:15,units:["sold","reserved","contract","available","available","available"]},
  {floor:14,units:["sold","available","available","reserved","sold","contract"]},
  {floor:13,units:["available","available","reserved","contract","available","sold"]},
  {floor:12,units:["available","reserved","contract","sold","available","sold"]},
  {floor:11,units:["sold","sold","available","available","reserved","contract"]}
] as const;

export const executiveRisks = [
  {severity:"high",title:"Receivables overdue",value:"23.5M ֏",detail:"4 obligations · oldest 11 days",route:"payments"},
  {severity:"medium",title:"Discount approvals",value:"5",detail:"2 above 7% require director approval",route:"approvals"},
  {severity:"medium",title:"Mortgage decisions",value:"3",detail:"Expected within 7 days · 73.8M ֏",route:"mortgages"},
  {severity:"low",title:"Handover backlog",value:"7",detail:"2 cases blocked by defects",route:"handover"},
  {severity:"high",title:"Warranty SLA",value:"2",detail:"Cases at risk or overdue",route:"service"}
];


export const processBenchmarks = [
  {key:"approval",avg:5.8,target:8,unit:"hours",withinSla:91,trend:-12,route:"approvals"},
  {key:"contract",avg:1.7,target:2,unit:"days",withinSla:88,trend:-8,route:"contracts"},
  {key:"registration",avg:2.4,target:3,unit:"days",withinSla:86,trend:-5,route:"registration"},
  {key:"handover",avg:4.1,target:5,unit:"days",withinSla:83,trend:-7,route:"handover"},
  {key:"warranty",avg:31,target:48,unit:"hours",withinSla:78,trend:-10,route:"service"}
];

export const slaTrend = [
  {label:"W20",value:81},
  {label:"W21",value:84},
  {label:"W22",value:86},
  {label:"W23",value:85},
  {label:"W24",value:88},
  {label:"W25",value:89}
];

export const dataQualityTrend = [
  {month:"May",value:86},
  {month:"Jun",value:88},
  {month:"Jul",value:90},
  {month:"Aug",value:92},
  {month:"Sep",value:94}
];
