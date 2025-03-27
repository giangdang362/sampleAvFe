"use client";
import HeaderMain from "@/components/layout/header";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleXmark } from "@/lib/fas/pro-duotone-svg-icons";
import { useTranslations } from "next-intl";
import { parseInt } from "lodash";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import {
  faClockRotateLeft,
  faMoneyCheckDollarPen,
  faPlus,
  faTrash,
  faTrashCan,
  faTruckRampBox,
} from "@/lib/fas/pro-regular-svg-icons";
import { faPen } from "@/lib/fas/pro-regular-svg-icons/faPen";
import DetailProductSection from "./DetailProductSection";
import ProductSpecificationsSection from "./ProductSpecificationsSection";
import { FileDragAndDrop } from "@/components/common/app-upload-file";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import { PdDetailRow } from "@/components/admin/products/detailProduct/product-detail-row";
import { EditSupplierDialog } from "@/screens/products/components/EditSupplierDialog";
import ButtonPrimary from "@/components/common/button-primary";
import SendQuoteRequestDialog from "../../components/SendQuoteRequestDialog";
import GetSampleDialog from "../../components/GetSampleDialog";
import {
  useDeleteImageProductScheduleMutation,
  useGetOneProductsScheduleQuery,
  useUpdateProductScheduleMutation,
  useUpdateProductStatusScheduleMutation,
  useUploadAttachmentProductScheduleMutation,
  useUploadImageFilesScheduleMutation,
} from "@/services/projectMaterialSchedule";
import EditableStatusDropDow from "@/components/common/app-edit-dropdow-status";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defaultValuesProduct,
  schemaProduct,
  ValuesProduct,
} from "@/components/admin/products/createProducts/zod";
import CustomSpecificationTable from "./CustomSpecification/DataTable";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { roleDataProduct } from "@/utils/common";
import ProductStatusChangeDialog from "../../components/ProductStatusChangeDialog";
import StatusHistory from "../../components/StatusHistory";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pathFile } from "@/config/api";
import { useIsUser } from "@/services/helpers";
import TagViewer from "@/components/common/TagViewer";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

