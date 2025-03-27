"use client";
import { DataGrid, GridPaginationModel, GridSlots } from "@mui/x-data-grid";
import { FC, useCallback, useMemo, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import { columns } from "./column-configs";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { useUpdateMemberProjectMutation } from "@/services/projects";
import { PAGE_SIZE_OPTIONS } from "@/constants/common";
import { useIsUser } from "@/services/helpers";
import { enqueueSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { roleDataLeader } from "@/utils/common";

type TableProps = {
  page?: number;
  pageSize?: number;
  rowsCount?: number;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  loading?: boolean;
  paginationModel: {
    page: number;
    pageSize: number;
  };
  handleClickOpenDl: () => void;
  onDelete: (id: number, name: string) => void;
  dataMemberProject: API.PjMember[];
  isDeleted?: boolean;
  projectId: string;
  roleName?: string;
};

const MemberList: FC<TableProps> = ({
  rowsCount,
  onPaginationModelChange,
  loading,
  paginationModel,
  handleClickOpenDl,
  onDelete,
  dataMemberProject,
  isDeleted,
  projectId,
  roleName,
}) => {
  const [role, setRole] = useState("");
  const [updateRoleMember] = useUpdateMemberProjectMutation();
  const isUser = useIsUser();
  const t = useTranslations("projects");
  const { openDialog } = useConfirmDialog();

  const onChangeRole = useCallback(
    (
      id: number,
      permission: string,
      currentPermission: string,
      currentName: string,
    ) => {
      if (permission === roleDataLeader[2]?.value) {
        openDialog({
          type: "confirm",
          mainColor: undefined,
          title: t("dialog.passLeadership"),
          content: t("message.wantPassLeader", {
            name: currentName ?? "",
          }),
          confirmButtonLabel: t("button.confirm"),
          icon: undefined,
          onConfirm: () => {
            updateRoleMember({
              projectId: projectId,
              body: {
                id: dataMemberProject?.filter(
                  (e) =>
                    e.permission === roleDataLeader[2]?.value && e.id !== id,
                )[0]?.id,
                permission: "edit",
              },
            });

            updateRoleMember({
              projectId: projectId,
              body: {
                id: id,
                permission: permission,
              },
            });
          },
        });
      } else {
        if (currentPermission !== roleDataLeader[2]?.value) {
          updateRoleMember({
            projectId: projectId,
            body: {
              id: id,
              permission: permission,
            },
          });
        } else {
          enqueueSnackbar(`${t("pleaseChooseProjectLeader")}`, {
            variant: "error",
          });
        }
      }
    },
    [dataMemberProject, openDialog, projectId, t, updateRoleMember],
  );

  const col = useMemo(() => {
    return columns({
      onDelete,
      handleClickOpenDl,
      role,
      setRole,
      isDeleted,
      onChangeRole,
      roleName,
      isUser,
    });
  }, [
    handleClickOpenDl,
    isDeleted,
    isUser,
    onChangeRole,
    onDelete,
    role,
    roleName,
  ]);

  return (
    <Box>
      <DataGrid
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        columnVisibilityModel={{
          actions: isDeleted ? false : true,
        }}
        rows={dataMemberProject || []}
        columns={col}
        rowCount={rowsCount}
        loading={loading}
        paginationMode="server"
        rowHeight={62}
        disableColumnMenu
        disableColumnSorting
        disableColumnFilter
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        sx={{
          border: "none",
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
    </Box>
  );
};

export default MemberList;
