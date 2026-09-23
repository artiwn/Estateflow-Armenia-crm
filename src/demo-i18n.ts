import {getLang,t} from "./i18n";

/**
 * Temporary adapter for localized demo fixture content.
 * Static UI copy must use t("...") directly. This helper exists only because
 * the current in-memory demo data still stores several human-readable labels
 * instead of stable machine codes. User-entered values are returned unchanged.
 */
const fixtureTranslations:Record<string,{ru:string;hy:string;en:string}>={
  "18 months": {
    "ru": "18 месяцев",
    "hy": "18 ամիս",
    "en": "18 months"
  },
  "2 above 7% require director approval": {
    "ru": "2 above 7% require director approval",
    "hy": "7%-ից բարձր 2 դեպք պահանջում է տնօրենի հաստատում",
    "en": "2 above 7% require director approval"
  },
  "2 cases blocked by defects": {
    "ru": "2 cases blocked by defects",
    "hy": "2 դեպք արգելափակված է թերությունների պատճառով",
    "en": "2 cases blocked by defects"
  },
  "24 months": {
    "ru": "24 месяца",
    "hy": "24 ամիս",
    "en": "24 months"
  },
  "3.8M ֏ до 30.09 + 7.3M ֏ до 10.10 + 25.9M ֏ ипотека 20.10": {
    "ru": "3.8M ֏ до 30.09 + 7.3M ֏ до 10.10 + 25.9M ֏ ипотека 20.10",
    "hy": "3.8M ֏ մինչև 30.09 + 7.3M ֏ մինչև 10.10 + 25.9M ֏ հիփոթեք 20.10",
    "en": "3.8M ֏ by 30.09 + 7.3M ֏ by 10.10 + 25.9M ֏ mortgage 20.10"
  },
  "30% + ипотека": {
    "ru": "30% + ипотека",
    "hy": "30% + հիփոթեք",
    "en": "30% + mortgage"
  },
  "4 obligations · oldest 11 days": {
    "ru": "4 obligations · oldest 11 days",
    "hy": "4 պարտավորություն · ամենահինը՝ 11 օր",
    "en": "4 obligations · oldest 11 days"
  },
  "5M ֏ reservation + 15.8745M ֏ buyer + 47M ֏ bank": {
    "ru": "5M ֏ reservation + 15.8745M ֏ buyer + 47M ֏ bank",
    "hy": "5M ֏ ամրագրում + 15.8745M ֏ գնորդ + 47M ֏ բանկ",
    "en": "5M ֏ reservation + 15.8745M ֏ buyer + 47M ֏ bank"
  },
  "7.3M ֏ до 13.09 + 3.8M ֏ до 30.09 + 25.9M ֏ ипотека": {
    "ru": "7.3M ֏ до 13.09 + 3.8M ֏ до 30.09 + 25.9M ֏ ипотека",
    "hy": "7.3M ֏ մինչև 13.09 + 3.8M ֏ մինչև 30.09 + 25.9M ֏ հիփոթեք",
    "en": "7.3M ֏ by 13.09 + 3.8M ֏ by 30.09 + 25.9M ֏ mortgage"
  },
  "Advance payment B-1303 / DL-2026-00477": {
    "ru": "Авансовый платеж B-1303 / DL-2026-00477",
    "hy": "Կանխավճար B-1303 / DL-2026-00477",
    "en": "Advance payment B-1303 / DL-2026-00477"
  },
  "Any": {
    "ru": "Любой район",
    "hy": "Ցանկացած",
    "en": "Any"
  },
  "Apartment advance": {
    "ru": "Аванс за квартиру",
    "hy": "Բնակարանի կանխավճար",
    "en": "Apartment advance"
  },
  "Apr": {
    "ru": "Apr",
    "hy": "Ապր",
    "en": "Apr"
  },
  "Arabkir": {
    "ru": "Arabkir",
    "hy": "Արաբկիր",
    "en": "Arabkir"
  },
  "Arabkir / Nor Nork": {
    "ru": "Арабкир / Нор Норк",
    "hy": "Արաբկիր / Նոր Նորք",
    "en": "Arabkir / Nor Nork"
  },
  "Archive": {
    "ru": "Archive",
    "hy": "Արխիվ",
    "en": "Archive"
  },
  "Aug": {
    "ru": "Aug",
    "hy": "Օգս",
    "en": "Aug"
  },
  "Authority / UBO review": {
    "ru": "Проверка полномочий / UBO",
    "hy": "Լիազորությունների / UBO ստուգում",
    "en": "Authority / UBO review"
  },
  "Bank financing": {
    "ru": "Bank financing",
    "hy": "Բանկային ֆինանսավորում",
    "en": "Bank financing"
  },
  "Buyer contribution": {
    "ru": "Buyer contribution",
    "hy": "Գնորդի մասնակցություն",
    "en": "Buyer contribution"
  },
  "Buyer down payment": {
    "ru": "Buyer down payment",
    "hy": "Գնորդի կանխավճար",
    "en": "Buyer down payment"
  },
  "Buyer requested revised handover clause": {
    "ru": "Покупатель запросил изменение условия передачи",
    "hy": "Գնորդը խնդրել է փոխել հանձնման պայմանը",
    "en": "Buyer requested revised handover clause"
  },
  "Call center": {
    "ru": "Колл-центр",
    "hy": "Զանգերի կենտրոն",
    "en": "Call center"
  },
  "Cases at risk or overdue": {
    "ru": "Cases at risk or overdue",
    "hy": "Ռիսկային կամ ժամկետանց դեպքեր",
    "en": "Cases at risk or overdue"
  },
  "Commercial Office": {
    "ru": "Коммерческий отдел",
    "hy": "Կոմերցիոն բաժին",
    "en": "Commercial Office"
  },
  "Commercial director approval": {
    "ru": "Commercial director approval",
    "hy": "Կոմերցիոն տնօրենի հաստատում",
    "en": "Commercial director approval"
  },
  "Commercial real estate financing": {
    "ru": "Commercial real estate financing",
    "hy": "Կոմերցիոն անշարժ գույքի ֆինանսավորում",
    "en": "Commercial real estate financing"
  },
  "Contract deviation": {
    "ru": "Отклонение договора",
    "hy": "Պայմանագրային շեղում",
    "en": "Contract deviation"
  },
  "Contract payment": {
    "ru": "Contract payment",
    "hy": "Պայմանագրային վճարում",
    "en": "Contract payment"
  },
  "Corporate financing": {
    "ru": "Corporate financing",
    "hy": "Կորպորատիվ ֆինանսավորում",
    "en": "Corporate financing"
  },
  "Dec": {
    "ru": "Dec",
    "hy": "Դեկ",
    "en": "Dec"
  },
  "Deferred contract payment": {
    "ru": "Deferred contract payment",
    "hy": "Հետաձգված պայմանագրային վճարում",
    "en": "Deferred contract payment"
  },
  "Discount approvals": {
    "ru": "Discount approvals",
    "hy": "Զեղչերի հաստատումներ",
    "en": "Discount approvals"
  },
  "Electrical": {
    "ru": "Электрика",
    "hy": "Էլեկտրիկա",
    "en": "Electrical"
  },
  "Expected within 7 days · 73.8M ֏": {
    "ru": "Expected within 7 days · 73.8M ֏",
    "hy": "Սպասվում է 7 օրվա ընթացքում · 73.8 մլն ֏",
    "en": "Expected within 7 days · 73.8M ֏"
  },
  "Feb": {
    "ru": "Feb",
    "hy": "Փետ",
    "en": "Feb"
  },
  "For Arman Petrosyan reservation apartment B1204": {
    "ru": "Бронирование квартиры B1204 для Армана Петросяна",
    "hy": "Արման Պետրոսյանի B1204 բնակարանի ամրագրման համար",
    "en": "For Arman Petrosyan reservation apartment B1204"
  },
  "Full settlement": {
    "ru": "Full settlement",
    "hy": "Ամբողջական հաշվարկ",
    "en": "Full settlement"
  },
  "Handover backlog": {
    "ru": "Handover backlog",
    "hy": "Հանձնման կուտակում",
    "en": "Handover backlog"
  },
  "High": {
    "ru": "Высокий",
    "hy": "Բարձր",
    "en": "High"
  },
  "Home purchase financing": {
    "ru": "Home purchase financing",
    "hy": "Բնակարան ձեռք բերելու ֆինանսավորում",
    "en": "Home purchase financing"
  },
  "Housing mortgage": {
    "ru": "Housing mortgage",
    "hy": "Բնակարանային հիփոթեք",
    "en": "Housing mortgage"
  },
  "ID reader": {
    "ru": "ID reader",
    "hy": "ID ընթերցիչ",
    "en": "ID reader"
  },
  "ID карта": {
    "ru": "ID карта",
    "hy": "ID քարտ",
    "en": "ID card"
  },
  "Initial contribution": {
    "ru": "Initial contribution",
    "hy": "Սկզբնական մասնակցություն",
    "en": "Initial contribution"
  },
  "Inspection & defects": {
    "ru": "Inspection & defects",
    "hy": "Զննում և թերություններ",
    "en": "Inspection & defects"
  },
  "Jan": {
    "ru": "Jan",
    "hy": "Հուն",
    "en": "Jan"
  },
  "Jul": {
    "ru": "Jul",
    "hy": "Հլս",
    "en": "Jul"
  },
  "Jun": {
    "ru": "Jun",
    "hy": "Հնս",
    "en": "Jun"
  },
  "Kentron": {
    "ru": "Kentron",
    "hy": "Կենտրոն",
    "en": "Kentron"
  },
  "Legal review · today": {
    "ru": "Legal review · today",
    "hy": "Իրավական ստուգում · այսօր",
    "en": "Legal review · today"
  },
  "Low": {
    "ru": "Низкий",
    "hy": "Ցածր",
    "en": "Low"
  },
  "Mar": {
    "ru": "Mar",
    "hy": "Մրտ",
    "en": "Mar"
  },
  "May": {
    "ru": "May",
    "hy": "Մյս",
    "en": "May"
  },
  "Medium": {
    "ru": "Средний",
    "hy": "Միջին",
    "en": "Medium"
  },
  "Mortgage bridge period": {
    "ru": "Переходный период ипотечного финансирования",
    "hy": "Հիփոթեքային անցումային շրջան",
    "en": "Mortgage bridge period"
  },
  "Mortgage decisions": {
    "ru": "Mortgage decisions",
    "hy": "Հիփոթեքային որոշումներ",
    "en": "Mortgage decisions"
  },
  "Mortgage disbursement": {
    "ru": "Mortgage disbursement",
    "hy": "Հիփոթեքային տրամադրում",
    "en": "Mortgage disbursement"
  },
  "Mortgage package": {
    "ru": "Mortgage package",
    "hy": "Հիփոթեքային փաթեթ",
    "en": "Mortgage package"
  },
  "Non-standard clause": {
    "ru": "Нестандартное условие",
    "hy": "Ոչ ստանդարտ պայման",
    "en": "Non-standard clause"
  },
  "Nor Nork": {
    "ru": "Нор Норк",
    "hy": "Նոր Նորք",
    "en": "Nor Nork"
  },
  "Nor Nork / Norq": {
    "ru": "Nor Nork / Norq",
    "hy": "Նոր Նորք / Նորք",
    "en": "Nor Nork / Norq"
  },
  "Norq": {
    "ru": "Норк",
    "hy": "Նորք",
    "en": "Norq"
  },
  "Notary scan": {
    "ru": "Notary scan",
    "hy": "Նոտարական սկան",
    "en": "Notary scan"
  },
  "Nov": {
    "ru": "Nov",
    "hy": "Նոյ",
    "en": "Nov"
  },
  "OCR + manual verification": {
    "ru": "OCR + manual verification",
    "hy": "OCR + ձեռքով ստուգում",
    "en": "OCR + manual verification"
  },
  "Oct": {
    "ru": "Oct",
    "hy": "Հոկ",
    "en": "Oct"
  },
  "Package purchase and long-term partnership": {
    "ru": "Пакетная покупка и долгосрочное сотрудничество",
    "hy": "Փաթեթային գնում և երկարաժամկետ համագործակցություն",
    "en": "Package purchase and long-term partnership"
  },
  "Partner": {
    "ru": "Партнер",
    "hy": "Գործընկեր",
    "en": "Partner"
  },
  "Partners": {
    "ru": "Partners",
    "hy": "Գործընկերներ",
    "en": "Partners"
  },
  "Payment / contract breach": {
    "ru": "Payment / contract breach",
    "hy": "Վճարման / պայմանագրի խախտում",
    "en": "Payment / contract breach"
  },
  "Payment overdue · 4 days": {
    "ru": "Payment overdue · 4 days",
    "hy": "Վճարումը ժամկետանց է · 4 օր",
    "en": "Payment overdue · 4 days"
  },
  "Payment under preliminary agreement": {
    "ru": "Платеж по предварительному договору",
    "hy": "Վճարում նախնական պայմանագրով",
    "en": "Payment under preliminary agreement"
  },
  "Primary market mortgage": {
    "ru": "Primary market mortgage",
    "hy": "Առաջնային շուկայի հիփոթեք",
    "en": "Primary market mortgage"
  },
  "RS-2026-011 · ипотечное финансирование": {
    "ru": "RS-2026-011 · ипотечное финансирование",
    "hy": "RS-2026-011 · հիփոթեքային ֆինանսավորում",
    "en": "RS-2026-011 · mortgage financing"
  },
  "Real estate payment": {
    "ru": "Платеж за недвижимость",
    "hy": "Անշարժ գույքի վճարում",
    "en": "Real estate payment"
  },
  "Receivables overdue": {
    "ru": "Receivables overdue",
    "hy": "Ժամկետանց դեբիտորական պարտք",
    "en": "Receivables overdue"
  },
  "Referral": {
    "ru": "Рекомендация",
    "hy": "Խորհուրդ",
    "en": "Referral"
  },
  "Reservation / advance": {
    "ru": "Reservation / advance",
    "hy": "Ամրագրում / կանխավճար",
    "en": "Reservation / advance"
  },
  "Reservation fee": {
    "ru": "Reservation fee",
    "hy": "Ամրագրման վճար",
    "en": "Reservation fee"
  },
  "Reservation payment · 18.09": {
    "ru": "Reservation payment · 18.09",
    "hy": "Ամրագրման վճարում · 18.09",
    "en": "Reservation payment · 18.09"
  },
  "Restructured buyer payment": {
    "ru": "Restructured buyer payment",
    "hy": "Վերակառուցված գնորդի վճարում",
    "en": "Restructured buyer payment"
  },
  "Sep": {
    "ru": "Sep",
    "hy": "Սեպ",
    "en": "Sep"
  },
  "Standard KYC": {
    "ru": "Стандартный KYC",
    "hy": "Ստանդարտ KYC",
    "en": "Standard KYC"
  },
  "Standard template": {
    "ru": "Типовой шаблон",
    "hy": "Տիպային շաբլոն",
    "en": "Standard template"
  },
  "State register": {
    "ru": "State register",
    "hy": "Պետական ռեգիստր",
    "en": "State register"
  },
  "System": {
    "ru": "Система",
    "hy": "Համակարգ",
    "en": "System"
  },
  "Uploaded": {
    "ru": "Uploaded",
    "hy": "Վերբեռնված",
    "en": "Uploaded"
  },
  "Warranty SLA": {
    "ru": "Warranty SLA",
    "hy": "Երաշխիքային SLA",
    "en": "Warranty SLA"
  },
  "Warranty case создан": {
    "ru": "Warranty case создан",
    "hy": "Երաշխիքային գործը ստեղծվել է",
    "en": "Warranty case created"
  },
  "Warranty period active": {
    "ru": "Warranty period active",
    "hy": "Երաշխիքային ժամկետը ակտիվ է",
    "en": "Warranty period active"
  },
  "Website": {
    "ru": "Сайт",
    "hy": "Կայք",
    "en": "Website"
  },
  "Windows": {
    "ru": "Окна",
    "hy": "Պատուհաններ",
    "en": "Windows"
  },
  "Yerevan": {
    "ru": "Ереван",
    "hy": "Երևան",
    "en": "Yerevan"
  },
  "accepted": {
    "ru": "accepted",
    "hy": "Ընդունված",
    "en": "Accepted"
  },
  "active": {
    "ru": "Активен",
    "hy": "Ակտիվ",
    "en": "Active"
  },
  "approval": {
    "ru": "Согласование",
    "hy": "Հաստատում",
    "en": "Approval"
  },
  "approved": {
    "ru": "Одобрено",
    "hy": "Հաստատված",
    "en": "Approved"
  },
  "archived": {
    "ru": "Архивирован",
    "hy": "Արխիվացված",
    "en": "Archived"
  },
  "assigned": {
    "ru": "Назначен",
    "hy": "Նշանակված",
    "en": "Assigned"
  },
  "available": {
    "ru": "Свободен",
    "hy": "Ազատ",
    "en": "Available"
  },
  "bank-review": {
    "ru": "На рассмотрении банка",
    "hy": "Բանկի դիտարկման փուլում",
    "en": "Bank review"
  },
  "buyer": {
    "ru": "Покупатель",
    "hy": "Գնորդ",
    "en": "Buyer"
  },
  "call-center": {
    "ru": "Колл-центр",
    "hy": "Զանգերի կենտրոն",
    "en": "Call center"
  },
  "client-review": {
    "ru": "client-review",
    "hy": "Հաճախորդի դիտարկում",
    "en": "Client review"
  },
  "cold": {
    "ru": "cold",
    "hy": "Ցածր հետաքրքրություն",
    "en": "Cold"
  },
  "company": {
    "ru": "Юридическое лицо",
    "hy": "Իրավաբանական անձ",
    "en": "Legal entity"
  },
  "contract": {
    "ru": "Договор",
    "hy": "Պայմանագիր",
    "en": "Contract"
  },
  "contracting": {
    "ru": "Кредитный договор",
    "hy": "Վարկային պայմանագիր",
    "en": "Credit contract"
  },
  "converted": {
    "ru": "converted",
    "hy": "Փոխարկված",
    "en": "Converted"
  },
  "current": {
    "ru": "Текущая",
    "hy": "Ընթացիկ",
    "en": "Current"
  },
  "documents": {
    "ru": "документов",
    "hy": "փաստաթուղթ",
    "en": "documents"
  },
  "draft": {
    "ru": "Черновик",
    "hy": "Սևագիր",
    "en": "Draft"
  },
  "due": {
    "ru": "срок",
    "hy": "ժամկետ",
    "en": "due"
  },
  "expired": {
    "ru": "expired",
    "hy": "Ժամկետանց",
    "en": "Expired"
  },
  "expiring": {
    "ru": "expiring",
    "hy": "Ժամկետն ավարտվում է",
    "en": "Expiring"
  },
  "future": {
    "ru": "По графику",
    "hy": "Ըստ գրաֆիկի",
    "en": "Scheduled"
  },
  "handover": {
    "ru": "Передача",
    "hy": "Հանձնում",
    "en": "Handover"
  },
  "high": {
    "ru": "Высокий",
    "hy": "Բարձր",
    "en": "High"
  },
  "hot": {
    "ru": "hot",
    "hy": "Բարձր հետաքրքրություն",
    "en": "Hot"
  },
  "in-progress": {
    "ru": "В работе",
    "hy": "Ընթացքում",
    "en": "In progress"
  },
  "individual": {
    "ru": "Физическое лицо",
    "hy": "Ֆիզիկական անձ",
    "en": "Individual"
  },
  "legal-review": {
    "ru": "legal-review",
    "hy": "Իրավական ստուգում",
    "en": "Legal review"
  },
  "low": {
    "ru": "Низкий",
    "hy": "Ցածր",
    "en": "Low"
  },
  "major": {
    "ru": "Серьезное",
    "hy": "Էական",
    "en": "Major"
  },
  "manager": {
    "ru": "Менеджер",
    "hy": "Մենեջեր",
    "en": "Manager"
  },
  "medium": {
    "ru": "Средний",
    "hy": "Միջին",
    "en": "Medium"
  },
  "minor": {
    "ru": "Незначительное",
    "hy": "Փոքր",
    "en": "Minor"
  },
  "missing": {
    "ru": "missing",
    "hy": "Բացակայում է",
    "en": "Missing"
  },
  "mobile": {
    "ru": "Мобильное приложение",
    "hy": "Բջջային հավելված",
    "en": "Mobile app"
  },
  "mortgage": {
    "ru": "Ипотека / банк",
    "hy": "Հիփոթեք / բանկ",
    "en": "Mortgage / bank"
  },
  "new": {
    "ru": "Новый",
    "hy": "Նոր",
    "en": "New"
  },
  "notary": {
    "ru": "notary",
    "hy": "Նոտար",
    "en": "Notary"
  },
  "offer": {
    "ru": "Предложение",
    "hy": "Առաջարկ",
    "en": "Offer"
  },
  "open": {
    "ru": "Открыт",
    "hy": "Բաց",
    "en": "Open"
  },
  "overdue": {
    "ru": "Просрочен",
    "hy": "Ժամկետանց",
    "en": "Overdue"
  },
  "paid": {
    "ru": "paid",
    "hy": "վճարված",
    "en": "paid"
  },
  "partial": {
    "ru": "Частично",
    "hy": "Մասնակի",
    "en": "Partial"
  },
  "payment": {
    "ru": "Оплата",
    "hy": "Վճարում",
    "en": "Payment"
  },
  "pending": {
    "ru": "Ожидает",
    "hy": "Սպասում է",
    "en": "Pending"
  },
  "preparation": {
    "ru": "preparation",
    "hy": "Նախապատրաստում",
    "en": "Preparation"
  },
  "ready": {
    "ru": "готово",
    "hy": "պատրաստ է",
    "en": "ready"
  },
  "ready-for-check": {
    "ru": "На повторную проверку",
    "hy": "Կրկնակի ստուգման",
    "en": "Ready for recheck"
  },
  "reservation": {
    "ru": "Бронь",
    "hy": "Ամրագրում",
    "en": "Reservation"
  },
  "reserved": {
    "ru": "Забронирован",
    "hy": "Ամրագրված",
    "en": "Reserved"
  },
  "review": {
    "ru": "На проверке",
    "hy": "Ստուգման փուլում",
    "en": "Under review"
  },
  "sent": {
    "ru": "sent",
    "hy": "Ուղարկված",
    "en": "Sent"
  },
  "signature": {
    "ru": "signature",
    "hy": "Ստորագրման փուլ",
    "en": "Signature"
  },
  "signed": {
    "ru": "signed",
    "hy": "Ստորագրված",
    "en": "Signed"
  },
  "sold": {
    "ru": "Продан",
    "hy": "Վաճառված",
    "en": "Sold"
  },
  "submitted": {
    "ru": "submitted",
    "hy": "Ներկայացված է",
    "en": "Submitted"
  },
  "suggested": {
    "ru": "Предложено",
    "hy": "Առաջարկված",
    "en": "Suggested"
  },
  "unmatched": {
    "ru": "Не распознано",
    "hy": "Չճանաչված",
    "en": "Unmatched"
  },
  "valid": {
    "ru": "valid",
    "hy": "Վավեր",
    "en": "Valid"
  },
  "verified": {
    "ru": "Проверен",
    "hy": "Ստուգված",
    "en": "Verified"
  },
  "viewed": {
    "ru": "viewed",
    "hy": "Դիտված",
    "en": "Viewed"
  },
  "warm": {
    "ru": "warm",
    "hy": "Միջին հետաքրքրություն",
    "en": "Warm"
  },
  "Августовская индексация": {
    "ru": "Августовская индексация",
    "hy": "Օգոստոսյան ինդեքսավորում",
    "en": "August indexation"
  },
  "Активный прайс-лист": {
    "ru": "Активный прайс-лист",
    "hy": "Ակտիվ գնացուցակ",
    "en": "Active price list"
  },
  "Базовый прайс Q3": {
    "ru": "Базовый прайс Q3",
    "hy": "Q3 բազային գնացուցակ",
    "en": "Q3 base price list"
  },
  "Балкон": {
    "ru": "Балкон",
    "hy": "Պատշգամբ",
    "en": "Balcony"
  },
  "Банк одобрил финансирование. Требуется переход к кредитному договору и страхованию.": {
    "ru": "Банк одобрил финансирование. Требуется переход к кредитному договору и страхованию.",
    "hy": "Բանկը հաստատել է ֆինանսավորումը։ Անհրաժեշտ է անցնել վարկային պայմանագրին և ապահովագրությանը։",
    "en": "The bank approved financing. Proceed to the credit contract and insurance."
  },
  "Бывший представитель": {
    "ru": "Бывший представитель",
    "hy": "Նախկին ներկայացուցիչ",
    "en": "Former representative"
  },
  "Встреча в офисе продаж": {
    "ru": "Встреча в офисе продаж",
    "hy": "Հանդիպում վաճառքի գրասենյակում",
    "en": "Meeting at sales office"
  },
  "Вчера · 16:05": {
    "ru": "Вчера · 16:05",
    "hy": "Երեկ · 16:05",
    "en": "Yesterday · 16:05"
  },
  "Вчера · 18:30": {
    "ru": "Вчера · 18:30",
    "hy": "Երեկ · 18:30",
    "en": "Yesterday · 18:30"
  },
  "Герметизация наружного шва": {
    "ru": "Герметизация наружного шва",
    "hy": "Արտաքին կարի հերմետիկացում",
    "en": "Exterior joint sealing"
  },
  "Гостиная": {
    "ru": "Гостиная",
    "hy": "Հյուրասենյակ",
    "en": "Living room"
  },
  "Готов рассматривать рассрочку до 18 месяцев. Важна парковка.": {
    "ru": "Готов рассматривать рассрочку до 18 месяцев. Важна парковка.",
    "hy": "Պատրաստ է դիտարկել մինչև 18 ամսվա տարաժամկետ վճարում։ Կարևոր է կայանատեղին։",
    "en": "Open to installment terms up to 18 months. Parking is important."
  },
  "Директор": {
    "ru": "Директор",
    "hy": "Տնօրեն",
    "en": "Director"
  },
  "Добавлено отклонение по сроку передачи": {
    "ru": "Добавлено отклонение по сроку передачи",
    "hy": "Ավելացվել է շեղում հանձնման ժամկետի վերաբերյալ",
    "en": "Handover-term deviation added"
  },
  "Доверенность завершилась 04.08.2026": {
    "ru": "Доверенность завершилась 04.08.2026",
    "hy": "Լիազորագրի գործողությունն ավարտվել է 04.08.2026",
    "en": "Power of attorney expired on 04.08.2026"
  },
  "Договор рассрочки": {
    "ru": "Договор рассрочки",
    "hy": "Տարաժամկետ վճարման պայմանագիր",
    "en": "Installment contract"
  },
  "Звонок по срокам договора": {
    "ru": "Звонок по срокам договора",
    "hy": "Զանգ պայմանագրի ժամկետների վերաբերյալ",
    "en": "Call about contract timeline"
  },
  "Инвестиционная квартира": {
    "ru": "Инвестиционная квартира",
    "hy": "Ներդրումային բնակարան",
    "en": "Investment apartment"
  },
  "Инвестиционная покупка. Интересует ликвидность и аренда.": {
    "ru": "Инвестиционная покупка. Интересует ликвидность и аренда.",
    "hy": "Ներդրումային գնում։ Հետաքրքրում են իրացվելիությունն ու վարձակալությունը։",
    "en": "Investment purchase. Interested in liquidity and rental potential."
  },
  "Ипотека": {
    "ru": "Ипотека",
    "hy": "Հիփոթեք",
    "en": "Mortgage"
  },
  "Исправлены реквизиты клиента": {
    "ru": "Исправлены реквизиты клиента",
    "hy": "Հաճախորդի տվյալները շտկվել են",
    "en": "Client details corrected"
  },
  "Ищет квартиру для собственного проживания. Предпочтение — высокий этаж и вид на город.": {
    "ru": "Ищет квартиру для собственного проживания. Предпочтение — высокий этаж и вид на город.",
    "hy": "Փնտրում է բնակարան սեփական բնակության համար։ Նախընտրում է բարձր հարկ և քաղաքի տեսարան։",
    "en": "Looking for an apartment for own residence. Prefers a high floor and city view."
  },
  "Квартира": {
    "ru": "Квартира",
    "hy": "Բնակարան",
    "en": "Apartment"
  },
  "Квартира + parking": {
    "ru": "Квартира + parking",
    "hy": "Բնակարան + կայանատեղի",
    "en": "Apartment + parking"
  },
  "Клиент подтвердил готовность подписать после финального legal review.": {
    "ru": "Клиент подтвердил готовность подписать после финального legal review.",
    "hy": "Հաճախորդը հաստատել է ստորագրելու պատրաստակամությունը վերջնական իրավական ստուգումից հետո։",
    "en": "Client confirmed readiness to sign after final legal review."
  },
  "Клиент просит проверить плотность прилегания створки.": {
    "ru": "Клиент просит проверить плотность прилегания створки.",
    "hy": "Հաճախորդը խնդրում է ստուգել փեղկի հպման խտությունը։",
    "en": "Client asks to check sash sealing pressure."
  },
  "Клиент сообщил о шуме внутреннего блока кондиционирования.": {
    "ru": "Клиент сообщил о шуме внутреннего блока кондиционирования.",
    "hy": "Հաճախորդը հայտնել է օդորակիչի ներքին բլոկի աղմուկի մասին։",
    "en": "Client reported noise from the indoor AC unit."
  },
  "Комментарии к договору": {
    "ru": "Комментарии к договору",
    "hy": "Պայմանագրի մեկնաբանություններ",
    "en": "Contract comments"
  },
  "Коммерческий пакет": {
    "ru": "Коммерческий пакет",
    "hy": "Կոմերցիոն փաթեթ",
    "en": "Commercial package"
  },
  "Кредит одобрен. Банк готовит пакет залога и график выдачи средств.": {
    "ru": "Кредит одобрен. Банк готовит пакет залога и график выдачи средств.",
    "hy": "Վարկը հաստատված է։ Բանկը պատրաստում է գրավի փաթեթը և միջոցների տրամադրման գրաֆիկը։",
    "en": "Credit approved. The bank is preparing the collateral package and disbursement schedule."
  },
  "Кухня": {
    "ru": "Кухня",
    "hy": "Խոհանոց",
    "en": "Kitchen"
  },
  "Не хватает банковской выписки, подтверждения занятости и страхового заявления.": {
    "ru": "Не хватает банковской выписки, подтверждения занятости и страхового заявления.",
    "hy": "Բացակայում են բանկային քաղվածքը, զբաղվածության հաստատումը և ապահովագրական դիմումը։",
    "en": "Bank statement, employment verification and insurance application are missing."
  },
  "Небольшой скол на настенной плитке рядом с дверной коробкой.": {
    "ru": "Небольшой скол на настенной плитке рядом с дверной коробкой.",
    "hy": "Փոքր վնասվածք պատի սալիկի վրա՝ դռան շրջանակի մոտ։",
    "en": "Small chip on wall tile near the door frame."
  },
  "Объект B-1205. Бронь ожидает оплаты.": {
    "ru": "Объект B-1205. Бронь ожидает оплаты.",
    "hy": "B-1205 գույք։ Ամրագրումը սպասում է վճարման։",
    "en": "Property B-1205. Reservation is awaiting payment."
  },
  "Одна из розеток рабочей зоны не подает питание.": {
    "ru": "Одна из розеток рабочей зоны не подает питание.",
    "hy": "Աշխատանքային գոտու վարդակներից մեկը հոսանք չի տալիս։",
    "en": "One socket in the work area has no power."
  },
  "Ожидаем ответ по предложению": {
    "ru": "Ожидаем ответ по предложению",
    "hy": "Սպասում ենք առաջարկի պատասխանին",
    "en": "Awaiting response to the offer"
  },
  "Ожидается справка о доходах созаемщика и финальная оценка объекта.": {
    "ru": "Ожидается справка о доходах созаемщика и финальная оценка объекта.",
    "hy": "Սպասվում է համավարկառուի եկամուտների տեղեկանքը և գույքի վերջնական գնահատումը։",
    "en": "Co-borrower income statement and final property appraisal are pending."
  },
  "Оплата брони до 18.09": {
    "ru": "Оплата брони до 18.09",
    "hy": "Ամրագրման վճարում մինչև 18.09",
    "en": "Reservation payment due by 18.09"
  },
  "Основной договор купли-продажи": {
    "ru": "Основной договор купли-продажи",
    "hy": "Հիմնական առուվաճառքի պայմանագիր",
    "en": "Main sale and purchase agreement"
  },
  "Отправлен пакет ипотечных документов": {
    "ru": "Отправлен пакет ипотечных документов",
    "hy": "Հիփոթեքային փաստաթղթերի փաթեթը ուղարկվել է",
    "en": "Mortgage document package sent"
  },
  "Паспорт": {
    "ru": "Паспорт",
    "hy": "Անձնագիր",
    "en": "Passport"
  },
  "Первичная версия": {
    "ru": "Первичная версия",
    "hy": "Սկզբնական տարբերակ",
    "en": "Initial version"
  },
  "Первичный звонок": {
    "ru": "Первичный звонок",
    "hy": "Առաջնային զանգ",
    "en": "Initial call"
  },
  "Первоначальный график договора": {
    "ru": "Первоначальный график договора",
    "hy": "Պայմանագրի սկզբնական գրաֆիկ",
    "en": "Initial contract schedule"
  },
  "Переданы предварительный договор, технические данные объекта и график оплаты.": {
    "ru": "Переданы предварительный договор, технические данные объекта и график оплаты.",
    "hy": "Փոխանցվել են նախնական պայմանագիրը, գույքի տեխնիկական տվյալները և վճարման գրաֆիկը։",
    "en": "Preliminary agreement, property technical data and payment schedule were sent."
  },
  "Подбор объектов": {
    "ru": "Подбор объектов",
    "hy": "Գույքերի ընտրություն",
    "en": "Property selection"
  },
  "Подготовить пакет объектов": {
    "ru": "Подготовить пакет объектов",
    "hy": "Պատրաստել գույքերի փաթեթ",
    "en": "Prepare property package"
  },
  "Подготовка к регистрации": {
    "ru": "Подготовка к регистрации",
    "hy": "Գրանցման նախապատրաստում",
    "en": "Registration preparation"
  },
  "Подписание договора, нотариальные и регистрационные действия": {
    "ru": "Подписание договора, нотариальные и регистрационные действия",
    "hy": "Պայմանագրի ստորագրում, նոտարական և գրանցման գործողություններ",
    "en": "Contract signing, notarial and registration actions"
  },
  "Подписание договора, нотариальные и регистрационные действия по B-1204": {
    "ru": "Подписание договора, нотариальные и регистрационные действия по B-1204",
    "hy": "B-1204-ի պայմանագրի ստորագրում, նոտարական և գրանցման գործողություններ",
    "en": "Contract signing, notarial and registration actions for B-1204"
  },
  "Подписанный экземпляр": {
    "ru": "Подписанный экземпляр",
    "hy": "Ստորագրված օրինակ",
    "en": "Signed copy"
  },
  "Покупка для семьи, проживающей за рубежом. Нужен English document pack.": {
    "ru": "Покупка для семьи, проживающей за рубежом. Нужен English document pack.",
    "hy": "Գնում արտերկրում բնակվող ընտանիքի համար։ Անհրաժեշտ է փաստաթղթերի անգլերեն փաթեթ։",
    "en": "Purchase for a family living abroad. English document pack required."
  },
  "Полномочия действуют до 30.09.2026": {
    "ru": "Полномочия действуют до 30.09.2026",
    "hy": "Լիազորությունները գործում են մինչև 30.09.2026",
    "en": "Authority valid until 30.09.2026"
  },
  "Полный расчет до 25.09": {
    "ru": "Полный расчет до 25.09",
    "hy": "Ամբողջական հաշվարկ մինչև 25.09",
    "en": "Full settlement by 25.09"
  },
  "Получение документов": {
    "ru": "Получение документов",
    "hy": "Փաստաթղթերի ստացում",
    "en": "Document collection"
  },
  "Получены замечания юридического отдела покупателя.": {
    "ru": "Получены замечания юридического отдела покупателя.",
    "hy": "Ստացվել են գնորդի իրավաբանական բաժնի դիտարկումները։",
    "en": "Buyer legal team comments received."
  },
  "После 20–30 минут работы появляется вибрационный шум.": {
    "ru": "После 20–30 минут работы появляется вибрационный шум.",
    "hy": "20–30 րոպե աշխատանքից հետո առաջանում է թրթռման աղմուկ։",
    "en": "A vibration noise appears after 20–30 minutes of operation."
  },
  "Право подписи по уставу": {
    "ru": "Право подписи по уставу",
    "hy": "Ստորագրման իրավունք՝ ըստ կանոնադրության",
    "en": "Signing authority under charter"
  },
  "Предварительный договор": {
    "ru": "Предварительный договор",
    "hy": "Նախնական պայմանագիր",
    "en": "Preliminary agreement"
  },
  "Представитель по доверенности": {
    "ru": "Представитель по доверенности",
    "hy": "Ներկայացուցիչ լիազորագրով",
    "en": "Representative by power of attorney"
  },
  "Представление компании и подписание договоров купли-продажи": {
    "ru": "Представление компании и подписание договоров купли-продажи",
    "hy": "Ընկերության ներկայացում և առուվաճառքի պայմանագրերի ստորագրում",
    "en": "Company representation and signing of sale agreements"
  },
  "При одновременном включении смесителя и душа давление заметно падает.": {
    "ru": "При одновременном включении смесителя и душа давление заметно падает.",
    "hy": "Ծորակը և ցնցուղը միաժամանակ միացնելիս ճնշումը նկատելիորեն նվազում է։",
    "en": "Pressure drops noticeably when the mixer and shower are used simultaneously."
  },
  "Прихожая": {
    "ru": "Прихожая",
    "hy": "Նախասրահ",
    "en": "Entrance hall"
  },
  "Проверка уплотнителя окна": {
    "ru": "Проверка уплотнителя окна",
    "hy": "Պատուհանի հերմետիկության ստուգում",
    "en": "Window seal inspection"
  },
  "Просмотр 18.09 · 15:00": {
    "ru": "Просмотр 18.09 · 15:00",
    "hy": "Դիտում 18.09 · 15:00",
    "en": "Viewing 18.09 · 15:00"
  },
  "Просрочка первого платежа и ожидание ипотечного решения": {
    "ru": "Просрочка первого платежа и ожидание ипотечного решения",
    "hy": "Առաջին վճարման ուշացում և հիփոթեքային որոշման սպասում",
    "en": "First payment overdue while awaiting mortgage decision"
  },
  "Просрочка платежа": {
    "ru": "Просрочка платежа",
    "hy": "Վճարման ուշացում",
    "en": "Payment overdue"
  },
  "Регулировка балконной двери": {
    "ru": "Регулировка балконной двери",
    "hy": "Պատշգամբի դռան կարգավորում",
    "en": "Balcony door adjustment"
  },
  "Решение о крупной сделке": {
    "ru": "Решение о крупной сделке",
    "hy": "Խոշոր գործարքի որոշում",
    "en": "Major transaction approval"
  },
  "Розетка в кухне не работает": {
    "ru": "Розетка в кухне не работает",
    "hy": "Խոհանոցի վարդակը չի աշխատում",
    "en": "Kitchen socket not working"
  },
  "Санузел": {
    "ru": "Санузел",
    "hy": "Սանհանգույց",
    "en": "Bathroom"
  },
  "Свидетельство госрегистрации": {
    "ru": "Свидетельство госрегистрации",
    "hy": "Պետական գրանցման վկայական",
    "en": "State registration certificate"
  },
  "Сентябрьский прайс по Building B": {
    "ru": "Сентябрьский прайс по корпусу B",
    "hy": "Սեպտեմբերյան գնացուցակ՝ B մասնաշենքի համար",
    "en": "September price list for Building B"
  },
  "Синхронизация графика с одобренным ипотечным финансированием": {
    "ru": "Синхронизация графика с одобренным ипотечным финансированием",
    "hy": "Գրաֆիկի համաժամեցում հաստատված հիփոթեքային ֆինանսավորման հետ",
    "en": "Align schedule with approved mortgage financing"
  },
  "Скол на плитке": {
    "ru": "Скол на плитке",
    "hy": "Սալիկի վնասվածք",
    "en": "Tile chip"
  },
  "Слабый напор холодной воды": {
    "ru": "Слабый напор холодной воды",
    "hy": "Սառը ջրի թույլ ճնշում",
    "en": "Low cold-water pressure"
  },
  "Согласие на приобретение объекта получено": {
    "ru": "Согласие на приобретение объекта получено",
    "hy": "Գույքի ձեռքբերման համաձայնությունը ստացվել է",
    "en": "Consent to acquire the property received"
  },
  "Согласие супруга": {
    "ru": "Согласие супруга",
    "hy": "Ամուսնու/կնոջ համաձայնություն",
    "en": "Spouse consent"
  },
  "Согласованы B-1204, структура финансирования и представители.": {
    "ru": "Согласованы B-1204, структура финансирования и представители.",
    "hy": "Համաձայնեցվել են B-1204-ը, ֆինանսավորման կառուցվածքը և ներկայացուցիչները։",
    "en": "B-1204, financing structure and representatives agreed."
  },
  "Соглашение о бронировании": {
    "ru": "Соглашение о бронировании",
    "hy": "Ամրագրման համաձայնագիր",
    "en": "Reservation agreement"
  },
  "Созаемщик по ипотеке": {
    "ru": "Созаемщик по ипотеке",
    "hy": "Հիփոթեքային համավարկառու",
    "en": "Mortgage co-borrower"
  },
  "Создан из заявки на покупку": {
    "ru": "Создан из заявки на покупку",
    "hy": "Ստեղծվել է գնման հայտից",
    "en": "Created from purchase application"
  },
  "Спальня 1": {
    "ru": "Спальня 1",
    "hy": "Ննջասենյակ 1",
    "en": "Bedroom 1"
  },
  "Спальня 2": {
    "ru": "Спальня 2",
    "hy": "Ննջասենյակ 2",
    "en": "Bedroom 2"
  },
  "Справка о доходах": {
    "ru": "Справка о доходах",
    "hy": "Եկամուտների տեղեկանք",
    "en": "Income certificate"
  },
  "Справка о семейном положении": {
    "ru": "Справка о семейном положении",
    "hy": "Ընտանեկան կարգավիճակի տեղեկանք",
    "en": "Marital status certificate"
  },
  "Сравнивает B-1204 и B-1302. Нужны 3 варианта графика оплаты.": {
    "ru": "Сравнивает B-1204 и B-1302. Нужны 3 варианта графика оплаты.",
    "hy": "Համեմատում է B-1204 և B-1302։ Անհրաժեշտ է վճարման գրաֆիկի 3 տարբերակ։",
    "en": "Comparing B-1204 and B-1302. Needs 3 payment schedule options."
  },
  "Створка задевает нижнюю часть рамы при закрытии.": {
    "ru": "Створка задевает нижнюю часть рамы при закрытии.",
    "hy": "Փակելիս դռան փեղկը դիպչում է շրջանակի ստորին մասին։",
    "en": "The sash touches the lower frame when closing."
  },
  "Супруг": {
    "ru": "Супруг",
    "hy": "Ամուսին",
    "en": "Husband"
  },
  "Супруга": {
    "ru": "Супруга",
    "hy": "Կին",
    "en": "Wife"
  },
  "Сформировано из брони": {
    "ru": "Сформировано из брони",
    "hy": "Ձևավորվել է ամրագրումից",
    "en": "Created from reservation"
  },
  "Требуется повторная герметизация участка примыкания парапета.": {
    "ru": "Требуется повторная герметизация участка примыкания парапета.",
    "hy": "Անհրաժեշտ է պարապետի միացման հատվածի կրկնակի հերմետիկացում։",
    "en": "Parapet junction requires resealing."
  },
  "Уполномоченный представитель": {
    "ru": "Уполномоченный представитель",
    "hy": "Լիազորված ներկայացուցիչ",
    "en": "Authorized representative"
  },
  "Устав": {
    "ru": "Устав",
    "hy": "Կանոնադրություն",
    "en": "Charter"
  },
  "Утвержденная версия": {
    "ru": "Утвержденная версия",
    "hy": "Հաստատված տարբերակ",
    "en": "Approved version"
  },
  "Уточнить бюджет": {
    "ru": "Уточнить бюджет",
    "hy": "Ճշտել բյուջեն",
    "en": "Clarify budget"
  },
  "Учтены комментарии клиента": {
    "ru": "Учтены комментарии клиента",
    "hy": "Հաճախորդի մեկնաբանությունները հաշվի են առնվել",
    "en": "Client comments incorporated"
  },
  "Царапина на ламинате": {
    "ru": "Царапина на ламинате",
    "hy": "Քերծվածք լամինատի վրա",
    "en": "Laminate scratch"
  },
  "Шум внутреннего блока кондиционирования": {
    "ru": "Шум внутреннего блока кондиционирования",
    "hy": "Օդորակիչի ներքին բլոկի աղմուկ",
    "en": "Indoor AC unit noise"
  },
  "Սերվիս թիմ": {
    "ru": "Сервисная команда",
    "hy": "Սերվիս թիմ",
    "en": "Service team"
  }
};

