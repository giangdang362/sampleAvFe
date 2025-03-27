"use client";
import HeaderMain, { BackBtnHref } from "@/components/layout/header";
import { useAvciRouter } from "@/hooks/avci-router";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { PdDetailRow } from "../../../components/admin/products/detailProduct/product-detail-row";
import {
  useAddProductToScheduleMutation,
  useCreateUpdateProductMutation,
  useDeleteImageProductMutation,
  useDeleteProductMutation,
  useGetOneProductsQuery,
  useGetOneProductsUserQuery,
  useUploadAttachmentMutation,
  useUploadImageFilesMutation,
} from "@/services/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EditSupplierDialog } from "../components/EditSupplierDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCircleXmark } from "@/lib/fas/pro-duotone-svg-icons";
import { useTranslations } from "next-intl";
import { parseInt } from "lodash";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { faPlus, faTrash, faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { faPen } from "@/lib/fas/pro-regular-svg-icons/faPen";
import DetailProductSection from "./DetailProductSection";
import ProductSpecificationsSection from "./ProductSpecificationsSection";
import { FileDragAndDrop } from "@/components/common/app-upload-file";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import { DialogConfirmProject } from "@/screens/projects/components/DialogConfirmProject";
import CustomSpecificationTable from "@/components/admin/products/createProducts/CustomSpecification/DataTable";
import {
  ValuesProduct,
  defaultValuesProduct,
  schemaProduct,
} from "@/components/admin/products/createProducts/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { paths } from "@/paths";
import { useIsUser } from "@/services/helpers";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import { usePageTitle } from "@/hooks/usePageTitle";
import { pathFile } from "@/config/api";
import { useAppDispatch } from "@/store";
import { setProductDetailType } from "@/store/product";
import TagViewer from "@/components/common/TagViewer";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

type DetailProductProps = {
  id: string;
};
const DetailProduct = ({ id }: DetailProductProps) => {
  const router = useAvciRouter();
  const isUser = useIsUser();
  console.log("🚀 ~ DetailProduct ~ isUser:", isUser);

  const {
    data: dataAdmin,
    isLoading: isAdminDataLoading,
    error: adminError,
  } = useGetOneProductsQuery(
    {
      id: id,
    },
    { skip: isUser },
  );

  const {
    data: dataUser,
    isLoading: isUserDataLoading,
    error: userError,
  } = useGetOneProductsUserQuery(
    {
      id: id,
    },
    { skip: !isUser },
  );

  console.log("dataUser", dataUser);
  console.log("dataAdmin", dataAdmin);

  const dataDetailProduct = !isUser ? dataAdmin : dataUser;
  const dataPartnerMember = dataDetailProduct?.supplier;
  const isDataLoading = !isUser ? isAdminDataLoading : isUserDataLoading;
  const error = !isUser ? adminError : userError;
  usePageTitle(
    "productDetail",
    dataDetailProduct &&
      `${dataDetailProduct.series}-${dataDetailProduct.model}`,
  );

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (dataDetailProduct) {
      dispatch(
        setProductDetailType(
          dataDetailProduct.isAdminCreated ? "admin" : "user",
        ),
      );
    }

    return () => {
      dispatch(setProductDetailType(undefined));
    };
  }, [dataDetailProduct, dispatch]);

  const [isOpenDialogEditSupplier, setIsOpenDialogEditSupplier] =
    useState(false);
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const handleClose = () => {
    setIsOpenDialogEditSupplier(false);
  };
  const [updateProduct] = useCreateUpdateProductMutation();

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
            id: id,
            supplierId: null,
          }).unwrap();
        } catch {}
      },
    });
  };

  const { data: productUnit } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productUnit,
  });
  const [deleteFile] = useDeleteImageProductMutation();
  const [upFile, { isLoading }] = useUploadImageFilesMutation();
  const [uploadAttachments] = useUploadAttachmentMutation();

  const handleUpFiles = (files: File[]) => {
    if (id !== null && id != undefined) {
      upFile({ id: id, files: files });
    }
  };

  const handleUpAttachments = async (attachments: File[]) => {
    if (id !== null && id != undefined) {
      await uploadAttachments({
        files: attachments,
        productId: id,
        authorId: dataDetailProduct?.author?.id ?? "",
      });
    }
  };
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [addProductToSchedule] = useAddProductToScheduleMutation();

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };
  const handleCloseAdd = () => {
    setOpenAdd(false);
  };
  const handleAdd = async (scheduleId: string, sectionId: string) => {
    if (!dataDetailProduct?.id) return;

    await addProductToSchedule({
      scheduleId,
      qd: {
        type: "library",
        productId: dataDetailProduct.id,
        sectionId,
        quantity: 0,
      },
    }).unwrap();
  };

  const [openCf, setOpenCf] = useState(false);

  const handleClickOpenCf = () => {
    setOpenCf(true);
  };
  const handleCloseCf = () => {
    setOpenCf(false);
  };

  const [deleteProduct] = useDeleteProductMutation();

  const deleteProd = () => {
    deleteProduct({ id: dataDetailProduct?.id ?? "" }).then(() => {});
    handleCloseCf();
    router.push(`${paths.admin.products}`);
  };

  const form = useForm<ValuesProduct>({
    resolver: zodResolver(schemaProduct),
    values: { ...defaultValuesProduct, metadata: dataDetailProduct?.metadata },
  });
  const { control } = form;

  const [isPrivate, setIsPrivate] = useState<boolean>();
  useEffect(() => {
    setIsPrivate(dataDetailProduct?.isPrivate);
  }, [dataDetailProduct]);

  return (
    <FormProvider {...form}>
      <Box pb={"40px"}>
        <DialogConfirmProject
          open={openCf}
          handleClickOpen={handleClickOpenCf}
          handleClose={handleCloseCf}
          handleAgree={deleteProd}
          name={`${dataDetailProduct?.series} ${dataDetailProduct?.model}`}
          type="delete"
          deleteName="product"
        />
        <ActionToProjectFileDialog
          type="schedule"
          action="add"
          open={openAdd}
          onClose={handleCloseAdd}
          onSectionSelected={handleAdd}
        />
        <HeaderMain
          titleLoading={isDataLoading}
          title={
            `${dataDetailProduct?.series}-${dataDetailProduct?.model}` || "null"
          }
          haveBackBtn
          backBtnHref={
            isUser
              ? {
                  isUser: true,
                  path: "products",
                }
              : isDataLoading
                ? undefined
                : ({
                    isUser: false,
                    path:
                      dataDetailProduct?.isAdminCreated === false
                        ? "userLibrary"
                        : "products",
                  } satisfies BackBtnHref<false> as BackBtnHref<boolean>)
          }
          buttonBlock={
            <>
              {!isUser && (
                <Button
                  color="error"
                  startIcon={
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{
                        fontSize: "16px",
                        color: "#D32F2F",
                      }}
                    />
                  }
                  variant="outlined"
                  style={{ borderRadius: 4 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClickOpenCf();
                  }}
                  aria-label="icon button"
                  LinkComponent={Link}
                >
                  {t("delete")}
                </Button>
              )}
              {(dataUser !== undefined && !isUser) ||
              dataAdmin?.isAdminCreated ? (
                <Button
                  onClick={() => {
                    handleClickOpenAdd();
                  }}
                  startIcon={
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ fontSize: "16px" }}
                    />
                  }
                  variant="outlined"
                  style={{ borderRadius: 4 }}
                >
                  {t("add_to")}
                </Button>
              ) : null}
            </>
          }
        />

        <NotFoundWrapper
          error={error}
          notFoundMessage={t("product_not_found")}
          messageProps={{ mt: 8 }}
        >
          {!isUser && dataDetailProduct?.isAdminCreated ? (
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">{t("private")}</Typography>
              <Switch
                checked={isPrivate}
                onChange={(e) => {
                  setIsPrivate(e.target.checked);
                  (async () => {
                    await updateProduct({
                      id: id,
                      isPrivate: e.target.checked,
                    }).unwrap();
                  })();
                }}
                sx={{ ml: "-12px" }}
              />
            </Box>
          ) : null}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box
              sx={{
                width: "55%",
                display: "flex",
                flexDirection: "column",
                rowGap: "28px",
              }}
            >
              <Box>
                {dataDetailProduct?.images?.length || !isUser ? (
                  <Typography variant="subtitle1">
                    {t("product_images")}
                  </Typography>
                ) : null}
                {!isUser ||
                (dataDetailProduct?.images &&
                  dataDetailProduct?.images?.length > 0) ? (
                  <ImageDragAndDrop
                    disabled={isLoading}
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
                          fileId: a,
                          productId: id,
                        });
                      }
                    }}
                    readonly={isUser}
                  />
                ) : null}
              </Box>
              <DetailProductSection
                id={id}
                dataDetailProduct={dataDetailProduct}
              />
              <ProductSpecificationsSection
                id={id}
                dataDetailProduct={dataDetailProduct}
              />
              {dataDetailProduct?.metadata?.length || !isUser ? (
                <Box>
                  <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                    {t("custom_specification")}
                  </Typography>
                  <CustomSpecificationTable
                    type="detail"
                    productId={id}
                    data={dataDetailProduct?.metadata ?? []}
                    control={control}
                  />
                </Box>
              ) : null}
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

                {dataPartnerMember?.partner && !isUser && (
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
                      {dataPartnerMember.partner.logoFile ? (
                        <Box
                          component={"img"}
                          src={`${pathFile}/${dataPartnerMember?.partner.logoFile?.path}`}
                          sx={{
                            height: "56px",
                            width: "56px",
                            borderRadius: "12px",
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            height: "56px",
                            width: "56px",
                            borderRadius: "12px",
                          }}
                        />
                      )}
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
                  {!isUser && (
                    <Button
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
                  )}
                </Box>
              )}
              <Typography
                variant="subtitle1"
                sx={{ marginBottom: 1, marginTop: "28px" }}
              >
                {t("cost_estimation")}
              </Typography>

              <PdDetailRow
                onChange={(e) => {
                  updateProduct({
                    id: id,
                    unitRate: parseInt(e.target.value),
                  });
                }}
                type="input"
                name={t("unit_rate")}
                data={dataDetailProduct?.unitRate || ""}
                typeInput="number"
                maxLength={15}
              />

              <PdDetailRow
                dataDropDow={productUnit?.children ?? []}
                onChangeDropDow={(e) => {
                  updateProduct({
                    id: id,
                    unit: e.target.value,
                  });
                }}
                type="dropDow"
                name={t("unit")}
                data={dataDetailProduct?.unit || ""}
              />

              <PdDetailRow
                onChange={(e) => {
                  updateProduct({
                    id: id,
                    discount: parseInt(e.target.value),
                  });
                }}
                type="input"
                name={t("discount")}
                data={dataDetailProduct?.discount || ""}
                typeInput="number"
                maxLength={15}
              />
              {dataDetailProduct?.attachments?.length || !isUser ? (
                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: 1, marginTop: "28px" }}
                >
                  {t("attachments")}
                </Typography>
              ) : null}
              <FileDragAndDrop
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
                      fileId: a.id,
                      productId: id,
                    }).then(() => {});
                  }
                }}
                maxFile={10}
                size="compact"
                sx={{ width: "100%" }}
                readonly={isUser ? true : false}
              />

              {!isUser && (
                <EditSupplierDialog
                  initData={dataDetailProduct?.supplierId || undefined}
                  open={isOpenDialogEditSupplier}
                  handleClose={handleClose}
                  handleConfirm={(selectedId) => {
                    updateProduct({
                      id: id,
                      supplierId: selectedId,
                    });
                  }}
                />
              )}

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
                      editDisabled={isUser}
                      isEdit={isEditingTag}
                      onEditModeChange={setIsEditingTag}
                      onSave={async (tags) => {
                        if (!dataDetailProduct.id) return;

                        await updateProduct({
                          id: dataDetailProduct.id,
                          tags,
                        }).unwrap();
                      }}
                    />
                  )}
                </>
              )}
            </Box>
          </Box>
        </NotFoundWrapper>
      </Box>
    </FormProvider>
  );
};

export default DetailProduct;
