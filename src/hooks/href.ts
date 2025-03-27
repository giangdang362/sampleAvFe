import { useLocale } from "next-intl";
import { useCallback } from "react";

export interface ICreateLinkFunc {
  (url: string): string;
}

export function useHref() {
  const locale = useLocale();

  return useCallback(
    (url: string, params?: Record<string, string>): string => {
      for (const [key, value] of Object.entries(params || {})) {
        url = url.replace(`{{${key}}}`, value);
      }

      return `/${locale}${url.startsWith("/") ? url : `/${url}`}`;
    },
    [locale],
  );
}
