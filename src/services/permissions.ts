export type PlatformRole=
  |"Sales Manager"|"Sales Head"|"Commercial Director"|"Legal"|"Finance"|"Financial Director"|"CEO"
  |"Call Center"|"Compliance"|"Project Manager"|"Handover"|"Service"|"System Administrator"|"Auditor";
export type AccessLevel="none"|"view"|"edit"|"manage";
export type PlatformModule="dashboard"|"leads"|"clients"|"properties"|"deals"|"payments"|"approvals"|"tasks"|"notifications"|"contracts"|"legal"|"finance"|"mortgages"|"registration"|"handover"|"service"|"reports"|"audit"|"administration";
export type PermissionAction=
  |"client.personal"|"client.financial"|"client.kyc"|"client.merge"
  |"property.price"|"property.status"
  |"deal.discount"|"deal.stage"
  |"approval.decide"|"approval.reassign"|"approval.rules"
  |"contract.edit"|"contract.templates"|"contract.sign"
  |"legal.review"|"legal.poa"
  |"finance.payment"|"finance.bank-confirm"|"finance.fx"|"finance.security"|"finance.schedule"
  |"mortgage.manage"|"registration.manage"|"handover.manage"|"service.manage"
  |"task.manage"|"task.reassign"|"report.export"|"admin.roles"|"data.export";

export interface RolePolicy{
  role:PlatformRole;
  department:"sales"|"legal"|"finance"|"operations"|"executive"|"administration"|"audit";
  modules:Record<PlatformModule,AccessLevel>;
  actions:Record<PermissionAction,boolean>;
  discountLimit:number|null;
  descriptionKey:string;
}

export const platformRoles:PlatformRole[]=[
  "Sales Manager","Sales Head","Commercial Director","Call Center","Legal","Compliance","Finance","Financial Director","Project Manager","Handover","Service","CEO","System Administrator","Auditor"
];
export const platformModules:PlatformModule[]=["dashboard","leads","clients","properties","deals","payments","approvals","tasks","notifications","contracts","legal","finance","mortgages","registration","handover","service","reports","audit","administration"];
export const permissionActions:PermissionAction[]=["client.personal","client.financial","client.kyc","client.merge","property.price","property.status","deal.discount","deal.stage","approval.decide","approval.reassign","approval.rules","contract.edit","contract.templates","contract.sign","legal.review","legal.poa","finance.payment","finance.bank-confirm","finance.fx","finance.security","finance.schedule","mortgage.manage","registration.manage","handover.manage","service.manage","task.manage","task.reassign","report.export","admin.roles","data.export"];

const noneModules=():Record<PlatformModule,AccessLevel>=>Object.fromEntries(platformModules.map(m=>[m,"none"])) as Record<PlatformModule,AccessLevel>;
const noActions=():Record<PermissionAction,boolean>=>Object.fromEntries(permissionActions.map(a=>[a,false])) as Record<PermissionAction,boolean>;
const policy=(role:PlatformRole,department:RolePolicy["department"],descriptionKey:string,moduleEntries:Partial<Record<PlatformModule,AccessLevel>>,actionEntries:Partial<Record<PermissionAction,boolean>>,discountLimit:number|null=null):RolePolicy=>({role,department,descriptionKey,modules:{...noneModules(),dashboard:"view",tasks:"view",notifications:"view",...moduleEntries},actions:{...noActions(),...actionEntries},discountLimit});

