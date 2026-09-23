export type Currency="AMD"|"USD"|"EUR";
export type ClientType="individual"|"sole-proprietor"|"company"|"foreign-company";
export type VerificationStatus="verified"|"pending"|"review";
export type PropertyType="apartment"|"house"|"parking"|"commercial"|"office"|"storage"|"land"|"auxiliary"|"property-right"|"other";
export type PropertyStatus="created"|"data-review"|"unavailable"|"available"|"offered"|"pre-reserved"|"reserved"|"application"|"approval"|"contract-preparation"|"contract"|"partially-paid"|"paid"|"registration"|"sold"|"handover"|"handed-over"|"suspended"|"cancelled"|"returned-to-sale";
export type PropertyLegalStatus="project-right"|"registered"|"pending-registration"|"restricted";
export type DealStatus="qualification"|"offer"|"reservation"|"approval"|"contract"|"payment"|"registration"|"handover";
export type DealParticipantRole="buyer"|"co-buyer"|"representative"|"co-borrower"|"spouse"|"signatory"|"beneficial-owner";
export type FinancingType="own-funds"|"installment"|"mortgage"|"mixed";
export type LeadStage="new"|"qualified"|"viewing"|"offer"|"reservation";

export interface ClientAddress{country:string;city:string;address:string;postalCode?:string}
export interface ClientBankAccount{bank:string;iban:string;currency:Currency;isPrimary?:boolean;accountName?:string;swift?:string;status?:"active"|"inactive"}
export interface CorporatePerson{name:string;role:string;sharePercent?:number;personalNumber?:string;verification?:VerificationStatus;phone?:string;email?:string;authority?:string}
export interface Client{
  id:string;
  type:ClientType;
  name:string;
  phone:string;
  email:string;
  personalNumber?:string;
  taxId?:string;
  verification:VerificationStatus;
  manager:string;
  activeDeals:number;
  outstanding:number;
  preferredLanguage?:"HY"|"RU"|"EN";
  firstName?:string;
  lastName?:string;
  middleName?:string;
  dateOfBirth?:string;
  placeOfBirth?:string;
  citizenship?:string;
  taxResidency?:string;
  maritalStatus?:"single"|"married"|"divorced"|"widowed";
  registrationAddress?:ClientAddress;
  residenceAddress?:ClientAddress;
  bankAccounts?:ClientBankAccount[];
  consentPersonalData?:boolean;
  consentMarketing?:boolean;
  consentElectronicCommunication?:boolean;
  consentDocumentDelivery?:boolean;
  companyShortName?:string;
  legalForm?:string;
  registrationNumber?:string;
  registrationDate?:string;
  countryOfRegistration?:string;
  legalAddress?:ClientAddress;
  businessAddress?:ClientAddress;
  director?:CorporatePerson;
  founders?:CorporatePerson[];
  beneficialOwners?:CorporatePerson[];
  authorizedSignatories?:CorporatePerson[];
}

export type PropertyDocumentCategory="floor-plan"|"technical-passport"|"title-document"|"project-document"|"photo"|"other";
export interface PropertyDocument{id:string;title:string;category:PropertyDocumentCategory;fileType:string;version:string;updatedAt:string;status:"current"|"draft"|"archived";source:"platform"|"sharepoint";confidentiality:"internal"|"confidential"|"restricted"}
export interface PropertyStatusEvent{id:string;status:PropertyStatus;at:string;actor:string;note?:string}
export interface PropertyRestriction{id:string;type:string;basis:string;status:"active"|"review"|"released";registeredAt?:string;validUntil?:string;note?:string}
export interface PropertyUnit{
  id:string;
  internalCode?:string;
  project:string;
  phase:string;
  building:string;
  entrance:string;
  floor:number;
  unit:string;
  type:PropertyType;
  rooms:number;
  area:number;
  usableArea?:number;
  balconyArea?:number;
  bathrooms?:number;
  balconies?:number;
  ceilingHeight?:number;
  position?:string;
  pricePerSqm:number;
  totalPrice:number;
  initialPricePerSqm?:number;
  initialPrice?:number;
  currency:Currency;
  vatIncluded:boolean;
  status:PropertyStatus;
  orientation:string;
  finishing:string;
  cadastralCode:string;
  legalStatus:PropertyLegalStatus;
  restrictions:string[];
  restrictionDetails?:PropertyRestriction[];
  address:string;
  constructionReadiness?:number;
  plannedHandover?:string;
  availabilityFrom?:string;
  technicalNote?:string;
  floorPlan?:string;
  photoCount?:number;
  documents?:PropertyDocument[];
  statusHistory?:PropertyStatusEvent[];
}

