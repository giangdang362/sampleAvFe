"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Box,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import InputForm from "@/components/common/form/InputForm";
import SelectForm from "@/components/common/form/SelectForm";
import { ProductSpecificationsSections } from "./ProductSpecifications";
import { ProductDetailsSection } from "./ProductDetails";
import {
  useAddProductToScheduleMutation,
  useCreateUpdateProductMutation,
  useDeleteImageProductMutation,
  useGetOneProductsMuMutation,
  useUploadAttachmentMutation,
  useUploadImageFilesMutation,
} from "@/services/products";
import { useAvciRouter } from "@/hooks/avci-router";
import { useAppDispatch } from "@/store";
import { useSearchParams } from "next/navigation";
import { setDataDetail } from "@/store/product";
import { FileDragAndDrop } from "@/components/common/app-upload-file";
import { paths } from "@/paths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPercent } from "@/lib/fas/pro-light-svg-icons";
import { ValuesProduct, defaultValuesProduct, schemaProduct } from "./zod";
import { useTranslations } from "next-intl";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import CustomSpecificationTable from "./CustomSpecification/DataTable";
import { useGetPlansQuery } from "@/services/plan";
import { useGetListPartnerMemberQuery } from "@/services/partnerMember";
import ActionToProjectFileDialog from "../../projects/ActionToProjectFileDialog";
import TagViewer from "@/components/common/TagViewer";
export type FormCreateProductProps = {
  addToOpen?: boolean;
  onAddToClose?: () => void;
  onLoadingChanged?: (source?: "save" | "add-to") => void;
};

