"use client";
import {
  DataGrid,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import { FC, useEffect, useState } from "react";
import { Box, Input, Stack, Typography } from "@mui/material";
import { columns } from "./columns";
import {
  useCreatePartnerMember1Mutation,
  useDeleteOnePartnerMemberMutation,
  useGetOnePartnerMemberQuery,
  useUpdatePartnerMemberMutation,
} from "@/services/partnerMember";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPlus,
  faTrash,
  faXmark,
} from "@/lib/fas/pro-regular-svg-icons";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useConfirmDialog } from "@/components/common/UserDialog";
import FaIconButton from "@/components/common/FaIconButton";

type TableProps = {
  data: API.PartnerMemberItem[];
  loading?: boolean;
};

const DataTable: FC<TableProps> = ({ data, loading }) => {
  const t = useTranslations("suppliers");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const [deletePartnerMember] = useDeleteOnePartnerMemberMutation();
  const [showInput, setShowInput] = useState<boolean>(false);

  const { data: curMember } = useGetOnePartnerMemberQuery({
    id: "",
  });

  const [memberPayload, setMemberPayload] = useState<API.PartnerMemberPayload>({
    name: curMember?.name,
    role: curMember?.role,
    email: curMember?.email,
    phone: curMember?.phone,
  });
  useEffect(() => {
    setMemberPayload({
      name: curMember?.name,
      role: curMember?.role,
      email: curMember?.email,
      phone: curMember?.phone,
    });
  }, [curMember?.email, curMember?.name, curMember?.phone, curMember?.role]);

  const [updateRowMember, { isLoading: isLoadingUpdateCurMember }] =
    useUpdatePartnerMemberMutation();
  const [addMember] = useCreatePartnerMember1Mutation();

  const { openDialog } = useConfirmDialog();

  const supplierId = searchParams.get("supplier_id") ?? "";

  const { name, role, email, phone, partnerId } = memberPayload;
  const isDisabledSaveNewMember =
    !name && !role && !email && !phone && !!partnerId;

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: string) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: string) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: string) => () => {
    openDialog({
      type: "confirm",
      title: "Delete supplier member",
      content: "Are you sure you want to delete this member?",
      confirmButtonLabel: "Delete",
      mainColor: "error",
      icon: faTrash,
      onConfirm: async () => {
        try {
          await deletePartnerMember({ ids: [id] }).unwrap();
        } catch (e) {
          console.log(e);
        }
      },
    });
  };

  const handleCancelClick = (id: string) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (newRow: API.PartnerMemberItem) => {
    await updateRowMember(newRow).unwrap();
    return newRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <Box sx={{ width: "72%" }}>
      <form noValidate id="form-members">
        <DataGrid
          rows={data || []}
          columns={columns({
            t,
            tCommon,
            rowModesModel,
            handleEditClick,
            handleCancelClick,
            handleSaveClick,
            handleDeleteClick,
          })}
          loading={loading || isLoadingUpdateCurMember}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          hideFooterPagination
          disableRowSelectionOnClick
          sx={{
            "&>.MuiDataGrid-footerContainer": {
              display: "none",
            },
            "& .MuiDataGrid-virtualScrollerContent": {
              height: data?.length ? "" : "unset !important",
            },
          }}
          // slots={{
          //   loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          //   noRowsOverlay: NoRowsOverlay,
          // }}
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
                setMemberPayload({ ...memberPayload, name: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                fontSize: "14px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("role").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setMemberPayload({ ...memberPayload, role: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                fontSize: "14px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("email").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setMemberPayload({ ...memberPayload, email: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                fontSize: "14px",
                paddingX: "10px",
              }}
            />
            <Input
              placeholder={`${t("enter")} ${t("phone").toLocaleLowerCase()} ...`}
              onChange={(e) =>
                setMemberPayload({ ...memberPayload, phone: e.target.value })
              }
              sx={{
                width: "20%",
                py: "8px",
                lineHeight: "18px",
                fontSize: "14px",
                paddingX: "10px",
              }}
            />
            <Box display="flex" gap={1} sx={{ px: "10px" }}>
              <FaIconButton
                title={t("save")}
                icon={faCheck}
                iconSize="20px"
                sx={{ color: "var(--mui-palette-text-primary)" }}
                onClick={() => {
                  addMember(memberPayload);
                  setShowInput(false);
                }}
                disabled={isDisabledSaveNewMember}
              />
              <FaIconButton
                title={t("cancel")}
                icon={faXmark}
                iconSize="20px"
                sx={{ color: "var(--mui-palette-text-primary)" }}
                onClick={() => setShowInput(false)}
              />
            </Box>
          </Stack>
        ) : (
          <Box
            onClick={() => {
              setMemberPayload({
                partnerId: supplierId,
              });
              setShowInput(true);
            }}
            component={"button"}
            sx={{
              mt: "10px",
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

export default DataTable;