const defaultPolicies:Record<PlatformRole,RolePolicy>={
  "Sales Manager":policy("Sales Manager","sales","v54.roleDesc.salesManager",{leads:"manage",clients:"edit",properties:"view",deals:"edit",payments:"view",approvals:"view",contracts:"edit",legal:"view",mortgages:"view",handover:"view",reports:"view"},{"client.personal":true,"client.financial":false,"deal.discount":true,"deal.stage":true,"contract.edit":true,"task.manage":true},3),
  "Sales Head":policy("Sales Head","sales","v54.roleDesc.salesHead",{leads:"manage",clients:"edit",properties:"view",deals:"manage",payments:"view",approvals:"manage",contracts:"edit",legal:"view",finance:"view",mortgages:"view",handover:"view",reports:"view"},{"client.personal":true,"client.financial":false,"client.merge":true,"deal.discount":true,"deal.stage":true,"approval.decide":true,"approval.reassign":true,"contract.edit":true,"task.manage":true,"task.reassign":true,"report.export":true},7),
  "Commercial Director":policy("Commercial Director","executive","v54.roleDesc.commercialDirector",{leads:"view",clients:"view",properties:"view",deals:"view",payments:"view",approvals:"manage",contracts:"view",legal:"view",finance:"view",mortgages:"view",handover:"view",reports:"manage"},{"client.personal":true,"client.financial":true,"property.price":true,"deal.discount":true,"approval.decide":true,"approval.reassign":true,"report.export":true,"data.export":true},15),
  "Call Center":policy("Call Center","sales","v54.roleDesc.callCenter",{leads:"manage",clients:"view",properties:"view",deals:"view",reports:"view"},{"client.personal":true,"task.manage":true},0),
  "Legal":policy("Legal","legal","v54.roleDesc.legal",{clients:"edit",properties:"view",deals:"view",payments:"view",approvals:"manage",contracts:"manage",legal:"manage",registration:"manage",handover:"view",reports:"view"},{"client.personal":true,"client.kyc":true,"approval.decide":true,"approval.reassign":true,"contract.edit":true,"contract.templates":true,"contract.sign":true,"legal.review":true,"legal.poa":true,"registration.manage":true,"task.manage":true,"task.reassign":true},0),
  "Compliance":policy("Compliance","legal","v54.roleDesc.compliance",{clients:"edit",properties:"view",deals:"view",approvals:"view",contracts:"view",legal:"manage",reports:"view"},{"client.personal":true,"client.kyc":true,"legal.review":true,"task.manage":true,"report.export":true},0),
  "Finance":policy("Finance","finance","v54.roleDesc.finance",{clients:"view",properties:"view",deals:"view",payments:"manage",approvals:"manage",contracts:"view",legal:"view",finance:"manage",mortgages:"manage",reports:"view"},{"client.personal":false,"client.financial":true,"approval.decide":true,"approval.reassign":true,"finance.payment":true,"finance.bank-confirm":true,"finance.fx":true,"finance.security":true,"finance.schedule":true,"mortgage.manage":true,"task.manage":true,"task.reassign":true,"report.export":true},0),
  "Financial Director":policy("Financial Director","executive","v54.roleDesc.financialDirector",{clients:"view",properties:"view",deals:"view",payments:"manage",approvals:"manage",contracts:"view",legal:"view",finance:"manage",mortgages:"manage",reports:"manage"},{"client.personal":false,"client.financial":true,"approval.decide":true,"approval.reassign":true,"finance.payment":true,"finance.bank-confirm":true,"finance.fx":true,"finance.security":true,"finance.schedule":true,"mortgage.manage":true,"task.manage":true,"task.reassign":true,"report.export":true,"data.export":true},0),
  "Project Manager":policy("Project Manager","operations","v54.roleDesc.projectManager",{clients:"view",properties:"edit",deals:"view",contracts:"view",handover:"edit",service:"view",reports:"view"},{"client.personal":false,"property.status":true,"handover.manage":true,"task.manage":true},0),
  "Handover":policy("Handover","operations","v54.roleDesc.handover",{clients:"view",properties:"view",deals:"view",payments:"view",contracts:"view",registration:"view",handover:"manage",service:"view",reports:"view"},{"client.personal":true,"client.financial":false,"handover.manage":true,"task.manage":true,"task.reassign":true},0),
  "Service":policy("Service","operations","v54.roleDesc.service",{clients:"view",properties:"view",deals:"view",handover:"view",service:"manage",reports:"view"},{"client.personal":true,"service.manage":true,"task.manage":true,"task.reassign":true},0),
  "CEO":policy("CEO","executive","v54.roleDesc.ceo",Object.fromEntries(platformModules.map(m=>[m,m==="administration"?"view":"view"])) as Partial<Record<PlatformModule,AccessLevel>>,{"client.personal":true,"client.financial":true,"client.kyc":true,"property.price":true,"approval.decide":true,"report.export":true,"data.export":true},100),
  "System Administrator":policy("System Administrator","administration","v54.roleDesc.systemAdministrator",Object.fromEntries(platformModules.map(m=>[m,"manage"])) as Partial<Record<PlatformModule,AccessLevel>>,Object.fromEntries(permissionActions.map(a=>[a,true])) as Partial<Record<PermissionAction,boolean>>,100),
  "Auditor":policy("Auditor","audit","v54.roleDesc.auditor",Object.fromEntries(platformModules.map(m=>[m,"view"])) as Partial<Record<PlatformModule,AccessLevel>>,{"client.personal":true,"client.financial":true,"report.export":true,"data.export":true},0)
};

