"use client";
import {
  DataGrid,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridSlots,
} from "@mui/x-data-grid";
import { FC, useState } from "react";
import { Box, Input, LinearProgress, Stack, Typography } from "@mui/material";
import { columnsPartnerMemberCreate } from "./columns";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@/lib/fas/pro-light-svg-icons";
import { useTranslations } from "next-intl";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import { ValuesSupplier } from "@/components/admin/supplier/NewSupplier/FormNewSupplier";
import FaIconButton from "@/components/common/FaIconButton";

type TableProps = {
  data: API.PartnerMemberItem[];
  control: Control<ValuesSupplier>;
};

const DataTablePartnerMemberCreate: FC<TableProps> = ({ data, control }) => {
  const t = useTranslations("suppliers");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [currentRow, setCurrentRow] = useState<API.PartnerMemberItemTable>({
    id: "",
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "partnerMembers",
  });

  const { trigger } = useFormContext<ValuesSupplier>();

  const handleAddRow = () => {
    setCurrentRow({
      id: "",
      name: "",
      role: "",
      email: "",
      phone: "",
    });

    append(currentRow);
  };

  const handleEdit = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSave = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDelete = (id: GridRowId) => {
    remove(fields.findIndex((item) => item.id === id));
  };

  const handleCancel = (id: GridRowId) => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (
    newRow: API.PartnerMemberItemTable,
    oldRow: API.PartnerMemberItemTable,
  ) => {
    const index = fields.findIndex((item) => item.id === newRow.id);
    const valid = await trigger(`partnerMembers.${index}`);

    if (valid) {
      update(index, newRow);
    }

    return valid ? newRow : oldRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  return (
    <Box sx={{ width: "72%" }}>
      <form noValidate id="form-members">
        <DataGrid
          rows={fields?.map((item) => ({ ...item }))}
          getRowId={(item) => item.id ?? ""}
          columns={columnsPartnerMemberCreate({
            t,
            rowModesModel,
            handleSave,
            handleEdit,
            handleCancel,
            handleDelete,
          })}
          hideFooterPagination
          disableRowSelectionOnClick
          autoHeight
          sx={{
            "&>.MuiDataGrid-footerContainer": {
              display: "none",
            },
            "& .MuiDataGrid-overlayWrapper": {
              // height: "50px",
              display: "none",
            },
            "& .MuiDataGrid-virtualScrollerContent": {
              height:
                fields.length > 0 || data?.length ? "" : "unset !important",
            },
          }}
          processRowUpdate={processRowUpdate}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          slots={{
            loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
            noRowsOverlay: () => "",
          }}
        />
      </form>
      <Box>
        {showInput ? (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Input
              placeholder={`${t("enter")} ${t("contact_name").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setCurrentRow({ ...currentRow, name: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("role").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setCurrentRow({ ...currentRow, role: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("email").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setCurrentRow({ ...currentRow, email: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("phone").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setCurrentRow({ ...currentRow, phone: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                paddingX: "10px",
              }}
            />
            <Box
              sx={{
                px: "10px",
                width: "138px",
                display: "flex",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <FaIconButton
                icon={faCheck}
                title={t("save")}
                onClick={() => {
                  handleAddRow();
                  setShowInput(false);
                }}
              />
              <FaIconButton
                icon={faXmark}
                title={t("cancel")}
                onClick={() => setShowInput(false)}
              />
            </Box>
          </Stack>
        ) : (
          <Box
            onClick={() => {
              setShowInput(true);
            }}
            component={"button"}
            sx={{
              mt: "30px",
              padding: "10px",
              width: "100%",
              border: "2px dashed #666",
              fontWeight: 600,
              color: "#666",
              borderRadius: "4px",
              background: "#fff",
              cursor: "pointer",
              "&:hover": {
                background: "#f0f0f0",
              },
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              style={{ fontSize: "14px", height: "14px" }}
            />
            <Typography>{t("add")}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataTablePartnerMemberCreate;
