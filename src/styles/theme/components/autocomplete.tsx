import type { Components } from "@mui/material/styles";

import type { Theme } from "../types";

export const MuiAutocomplete = {
  styleOverrides: {
    root: {
      "& .MuiAutocomplete-input:not(:focus)": {
        minWidth: "30px !important",
      },
      "& .MuiAutocomplete-input:focus": {
        minWidth: "30px !important",
      },
    },
  },
} satisfies Components<Theme>["MuiAutocomplete"];
