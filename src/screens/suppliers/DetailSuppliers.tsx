"use client";
import HeaderMain from "@/components/layout/header";
import { useAvciRouter } from "@/hooks/avci-router";
import { paths } from "@/paths";
import {
  useDeleteAttachmentMutation,
  useDeleteLogoPartnerMutation,
  useDeletePartnerMutation,
  useGetOnePartnerQuery,
  useUpdatePartnerMutation,
  useUploadAttachmentsMutation,
  useUploadLogoMutation,
} from "@/services/partner";
import { Box, Button, Input, Stack, Typography, styled } from "@mui/material";
import { useSearchParams } from "next/navigation";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import DataTable from "./TableSuppliersList/DataTable";
import { useGetPartnerMembersQuery } from "@/services/partnerMember";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faGlobe,
  faLocationDot,
  faNoteSticky,
  faPlus,
  faTrashCan,
} from "@/lib/fas/pro-light-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useUpdateOneAddressMutation } from "@/services/address";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import { FileDragAndDrop } from "@/components/common/app-upload-file";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useIsUser } from "@/services/helpers";
import TagViewer from "@/components/common/TagViewer";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

library.add(faEnvelope, faPhone, faGlobe, faLocationDot, faNoteSticky, faPlus);
export const inputStyles = {
  border: "none",
  "&:hover:not(.Mui-disabled):before": {
    border: "none",
  },
  "&:before": {
    border: "none",
  },
  "&:after": {
    border: "none",
  },
  "&.Mui-focused:after": {
    border: "#c4c4c4",
  },
  "&.Mui-focused:before": {
    border: "none",
  },
  "&.Mui-visited": {
    border: "none",
  },
  "& input": {
    borderRadius: "2px",
    padding: "2px 4px",
  },
  "& input:focus-visible": {
    outline: "1px solid #212121",
  },
  fontSize: "14px",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
};
const TextareaAutoSize = styled(BaseTextareaAutosize)(
  () => `
  box-sizing: border-box;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  font-size: 14px;
  font-weight: 400;
  line-height: 17px;
  padding: 2px 4px;
  border-radius: 2px;
  color: #212121;
  border: unset;

  &:hover {
    border-color: #c4c4c4;
  }

  &:focus {
    border-color: #c4c4c4;
  }

  &:focus-visible {
    outline: 1px solid #212121;
  }
`,
);

