"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/providers/StoreProvider";
import { LocalizationProvider } from "@/providers/locale";
import "@/styles/global.css";
import AppThemeProvider from "@/providers/theme";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import NProgress from "nprogress";
import { GoogleAnalytics } from "@next/third-parties/google";
interface Props {
  readonly children: ReactNode;
}

NProgress.configure({ showSpinner: false });

export default function RootLayout({ children }: Props) {
  return (
    <StoreProvider>
      <LocalizationProvider>
        <AppThemeProvider>
          <html lang="en">
            <body>
              {children}
              <ProgressBar
                height="2px"
                color="var(--mui-palette-primary-main)"
                shallowRouting
              />
              <GoogleAnalytics gaId="G-Q11QNYV6F5" />
            </body>
          </html>
        </AppThemeProvider>
      </LocalizationProvider>
    </StoreProvider>
  );
}