export interface DealParticipant{id:string;clientId?:string;name:string;role:DealParticipantRole;phone?:string;sharePercent?:number;authority?:string}
export interface DealAssetLine{propertyId:string;listPrice:number;dealPrice:number;discountPercent:number;contractMode:"shared"|"separate";paymentSharePercent:number}
export interface Deal{
  id:string;
  clientId:string;
  clientName:string;
  propertyId:string;
  propertyLabel:string;
  propertyIds:string[];
  assetLines?:DealAssetLine[];
  participants:DealParticipant[];
  status:DealStatus;
  amount:number;
  currency:Currency;
  taxIncluded:boolean;
  financing:FinancingType;
  discount:number;
  manager:string;
  nextAction:string;
}
export interface Payment{id:string;dealId:string;clientName:string;dueDate:string;amount:number;paid:number;currency:Currency;status:"paid"|"due"|"overdue"|"partial"}
export type WorkflowRole="Sales Head"|"Commercial Director"|"Legal"|"Finance"|"Financial Director"|"CEO";
export type WorkflowPriority="normal"|"high"|"critical";
export type WorkflowScope="offer"|"application"|"deal"|"contract"|"payment-plan"|"legal";
export type WorkflowRouteStatus="active"|"approved"|"returned"|"rejected"|"cancelled";
export type WorkflowRuleField="always"|"discountPercent"|"amount"|"installmentMonths"|"buyerType"|"hasRepresentative"|"nonStandardClauses"|"riskLevel"|"assetCount";
export type WorkflowRuleOperator="always"|"gt"|"gte"|"eq"|"in"|"truthy";
export interface WorkflowRule{id:string;nameKey:string;descriptionKey:string;scopes:WorkflowScope[];field:WorkflowRuleField;operator:WorkflowRuleOperator;value:string|number|boolean|string[];approvalType:"application"|"discount"|"contract"|"payment-plan"|"legal"|"executive";requiredRole:WorkflowRole;stepOrder:number;slaHours:number;priority:WorkflowPriority;active:boolean;editable:boolean}
export interface WorkflowContext{sourceType:WorkflowScope;subjectId:string;dealId:string;title:string;clientName:string;propertyLabel:string;requestedBy:string;discountPercent?:number;amount?:number;currency?:Currency;installmentMonths?:number;buyerType?:ClientType;hasRepresentative?:boolean;nonStandardClauses?:number;riskLevel?:"low"|"medium"|"high";assetCount?:number}
export interface WorkflowRouteEvent{id:string;at:string;actor:string;action:"created"|"step-approved"|"conditional"|"returned"|"rejected"|"reassigned"|"document-request"|"comment"|"completed"|"cancelled";note:string;approvalId?:string}
export interface WorkflowRoute{id:string;sourceType:WorkflowScope;subjectId:string;dealId:string;title:string;clientName:string;propertyLabel:string;createdAt:string;status:WorkflowRouteStatus;context:WorkflowContext;matchedRuleIds:string[];approvalIds:string[];currentStep:number;history:WorkflowRouteEvent[]}
export interface ApprovalDecisionEvent{id:string;at:string;actor:string;action:"approved"|"conditional"|"returned"|"rejected"|"reassigned"|"document-request"|"comment";note:string}
export interface Approval{id:string;type:"application"|"discount"|"contract"|"payment-plan"|"legal"|"executive";dealId:string;clientName:string;propertyLabel:string;requestedBy:string;requestedValue:string;limitValue:string;reason:string;status:"queued"|"pending"|"approved"|"returned"|"rejected"|"cancelled";condition?:string;conditionStatus?:"open"|"completed";resolvedAt?:string;routeId?:string;ruleIds?:string[];requiredRole?:WorkflowRole;sequence?:number;slaDueAt?:string;priority?:WorkflowPriority;triggerSummary?:string;decisionNote?:string;decisionBy?:string;history?:ApprovalDecisionEvent[]}
export type TaskPriority="low"|"normal"|"high"|"critical";
export type TaskStatus="open"|"in-progress"|"waiting"|"done"|"cancelled";
export type TaskCategory="sales"|"approval"|"contract"|"payment"|"legal"|"registration"|"handover"|"service"|"mortgage"|"general";
export type TaskSourceType="manual"|"lead"|"deal"|"approval"|"contract"|"payment"|"legal"|"registration"|"handover"|"warranty"|"mortgage";
export interface TaskEvent{id:string;at:string;actor:string;action:"created"|"started"|"completed"|"reopened"|"reassigned"|"deferred"|"escalated"|"comment"|"reminder";note:string}
export interface WorkTask{
  id:string;title:string;description:string;category:TaskCategory;sourceType:TaskSourceType;sourceId?:string;sourceLabel?:string;sourceRoute?:string;dealId?:string;clientName?:string;propertyLabel?:string;assignedTo:string;assignedRole:string;backupOwner?:string;createdBy:string;createdAt:string;dueAt:string;priority:TaskPriority;status:TaskStatus;slaHours?:number;escalated:boolean;escalationLevel?:number;reminderAt?:string;tags?:string[];history:TaskEvent[]
}

