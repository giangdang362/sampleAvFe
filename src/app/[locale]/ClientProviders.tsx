"use client";

import { NextIntlClientProvider, useTranslations } from "next-intl";
import { closeSnackbar, SnackbarKey, SnackbarProvider } from "notistack";
import { ComponentProps } from "react";
import QueryParamsProvider from "@/components/common/query-param-state/QueryParamsProvider";
import FaIconButton from "@/components/common/FaIconButton";
import { faXmark } from "@/lib/fas/pro-regular-svg-icons";
import { GlobalStyles } from "@mui/material";

const defaultTRef = (key: string) => key;
defaultTRef.rich = (key: string) => key;
defaultTRef.markup = (key: string) => key;
defaultTRef.raw = (key: string) => key;

export const tRef: { current: ReturnType<typeof useTranslations<never>> } = {
  current: defaultTRef,
};

const TranslationRefProvider = () => {
  const t = useTranslations();
  tRef.current = t;

  return null;
};

const SnackbarCloseButton = ({ snackbarKey }: { snackbarKey: SnackbarKey }) => {
  const t = useTranslations("common");

  return (
    <FaIconButton
      icon={faXmark}
      title={t("close")}
      sx={{ color: "var(--mui-palette-background-default)" }}
      onClick={() => closeSnackbar(snackbarKey)}
    />
  );
};

export default function ClientProviders(
  props: ComponentProps<typeof NextIntlClientProvider>,
) {
  return (
    <NextIntlClientProvider
      defaultTranslationValues={{
        b: (chunks) => <b>{chunks}</b>,
        u: (chunks) => <u>{chunks}</u>,
      }}
      {...props}
    >
      <QueryParamsProvider>{props.children}</QueryParamsProvider>
      <TranslationRefProvider />

      <GlobalStyles
        styles={{
          ".notistack-MuiContent>div": {
            maxWidth: "400px",
          },
        }}
      />
      <SnackbarProvider
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        autoHideDuration={4000}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      />
    </NextIntlClientProvider>
  );
}