Object.assign(fixtureTranslations,{
  "Клиент ожидает решение банка; инициирована реструктуризация графика.":{ru:"Клиент ожидает решение банка; инициирована реструктуризация графика.",hy:"Հաճախորդը սպասում է բանկի որոշմանը․ նախաձեռնվել է վճարումների ժամանակացույցի վերակառուցում։",en:"The client is awaiting the bank's decision; payment schedule restructuring has been initiated."},
  "Проверен комплект документов, следующий шаг — госрегистрация.":{ru:"Проверен комплект документов, следующий шаг — госрегистрация.",hy:"Փաստաթղթերի փաթեթը ստուգված է, հաջորդ քայլը՝ պետական գրանցում։",en:"The document package has been checked; the next step is state registration."},
  "Повреждение верхнего слоя возле окна, требуется локальная замена панели.":{ru:"Повреждение верхнего слоя возле окна, требуется локальная замена панели.",hy:"Պատուհանի մոտ վերին շերտը վնասված է, անհրաժեշտ է վահանակի տեղային փոխարինում։",en:"The top layer near the window is damaged; a local panel replacement is required."},
  "Рассматривает покупку двух объектов, возможна пакетная скидка.":{ru:"Рассматривает покупку двух объектов, возможна пакетная скидка.",hy:"Դիտարկում է երկու գույքի գնում, հնարավոր է փաթեթային զեղչ։",en:"Considering the purchase of two properties; a package discount may apply."},
  "Сегодня · 10:15":{ru:"Сегодня · 10:15",hy:"Այսօր · 10:15",en:"Today · 10:15"},
  "Сегодня · 11:42":{ru:"Сегодня · 11:42",hy:"Այսօր · 11:42",en:"Today · 11:42"}
});

