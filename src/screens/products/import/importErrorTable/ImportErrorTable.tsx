import { LinearProgress } from "@mui/material";
import { DataGrid, GridSlots } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { columns } from "./columns";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

interface ImportErrorTableProps {
  data?: string;
}

const ImportErrorTable = ({ data }: ImportErrorTableProps) => {
  const t = useTranslations("common");
  const errors = useMemo(() => {
    if (!data) return [];
    return JSON.parse(data) as API.ImportErrItem[];
  }, [data]);
  return (
    <DataGrid
      rows={errors}
      columns={columns({ t })}
      sx={{
        border: "none",
        "& > .MuiDataGrid-main .MuiDataGrid-virtualScroller .MuiDataGrid-filler":
          {
            // ...
          },
        "& .MuiDataGrid-virtualScrollerRenderZone": {
          position: "relative",
          height: "624px",
          overflowY: "auto",
          overflowX: "unset !important",
        },
      }}
      slots={{
        loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        noRowsOverlay: NoRowsOverlay,
      }}
      getRowId={() => `${uuidv4()}`}
    />
  );
};

export default ImportErrorTable;
