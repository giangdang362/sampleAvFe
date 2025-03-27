"use client";
import { DataGrid, GridPaginationModel, GridSlots } from "@mui/x-data-grid";
import { FC } from "react";
import { Box, LinearProgress } from "@mui/material";
import { paths } from "@/paths";
import { useAvciRouter } from "@/hooks/avci-router";
import { useHref } from "@/hooks/href";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { useTranslations } from "next-intl";
import { columns } from "./columns";
import { PAGE_SIZE_OPTIONS } from "@/constants/common";

type TableProps = {
  data: API.ProductItem[];
  rowsCount: number;
  paginationModel: {
    page: number;
    pageSize: number;
  };
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  loading?: boolean;
  handleClickOpen: () => void;
  handleClickOpenDl: () => void;
  onDelete: (id: string) => void;
  onAdd: (id: string) => void;
  setNameProduct: (name: string) => void;
};

const DataTable: FC<TableProps> = ({
  data,
  rowsCount,
  onPaginationModelChange,
  handleClickOpen,
  handleClickOpenDl,
  loading,
  onDelete,
  paginationModel,
  onAdd,
  setNameProduct,
}) => {
  const t = useTranslations("products");
  const createHref = useHref();
  const router = useAvciRouter();

  return (
    <Box>
      <DataGrid
        rows={data || []}
        columns={columns({
          t,
          handleClickOpen,
          createHref,
          onDelete: (id) => onDelete(id),
          onAdd: (id) => onAdd(id),
          handleClickOpenDl,
          setNameProduct,
        })}
        rowCount={rowsCount}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        sx={{
          border: "none",
        }}
        onRowClick={(p) => {
          router.push(`${paths.admin.detailProduct}/${p.id}`);
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
    </Box>
  );
};

export default DataTable;
