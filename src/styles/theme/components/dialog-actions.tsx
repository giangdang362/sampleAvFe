import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiDialogActions = {
  styleOverrides: {
    root: {
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
} satisfies Components<Theme>["MuiDialogActions"];
