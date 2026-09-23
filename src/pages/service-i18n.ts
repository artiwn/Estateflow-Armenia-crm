import { t } from "../i18n";
import { demoText } from "../demo-i18n";

const categoryKey: Record<string, string> = {
  Electrical: "servicePage.category.electrical",
  Plumbing: "servicePage.category.plumbing",
  HVAC: "servicePage.category.hvac",
  Windows: "servicePage.category.windows",
  Finishing: "servicePage.category.finishing"
};

export const warrantyCategoryLabel = (value: string) => categoryKey[value] ? t(categoryKey[value]) : demoText(value);