const DetailSuppliers = () => {
  const t = useTranslations("suppliers");
  const tFiles = useTranslations("filesUpload");
  const format = useFormatter();
  const searchParams = useSearchParams();
  const router = useAvciRouter();
  const isUser = useIsUser();
  const [showInputTag, setShowInputTag] = useState<boolean>(false);

  const supplierId = useMemo(() => {
    if (
      searchParams.get("supplier_id") &&
      searchParams.get("supplier_id") !== ""
    ) {
      return searchParams.get("supplier_id");
    }

    return undefined;
  }, [searchParams.get("supplier_id")]);

  const {
    data: dataDetail,
    isLoading,
    error,
  } = useGetOnePartnerQuery({
    id: supplierId ?? "",
  });
  usePageTitle("supplierDetail", dataDetail?.companyName);

  const { data: dataPartnerMembers } = useGetPartnerMembersQuery({
    id: supplierId ?? "",
  });

  const [deletePartner] = useDeletePartnerMutation();
  const [updatePartner] = useUpdatePartnerMutation();

  const [updateAddressPartner] = useUpdateOneAddressMutation();

  const [upFile] = useUploadLogoMutation();
  const [deleteLogoPartner] = useDeleteLogoPartnerMutation();

  const [uploadAttachments] = useUploadAttachmentsMutation();

  const handleUpFile = (logoFiles: File[]) => {
    if (logoFiles.length) {
      upFile({ id: supplierId ?? "", file: logoFiles[0] });
    }
  };

  const handleUpAttachments = async (attachments: File[]) => {
    await uploadAttachments({ id: supplierId ?? "", files: attachments });
  };

  const { openDialog } = useConfirmDialog();
  const [deleteAttachment] = useDeleteAttachmentMutation();

  const handleDeleteSupplier = async () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_supplier"),
      content: t.rich("deleteContent", { name: dataDetail?.companyName ?? "" }),
      confirmButtonLabel: t("delete_supplier"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deletePartner({ id: supplierId ?? "" })
            .unwrap()
            .then(() => {
              router.push(`${paths.admin.suppliers}`);
            });
        } catch {}
      },
    });
  };

  const handleTitleChange = async (newName: string) => {
    if (newName.length < 1) {
      return { error: t("validation.title_empty") };
    }
    if (newName.length > 155) {
      return {
        error: t("validation.max_length", {
          count: 155,
        }),
      };
    }

    try {
      await updatePartner({
        id: supplierId ?? "",
        companyName: newName,
      }).unwrap();
    } catch (e) {}
  };

  return (
    <Box pb={"40px"}>
      <HeaderMain
        haveBackBtn
        backBtnHref={{ isUser, path: "suppliers" }}
        title={isLoading ? "..." : dataDetail?.companyName}
        titleLoading={isLoading}
        titleEditable={!isLoading}
        editTitleLabel={t("editSupplierName")}
        editTitlePlaceholder={t("editSupplierNamePlaceholder")}
        onTitleChange={handleTitleChange}
        buttonBlock={
          <Button
            variant="text"
            startIcon={<DeleteOutlineIcon />}
            sx={{ color: "red" }}
            onClick={handleDeleteSupplier}
          >
            {t("delete_supplier")}
          </Button>
        }
      />
      <NotFoundWrapper error={error} notFoundMessage={t("supplier_not_found")}>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "32px",
          }}
        >
          <Box sx={{ width: "25%" }}>
            <Box sx={{ maxWidth: "150px", minHeight: "150px" }}>
              <ImageDragAndDrop
                previewMode="normal"
                maxFile={1}
                currentMaxFile={dataDetail?.logoFile ? 0 : 1}
                files={[]}
                setFiles={handleUpFile}
                initFile={
                  dataDetail?.logoFile
                    ? [
                        {
                          id: dataDetail?.logoFile?.id ?? "",
                          path: dataDetail?.logoFile?.path ?? "",
                        },
                      ]
                    : []
                }
                deleteFile={async () => {
                  await deleteLogoPartner({ id: supplierId ?? "" });
                }}
                dndProps={{
                  informationText: ({ formats }) =>
                    tFiles("formatsOnly", {
                      formats:
                        typeof formats === "string"
                          ? formats
                          : format.list(
                              formats?.map((f) => f.toUpperCase()),
                              { type: "disjunction" },
                            ),
                    }),
                }}
                sx={{
                  "& .DnD-InformationText": {
                    fontSize: "10px",
                  },
                }}
              />
            </Box>
            {/* Infor Supplier detail */}
            <Box>
              <Stack
                flexDirection={"row"}
                gap={1}
                mt={"12px"}
                mb={"16px"}
                color={"#9e9e9e"}
                fontSize={"12px"}
              >
                <Typography> {t("created_by")} </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  {" "}
                  {dataDetail?.author?.firstName}
                </Typography>
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <Input
                  startAdornment={
                    <Box width={"22px"}>
                      <FontAwesomeIcon
                        icon={faGlobe}
                        style={{ marginRight: "8px", fontSize: "15px" }}
                      />
                    </Box>
                  }
                  defaultValue={dataDetail?.website ?? ""}
                  onChange={(e) =>
                    updatePartner({
                      id: supplierId ?? "",
                      website: e.target.value,
                    })
                  }
                  placeholder={dataDetail?.website ? "" : "..."}
                  sx={{ ...inputStyles }}
                />
                <Input
                  startAdornment={
                    <Box width={"22px"}>
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{ marginRight: "8px", fontSize: "15px" }}
                      />
                    </Box>
                  }
                  defaultValue={dataDetail?.address?.email ?? ""}
                  onChange={(e) =>
                    updateAddressPartner({
                      id: dataDetail?.address?.id ?? "",
                      email: e.target.value,
                    })
                  }
                  placeholder={dataDetail?.address?.email ? "" : "..."}
                  sx={{ ...inputStyles }}
                />
                <Input
                  startAdornment={
                    <Box width={"22px"}>
                      <FontAwesomeIcon
                        icon={faPhone}
                        style={{ marginRight: "8px", fontSize: "15px" }}
                      />
                    </Box>
                  }
                  defaultValue={dataDetail?.address?.phone ?? ""}
                  onChange={(e) =>
                    updateAddressPartner({
                      id: dataDetail?.address?.id ?? "",
                      phone: e.target.value,
                    })
                  }
                  placeholder={dataDetail?.address?.phone ? "" : "..."}
                  sx={{ ...inputStyles }}
                />
                <Input
                  startAdornment={
                    <Box width={"22px"}>
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        style={{ marginRight: "8px", fontSize: "15px" }}
                      />
                    </Box>
                  }
                  defaultValue={dataDetail?.address?.addressLine1 ?? ""}
                  onChange={(e) => {
                    updateAddressPartner({
                      id: dataDetail?.address?.id ?? "",
                      addressLine1: e.target.value,
                    });
                  }}
                  placeholder={dataDetail?.address?.addressLine1 ? "" : "..."}
                  sx={{ ...inputStyles }}
                />
                <Box sx={{ display: "flex" }}>
                  <Box width={"22px"}>
                    <FontAwesomeIcon
                      icon={faNoteSticky}
                      style={{ fontSize: "15px" }}
                    />
                  </Box>
                  <TextareaAutoSize
                    defaultValue={dataDetail?.note ?? ""}
                    onChange={(e) =>
                      updatePartner({
                        id: supplierId ?? "",
                        note: e.target.value,
                      })
                    }
                    placeholder={dataDetail?.note ? "" : "..."}
                    minRows={5}
                    style={{ width: "100%" }}
                  />
                </Box>
                {/* Tags */}
                <Box>
                  {!!dataDetail && (
                    <TagViewer
                      tags={dataDetail.tags ?? []}
                      tagType="partner"
                      isEdit={showInputTag}
                      onEditModeChange={setShowInputTag}
                      onSave={async (tags) => {
                        await updatePartner({
                          id: supplierId ?? "",
                          tags,
                        }).unwrap();
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{ marginBottom: 1, mt: "20px" }}
              >
                {t("attachments")}
              </Typography>
              <FileDragAndDrop
                files={
                  dataDetail?.attachments.map((a) => ({
                    id: a.id,
                    name: a.name,
                    path: a.path,
                  })) || []
                }
                addFiles={handleUpAttachments}
                deleteFile={async (a) => {
                  deleteAttachment({
                    body: { ids: [`${a.id}`] },
                    partnerId: dataDetail?.id ?? "",
                  });
                }}
                maxFile={10}
                size="compact"
                sx={{ width: "100%" }}
              />
            </Box>
          </Box>
          <DataTable
            data={dataPartnerMembers?.data ?? []}
            loading={isLoading}
          />
        </Stack>
      </NotFoundWrapper>
    </Box>
  );
};

export default DetailSuppliers;