// V33: finance fixture translations used by key-based financial pages.
Object.assign(fixtureTranslations,{"Advance payment B-1303 / DL-2026-00477":{"ru":"Авансовый платеж B-1303 / DL-2026-00477","hy":"Կանխավճար B-1303 / DL-2026-00477","en":"Advance payment B-1303 / DL-2026-00477"},"Apartment advance":{"ru":"Аванс за квартиру","hy":"Բնակարանի կանխավճար","en":"Apartment advance"},"Bank financing":{"ru":"Банковское финансирование","hy":"Բանկային ֆինանսավորում","en":"Bank financing"},"Buyer contribution":{"ru":"Взнос покупателя","hy":"Գնորդի մասնակցություն","en":"Buyer contribution"},"Buyer down payment":{"ru":"Первоначальный взнос покупателя","hy":"Գնորդի կանխավճար","en":"Buyer down payment"},"Commercial real estate financing":{"ru":"Финансирование коммерческой недвижимости","hy":"Կոմերցիոն անշարժ գույքի ֆինանսավորում","en":"Commercial real estate financing"},"Contract payment":{"ru":"Платеж по договору","hy":"Պայմանագրային վճարում","en":"Contract payment"},"Deferred contract payment":{"ru":"Отсроченный платеж по договору","hy":"Հետաձգված պայմանագրային վճարում","en":"Deferred contract payment"},"For Arman Petrosyan reservation apartment B1204":{"ru":"Бронь квартиры B1204 для Армана Петросяна","hy":"Արման Պետրոսյանի B1204 բնակարանի ամրագրման համար","en":"For Arman Petrosyan reservation apartment B1204"},"Full settlement":{"ru":"Полный расчет","hy":"Ամբողջական հաշվարկ","en":"Full settlement"},"Home purchase financing":{"ru":"Финансирование покупки жилья","hy":"Բնակարան ձեռք բերելու ֆինանսավորում","en":"Home purchase financing"},"Housing mortgage":{"ru":"Жилищная ипотека","hy":"Բնակարանային հիփոթեք","en":"Housing mortgage"},"Initial contribution":{"ru":"Первоначальный взнос","hy":"Սկզբնական մասնակցություն","en":"Initial contribution"},"Mortgage disbursement":{"ru":"Ипотечный транш","hy":"Հիփոթեքային փոխանցում","en":"Mortgage disbursement"},"Payment under preliminary agreement":{"ru":"Платеж по предварительному договору","hy":"Վճարում նախնական պայմանագրով","en":"Payment under preliminary agreement"},"Primary market mortgage":{"ru":"Ипотека на первичном рынке","hy":"Առաջնային շուկայի հիփոթեք","en":"Primary market mortgage"},"Real estate payment":{"ru":"Платеж за недвижимость","hy":"Անշարժ գույքի վճարում","en":"Real estate payment"},"Reservation / advance":{"ru":"Бронь / аванс","hy":"Ամրագրում / կանխավճար","en":"Reservation / advance"},"Reservation fee":{"ru":"Платеж за бронирование","hy":"Ամրագրման վճար","en":"Reservation fee"},"Restructured buyer payment":{"ru":"Реструктурированный платеж покупателя","hy":"Գնորդի վերակառուցված վճարում","en":"Restructured buyer payment"},"5M ֏ reservation + 15.8745M ֏ buyer + 47M ֏ bank":{"ru":"5M ֏ бронь + 15.8745M ֏ покупатель + 47M ֏ банк","hy":"5M ֏ ամրագրում + 15.8745M ֏ գնորդ + 47M ֏ բանկ","en":"5M ֏ reservation + 15.8745M ֏ buyer + 47M ֏ bank"},"RS-2026-011 · ипотечное финансирование":{"ru":"RS-2026-011 · ипотечное финансирование","hy":"RS-2026-011 · հիփոթեքային ֆինանսավորում","en":"RS-2026-011 · mortgage financing"},"Первоначальный график договора":{"ru":"Первоначальный график договора","hy":"Պայմանագրի սկզբնական ժամանակացույց","en":"Original contract schedule"}});