export default function FormCreateProduct({
  addToOpen,
  onAddToClose,
  onLoadingChanged,
}: FormCreateProductProps): React.JSX.Element {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const tFiles = useTranslations("filesUpload");
  const searchParams = useSearchParams();
  const [getOne, { data }] = useGetOneProductsMuMutation();
  const dispatch = useAppDispatch();

  const productId = useMemo(() => {
    if (searchParams.get("ori_id") && searchParams.get("ori_id") !== "") {
      return searchParams.get("ori_id");
    }
    return undefined;
  }, [searchParams.get("ori_id")]);

  const { data: dataPlan } = useGetPlansQuery();

  useEffect(() => {
    if (productId !== undefined) {
      getOne({ id: productId ?? "" }).then((aas) => {
        if (aas?.data) dispatch(setDataDetail(aas.data));
      });
    }
  }, [productId]);

  const form = useForm<ValuesProduct>({
    resolver: zodResolver(schemaProduct),
    values: defaultValuesProduct,
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = form;
  const [productImages, setProductImages] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [createUpdateProductApi] = useCreateUpdateProductMutation();
  const [addProductToSchedule] = useAddProductToScheduleMutation();

  const { data: dataUnit } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productUnit,
  });

  const { data: dataPartnerMember } = useGetListPartnerMemberQuery();

  const router = useAvciRouter();

  const [upFile] = useUploadImageFilesMutation();
  const [uploadAttachments] = useUploadAttachmentMutation();

  const createProduct = useCallback(
    async (
      data: ValuesProduct,
      addTo?: { scheduleId: string; sectionId: string },
    ): Promise<void> => {
      try {
        const as = await createUpdateProductApi({
          id: undefined,
          ...data,
          antiBacterial: Boolean(data.antiBacterial),
          width: Number(data.width),
          length: Number(data.length),
          height: Number(data.height),
          depth: Number(data.depth),
          unitRate: Number(data.unitRate),
          discount: Number(data.discount),
          planId: dataPlan?.data[0]?.id ? dataPlan?.data[0]?.id : undefined,
        }).unwrap();

        if (!as?.id) return;

        const additionalDataApis: Promise<any>[] = [];
        if (productImages?.length) {
          additionalDataApis.push(upFile({ id: as.id, files: productImages }));
        }

        if (attachments?.length) {
          additionalDataApis.push(
            uploadAttachments({
              files: attachments,
              productId: as.id,
            }),
          );
        }

        await Promise.all(additionalDataApis);

        if (addTo) {
          await addProductToSchedule({
            scheduleId: addTo.scheduleId,
            qd: {
              type: "library",
              productId: as.id,
              sectionId: addTo.sectionId,
              quantity: 0,
            },
          });
        }

        router.push(`${paths.admin.products}`);
      } catch {
        onLoadingChanged?.(undefined);
      }
    },
    [
      createUpdateProductApi,
      dataPlan?.data,
      router,
      productImages,
      attachments,
      upFile,
      uploadAttachments,
      addProductToSchedule,
      onLoadingChanged,
    ],
  );
  const onSubmit = useCallback(
    (data: ValuesProduct) => {
      onLoadingChanged?.("save");
      createProduct(data);
    },
    [createProduct, onLoadingChanged],
  );

  const handleAddTo = useCallback(
    (scheduleId: string, sectionId: string) => {
      handleSubmit((data) => {
        onLoadingChanged?.("add-to");
        createProduct(data, { scheduleId, sectionId });
      })();
    },
    [handleSubmit, createProduct, onLoadingChanged],
  );

  const [deleteFile] = useDeleteImageProductMutation();

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate id="form-product">
        <Box sx={{ display: "flex", bgcolor: "background.paper", pb: "40px" }}>
          <Box sx={{ flex: 3, marginRight: "100px" }}>
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              {t("product_images")}
            </Typography>
            <ImageDragAndDrop
              maxFile={10}
              currentMaxFile={10 - productImages.length}
              files={productImages}
              setFiles={setProductImages}
              initFile={data?.images ?? []}
              deleteFile={async (a) => {
                if (productId) {
                  await deleteFile({
                    fileId: a,
                    productId: productId,
                  });
                  getOne({ id: productId });
                }
              }}
            />
            <ProductDetailsSection control={control} errors={errors} />
            <ProductSpecificationsSections control={control} errors={errors} />
            <Box sx={{ mt: "28px" }}>
              <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                {t("custom_specification")}
              </Typography>
              <CustomSpecificationTable control={control} type="create" />
            </Box>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              {t("supplier")}
            </Typography>
            <Controller
              control={control}
              name="supplierId"
              render={({ field: { onChange } }) => (
                <Autocomplete
                  onChange={(e, data) => {
                    onChange(data?.id);
                  }}
                  sx={{
                    p: 0,
                    "& .mui-ga15xk-MuiFormLabel-root-MuiInputLabel-root": {
                      top: "6px",
                    },
                  }}
                  id="tags-outlined"
                  options={dataPartnerMember?.data ?? []}
                  getOptionLabel={(item) => {
                    return `${item.name} - ${item.partner?.companyName}`;
                  }}
                  filterSelectedOptions
                  renderInput={({ size: _size, ...params }) => (
                    <TextField
                      {...params}
                      size="medium"
                      variant="outlined"
                      label=""
                      placeholder={t("supplier_name_company")}
                    />
                  )}
                />
              )}
            />

            <Box sx={{ marginBottom: "28px" }} />
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              {t("cost_estimation")}
            </Typography>
            <Stack gap="20px">
              <InputForm
                control={control}
                label={t("unit_rate")}
                name="unitRate"
                fullWidth
                multiline
                inputMode="decimal"
              />
              <SelectForm
                control={control}
                label={t("unit")}
                name="unit"
                defaultValue="cm"
                fullWidth
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataUnit?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
              <InputForm
                control={control}
                label={t("discount")}
                name="discount"
                fullWidth
                multiline
                endAdornment={
                  <FontAwesomeIcon
                    icon={faPercent}
                    style={{ fontSize: "14px" }}
                  />
                }
                inputMode="decimal"
              />
            </Stack>
            <Box sx={{ marginBottom: "28px" }} />
            <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
              {t("attachments")}
            </Typography>
            <FileDragAndDrop
              files={attachments}
              addFiles={(newFiles) =>
                setAttachments((prev) => [...prev, ...newFiles])
              }
              deleteFile={(file) =>
                setAttachments((prev) => prev.filter((f) => f !== file))
              }
              maxFile={10}
              informationText={({ maxFile, maxSize }) =>
                tFiles("uploadFileNumberAndSizeInfo", {
                  count: maxFile,
                  size: maxSize,
                })
              }
              sx={{ width: "100%" }}
            />

            <Typography
              variant="subtitle1"
              component="label"
              htmlFor="input-tags"
              sx={{
                display: "block",
                marginBottom: 1,
                marginTop: "28px",
              }}
            >
              {tCommon(`tags`)}
            </Typography>

            <Controller
              control={control}
              name="tags"
              render={({ field: { value, onChange, name } }) => (
                <TagViewer
                  tags={value ?? []}
                  tagType="product"
                  textFieldProps={{
                    label: undefined,
                    inputProps: { id: "input-tags", name },
                  }}
                  onEditChange={onChange}
                  isEdit
                  noSaveControl
                />
              )}
            />
          </Box>
        </Box>
      </form>

      <ActionToProjectFileDialog
        type="schedule"
        action="add"
        open={!!addToOpen}
        onClose={onAddToClose}
        onSectionSelected={handleAddTo}
        showSuccessToast={false}
      />
    </FormProvider>
  );
}
