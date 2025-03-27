import type { Components } from "@mui/material/styles";

import type { Theme } from "../types";
import { Link } from "@/i18n";

export const MuiButton = {
  defaultProps: { LinkComponent: Link },
  styleOverrides: {
    root: {
      fontWeight: 600,
      lineHeight: 1.215,
      borderRadius: "4px",
      textTransform: "none",
      padding: "8px 20px",
      "&.MuiButton-outlined": {
        padding: "7px 19px", // account for the border width
      },
    },
    sizeSmall: { padding: "6px 16px" },
    sizeMedium: { padding: "8px 20px" },
    sizeLarge: { padding: "11px 24px" },
    textSizeSmall: { padding: "7px 12px" },
    textSizeMedium: { padding: "9px 16px" },
    textSizeLarge: { padding: "12px 16px" },
    startIcon: {
      "& > *:nth-of-type(1)": {
        fontSize: "16px",
        width: "16px",
        height: "16px",
      },
    },
  },
  variants: [
    {
      props: { variant: "dashed" },
      style: {
        textTransform: "none",
        border: `2px dashed grey`,
      },
    },
  ],
} satisfies Components<Theme>["MuiButton"];
