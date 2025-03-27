"use client";
import { DataGrid, GridPaginationModel, GridSlots } from "@mui/x-data-grid";
import {
  Dispatch,
  FC,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { Box, LinearProgress } from "@mui/material";
import { columns } from "./columns";
import { paths } from "@/paths";
import { useAvciRouter } from "@/hooks/avci-router";
import { useHref } from "@/hooks/href";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { useTranslations } from "next-intl";
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
  setCurId: Dispatch<SetStateAction<string>>;
  setNameProduct: Dispatch<SetStateAction<string>>;
};

const DataTable: FC<TableProps> = ({
  data,
  rowsCount,
  onPaginationModelChange,
  handleClickOpen,
  handleClickOpenDl,
  setCurId,
  loading,
  paginationModel,
  setNameProduct,
}) => {
  const t = useTranslations("products");
  const createHref = useHref();
  const router = useAvciRouter();

  return (
    <Box>
      <DataGrid
        rows={data}
        columns={useMemo(
          () =>
            columns({
              t,
              handleClickOpen,
              createHref,
              setCurId,
              handleClickOpenDl,
              setNameProduct,
            }),
          [
            createHref,
            handleClickOpen,
            handleClickOpenDl,
            setCurId,
            setNameProduct,
            t,
          ],
        )}
        getRowId={useCallback((item: API.ProductItem) => item.id, [])}
        rowCount={rowsCount}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        sx={{ border: "none" }}
        onRowClick={(p) => {
          router.push(`${paths.admin.detailProduct}/${p.id}`);
        }}
        slots={slots}
      />
    </Box>
  );
};

const slots = {
  loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
  noRowsOverlay: NoRowsOverlay,
};

export default memo(DataTable);
