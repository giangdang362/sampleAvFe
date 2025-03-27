import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiDialogContent = {
  styleOverrides: {
    root: {
      padding: 24,
    },
  },
} satisfies Components<Theme>["MuiDialogContent"];
