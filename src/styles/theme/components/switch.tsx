import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiSwitch = {
  styleOverrides: {
    switchBase: ({ theme }) => ({
      "& .MuiSwitch-thumb": {
        border: `1px solid ${theme.palette.divider}`,
      },
      "&.Mui-checked": {
        ".MuiSwitch-thumb": {
          border: "none",
        },
      },
    }),
  },
} satisfies Components<Theme>["MuiSwitch"];