// V34: legal-contour fixture text used by key-based pages.
Object.assign(fixtureTranslations,{
  "18 months":{ru:"18 месяцев",hy:"18 ամիս",en:"18 months"},
  "24 months":{ru:"24 месяца",hy:"24 ամիս",en:"24 months"},
  "Buyer requested revised handover clause":{ru:"Покупатель запросил изменение условия передачи",hy:"Գնորդը խնդրել է փոխել հանձնման պայմանը",en:"Buyer requested a revised handover clause"},
  "Mortgage bridge period":{ru:"Переходный период до ипотечного финансирования",hy:"Հիփոթեքային ֆինանսավորման անցումային շրջան",en:"Mortgage bridge period"},
  "Non-standard clause":{ru:"Нестандартное условие",hy:"Ոչ ստանդարտ պայման",en:"Non-standard clause"},
  "Package purchase and long-term partnership":{ru:"Пакетная покупка и долгосрочное сотрудничество",hy:"Փաթեթային գնում և երկարաժամկետ համագործակցություն",en:"Package purchase and long-term partnership"},
  "Standard template":{ru:"Стандартный шаблон",hy:"Ստանդարտ ձևանմուշ",en:"Standard template"},
  "Contract deviation":{ru:"Отклонение от договора",hy:"Պայմանագրային շեղում",en:"Contract deviation"},
  "Authority / UBO review":{ru:"Проверка полномочий / UBO",hy:"Լիազորությունների / UBO ստուգում",en:"Authority / UBO review"},
  "Standard KYC":{ru:"Стандартный KYC",hy:"Ստանդարտ KYC",en:"Standard KYC"},
  "Payment / contract breach":{ru:"Нарушение оплаты / договора",hy:"Վճարման / պայմանագրի խախտում",en:"Payment / contract breach"}
});


