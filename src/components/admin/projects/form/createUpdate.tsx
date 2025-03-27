"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, MenuItem, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import z from "zod";
import Grid from "@mui/material/Unstable_Grid2";
import InputForm from "@/components/common/form/InputForm";
import SelectForm from "@/components/common/form/SelectForm";
import {
  useCreateOrUpdateMutation,
  useDeleteImageProjectMutation,
  useGetCountriesQuery,
  useUploadImageMutation,
} from "@/services/projects";
import MemberSectionForm from "./member-section-form";
import ErrorFormMes from "@/components/common/error-form-mes";
import { useEffect, useState } from "react";
import { useGetMyAccountQuery, useGetUsersSearchQuery } from "@/services/user";
import { useAvciRouter } from "@/hooks/avci-router";
import { pathFile } from "@/config/api";
import { ImageDragAndDrop } from "@/components/common/app-upload-image";
import { useFormatter, useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { roleDataLeader } from "@/utils/common";

const schema = z.object({
  id: z.string().trim(),
  clientName: z
    .string()
    .min(1, { message: "This field is required" })
    .max(155)
    .trim(),
  clientEmail: z.string().trim().optional(),
  clientPhone: z.string().trim().optional(),
  address: z.object({
    id: z.string().optional(),
    addressLine1: z.string().max(155).trim().optional(),
    addressLine2: z.string().optional(),
    city: z.string().max(55).trim().optional(),
    state: z.string().max(155).trim().optional(),
    postcode: z.string().max(11).trim().optional(),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    countryId: z.number().int().min(1, { message: "This field is required" }),
  }),
  name: z
    .string()
    .min(1, { message: "This field is required" })
    .max(155)
    .trim(),
  website: z.string().trim().optional(),
  coverImage: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isArchive: z.boolean().optional(),
  projectUsers: z
    .object({
      permission: z.string().nullish().optional(),
      email: z.string().optional(),
      userId: z.string().nullish().optional(),
    })
    .array()
    .optional(),
  authorId: z.string().optional(),
});

export type Values = z.infer<typeof schema>;

interface CreateFormData {
  showMemberSection?: boolean;
  formId?: string;
  isDeleted?: boolean;
  projectData?: API.ProjectItem;
}

const CreateUpdateForm = ({
  showMemberSection,
  formId,
  isDeleted,
  projectData,
}: CreateFormData): React.JSX.Element => {
  const tFiles = useTranslations("filesUpload");
  const format = useFormatter();
  const { data: countries } = useGetCountriesQuery({ slug: "country" });
  const [createOrUpdate, { error }] = useCreateOrUpdateMutation();
  const [files, setFiles] = useState<File[]>([]);
  const rt = useAvciRouter();
  const [upFile] = useUploadImageMutation();
  const [dfCountry, setDfCountry] = useState(0);
  const defaultValues = {
    id: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    address: {
      id: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postcode: "",
      email: "",
      phone: "",
      countryId: dfCountry,
    },
    name: "",
    website: "",
    coverImage: "",
    description: "",
    isArchive: false,
    projectUsers: [],
    authorId: "",
  };
  useEffect(() => {
    setDfCountry(
      countries?.children.filter((e) => e.slug === "ct_HK")[0]?.id ?? 0,
    );
  }, [countries?.children]);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<Values>({
    disabled: projectData?.roleName === roleDataLeader[1].value ? true : false,
    defaultValues,
    resolver: zodResolver(schema),
    values: {
      id: projectData?.id ?? "",
      clientName: projectData?.clientName ?? "",
      clientEmail: projectData?.clientEmail ?? "",
      clientPhone: projectData?.clientPhone ?? "",
      address: {
        id: projectData?.address?.id ?? "",
        addressLine1: projectData?.address?.addressLine1 ?? "",
        addressLine2: projectData?.address?.addressLine2 ?? "",
        city: projectData?.address?.city ?? "",
        state: projectData?.address?.state ?? "",
        postcode: projectData?.address?.postcode ?? "",
        email: projectData?.address?.email ?? "",
        phone: projectData?.address?.phone ?? "",
        countryId: projectData?.address?.countryId ?? dfCountry,
      },
      name: projectData?.name ?? "",
      website: projectData?.website ?? "",
      coverImage: projectData?.coverImage ?? "",
      description: projectData?.description ?? "",
      isArchive: projectData?.isArchive ?? false,
      projectUsers: projectData?.projectUsers ?? [],
      authorId: projectData?.authorId ?? "",
    },
  });

  const handleUpFiles = (files: File[]) => {
    setFiles(files);
  };

  const onSubmit = async (data: Values): Promise<void> => {
    if (
      data?.projectUsers?.some(
        (item) => item.permission === roleDataLeader[2]?.value,
      )
    ) {
      createOrUpdate({
        id: projectData?.id,
        clientName: data?.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        address: {
          addressLine1: data.address.addressLine1,
          city: data.address.city,
          state: data.address.state,
          postcode: data.address.postcode,
          email: data.address.email,
          phone: data.address.phone,
          countryId: data.address.countryId ?? -1,
        },
        name: data.name,
        website: data.website,
        description: data.description,
        isArchive: true,
        projectUsers: data.projectUsers,
      })
        .then((add) => {
          if (!projectData?.id) {
            for (let i = 0; i < files.length; i++) {
              if (add?.data?.id !== undefined) {
                upFile({ id: add?.data.id, file: files[i] });
              }
            }
          } else {
            if (isDeleteFile) {
              deleteCoverImage({ projectId: projectData?.id ?? "" });
            }
            for (let i = 0; i < files.length; i++) {
              upFile({ id: projectData.id, file: files[i] });
            }
          }
          rt.back();
        })
        .catch(() => {
          console.log("error: ", error);
        });
    } else {
      enqueueSnackbar(`${t("pleaseChooseProjectLeader")}`, {
        variant: "error",
      });
    }
  };

  const { data: resGetAllUser } = useGetUsersSearchQuery({
    page: 0,
    limit: 100,
  });

  const [deleteCoverImage] = useDeleteImageProjectMutation();
  const [isDeleteFile, setIsDeleteFile] = useState(false);
  const { data: dataMyAccount } = useGetMyAccountQuery();
  const t = useTranslations("projects");

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate id={formId}>
        <Stack gap="36px">
          <Stack gap="16px">
            <Typography variant="subtitle2">
              {t("createProject.general")}
            </Typography>
            <Stack gap="20px">
              <Grid
                container
                columns={16}
                columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
                rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
              >
                <Grid xs={16}>
                  <InputForm
                    control={control}
                    label={t("createProject.projectName")}
                    name="name"
                    fullWidth
                    required
                    disabled={isDeleted}
                    error={Boolean(errors.name)}
                    textFieldProps={{
                      inputProps: { maxLength: 155 },
                    }}
                  />
                </Grid>
                <Grid xs={16}>
                  <InputForm
                    control={control}
                    label={t("createProject.client")}
                    name="clientName"
                    fullWidth
                    required
                    disabled={isDeleted}
                    error={Boolean(errors.clientName)}
                    textFieldProps={{
                      inputProps: { maxLength: 155 },
                    }}
                  />
                </Grid>

                <Grid xs={8}>
                  <InputForm
                    control={control}
                    label={t("createProject.clientEmail")}
                    name="clientEmail"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.clientEmail)}
                  />
                </Grid>
                <Grid xs={8}>
                  <InputForm
                    control={control}
                    label={t("createProject.clientPhoneNo")}
                    name="clientPhone"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.clientPhone)}
                  />
                </Grid>

                <Grid xs={16}>
                  <InputForm
                    control={control}
                    label={t("createProject.website")}
                    name="website"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.website)}
                  />
                </Grid>
                <Grid xs={16}>
                  <InputForm
                    control={control}
                    label={t("createProject.description")}
                    name="description"
                    fullWidth
                    disabled={isDeleted}
                    multiline
                  />
                </Grid>
              </Grid>
            </Stack>
            <Typography variant="subtitle2">
              {t("createProject.coverImage")}
            </Typography>
            <Box
              sx={{
                maxWidth: "260px",
                "& div": {
                  mt: "0px",
                },
              }}
            >
              {isDeleted ||
              projectData?.roleName === roleDataLeader[1].value ? (
                <Box
                  component="img"
                  sx={{
                    objectFit: "cover",
                    height: "146px",
                    width: "260px",
                    borderRadius: "4px",
                  }}
                  alt=""
                  src={`${pathFile}/${projectData?.coverImageFile?.path}`}
                />
              ) : (
                <ImageDragAndDrop
                  sx={{
                    display: "block",
                    "& .ImgDnD-ImgContainer": {
                      height: "146px",
                      width: "260px",
                    },
                    "& .DnD-DragDrop": {
                      aspectRatio: "unset",
                    },
                  }}
                  maxFile={1}
                  currentMaxFile={1}
                  files={files}
                  setFiles={handleUpFiles}
                  initFile={
                    projectData?.coverImageFile && !isDeleteFile
                      ? [
                          {
                            id: projectData?.coverImageFile?.id ?? "",
                            path: projectData?.coverImageFile?.path ?? "",
                            thumbnail:
                              projectData?.coverImageFile?.thumbnail ?? "",
                          },
                        ]
                      : []
                  }
                  deleteFile={() => {
                    setIsDeleteFile(true);
                    setFiles([]);
                    // deleteCoverImage({ projectId: projectData?.id ?? "" });
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
              )}
            </Box>
          </Stack>
          <Stack gap="16px">
            <Typography variant="subtitle2">
              {t("createProject.projectAddress")}
            </Typography>
            <Stack gap="20px">
              <Grid
                container
                columns={16}
                columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
                rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
              >
                <Grid xs={16}>
                  <InputForm
                    control={control}
                    label={t("createProject.address")}
                    name="address.addressLine1"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.address?.addressLine1)}
                  />
                </Grid>
                <Grid xs={5}>
                  <InputForm
                    control={control}
                    label={t("createProject.city")}
                    name="address.city"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.address?.city)}
                  />
                </Grid>
                <Grid xs={6}>
                  <SelectForm
                    control={control}
                    label={t("createProject.country")}
                    name="address.countryId"
                    fullWidth
                    defaultValue=""
                    required
                    disabled={isDeleted}
                    error={Boolean(errors.address?.countryId)}
                  >
                    {countries?.children?.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.enName}
                      </MenuItem>
                    ))}
                  </SelectForm>
                  {errors.address?.countryId ? (
                    <ErrorFormMes
                      mes={errors.address?.countryId.message ?? ""}
                    />
                  ) : null}
                </Grid>
                <Grid xs={5}>
                  <InputForm
                    control={control}
                    label={t("createProject.postcode")}
                    name="address.postcode"
                    fullWidth
                    disabled={isDeleted}
                    error={Boolean(errors.address?.postcode)}
                  />
                  {errors.address?.postcode ? (
                    <ErrorFormMes
                      mes={errors.address?.postcode.message ?? ""}
                    />
                  ) : null}
                </Grid>
              </Grid>
            </Stack>
          </Stack>
          {showMemberSection && (
            <MemberSectionForm
              dataMyAccount={dataMyAccount}
              control={control}
              errors={errors}
              dataGetAllUser={resGetAllUser?.data ?? []}
            />
          )}
        </Stack>
      </form>
    </div>
  );
};

export { CreateUpdateForm };
