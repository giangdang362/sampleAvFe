import { config } from "@/config";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export function usePageTitle(
  page: keyof IntlMessages["pageTitle"],
  name?: string,
) {
  const t = useTranslations("pageTitle");

  useEffect(() => {
    document.title = `${t(page, { name: name ?? "-" })} | ${config.site.name}`;
  }, [page, t, name]);
}