type DetailProductProps = {
  id: string;
  scheduleId: string;
};
const DetailProduct = ({ id, scheduleId }: DetailProductProps) => {
  const isUser = useIsUser();
  const [openQuote, setOpenQuote] = useState(false);
  const [openGetSample, setOpenGetSample] = useState(false);
  const [openStatusChange, setOpenStatusChange] = useState(false);
  const [openStatusHistory, setOpenStatusHistory] = useState(false);
  const [updateStatus] = useUpdateProductStatusScheduleMutation();
  const {
    data: dataDetailProduct,
    isLoading,
    error,
  } = useGetOneProductsScheduleQuery({
    scheduleId: scheduleId,
    id: id,
  });
  usePageTitle(
    "materialScheduleDetail",
    dataDetailProduct &&
      `${dataDetailProduct.series} - ${dataDetailProduct.model}`,
  );

  const readOnly =
    !dataDetailProduct ||
    dataDetailProduct.roleName === roleDataProduct[1].value;
  const dataPartnerMember = dataDetailProduct?.supplier;

  const [isEditingTag, setIsEditingTag] = useState(false);
  const [isOpenDialogEditSupplier, setIsOpenDialogEditSupplier] =
    useState(false);
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const handleClose = () => {
    setIsOpenDialogEditSupplier(false);
  };
  const [updateProduct] = useUpdateProductScheduleMutation();

  const { openDialog } = useConfirmDialog();
  const handleClickOpenDl = () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_supplier"),
      content: tCommon.rich("deleteContent", {
        name: dataPartnerMember?.name + "",
      }),
      confirmButtonLabel: t("delete_supplier"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await updateProduct({
            scheduleId: scheduleId,
            id: id,
            supplierId: null,
          }).unwrap();
        } catch {}
      },
    });
  };

  const handleClickOpenQuote = () => {
    setOpenQuote(true);
  };
  const handleCloseQuote = () => {
    setOpenQuote(false);
  };
  const handleClickOpenSample = () => {
    setOpenGetSample(true);
  };
  const handleCloseSample = () => {
    setOpenGetSample(false);
  };

  const { data: productUnit } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productUnit,
  });
  const [deleteFile] = useDeleteImageProductScheduleMutation();
  const [upFile, { isLoading: isUploadingFile }] =
    useUploadImageFilesScheduleMutation();
  const [uploadAttachments] = useUploadAttachmentProductScheduleMutation();

  const handleUpFiles = (files: File[]) => {
    if (id !== null && id != undefined) {
      upFile({ scheduleId: scheduleId, id: id, files });
    }
  };

  const handleUpAttachments = async (attachments: File[]) => {
    await uploadAttachments({
      files: attachments,
      productId: id,
      scheduleId: scheduleId,
    });
  };

  const form = useForm<ValuesProduct>({
    resolver: zodResolver(schemaProduct),
    values: { ...defaultValuesProduct, metadata: dataDetailProduct?.metadata },
  });

  return (
    <FormProvider {...form}>
      <Box>
        <HeaderMain
          titleLoading={isLoading}
          title={`${dataDetailProduct?.series} - ${dataDetailProduct?.model}`}
          haveBackBtn
          backBtnHref={{
            isUser,
            path: "materialSchedule",
            suffix: "/" + scheduleId,
          }}
          buttonBlock={
            <>
              <IconButton
                sx={{
                  border: "solid 1px",
                  borderRadius: "5px",
                }}
                onClick={() => {
                  setOpenStatusHistory(true);
                }}
              >
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  style={{
                    fontSize: "16px",
                  }}
                />
              </IconButton>

              {!readOnly && (
                <>
                  <ButtonPrimary
                    disabled={dataPartnerMember?.partner === undefined}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faMoneyCheckDollarPen}
                        style={{
                          fontSize: "16px",
                        }}
                      />
                    }
                    label="Quote"
                    style={{ borderRadius: 4 }}
                    onClick={handleClickOpenQuote}
                    sx={{}}
                  />
                  <ButtonPrimary
                    disabled={dataPartnerMember?.partner === undefined}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faTruckRampBox}
                        style={{ fontSize: "16px" }}
                      />
                    }
                    label="Get Sample"
                    style={{ borderRadius: 4 }}
                    onClick={() => {
                      if (
                        dataDetailProduct?.status === "internal_approved" ||
                        dataDetailProduct?.status === "client_approved"
                      ) {
                        setOpenStatusChange(true);
                      } else {
                        handleClickOpenSample();
                      }
                    }}
                  />
                </>
              )}
            </>
          }
          statusBlock={
            <EditableStatusDropDow
              enabled={!readOnly}
              value={dataDetailProduct?.status ?? ""}
              onChangeDropDow={(e) => {
                updateStatus({
                  scheduleId: scheduleId,
                  id: id,
                  newStatus: e.target.value,
                  reason: "",
                });
              }}
            />
          }
        />

        <NotFoundWrapper
          error={error}
          notFoundMessage={t("product_not_found")}
          messageProps={{ mt: 8 }}
        >
          <List>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box sx={{ width: "55%" }}>
                <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                  {t("product_images")}
                </Typography>
                <Box>
                  <ImageDragAndDrop
                    readonly={
                      dataDetailProduct?.roleName !==
                        roleDataProduct[3].value &&
                      (readOnly || dataDetailProduct?.isAdminCreated)
                    }
                    disabled={isUploadingFile}
                    maxFile={10}
                    currentMaxFile={
                      10 - (dataDetailProduct?.images?.length ?? 0)
                    }
                    files={[]}
                    setFiles={handleUpFiles}
                    initFile={dataDetailProduct?.images ?? []}
                    deleteFile={async (a) => {
                      if (id) {
                        await deleteFile({
                          scheduleId: scheduleId,
                          fileId: a,
                          productId: id,
                        });
                      }
                    }}
                  />
                </Box>

                <DetailProductSection
                  id={id}
                  dataDetailProduct={dataDetailProduct}
                  scheduleId={scheduleId}
                  readOnly={readOnly}
                />

                <ProductSpecificationsSection
                  scheduleId={scheduleId}
                  id={id}
                  dataDetailProduct={dataDetailProduct}
                  readOnly={readOnly}
                />

                <Box sx={{ mt: "28px" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ marginBottom: 1, marginTop: "28px" }}
                  >
                    {t("custom_specification")}
                  </Typography>
                  <CustomSpecificationTable
                    type="detail"
                    productId={id}
                    scheduleId={scheduleId}
                    data={dataDetailProduct?.metadata ?? []}
                    control={form.control}
                    readonly={readOnly}
                  />
                </Box>
              </Box>
              <Box sx={{ width: "30%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ marginBottom: 1, marginTop: "28px" }}
                  >
                    {t("supplier")}
                  </Typography>

                  {dataPartnerMember?.partner &&
                    ((!readOnly && !dataDetailProduct.isAdminCreated) ||
                      dataDetailProduct?.roleName ===
                        roleDataProduct[3].value) && (
                      <Box
                        sx={{
                          marginTop: "28px",
                          display: "flex",
                          flexDirection: "row",
                          gap: "8px",
                        }}
                      >
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            sx={{
                              border: "1px solid",
                              borderRadius: "4px",
                              borderColor: "grey.300",
                            }}
                            onClick={() => {
                              handleClickOpenDl();
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              style={{ fontSize: "16px" }}
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Edit" arrow>
                          <IconButton
                            sx={{
                              border: "1px solid",
                              borderRadius: "4px",
                              borderColor: "grey.300",
                            }}
                            onClick={() => {
                              setIsOpenDialogEditSupplier(true);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faPen}
                              style={{ fontSize: "16px" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                </Box>
                {dataPartnerMember?.partner ? (
                  <>
                    <Box
                      sx={{
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <>
                        <Avatar
                          src={
                            dataPartnerMember?.partner.logoFile
                              ? `${pathFile}/${dataPartnerMember?.partner.logoFile?.path}`
                              : ""
                          }
                          sx={{
                            height: "56px",
                            width: "56px",
                            borderRadius: "12px",
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <Typography variant="subtitle1">
                            {dataPartnerMember?.partner.companyName || "null"}
                          </Typography>
                          <Stack flexDirection={"row"} gap={"6px"}>
                            <Typography color={"GrayText"}>
                              {dataPartnerMember?.name || "null"}
                            </Typography>

                            <Typography color={"GrayText"}>
                              {dataPartnerMember?.email || "null"}
                            </Typography>
                          </Stack>
                        </Box>
                      </>
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileCircleXmark}
                      style={{ fontSize: "50px" }}
                      color={"GrayText"}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: 1, marginTop: "20px" }}
                    >
                      {t("no_information")}
                    </Typography>
                    <Button
                      disabled={
                        dataDetailProduct?.roleName !==
                          roleDataProduct[3].value &&
                        (readOnly || dataDetailProduct?.isAdminCreated)
                      }
                      startIcon={
                        <FontAwesomeIcon
                          icon={faPlus}
                          style={{ fontSize: "16px" }}
                        />
                      }
                      variant="outlined"
                      style={{ borderRadius: 4 }}
                      sx={{ marginTop: "28px" }}
                      onClick={() => {
                        setIsOpenDialogEditSupplier(true);
                      }}
                    >
                      {t("add_a_supplier")}
                    </Button>
                  </Box>
                )}
                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: 1, marginTop: "28px" }}
                >
                  {t("cost_estimation")}
                </Typography>

                <PdDetailRow
                  disabled={readOnly}
                  onChange={(e) => {
                    updateProduct({
                      scheduleId: scheduleId,
                      id: id,
                      unitRate: parseInt(e.target.value),
                    });
                  }}
                  type="input"
                  name={t("unit_rate")}
                  typeInput="number"
                  data={dataDetailProduct?.unitRate || ""}
                />

                <PdDetailRow
                  disabled={readOnly}
                  onChange={(e) => {
                    updateProduct({
                      scheduleId: scheduleId,
                      id: id,
                      quantity: parseInt(e.target.value),
                    });
                  }}
                  type="input"
                  name={t("quatity")}
                  typeInput="number"
                  data={dataDetailProduct?.quantity || ""}
                />

                {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
                  <PdDetailRow
                    disabled={readOnly}
                    dataDropDow={productUnit?.children ?? []}
                    onChangeDropDow={(e) => {
                      updateProduct({
                        scheduleId: scheduleId,
                        id: id,
                        unit: e.target.value,
                      });
                    }}
                    type="dropDow"
                    name={t("unit")}
                    data={dataDetailProduct?.unit || ""}
                  />
                ) : (
                  <PdDetailRow
                    disabled={readOnly}
                    name={t("unit")}
                    data={dataDetailProduct?.unit || ""}
                    onChange={(e) => {
                      updateProduct({
                        scheduleId: scheduleId,
                        id: id,
                        unit: e.target.value,
                      });
                    }}
                    type="input"
                  />
                )}

                <PdDetailRow
                  disabled={readOnly}
                  onChange={(e) => {
                    updateProduct({
                      scheduleId: scheduleId,
                      id: id,
                      discount: parseInt(e.target.value),
                    });
                  }}
                  type="input"
                  typeInput="number"
                  name={t("discount")}
                  suffixValue="%"
                  data={dataDetailProduct?.discount || ""}
                />

                <Card
                  sx={{ p: 2, my: 2, backgroundColor: "rgba(0, 0, 0, 0.12)" }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      marginBottom: 1,
                      color: "GrayText",
                      fontWeight: "700",
                    }}
                  >
                    {"TOTAL"}
                  </Typography>

                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: 2, color: "GrayText" }}
                    >
                      {"Original Cost"}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: 2, color: "black", fontSize: 16 }}
                    >
                      ${dataDetailProduct?.originalCost}
                    </Typography>
                  </Stack>
                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: 2, color: "GrayText" }}
                    >
                      {"Savings"}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ marginBottom: 2, color: "black", fontSize: 16 }}
                    >
                      ${dataDetailProduct?.savings}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ marginTop: 2, color: "GrayText" }}
                    >
                      {"Final Cost"}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ marginTop: 2, color: "black", fontSize: 22 }}
                    >
                      ${dataDetailProduct?.finalCost}
                    </Typography>
                  </Stack>
                </Card>

                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: 1, marginTop: "28px" }}
                >
                  {t("attachments")}
                </Typography>

                <FileDragAndDrop
                  readonly={
                    dataDetailProduct?.roleName !== roleDataProduct[3].value &&
                    (readOnly || dataDetailProduct?.isAdminCreated)
                  }
                  files={
                    dataDetailProduct?.attachments?.map((a) => ({
                      id: a.id,
                      name: a.name,
                      path: a.path,
                    })) || []
                  }
                  addFiles={handleUpAttachments}
                  deleteFile={async (a) => {
                    if (id) {
                      await deleteFile({
                        scheduleId: scheduleId,
                        fileId: a.id,
                        productId: id,
                      }).then(() => {});
                    }
                  }}
                  maxFile={10}
                  size="compact"
                  sx={{ width: "100%" }}
                />

                {(!!dataDetailProduct?.productTags?.length || !isUser) && (
                  <>
                    <Typography
                      variant="subtitle1"
                      {...(isEditingTag
                        ? { component: "label", htmlFor: "input-tags" }
                        : undefined)}
                      sx={{
                        display: "block",
                        marginBottom: 1,
                        marginTop: "28px",
                      }}
                    >
                      {tCommon(`tags`)}
                    </Typography>

                    {!!dataDetailProduct && (
                      <TagViewer
                        tags={
                          dataDetailProduct.productTags
                            ?.map((item) => item.tag)
                            .reverse() ?? []
                        }
                        tagType="product"
                        textFieldProps={{
                          label: undefined,
                          inputProps: { id: "input-tags" },
                        }}
                        editDisabled={readOnly}
                        isEdit={isEditingTag}
                        onEditModeChange={setIsEditingTag}
                        onSave={async (tags) => {
                          await updateProduct({
                            scheduleId: scheduleId,
                            id: id,
                            tags,
                          }).unwrap();
                        }}
                      />
                    )}
                  </>
                )}

                {!readOnly && (
                  <EditSupplierDialog
                    initData={dataDetailProduct?.supplierId || undefined}
                    open={isOpenDialogEditSupplier}
                    handleClose={handleClose}
                    handleConfirm={(selectedId) => {
                      updateProduct({
                        scheduleId: scheduleId,
                        id: id,
                        supplierId: selectedId,
                      });
                    }}
                  />
                )}
              </Box>
            </Box>
          </List>
        </NotFoundWrapper>

        <SendQuoteRequestDialog
          handleClose={handleCloseQuote}
          open={openQuote}
          supplier={dataDetailProduct?.supplier}
          scheduleId={scheduleId}
          productId={id}
        />
        <GetSampleDialog
          handleClose={handleCloseSample}
          open={openGetSample}
          supplier={dataDetailProduct?.supplier}
          scheduleId={scheduleId}
          productId={id}
        />
        <ProductStatusChangeDialog
          scheduleId={scheduleId}
          productId={id}
          isClientStatus={dataDetailProduct?.status === "client_approved"}
          handleClickOpenSample={handleClickOpenSample}
          handleClose={() => {
            setOpenStatusChange(false);
          }}
          open={openStatusChange}
        />
        <StatusHistory
          productId={id}
          handleClose={() => {
            setOpenStatusHistory(false);
          }}
          open={openStatusHistory}
        />
      </Box>
    </FormProvider>
  );
};

export default DetailProduct;
