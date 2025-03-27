import { Box, Input, LinearProgress, Stack, Typography } from "@mui/material";
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
import { columns } from "./columns";
import { useTranslations } from "next-intl";
import { Control, useFieldArray, useFormContext } from "react-hook-form";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faXmark } from "@/lib/fas/pro-light-svg-icons";
import { ValuesProduct } from "../zod";
import FaIconButton from "@/components/common/FaIconButton";
import { useUpdateProductScheduleMutation } from "@/services/projectMaterialSchedule";

type TableProps = {
  productId?: string;
  data?: API.SpecificationItem[];
  loading?: boolean;
  type: "create" | "detail";
  control: Control<ValuesProduct>;
  scheduleId: string;
  readonly?: boolean;
};

const CustomSpecificationTable: FC<TableProps> = ({
  productId,
  data,
  loading,
  type,
  control,
  scheduleId,
  readonly = false,
}) => {
  const t = useTranslations("products");
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [showInput, setShowInput] = useState<boolean>(false);

  const [currentRow, setCurrentRow] = useState<API.SpecificationItem>({
    id: "",
    label: "",
    detail: "",
  });
  const [updateProduct] = useUpdateProductScheduleMutation();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "metadata",
    keyName: type === "create" ? "id" : "_id",
  });
  const { trigger } = useFormContext<ValuesProduct>();

  const handleAddRow = () => {
    setCurrentRow({
      id: "",
      label: "",
      detail: "",
    });

    if (type === "create") {
      append(currentRow);
    }
    if (type === "detail") {
      updateProduct({
        id: productId,
        scheduleId: scheduleId,
        metadata: [...fields, currentRow],
      });
    }
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEdit = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSave = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDelete = (id: GridRowId) => {
    if (type === "create") {
      remove(fields.findIndex((item) => item.id === id));
    }
    if (type === "detail") {
      updateProduct({
        id: productId,
        scheduleId: scheduleId,
        metadata: fields.filter((item) => item.id !== id),
      });
    }
  };

  const handleCancel = (id: GridRowId) => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (
    newRow: API.SpecificationItem,
    oldRow: API.SpecificationItem,
  ) => {
    const index = fields.findIndex((item) => item.id === newRow.id);
    const valid = await trigger(`metadata.${index}`);

    if (valid) {
      if (type === "create") {
        update(index, newRow);
      }
      if (type === "detail") {
        try {
          await updateProduct({
            id: productId,
            scheduleId: scheduleId,
            metadata: fields?.map((item) => {
              const newItem = { ...(item.id === newRow.id ? newRow : item) };
              if ("_id" in newItem) {
                delete newItem._id;
              }

              return newItem;
            }),
          }).unwrap();
        } catch {
          return oldRow;
        }
      }
    }

    return valid ? newRow : oldRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <Box>
      <DataGrid
        rows={fields?.map((item) => ({ ...item }))}
        loading={loading || false}
        getRowId={(item) => item.id ?? ""}
        columns={columns({
          t,
          rowModesModel,
          handleSave,
          handleEdit,
          handleCancel,
          handleDelete,
          readonly,
        })}
        // loading={loading}
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
          "& .MuiInputBase-input": {
            px: "10px",
            py: 0,
          },
          "& .MuiDataGrid-virtualScrollerContent": {
            height: fields.length > 0 || data?.length ? "" : "unset !important",
          },
        }}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: type === "detail" ? NoRowsOverlay : () => "",
        }}
      />
      <Box sx={{ mt: "16px", pb: "40px" }}>
        {showInput ? (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Input
              placeholder={`${t("enter")} ${t("specification_label").toLocaleLowerCase()} ...`}
              onChange={(e) => {
                setCurrentRow({ ...currentRow, label: e.target.value });
              }}
              sx={{
                width: "200px",
                py: "8px",
                lineHeight: "18px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("specification_detail").toLocaleLowerCase()} ...`}
              onChange={(e) => {
                setCurrentRow({ ...currentRow, detail: e.target.value });
              }}
              sx={{
                width: "calc(100% - 338px)",
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
          !readonly && (
            <Box
              onClick={() => {
                // setPayload({
                //   partnerId: supplierId ?? "",
                // });
                setShowInput(true);
              }}
              component={"button"}
              sx={{
                mt: "0px",
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
          )
        )}
      </Box>
    </Box>
  );
};

export default CustomSpecificationTable;
