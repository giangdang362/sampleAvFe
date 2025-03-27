"use client";

import React, { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Box,
  Chip,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import InputForm from "@/components/common/form/InputForm";
import { FileDragAndDrop } from "@/components/common/app-upload-file";

import { SupplierProjectAddressSection } from "./ProjectAddress";
import {
  useCreatePartnerMemberMutation,
  useUploadAttachmentsMutation,
  useUploadLogoMutation,
} from "@/services/partner";
import { useAvciRouter } from "@/hooks/avci-router";
import { paths } from "@/paths";
import { useFormatter, useTranslations } from "next-intl";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import { useGetTagsListQuery } from "@/services/tags";
import ErrorFormMes from "@/components/common/error-form-mes";
import FooterMain from "@/components/layout/footer-main";
import DataTablePartnerMemberCreate from "@/screens/suppliers/TableSuppliersListCreate/DataTable";
import { SupplierSGeneralSection } from "./General";
import { useGetCountriesQuery } from "@/services/projects";

interface TabType {
  id: number;
  name: string;
  isActive: boolean;
}
const schema = z.object({
  companyName: z
    .string()
    .min(1, { message: "This field is required" })
    .max(155)
    .trim(),
  logo: z.string().optional(),
  website: z.string().optional(),
  type: z.string().optional(),
  address: z
    .object({
      addressLine1: z
        .string()
        .min(1, { message: "This field is required" })
        .optional(),
      addressLine2: z.string().optional(),
      city: z
        .string()
        .min(1, { message: "This field is required" })
        .max(55)
        .trim(),
      state: z.string().optional(),
      postcode: z.string().optional(),
      email: z
        .string()
        .min(1, { message: "This field is required" })
        .email({ message: "Invalid email" })
        .optional(),
      phone: z
        .string()
        .min(1, { message: "This field is required" })
        .optional(),
      countryId: z.number().int().min(1, "This field is required"),
    })
    .optional(),
  note: z.string().optional(),
  tags: z
    .object({
      name: z.string().optional(),
    })
    .array(),
  partnerMembers: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .array(),
});
export type ValuesSupplier = z.infer<typeof schema>;

export interface DataSpecifications {
  label: string;
  detail: string;
}

export type FormNewSupplierProps = {
  setIdSave?: (id: string) => void;
};

export default function FormNewSupplier({
  setIdSave,
}: FormNewSupplierProps): React.JSX.Element {
  const t = useTranslations("suppliers");
  const tFiles = useTranslations("filesUpload");
  const format = useFormatter();
  const { data: dataTags } = useGetTagsListQuery();
  const { data: countries } = useGetCountriesQuery({ slug: "country" });

  const [dfCountry, setDfCountry] = useState(0);
  useEffect(() => {
    setDfCountry(
      countries?.children.filter((e) => e.slug === "ct_HK")[0]?.id ?? 0,
    );
  }, [countries?.children]);

  const defaultValues = {
    companyName: "",
    logo: "",
    website: "",
    type: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postcode: "",
      email: "",
      phone: "",
      countryId: dfCountry,
    },
    tags: [],
    note: "",
    partnerMembers: [],
  };

  const form = useForm<ValuesSupplier>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });
  const {
    control,
    formState: { errors, isSubmitted, isValid },
    handleSubmit,
  } = form;
  const [files, setFiles] = useState<File[]>([]);
  const [filesDoc, setFilesDoc] = useState<File[]>([]);
  const { replace, fields } = useFieldArray({
    control,
    name: "tags",
  });
  const [upFile, { error: errorUpFile }] = useUploadLogoMutation<{
    error: API.ErrorResponse;
  }>();
  const [createUpdatePartner] = useCreatePartnerMemberMutation();
  const [uploadAttachments] = useUploadAttachmentsMutation();
  const [isLoading, setIsLoading] = useState(false);

  const router = useAvciRouter();

  const [stepIndex, setStepIndex] = useState(1);

  const onSubmit = useCallback(
    async (data: ValuesSupplier): Promise<void> => {
      if (files.length !== 0) {
        setIsLoading(true);
        createUpdatePartner({
          id: undefined,
          companyName: data.companyName,
          website: data.website ?? "",
          type: data.type ?? "",
          address: {
            addressLine1: data.address?.addressLine1 ?? "",
            city: data.address?.city ?? "",
            state: data.address?.state ?? "",
            postcode: data.address?.postcode ?? "",
            email: data.address?.email ?? "",
            phone: data.address?.phone ?? "",
            countryId: Number(data.address?.countryId),
          },
          tags: data.tags ?? [{ name: "" }],
          note: data.note ?? "",
          partnerMembers: data?.partnerMembers ?? [],
        })
          .unwrap()
          .then((as) => {
            if (as?.id !== undefined) {
              for (let i = 0; i < files.length; i++) {
                upFile({ id: as?.id, file: files[i] })
                  .unwrap()
                  .then(() => {
                    router.push(`${paths.admin.suppliers}`);
                  })
                  .catch(() => {
                    setIsLoading(false);
                    handleTabClick(tabs[0]);
                    setStepIndex(1);
                  });
              }
              if (filesDoc && filesDoc.length > 0) {
                uploadAttachments({
                  id: as?.id,
                  files: filesDoc,
                })
                  .unwrap()
                  .then(() => {
                    router.push(`${paths.admin.suppliers}`);
                  })
                  .catch(() => {
                    setIsLoading(false);
                    handleTabClick(tabs[0]);
                    setStepIndex(1);
                  });
              }
              router.push(`${paths.admin.suppliers}`);

              setIdSave && setIdSave(as?.id);
            }
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    },
    [
      files,
      createUpdatePartner,
      uploadAttachments,
      filesDoc,
      setIdSave,
      upFile,
      router,
    ],
  );

  const [tabs, setTabs] = useState<TabType[]>([
    { id: 1, name: "Step 1", isActive: true },
    { id: 2, name: "Step 2", isActive: false },
  ]);

  const handleTabClick = (tab: TabType) => {
    setTabs(
      tabs?.map((t) => ({
        ...t,
        isActive: t.id === tab.id,
      })),
    );
  };

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit, (e) => {
            console.log(e);
          })}
          noValidate
          id="create-new-supplier"
        >
          {tabs[0].isActive ? (
            <Box
              sx={{
                display: "flex",
                bgcolor: "background.paper",
                marginBottom: "100px",
              }}
            >
              <Box sx={{ flex: 3, marginRight: "100px" }}>
                <Box
                  sx={{
                    maxWidth: "150px",
                    minHeight: "150px",
                    position: "relative",
                  }}
                >
                  {files.length <= 0 && (
                    <Typography
                      sx={{
                        color: "red",
                        position: "absolute",
                        right: 0,
                        top: 0,
                      }}
                    >
                      *
                    </Typography>
                  )}

                  <ImageDragAndDrop
                    maxFile={1}
                    currentMaxFile={1}
                    files={files}
                    setFiles={setFiles}
                    initFile={[]}
                    deleteFile={() => {}}
                    sx={{
                      "& .DnD-InformationText": {
                        fontSize: "10px",
                      },
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
                  />
                </Box>
                {files.length === 0 && isSubmitted && isSubmitted ? (
                  <ErrorFormMes mes={t("message.thisFieldRequired")} />
                ) : (
                  <>
                    {errorUpFile && (
                      <ErrorFormMes
                        mes={`${errorUpFile?.data?.message.includes("max") ? t("message.max") : t("message.somethingWrong")}`}
                      />
                    )}
                  </>
                )}
                <SupplierSGeneralSection control={control} errors={errors} />
                <Autocomplete
                  sx={{
                    p: 0,
                    "& .mui-ga15xk-MuiFormLabel-root-MuiInputLabel-root": {
                      top: "6px",
                    },
                  }}
                  onChange={(e, value: readonly string[]) => {
                    replace(value?.map((val) => ({ name: val })));
                  }}
                  multiple
                  id="tags-filled"
                  options={dataTags?.deduplicatedTags ?? []}
                  value={fields?.map((option) => option.name ?? "") ?? []}
                  freeSolo
                  renderTags={(value: readonly string[], getTagProps) =>
                    value?.map((option: string, index: number) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          variant="outlined"
                          label={option}
                          key={key}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={({ size: _size, ...params }) => (
                    <TextField
                      {...params}
                      size="medium"
                      variant="outlined"
                      label={t("newSupplier.tags")}
                      placeholder=""
                      sx={{
                        width: "100%",
                      }}
                    />
                  )}
                />

                <Box sx={{ marginBottom: "28px" }} />
                <SupplierProjectAddressSection
                  control={control}
                  errors={errors}
                />
                <Box sx={{ marginBottom: "28px" }} />
              </Box>

              <Box sx={{ flex: 1.5, minWidth: 0 }}>
                <Box sx={{ marginBottom: "28px" }} />
                <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                  {t("newSupplier.notes")}
                </Typography>
                <InputForm
                  control={control}
                  label={t("newSupplier.notes")}
                  name="note"
                  fullWidth
                  multiline
                  maxRow={5}
                  row={5}
                />
                {errors.note ? (
                  <FormHelperText>{errors.note.message}</FormHelperText>
                ) : null}
                <Box sx={{ marginBottom: "28px" }} />
                <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
                  {t("newSupplier.attachments")}
                </Typography>
                <FileDragAndDrop
                  maxFile={10}
                  files={filesDoc}
                  addFiles={(newFiles) =>
                    setFilesDoc((prev) => [...prev, ...newFiles])
                  }
                  deleteFile={(file) =>
                    setFilesDoc((prev) => prev?.filter((f) => f !== file))
                  }
                  informationText={({ maxFile }) =>
                    tFiles("uploadFileNumberInfo", { count: maxFile })
                  }
                  sx={{ width: "100%" }}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              <DataTablePartnerMemberCreate data={[]} control={control} />
            </Box>
          )}
        </form>
      </FormProvider>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 20,
          left: 300,
          zIndex: 100,
        }}
      >
        <FooterMain
          isLoading={isLoading}
          formId="create-new-supplier"
          type="step"
          setStep={setStepIndex}
          step={stepIndex}
          isActiveNextStep2={isValid && files.length > 0}
          onNext={() => {
            handleTabClick(tabs[1]);
          }}
          onBack={() => {
            handleTabClick(tabs[0]);
          }}
        />
      </Box>
    </>
  );
}