const STORAGE="estateflowRolePoliciesV54";
type PolicyOverride={modules?:Partial<Record<PlatformModule,AccessLevel>>;actions?:Partial<Record<PermissionAction,boolean>>;discountLimit?:number|null};
function loadOverrides():Partial<Record<PlatformRole,PolicyOverride>>{try{return JSON.parse(localStorage.getItem(STORAGE)||"{}") as Partial<Record<PlatformRole,PolicyOverride>>}catch{return{}}}
function saveOverrides(value:Partial<Record<PlatformRole,PolicyOverride>>){localStorage.setItem(STORAGE,JSON.stringify(value))}
export function getRolePolicy(role:PlatformRole=currentRole()):RolePolicy{const base=defaultPolicies[role]??defaultPolicies["Sales Manager"],override=loadOverrides()[role];return{...base,modules:{...base.modules,...override?.modules},actions:{...base.actions,...override?.actions},discountLimit:override&&"discountLimit"in override?override.discountLimit!:base.discountLimit}}
export function currentRole():PlatformRole{const raw=localStorage.getItem("estateflowRole") as PlatformRole|null;return raw&&platformRoles.includes(raw)?raw:"Sales Manager"}
export function setCurrentRole(role:PlatformRole){localStorage.setItem("estateflowRole",role)}
export function setModuleAccess(role:PlatformRole,module:PlatformModule,level:AccessLevel){const all=loadOverrides(),r=all[role]??{};r.modules={...(r.modules??{}),[module]:level};all[role]=r;saveOverrides(all)}
export function setActionPermission(role:PlatformRole,action:PermissionAction,value:boolean){const all=loadOverrides(),r=all[role]??{};r.actions={...(r.actions??{}),[action]:value};all[role]=r;saveOverrides(all)}
export function setDiscountLimit(role:PlatformRole,value:number|null){const all=loadOverrides(),r=all[role]??{};r.discountLimit=value;all[role]=r;saveOverrides(all)}
export function resetRolePolicy(role:PlatformRole){const all=loadOverrides();delete all[role];saveOverrides(all)}
export function resetAllPolicies(){localStorage.removeItem(STORAGE)}
export function canViewModule(module:PlatformModule,role:PlatformRole=currentRole()){return getRolePolicy(role).modules[module]!=="none"}
export function canEditModule(module:PlatformModule,role:PlatformRole=currentRole()){return ["edit","manage"].includes(getRolePolicy(role).modules[module])}
export function canManageModule(module:PlatformModule,role:PlatformRole=currentRole()){return getRolePolicy(role).modules[module]==="manage"}
export function canAction(action:PermissionAction,role:PlatformRole=currentRole()){return Boolean(getRolePolicy(role).actions[action])}
export function moduleForRoute(route:string):PlatformModule{
  const path=route.split("?")[0].split("/")[0];
  return ({lead:"leads",offer:"leads",reservation:"leads",application:"deals",client:"clients",property:"properties","price-lists":"properties",deal:"deals",reconciliation:"payments",restructure:"payments",contract:"contracts","contract-templates":"contracts",poa:"legal",registration:"registration",securities:"finance",mortgage:"mortgages","handover-case":"handover",inspection:"handover",warranty:"service",admin:"administration"} as Record<string,PlatformModule>)[path]??(platformModules.includes(path as PlatformModule)?path as PlatformModule:"dashboard");
}
export function canAccessRoute(route:string,role:PlatformRole=currentRole()){const path=route.split("?")[0].split("/")[0];if(path==="search")return true;return canViewModule(moduleForRoute(route),role)}
export function landingRoute(role:PlatformRole=currentRole()){const preferred:Partial<Record<PlatformRole,string>>={Finance:"finance",Legal:"legal","Sales Head":"approvals?tab=inbox","Commercial Director":"approvals?tab=inbox","Financial Director":"finance",Handover:"handover",Service:"service","Call Center":"leads",Compliance:"legal","Project Manager":"properties",CEO:"reports","System Administrator":"admin/roles",Auditor:"audit"};const candidate=preferred[role]??"dashboard";return canAccessRoute(candidate,role)?candidate:(platformModules.find(m=>canViewModule(m,role))??"dashboard")}
export function moduleStats(role:PlatformRole=currentRole()){const p=getRolePolicy(role);const accessible=platformModules.filter(m=>p.modules[m]!=="none").length,editable=platformModules.filter(m=>["edit","manage"].includes(p.modules[m])).length,managed=platformModules.filter(m=>p.modules[m]==="manage").length,elevated=permissionActions.filter(a=>p.actions[a]).length;return{accessible,editable,managed,elevated}}
export function roleLabelKey(role:PlatformRole){return ({"Sales Manager":"role.salesManager","Sales Head":"role.salesHead","Commercial Director":"role.commercialDirector","Legal":"role.legal","Finance":"role.finance","Financial Director":"role.financialDirector",CEO:"role.ceo","Call Center":"v54.role.callCenter",Compliance:"v54.role.compliance","Project Manager":"v54.role.projectManager",Handover:"v54.role.handover",Service:"v54.role.service","System Administrator":"v54.role.systemAdministrator",Auditor:"v54.role.auditor"} as Record<PlatformRole,string>)[role]}
export function moduleLabelKey(module:PlatformModule){return ({dashboard:"dashboard",leads:"leads",clients:"clients",properties:"properties",deals:"deals",payments:"payments",approvals:"approvals",tasks:"tasks",notifications:"notifications",contracts:"contracts",legal:"legal",finance:"finance",mortgages:"mortgages",registration:"registration",handover:"handover",service:"service",reports:"reports",audit:"v55.audit.nav",administration:"v54.module.administration"} as Record<PlatformModule,string>)[module]}
export function actionLabelKey(action:PermissionAction){return `v54.permission.${action}`}
export function isSensitiveAllowed(kind:"personal"|"financial",role:PlatformRole=currentRole()){return canAction(kind==="personal"?"client.personal":"client.financial",role)}
