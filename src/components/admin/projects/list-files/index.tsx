import { DataGrid, GridPaginationModel } from "@mui/x-data-grid";
import { FC } from "react";
import { Box } from "@mui/material";
import { columns } from "./columns-config";
import { PAGE_SIZE_OPTIONS } from "@/constants/common";

type TableProps = {
  data: API.ProjectItem[];
  page: number;
  pageSize: number;
  rowsCount: number;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  loading?: boolean;
};

const DataTable: FC<TableProps> = ({
  data,
  page,
  pageSize,
  rowsCount,
  onPaginationModelChange,
  loading,
}) => {
  return (
    <Box>
      {data.length > 0 && (
        <DataGrid
          rows={data || []}
          columns={columns()}
          rowCount={rowsCount}
          loading={loading}
          paginationModel={{ page: page ?? 1, pageSize: pageSize ?? 10 }}
          onPaginationModelChange={onPaginationModelChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          checkboxSelection
          sx={{ height: "700px" }}
        />
      )}
    </Box>
  );
};

export default DataTable;
