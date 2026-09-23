import { t } from "../i18n";

/**
 * Placeholder is intentionally key-based: callers should pass i18n keys,
 * not already-localized visible strings.
 */
export function placeholderPage(titleKey:string,descriptionKey:string){
  return`<section class="page"><div class="page-header"><div class="page-title"><h1>${t(titleKey)}</h1><p>${t(descriptionKey)}</p></div></div><div class="card card-pad"><div class="empty"><div class="u-fs-34 u-mb-12">◌</div><strong>${t("placeholder.moduleReady")}</strong><div class="u-mt-7">${t("placeholder.nextIteration")}</div></div></div></section>`;
}