// V38: final fixture-language QA. Only fixture/demo content is handled here;
// static UI remains key-based in i18n.ts.
Object.assign(fixtureTranslations,{
  "2 above 7% require director approval":{ru:"2 скидки выше 7% требуют согласования директора",hy:"7%-ից բարձր 2 դեպք պահանջում է տնօրենի հաստատում",en:"2 above 7% require director approval"},
  "2 cases blocked by defects":{ru:"2 процесса заблокированы из-за замечаний",hy:"2 դեպք արգելափակված է թերությունների պատճառով",en:"2 cases blocked by defects"},
  "4 obligations · oldest 11 days":{ru:"4 обязательства · самому старому 11 дней",hy:"4 պարտավորություն · ամենահինը՝ 11 օր",en:"4 obligations · oldest 11 days"},
  "Apr":{ru:"Апр",hy:"Ապր",en:"Apr"},
  "Arabkir":{ru:"Арабкир",hy:"Արաբկիր",en:"Arabkir"},
  "Archive":{ru:"Архив",hy:"Արխիվ",en:"Archive"},
  "Aug":{ru:"Авг",hy:"Օգս",en:"Aug"},
  "Cases at risk or overdue":{ru:"Обращения под риском или просрочены",hy:"Ռիսկային կամ ժամկետանց դեպքեր",en:"Cases at risk or overdue"},
  "Commercial director approval":{ru:"Согласование коммерческого директора",hy:"Կոմերցիոն տնօրենի հաստատում",en:"Commercial director approval"},
  "Corporate financing":{ru:"Корпоративное финансирование",hy:"Կորպորատիվ ֆինանսավորում",en:"Corporate financing"},
  "Dec":{ru:"Дек",hy:"Դեկ",en:"Dec"},
  "Discount approvals":{ru:"Согласование скидок",hy:"Զեղչերի հաստատումներ",en:"Discount approvals"},
  "Expected within 7 days · 73.8M ֏":{ru:"Ожидается в течение 7 дней · 73,8 млн ֏",hy:"Սպասվում է 7 օրվա ընթացքում · 73.8 մլն ֏",en:"Expected within 7 days · 73.8M ֏"},
  "Feb":{ru:"Фев",hy:"Փետ",en:"Feb"},
  "Handover backlog":{ru:"Очередь передачи",hy:"Հանձնման կուտակում",en:"Handover backlog"},
  "ID reader":{ru:"Считыватель ID",hy:"ID ընթերցիչ",en:"ID reader"},
  "Inspection & defects":{ru:"Осмотр и замечания",hy:"Զննում և թերություններ",en:"Inspection & defects"},
  "Jan":{ru:"Янв",hy:"Հուն",en:"Jan"},
  "Jul":{ru:"Июл",hy:"Հլս",en:"Jul"},
  "Jun":{ru:"Июн",hy:"Հնս",en:"Jun"},
  "Kentron":{ru:"Кентрон",hy:"Կենտրոն",en:"Kentron"},
  "Legal review · today":{ru:"Юридическая проверка · сегодня",hy:"Իրավական ստուգում · այսօր",en:"Legal review · today"},
  "Mar":{ru:"Мар",hy:"Մրտ",en:"Mar"},
  "May":{ru:"Май",hy:"Մյս",en:"May"},
  "Mortgage decisions":{ru:"Ипотечные решения",hy:"Հիփոթեքային որոշումներ",en:"Mortgage decisions"},
  "Mortgage package":{ru:"Ипотечный пакет",hy:"Հիփոթեքային փաթեթ",en:"Mortgage package"},
  "Nor Nork / Norq":{ru:"Нор Норк / Норк",hy:"Նոր Նորք / Նորք",en:"Nor Nork / Norq"},
  "Notary scan":{ru:"Нотариальный скан",hy:"Նոտարական սկան",en:"Notary scan"},
  "Nov":{ru:"Ноя",hy:"Նոյ",en:"Nov"},
  "OCR + manual verification":{ru:"OCR + ручная проверка",hy:"OCR + ձեռքով ստուգում",en:"OCR + manual verification"},
  "Oct":{ru:"Окт",hy:"Հոկ",en:"Oct"},
  "Partners":{ru:"Партнеры",hy:"Գործընկերներ",en:"Partners"},
  "Payment overdue · 4 days":{ru:"Платеж просрочен · 4 дня",hy:"Վճարումը ժամկետանց է · 4 օր",en:"Payment overdue · 4 days"},
  "Payment schedule":{ru:"График платежей",hy:"Վճարման ժամանակացույց",en:"Payment schedule"},
  "Receivables overdue":{ru:"Просроченная дебиторская задолженность",hy:"Ժամկետանց դեբիտորական պարտք",en:"Receivables overdue"},
  "Reservation payment · 18.09":{ru:"Платеж за бронь · 18.09",hy:"Ամրագրման վճարում · 18.09",en:"Reservation payment · 18.09"},
  "Sep":{ru:"Сен",hy:"Սեպ",en:"Sep"},
  "State register":{ru:"Государственный реестр",hy:"Պետական ռեգիստր",en:"State register"},
  "Uploaded":{ru:"Загружено",hy:"Վերբեռնված",en:"Uploaded"},
  "Warranty SLA":{ru:"Гарантийный SLA",hy:"Երաշխիքային SLA",en:"Warranty SLA"},
  "Warranty period active":{ru:"Гарантийный период активен",hy:"Երաշխիքային ժամկետը ակտիվ է",en:"Warranty period active"},
  "accepted":{ru:"принято",hy:"Ընդունված",en:"Accepted"},
  "client-review":{ru:"рассмотрение клиентом",hy:"Հաճախորդի դիտարկում",en:"Client review"},
  "cold":{ru:"низкий интерес",hy:"Ցածր հետաքրքրություն",en:"Cold"},
  "converted":{ru:"конвертирован",hy:"Փոխարկված",en:"Converted"},
  "expired":{ru:"истек",hy:"Ժամկետանց",en:"Expired"},
  "expiring":{ru:"истекает",hy:"Ժամկետն ավարտվում է",en:"Expiring"},
  "hot":{ru:"высокий интерес",hy:"Բարձր հետաքրքրություն",en:"Hot"},
  "legal-review":{ru:"юридическая проверка",hy:"Իրավական ստուգում",en:"Legal review"},
  "missing":{ru:"отсутствует",hy:"Բացակայում է",en:"Missing"},
  "notary":{ru:"нотариус",hy:"Նոտար",en:"Notary"},
  "paid":{ru:"оплачено",hy:"վճարված",en:"Paid"},
  "preparation":{ru:"подготовка",hy:"Նախապատրաստում",en:"Preparation"},
  "sent":{ru:"отправлено",hy:"Ուղարկված",en:"Sent"},
  "signature":{ru:"на подписании",hy:"Ստորագրման փուլ",en:"Signature"},
  "signed":{ru:"подписано",hy:"Ստորագրված",en:"Signed"},
  "submitted":{ru:"подано",hy:"Ներկայացված է",en:"Submitted"},
  "valid":{ru:"действителен",hy:"Վավեր",en:"Valid"},
  "viewed":{ru:"просмотрено",hy:"Դիտված",en:"Viewed"},
  "warm":{ru:"средний интерес",hy:"Միջին հետաքրքրություն",en:"Warm"},
  "Imported bank":{ru:"Импортированный банк",hy:"Ներմուծված բանկ",en:"Imported bank"},
  "17.09.2026 · import":{ru:"17.09.2026 · импорт",hy:"17.09.2026 · ներմուծում",en:"17.09.2026 · import"},
  "17.09.2026 · snapshot":{ru:"17.09.2026 · снимок",hy:"17.09.2026 · պատճեն",en:"17.09.2026 · snapshot"},
  "Current schedule":{ru:"Текущий график",hy:"Ընթացիկ ժամանակացույց",en:"Current schedule"},
  "17.09.2026 · before restructure":{ru:"17.09.2026 · до реструктуризации",hy:"17.09.2026 · վերակառուցումից առաջ",en:"17.09.2026 · before restructure"},
  "График до реструктуризации":{ru:"График до реструктуризации",hy:"Վերակառուցումից առաջ գործող ժամանակացույց",en:"Schedule before restructuring"},
  "Создан из утвержденного шаблона":{ru:"Создан из утвержденного шаблона",hy:"Ստեղծվել է հաստատված ձևանմուշից",en:"Created from the approved template"}
});


