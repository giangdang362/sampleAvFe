import type { Components } from "@mui/material/styles";
import type { Theme } from "../types";

export const MuiPopover = {
  styleOverrides: {
    root: ({ theme }) => ({
      "& .MuiList-root": {
        "& .MuiDivider-root": {
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        },
        "& .MuiListItemButton-root": {
          paddingTop: 6,
          paddingBottom: 6,
        },
        "& .MuiListItemText-root": {
          margin: 0,
        },
        "& .MuiListItemText-primary": {
          fontSize: "0.9rem",
          lineHeight: 1.215,
        },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          marginRight: "6px",
          "& > *:nth-of-type(1)": {
            width: "1rem",
            height: "1rem",
            fontSize: "1rem",
          },
        },
      },
    }),
  },
} satisfies Components<Theme>["MuiPopover"];