export interface Lead{id:string;name:string;phone:string;email:string;source:string;stage:LeadStage;manager:string;budgetFrom:number;budgetTo:number;rooms:string;district:string;score:number;lastActivity:string;nextAction:string;language:"HY"|"RU"|"EN";notes:string}

export type ContractStatus="draft"|"legal-review"|"client-review"|"signature"|"signed"|"notary"|"registered";
export type LegalCaseStatus="clear"|"review"|"blocked";
export type RegistrationStatus="preparation"|"notary"|"submitted"|"additional-documents"|"rejected"|"registered";

export interface ContractVersion{id:string;version:string;createdAt:string;author:string;note:string;status:"archived"|"current"|"signed"}
export type ContractTemplateStatus="draft"|"active"|"archived";
export type ContractClauseMode="standard"|"conditional";
export type ContractClauseCondition="always"|"installment"|"mortgage"|"representative"|"corporate"|"package"|"vat";
export interface ContractTemplateClause{id:string;code:string;title:string;text:string;category:string;mode:ContractClauseMode;condition:ContractClauseCondition;required:boolean;order:number}
export interface ContractTemplateVersion{id:string;code:string;version:string;language:"HY"|"RU"|"EN";effectiveFrom:string;status:ContractTemplateStatus;approvedBy:string;approvedAt?:string;note:string;clauses:ContractTemplateClause[]}
export interface ContractTemplate{id:string;name:string;type:string;description:string;owner:string;versions:ContractTemplateVersion[]}
export interface ContractClauseSnapshot{id:string;code:string;title:string;text:string;category:string;mode:ContractClauseMode;condition:ContractClauseCondition;required:boolean;included:boolean;inclusionReason:string;sourceTemplateVersionId:string}
export type ContractDeviationStatus="draft"|"approval"|"approved"|"rejected";
export interface ContractDeviation{id:string;clauseCode:string;title:string;standardText:string;proposedText:string;reason:string;status:ContractDeviationStatus;createdAt:string;createdBy:string;workflowRouteId?:string}
export type ContractSignerRole="buyer"|"co-buyer"|"representative"|"buyer-signatory"|"seller-signatory";
export type ContractSignerStatus="pending"|"signed"|"declined";
export type ContractSignatureMethod="pending"|"electronic"|"paper";
export interface ContractSigner{id:string;name:string;role:ContractSignerRole;side:"buyer"|"seller";required:boolean;status:ContractSignerStatus;method:ContractSignatureMethod;authority?:string;signedAt?:string;documentName?:string}
export interface Contract{id:string;dealId:string;clientId:string;clientName:string;propertyId:string;propertyIds?:string[];propertyLabel:string;packageMode?:"shared"|"separate";type:string;language:"HY"|"RU"|"EN";status:ContractStatus;template:string;templateId?:string;templateVersionId?:string;amount:number;currency?:Currency;createdAt:string;updatedAt:string;owner:string;nonStandardClauses:number;versions:ContractVersion[];clauses?:ContractClauseSnapshot[];deviations?:ContractDeviation[];signers?:ContractSigner[];signingStartedAt?:string;signedDocumentName?:string}
export type PowerOfAttorneyStatus="draft"|"review"|"active"|"expiring"|"suspended"|"revoked"|"expired";
export type PowerOfAttorneyAction="sign-contract"|"notary"|"registration"|"submit-documents"|"handover"|"payment-schedule"|"price-change"|"receive-funds";
export interface PowerOfAttorneyEvent{id:string;at:string;actor:string;action:string;note?:string}
export interface PowerOfAttorney{
  id:string;principal:string;principalClientId?:string;representative:string;representativePersonalNumber?:string;documentNo:string;issuedAt:string;expiresAt:string;notary:string;scope:string;status:PowerOfAttorneyStatus;relatedDeal?:string;
  authorityBasis?:string;allowedActions:PowerOfAttorneyAction[];allowedPropertyIds:string[];canSubdelegate:boolean;documentFile?:string;verificationStatus:"verified"|"review";createdBy?:string;updatedAt?:string;history:PowerOfAttorneyEvent[];
}
export type LegalCheckStatus="clear"|"review"|"blocked";
export interface LegalCheckItem{id:string;label:string;status:LegalCheckStatus;required:boolean;owner:string;evidence:string;note?:string}
export interface LegalCase{id:string;clientId:string;clientName:string;dealId:string;type:string;risk:string;status:LegalCaseStatus;owner:string;updatedAt:string;checklist?:LegalCheckItem[];decisionNote?:string;evidenceCount?:number}
export type RegistrationDocumentStatus="missing"|"uploaded"|"verified"|"rejected";
export type RegistrationDocumentType="signed-contract"|"party-documents"|"cadastral"|"fee-receipt"|"notary-act"|"additional"|"final-extract";
export interface RegistrationDocument{id:string;type:RegistrationDocumentType;title:string;required:boolean;status:RegistrationDocumentStatus;fileName?:string;uploadedAt?:string;verifiedAt?:string;verifiedBy?:string;note?:string}
export interface RegistrationAdditionalRequest{id:string;requestedAt:string;requestedBy:string;dueAt?:string;items:string[];note?:string;status:"open"|"fulfilled";fulfilledAt?:string}
export interface RegistrationEvent{id:string;at:string;actor:string;action:string;note:string}
export interface RegistrationCase{
  id:string;dealId:string;contractId:string;clientName:string;propertyLabel:string;status:RegistrationStatus;notary:string;applicationNo?:string;stateFee:number;plannedAt:string;
  authority?:string;notaryActionNo?:string;notaryCompletedAt?:string;submittedAt?:string;submissionRound?:number;feeReceiptNo?:string;feePaidAt?:string;documents?:RegistrationDocument[];additionalRequests?:RegistrationAdditionalRequest[];rejectionReason?:string;rejectedAt?:string;resultDocumentNo?:string;resultDocumentName?:string;registeredAt?:string;owner?:string;history?:RegistrationEvent[]
}

