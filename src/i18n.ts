import { getRequestConfig, getTranslations } from "next-intl/server";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { Metadata } from "next";
import { TranslationValues } from "next-intl";
import { config } from "./config";

export const i18nConfig = {
  // A list of all locales that are supported
  locales: ["en", "zh"],

  // Used when no locale matches
  defaultLocale: "en",
  localePrefix: "always" as const,
};
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(i18nConfig);

export function generateI18nMetadata(
  page: keyof IntlMessages["pageTitle"],
  values?: TranslationValues,
): (props: { params: { locale: string } }) => Promise<Metadata> {
  return async (props) => {
    const t = await getTranslations({
      locale: props.params.locale,
      namespace: "pageTitle",
    });

    return {
      title: `${t(page, values)} | ${config.site.name}`,
    };
  };
}

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: {
      ...(await import(`../messages/${locale}/common.json`)).default,
      ...(await import(`../messages/${locale}/menu.json`)).default,
      ...(await import(`../messages/${locale}/products.json`)).default,
      ...(await import(`../messages/${locale}/projects.json`)).default,
      ...(await import(`../messages/${locale}/suppliers.json`)).default,
      ...(await import(`../messages/${locale}/userManagement.json`)).default,
      ...(await import(`../messages/${locale}/pinboard.json`)).default,
      ...(await import(`../messages/${locale}/addImages.json`)).default,
      ...(await import(`../messages/${locale}/filesUpload.json`)).default,
      ...(await import(`../messages/${locale}/toolsPanel.json`)).default,
      ...(await import(`../messages/${locale}/imageLibrary.json`)).default,
      ...(await import(`../messages/${locale}/myAccount.json`)).default,
      ...(await import(`../messages/${locale}/errorMsg.json`)).default,
      ...(await import(`../messages/${locale}/pageTitle.json`)).default,
      ...(await import(`../messages/${locale}/signUp.json`)).default,
      ...(await import(`../messages/${locale}/signIn.json`)).default,
      ...(await import(`../messages/${locale}/report.json`)).default,
    },
  };
});
