import { getLang, t } from "../i18n";

const exactMaps: Record<"source"|"district"|"lastActivity"|"nextAction"|"notes", Record<string,string>> = {
  source: {
    "Website":"leads.source.website",
    "Instagram":"leads.source.instagram",
    "Facebook":"leads.source.facebook",
    "Referral":"leads.source.referral",
    "Call center":"leads.source.callCenter",
    "Call Center":"leads.source.callCenter",
    "Partner":"leads.source.partner",
    "Walk-in":"leads.source.walkIn",
    "Import":"leads.source.import"
  },
  district: {
    "Arabkir / Nor Nork":"leads.district.arabkirNorNork",
    "Nor Nork":"leads.district.norNork",
    "Yerevan":"leads.district.yerevan",
    "Norq":"leads.district.norq",
    "Any":"leads.district.any"
  },
  lastActivity: {
    "Сегодня · 11:42":"leads.activity.today1142",
    "Сегодня · 10:15":"leads.activity.today1015",
    "Вчера · 18:30":"leads.activity.yesterday1830",
    "Вчера · 16:05":"leads.activity.yesterday1605",
    "16.09 · 14:22":"leads.activity.sep16_1422",
    "16.09 · 12:08":"leads.activity.sep16_1208",
    "15.09 · 17:20":"leads.activity.sep15_1720",
    "сейчас":"leads.activity.now",
    "i18n:leads.activity.now":"leads.activity.now",
    "импорт · сейчас":"leads.activity.importNow"
  },
  nextAction: {
    "Первичный звонок":"leads.nextAction.initialCall",
    "Подбор объектов":"leads.nextAction.propertySelection",
    "Просмотр 18.09 · 15:00":"leads.nextAction.viewingSep18",
    "Ожидаем ответ по предложению":"leads.nextAction.awaitOfferReply",
    "Оплата брони до 18.09":"leads.nextAction.reservationPayment",
    "Уточнить бюджет":"leads.nextAction.clarifyBudget",
    "Подготовить пакет объектов":"leads.nextAction.preparePropertyPack",
    "Звонок · сегодня 17:30":"leads.nextAction.callToday1730",
    "i18n:leads.nextAction.initialCallToday":"leads.nextAction.initialCallToday",
    "i18n:leads.nextAction.callToday1730":"leads.nextAction.callToday1730"
  },
  notes: {
    "Ищет квартиру для собственного проживания. Предпочтение — высокий этаж и вид на город.":"leads.notes.ownResidence",
    "Готов рассматривать рассрочку до 18 месяцев. Важна парковка.":"leads.notes.installmentParking",
    "Покупка для семьи, проживающей за рубежом. Нужен English document pack.":"leads.notes.familyAbroad",
    "Сравнивает B-1204 и B-1302. Нужны 3 варианта графика оплаты.":"leads.notes.compareUnits",
    "Объект B-1205. Бронь ожидает оплаты.":"leads.notes.reservationPending",
    "Инвестиционная покупка. Интересует ликвидность и аренда.":"leads.notes.investment",
    "Рассматривает покупку двух объектов, возможна пакетная скидка.":"leads.notes.twoUnits",
    "Первичный интерес к новостройке.":"leads.notes.initialInterest"
  }
};

export function leadLocalized(kind:keyof typeof exactMaps, value:string):string {
  if (value.startsWith("i18n:")) return t(value.slice(5));
  const key=exactMaps[kind][value];
  return key?t(key):value;
}

export function leadSource(value:string){ return leadLocalized("source",value); }
export function leadDistrict(value:string){ return leadLocalized("district",value); }
export function leadLastActivity(value:string){ return leadLocalized("lastActivity",value); }
export function leadNextAction(value:string){ return leadLocalized("nextAction",value); }
export function leadNotes(value:string){ return leadLocalized("notes",value); }

export function leadStageLabel(stage:string){ return t(`leads.stage.${stage}`); }
export function currentLeadLanguageName(code:string){
  const key=`leads.language.${code.toLowerCase()}`;
  const value=t(key);
  return value===key?code:value;
}
