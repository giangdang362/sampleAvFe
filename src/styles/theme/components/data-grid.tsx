import type { Components } from "@mui/material/styles";

import type { Theme } from "../types";

export const MuiDataGrid = {
  defaultProps: {
    disableColumnResize: true,
    disableColumnMenu: true,
    disableColumnSorting: true,
    disableColumnFilter: true,
    disableRowSelectionOnClick: true,
    autoHeight: true,
  },
  styleOverrides: {
    columnHeader: {
      cursor: "initial",
      "&:focus-within": {
        outline: "none !important",
      },
    },
    cell: {
      cursor: "pointer",
      "&:focus-within": {
        outline: "none !important",
      },
    },
  },
} satisfies Components<Theme>["MuiDataGrid"];