export type MortgageStatus="draft"|"documents"|"bank-review"|"approved"|"contracting"|"funded"|"declined";
export interface MortgageApplication{id:string;dealId:string;clientId:string;clientName:string;propertyLabel:string;bank:string;program:string;status:MortgageStatus;propertyPrice:number;downPayment:number;requestedAmount:number;approvedAmount:number;termMonths:number;submittedAt:string;decisionDue:string;manager:string;documentsDone:number;documentsTotal:number;note:string}
export interface PaymentAllocation{propertyId:string;amount:number}
export type ExchangeRateRule="fixed"|"payment-date"|"contract-date"|"manual";
export interface PaymentScheduleItem{id:string;dealId:string;sequence:number;dueDate:string;title:string;amount:number;paid:number;source:"buyer"|"mortgage"|"reservation";status:"paid"|"due"|"overdue"|"partial"|"future";currency?:Currency;exchangeRateRule?:ExchangeRateRule;fixedExchangeRate?:number;penaltyRateDaily?:number;penaltyGraceDays?:number;allocations?:PaymentAllocation[]}
export interface BankStatementLine{id:string;bank:string;bookingDate:string;amount:number;currency:Currency;payer:string;purpose:string;reference:string;matchedDealId?:string;confidence:number;status:"matched"|"suggested"|"unmatched"|"confirmed";exchangeRate?:number;accountingStatus?:"unreviewed"|"confirmed"|"reversed";receiptId?:string}
export interface ExchangeRate{id:string;currency:Currency;rateToAMD:number;effectiveDate:string;source:string;status:"active"|"archived";updatedBy:string}
export interface PaymentReceiptAllocation{id:string;scheduleItemId:string;dealId:string;amount:number;currency:Currency}
export type PaymentReceiptStatus="allocated"|"partially-allocated"|"advance"|"refunded"|"reversed";
export interface PaymentReceipt{id:string;bankLineId?:string;dealId:string;receivedAt:string;payer:string;bank:string;reference:string;sourceAmount:number;sourceCurrency:Currency;dealAmount:number;dealCurrency:Currency;exchangeRate:number;allocatedAmount:number;unallocatedAmount:number;refundedAmount?:number;status:PaymentReceiptStatus;accountingStatus:"confirmed"|"reversed";allocations:PaymentReceiptAllocation[];note?:string}
export type FinancialSecurityType="pledge"|"guarantee"|"bank-guarantee"|"insurance"|"surety"|"advance"|"other";
export type FinancialSecurityStatus="draft"|"active"|"expiring"|"expired"|"released";
export interface FinancialSecurity{id:string;dealId:string;type:FinancialSecurityType;provider:string;amount:number;currency:Currency;validFrom:string;validUntil?:string;status:FinancialSecurityStatus;documentNo:string;documentName?:string;beneficiary:string;owner:string;note?:string}
export interface RestructureScheduleLine{dueDate:string;title:string;amount:number;source:"buyer"|"mortgage"|"reservation"}
export interface RestructureCase{id:string;dealId:string;clientName:string;reason:string;oldTerms:string;newTerms:string;impact:number;status:"draft"|"approval"|"approved";owner:string;updatedAt:string;proposedSchedule?:RestructureScheduleLine[];approvalId?:string;appliedVersion?:string}
export interface PaymentScheduleVersion{id:string;dealId:string;version:number;createdAt:string;reason:string;sourceCaseId?:string;rows:PaymentScheduleItem[]}
export interface DealObligation{id:string;dealId:string;approvalId:string;title:string;condition:string;status:"open"|"completed";owner:string;createdAt:string}

