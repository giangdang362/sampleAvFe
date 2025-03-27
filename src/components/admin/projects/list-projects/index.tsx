"use client";

import {
  DataGrid,
  GridEventListener,
  GridPaginationModel,
  GridSlots,
} from "@mui/x-data-grid";
import { FC } from "react";
import { Box, LinearProgress } from "@mui/material";
import { columns } from "./columns-configs";
import { columns as deletedConfigColumns } from "../deleted-list/column-configs";
import { useAvciRouter } from "@/hooks/avci-router";
import { paths } from "@/paths";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { useTranslations } from "next-intl";
import { useIsUser } from "@/services/helpers";
import { PAGE_SIZE_OPTIONS } from "@/constants/common";

type TableProps = {
  data: API.ProjectItem[];
  page?: number;
  pageSize?: number;
  rowsCount?: number;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  loading?: boolean;
  paginationModel: {
    page: number;
    pageSize: number;
  };
  isDeleted?: boolean;
  handleClickOpenDl: () => void;
  onReStore: (id: string) => void;
  setNameProjectRestore: (name: string) => void;
};

const ProjectList: FC<TableProps> = ({
  data,
  rowsCount,
  onPaginationModelChange,
  loading,
  paginationModel,
  isDeleted,
  handleClickOpenDl,
  onReStore,
  setNameProjectRestore,
}) => {
  const t = useTranslations("projects");
  const isUser = useIsUser();

  const router = useAvciRouter();

  const handleRowClick: GridEventListener<"rowClick"> = (params) => {
    if (!isDeleted) {
      router.push(
        `${!isUser ? paths.admin.projects : paths.app.projects}/${params.row.id}/files`,
      );
    }
  };

  return (
    <Box>
      <DataGrid
        rows={data || []}
        columns={
          !isDeleted
            ? columns({ t })
            : deletedConfigColumns({
                t,
                handleClickOpenDl,
                onReStore,
                setNameProjectRestore,
              })
        }
        rowCount={rowsCount}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        rowHeight={62}
        onRowClick={handleRowClick}
        disableColumnMenu
        disableColumnSorting
        disableColumnFilter
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            cursor: isDeleted ? "initial" : undefined,
          },
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
    </Box>
  );
};

export default ProjectList;