// V50: finance fixtures introduced by the completed finance workspace.
Object.assign(fixtureTranslations,{
  "Package initial contribution":{ru:"Первоначальный взнос по пакету",hy:"Փաթեթի սկզբնական վճարում",en:"Package initial contribution"},
  "Package bank financing":{ru:"Банковское финансирование пакета",hy:"Փաթեթի բանկային ֆինանսավորում",en:"Package bank financing"},
  "Final settlement":{ru:"Окончательный расчет",hy:"Վերջնական հաշվարկ",en:"Final settlement"},
  "Second installment":{ru:"Второй платеж",hy:"Երկրորդ վճարում",en:"Second installment"},
  "Final installment":{ru:"Финальный платеж",hy:"Վերջնական վճարում",en:"Final installment"},
  "USD installment payment · 25.09":{ru:"Платеж рассрочки в USD · 25.09",hy:"USD տարաժամկետ վճարում · 25.09",en:"USD installment payment · 25.09"},
  "Installment T1-0501 / DL-2026-00488":{ru:"Платеж рассрочки T1-0501 / DL-2026-00488",hy:"Տարաժամկետ վճարում T1-0501 / DL-2026-00488",en:"Installment T1-0501 / DL-2026-00488"},
  "Overpayment retained as customer advance":{ru:"Переплата сохранена как аванс клиента",hy:"Գերավճարը պահպանվել է որպես հաճախորդի կանխավճար",en:"Overpayment retained as customer advance"},
  "USD receipt; AMD equivalent fixed at confirmation date":{ru:"Поступление в USD; эквивалент в AMD зафиксирован на дату подтверждения",hy:"USD մուտքագրում․ AMD համարժեքը ֆիքսվել է հաստատման ամսաթվով",en:"USD receipt; AMD equivalent fixed at confirmation date"},
  "Base currency":{ru:"Базовая валюта",hy:"Հիմնական արժույթ",en:"Base currency"},
  "Treasury reference rate":{ru:"Внутренний казначейский курс",hy:"Գանձապետական հաշվարկային փոխարժեք",en:"Treasury reference rate"},
  "Will become effective after mortgage disbursement":{ru:"Вступит в силу после перечисления ипотечного финансирования",hy:"Ուժի մեջ կմտնի հիփոթեքային ֆինանսավորման փոխանցումից հետո",en:"Will become effective after mortgage disbursement"},
  "Renewal required before the next payment milestone":{ru:"Требуется продление до следующего этапа платежа",hy:"Պահանջվում է երկարաձգում մինչև վճարման հաջորդ փուլը",en:"Renewal required before the next payment milestone"},
  "Reservation payment retained as contractual advance":{ru:"Платеж за бронирование учтен как договорный аванс",hy:"Ամրագրման վճարը հաշվառվել է որպես պայմանագրային կանխավճար",en:"Reservation payment retained as contractual advance"},
  "Collateral agreement draft.pdf":{ru:"Проект договора залога.pdf",hy:"Գրավի պայմանագրի նախագիծ.pdf",en:"Collateral agreement draft.pdf"},
  "Property insurance.pdf":{ru:"Страхование недвижимости.pdf",hy:"Անշարժ գույքի ապահովագրություն.pdf",en:"Property insurance.pdf"},
  "Bank guarantee BG-2026-00419.pdf":{ru:"Банковская гарантия BG-2026-00419.pdf",hy:"Բանկային երաշխիք BG-2026-00419.pdf",en:"Bank guarantee BG-2026-00419.pdf"},
  "Surety agreement.pdf":{ru:"Договор поручительства.pdf",hy:"Երաշխավորության պայմանագիր.pdf",en:"Surety agreement.pdf"},
  "Corporate guarantee.pdf":{ru:"Корпоративная гарантия.pdf",hy:"Կորպորատիվ երաշխիք.pdf",en:"Corporate guarantee.pdf"}
});

export function demoText(value:string|undefined|null){
  if(value==null)return "";
  if(value.startsWith("i18n:"))return t(value.slice(5));
  const exact=fixtureTranslations[value];
  if(exact)return exact[getLang()];
  // A few demo timestamps are assembled with a localized trailing token.
  return value.replace(/(^|[ ·])сейчас(?=$|[ ·])/g,(_m,prefix)=>prefix+t("common.now"));
}
