import ButtonPrimary from "@/components/common/button-primary";
import InputForm from "@/components/common/form/InputForm";
import SelectForm from "@/components/common/form/SelectForm";
import UserTextField from "@/components/common/UserTextField";
import { pathFile } from "@/config/api";
import { timezones } from "@/constants/timezones";
import { faCamera } from "@/lib/fas/pro-duotone-svg-icons";
import {
  useGetMyAccountQuery,
  useUpdateMeMutation,
  useUploadAvaMeMutation,
} from "@/services/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, InputAdornment, Avatar, MenuItem } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { useCallback, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormUpdateUser = () => {
  const { data: dataMyAccount } = useGetMyAccountQuery();
  const [updateMe] = useUpdateMeMutation();
  const [uploadAva] = useUploadAvaMeMutation();
  const t = useTranslations("myAccount");

  const schemaMyAccount = z.object({
    firstName: z
      .string()
      .min(1, { message: `${t("thisFieldIsRequired")}` })
      .max(155),
    avatar: z.string().optional(),
    social: z
      .object({
        linkedin: z.string().optional(),
      })
      .optional(),
    company: z
      .string()
      .min(1, { message: `${t("thisFieldIsRequired")}` })
      .max(155),
    timeZone: z.string().max(155).optional(),
  });
  type ValuesMyAccount = z.infer<typeof schemaMyAccount>;
  const defaultValuesProduct = {
    firstName: dataMyAccount?.firstName ?? "",
    avatar: dataMyAccount?.avatar ?? "",
    social: {
      linkedin: dataMyAccount?.social?.linkedin ?? "",
    },
    company: dataMyAccount?.company ?? "",
    timeZone: dataMyAccount?.timeZone ?? "",
  } satisfies ValuesMyAccount;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ValuesMyAccount>({
    resolver: zodResolver(schemaMyAccount),
    values: defaultValuesProduct,
  });
  const onSubmit = useCallback(
    async (data: ValuesMyAccount): Promise<void> => {
      updateMe({
        firstName: data.firstName ?? "",
        timeZone: data.timeZone ?? "",
        avatar: data.avatar ?? "",
        social: {
          linkedin: data.social?.linkedin ?? "",
        },
        company: data.company ?? "",
      })
        .unwrap()
        .then(() => {
          enqueueSnackbar(t("yourProfileUpdated"), {
            variant: "success",
          });
        })
        .catch(() => {
          enqueueSnackbar(t("somethingWrong"), {
            variant: "error",
          });
        });
    },
    [t, updateMe],
  );

  const handleUploadClick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAva({ file: file });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate id="form-update-me">
        {dataMyAccount?.avatar ? (
          <Box
            sx={{
              position: "relative",
              width: "fit-content",
            }}
          >
            <Box
              component="img"
              sx={{
                width: "110px",
                height: "110px",
                borderRadius: "9999px",
              }}
              alt={`avatar-user`}
              src={`${pathFile}/${dataMyAccount?.avatar}`}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="icon-upload-avatar"
              type="file"
              onChange={handleUploadClick}
            />
            <label htmlFor="icon-upload-avatar">
              <InputAdornment
                position="end"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: 0,
                  right: 4,
                  width: "28px",
                  height: "28px",
                  background: "#fff",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  color: "#9e9e9e",
                  transition: "color 0.3s",
                  "&:hover": {
                    color: "#000",
                  },
                }}
              >
                <FontAwesomeIcon icon={faCamera} style={{ fontSize: "16px" }} />
              </InputAdornment>
            </label>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              width: "fit-content",
            }}
          >
            <Avatar
              sx={{
                width: "110px",
                height: "110px",
                borderRadius: "9999px",
              }}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="icon-upload-avatar"
              type="file"
              onChange={handleUploadClick}
            />
            <label htmlFor="icon-upload-avatar">
              <InputAdornment
                position="end"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "absolute",
                  bottom: 0,
                  right: 4,
                  width: "28px",
                  height: "28px",
                  background: "#fff",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  color: "#9e9e9e",
                  transition: "color 0.3s",
                  "&:hover": {
                    color: "#000",
                  },
                }}
              >
                <FontAwesomeIcon icon={faCamera} style={{ fontSize: "16px" }} />
              </InputAdornment>
            </label>
          </Box>
        )}
        <Grid2
          sx={{ width: "70%", marginTop: "24px" }}
          container
          columns={16}
          columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
          rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        >
          <Grid2 xs={16}>
            <InputForm
              control={control}
              label={t("label.fullName")}
              name="firstName"
              fullWidth
              required
              error={Boolean(errors.firstName)}
            />
          </Grid2>
          <Grid2 xs={16}>
            <UserTextField
              variant="outlined"
              size="medium"
              disabled
              label={t("label.emailAddress")}
              defaultValue={dataMyAccount?.email}
              fullWidth
              required
            />
          </Grid2>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("label.timeZone")}
              name="timeZone"
              fullWidth
            >
              <MenuItem value={""}>---</MenuItem>

              {timezones.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
          <Grid2 xs={16}>
            <InputForm
              control={control}
              label={t("label.companyName")}
              name="company"
              fullWidth
              required
              error={Boolean(errors.company)}
            />
          </Grid2>
          <Grid2 xs={16}>
            <InputForm
              control={control}
              label={t("label.linkdedinURL")}
              name="social.linkedin"
              fullWidth
              error={Boolean(errors.social?.linkedin)}
            />
          </Grid2>
          <Box width={"100%"} justifyContent={"flex-end"} display={"flex"}>
            <ButtonPrimary
              disabled={!isValid}
              sx={{ marginTop: "24px" }}
              type="submit"
              label={t("button.saveChange")}
              form="form-update-me"
            ></ButtonPrimary>
          </Box>
        </Grid2>
      </form>
    </>
  );
};

export default FormUpdateUser;
