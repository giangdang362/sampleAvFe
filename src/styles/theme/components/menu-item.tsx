import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiMenuItem = {
  styleOverrides: {
    root: {
      fontSize: 14,
    },
  },
} satisfies Components<Theme>["MuiMenuItem"];
