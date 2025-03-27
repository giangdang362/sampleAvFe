import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiOutlinedInput = {
  styleOverrides: {
    root: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: "4px",
      },
    },
  },
} satisfies Components<Theme>["MuiOutlinedInput"];
