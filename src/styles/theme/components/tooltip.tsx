import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiTooltip = {
  styleOverrides: {
    tooltip: {
      borderRadius: 4,
      fontSize: "0.75rem",
      lineHeight: 1.215,
    },
  },
  defaultProps: {
    arrow: true,
    enterDelay: 600,
  },
} satisfies Components<Theme>["MuiTooltip"];
