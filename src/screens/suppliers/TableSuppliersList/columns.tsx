import {
  GridColDef,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModes,
  GridRowModesModel,
  useGridApiContext,
} from "@mui/x-data-grid";
import { Box, Input, Stack } from "@mui/material";
import {
  faCheck,
  faXmark,
  faPen,
  faTrashCan,
  faCopy,
} from "@/lib/fas/pro-regular-svg-icons";
import FaIconButton from "@/components/common/FaIconButton";
import { enqueueSnackbar } from "notistack";
import { startCase } from "lodash";
import { useLayoutEffect, useRef } from "react";

type columnsType = {
  t: (
    t:
      | "contact_name"
      | "role"
      | "email"
      | "phone"
      | "edit"
      | "save"
      | "cancel"
      | "delete"
      | "copy_contact_id",
  ) => string;
  tCommon: (t: "actionSuccessfully", value?: {}) => string;
  rowModesModel: GridRowModesModel;
  handleEditClick: (id: string) => () => void;
  handleCancelClick: (id: string) => () => void;
  handleSaveClick: (id: string) => () => void;
  handleDeleteClick: (id: string) => () => void;
};

function EditInput(props: GridRenderEditCellParams) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (hasFocus) {
      ref.current?.focus();
    }
  }, [hasFocus]);

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // The new value entered by the user
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return (
    <Input
      ref={ref}
      type="text"
      value={value}
      onChange={handleValueChange}
      sx={{
        padding: "8px 8px",
        lineHeight: "18px",
        fontSize: "14px",
      }}
    />
  );
}

export const columns = ({
  t,
  tCommon,
  rowModesModel,
  handleEditClick,
  handleCancelClick,
  handleSaveClick,
  handleDeleteClick,
}: columnsType): GridColDef<API.PartnerMemberItem>[] => {
  return [
    {
      field: "name",
      headerName: t("contact_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      flex: 1,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <EditInput {...params} />
      ),
    },
    {
      field: "role",
      headerName: t("role"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      flex: 1,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <EditInput {...params} />
      ),
    },
    {
      field: "email",
      headerName: t("email"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      flex: 1,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <EditInput {...params} />
      ),
    },
    {
      field: "phone",
      headerName: t("phone"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      flex: 1,
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <EditInput {...params} />
      ),
    },
    {
      field: "action",
      headerName: "",
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 100,
      flex: 1,
      renderCell: (original: GridRenderCellParams<API.PartnerMemberItem>) => {
        const id = original.row.id;
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            {!isInEditMode && (
              <Box display="flex" gap={1}>
                <FaIconButton
                  title={t("edit")}
                  icon={faPen}
                  iconSize="16px"
                  iconProps={{ style: { padding: 2 } }}
                  onClick={handleEditClick(id)}
                />
                <FaIconButton
                  title={t("delete")}
                  icon={faTrashCan}
                  iconSize="16px"
                  iconProps={{ style: { padding: 2 } }}
                  onClick={handleDeleteClick(id)}
                />
                <FaIconButton
                  title={t("copy_contact_id")}
                  icon={faCopy}
                  iconSize="16px"
                  iconProps={{ style: { padding: 2 } }}
                  onClick={() => {
                    navigator.clipboard.writeText(original.row.id).then(() => {
                      enqueueSnackbar(
                        tCommon("actionSuccessfully", {
                          action: startCase(t("copy_contact_id")),
                        }),
                        {
                          variant: "success",
                        },
                      );
                    });
                  }}
                />
              </Box>
            )}
            {isInEditMode && (
              <Box display="flex" gap={1}>
                <FaIconButton
                  title={t("save")}
                  icon={faCheck}
                  iconSize="20px"
                  sx={{ color: "var(--mui-palette-text-primary)" }}
                  onClick={handleSaveClick(id)}
                />
                <FaIconButton
                  title={t("cancel")}
                  icon={faXmark}
                  iconSize="20px"
                  sx={{ color: "var(--mui-palette-text-primary)" }}
                  onClick={handleCancelClick(id)}
                />
              </Box>
            )}
          </Stack>
        );
      },
    },
  ];
};
