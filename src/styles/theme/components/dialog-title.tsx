import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiDialogTitle = {
  styleOverrides: {
    root: {
      fontSize: "1.38rem",
      fontWeight: 600,
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
} satisfies Components<Theme>["MuiDialogTitle"];
