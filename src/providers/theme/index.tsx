"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";

import { createTheme } from "@/styles/theme/create-theme";

import EmotionCache from "./emotion-cache";

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function AppThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const theme = createTheme();

  return (
    <EmotionCache options={{ key: "mui" }}>
      {/* <ThemeProvider theme={{ [THEME_ID]: inputTheme }}> */}
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        {children}
      </CssVarsProvider>
      {/* </ThemeProvider> */}
    </EmotionCache>
  );
}