export interface PriceListVersion{id:string;project:string;building:string;effectiveFrom:string;adjustmentPercent:number;status:"draft"|"active"|"archived";createdBy:string;createdAt:string;note:string}
export interface PropertyPriceHistory{id:string;propertyId:string;pricePerSqm:number;totalPrice:number;effectiveFrom:string;versionId:string;reason:string}

export type HandoverStatus="readiness"|"inspection"|"defects"|"reinspection"|"acceptance"|"handed-over";
export type ClientAcceptanceStatus="pending"|"confirmed"|"declined";
export type DefectSeverity="minor"|"major"|"critical";
export type DefectStatus="open"|"in-progress"|"ready-for-check"|"resolved";
export type WarrantyStatus="new"|"assigned"|"in-progress"|"waiting-client"|"resolved"|"closed";
export interface AssignmentEvent{id:string;at:string;actor:string;from:string;to:string;note:string}
export interface ServiceEvent{id:string;at:string;actor:string;action:string;note:string}

export interface HandoverCase{id:string;dealId:string;clientId:string;clientName:string;propertyId:string;propertyLabel:string;project:string;status:HandoverStatus;plannedAt:string;coordinator:string;financialClearance:boolean;registrationClearance:boolean;technicalReadiness:number;keysCount:number;actNo?:string;handedOverAt?:string;clientAcceptance?:ClientAcceptanceStatus;clientAcceptedAt?:string;clientAcceptanceComment?:string;clientAcceptanceBy?:string}
export interface InspectionRoom{id:string;handoverId:string;name:string;area:number;checklistDone:number;checklistTotal:number;defectCount:number;state:"ready"|"attention"|"blocked"}
export interface Defect{id:string;handoverId:string;roomId:string;roomName:string;title:string;description:string;severity:DefectSeverity;status:DefectStatus;contractor:string;createdAt:string;dueAt:string;evidence:number;beforeEvidence?:number;afterEvidence?:number;resolutionNote?:string;reinspectionAt?:string;assignmentHistory?:AssignmentEvent[]}
export interface WarrantyCase{id:string;clientId:string;clientName:string;propertyId:string;propertyLabel:string;category:string;title:string;description:string;priority:"low"|"medium"|"high"|"urgent";status:WarrantyStatus;createdAt:string;dueAt:string;owner:string;contractor:string;channel:"mobile"|"manager"|"call-center";attachments:number;slaHours:number;beforeEvidence?:number;afterEvidence?:number;resolutionNote?:string;clientNotifiedAt?:string;clientConfirmation?:ClientAcceptanceStatus;clientConfirmedAt?:string;clientComment?:string;csat?:number;csatComment?:string;resolvedAt?:string;closedAt?:string;escalationLevel?:number;escalatedAt?:string;escalationReason?:string;assignmentHistory?:AssignmentEvent[];history?:ServiceEvent[]}

export type NotificationCategory="approval"|"payment"|"legal"|"registration"|"handover"|"service"|"sla"|"general";
export type NotificationSeverity="info"|"warning"|"critical"|"success";
export interface PlatformNotification{
  id:string;sourceKey:string;category:NotificationCategory;severity:NotificationSeverity;title:string;description:string;createdAt:string;targetRoles:string[];sourceRoute?:string;sourceLabel?:string;dealId?:string;clientName?:string;propertyLabel?:string;readAt?:string;snoozedUntil?:string;archivedAt?:string;resolvedAt?:string;meta?:string[]
}
