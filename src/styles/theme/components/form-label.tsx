import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiFormLabel = {
  styleOverrides: {
    asterisk: {
      color: "var(--mui-palette-error-main)",
    },
  },
} satisfies Components<Theme>["MuiFormLabel"];
