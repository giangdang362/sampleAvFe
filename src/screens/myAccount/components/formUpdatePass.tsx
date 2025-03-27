import InputForm from "@/components/common/form/InputForm";
import { passwordSchema } from "@/constants/zod";
import { isErrorResponse } from "@/services/helpers";
import { useUpdateMePasswordMutation } from "@/services/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@mui/lab";
import { Box } from "@mui/material";
import { useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormUpdatePass = () => {
  const [updatePass, { isLoading }] = useUpdateMePasswordMutation();
  const t = useTranslations("myAccount");

  const schemaMyPassword = z
    .object({
      oldPassword: z
        .string()
        .min(1, { message: t("thisFieldIsRequired") })
        .max(155),
      password: passwordSchema,
      confirmPass: z.string(),
    })
    .refine((data) => data.password === data.confirmPass, {
      message: t("confirmNewError"),
      path: ["confirmPass"],
    });
  type ValuesMyPassword = z.infer<typeof schemaMyPassword>;
  const defaultValuesProduct = {
    oldPassword: "",
    password: "",
    confirmPass: "",
  } satisfies ValuesMyPassword;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ValuesMyPassword>({
    resolver: zodResolver(schemaMyPassword),
    defaultValues: defaultValuesProduct,
  });
  const onSubmit = useCallback(
    async (data: ValuesMyPassword): Promise<void> => {
      updatePass({
        oldPassword: data.oldPassword ?? "",
        password: data.password ?? "",
      })
        .unwrap()
        .then(() => {
          enqueueSnackbar(`${t("yourPasswordUpdated")}`, {
            variant: "success",
          });
        })
        .catch((e) => {
          if (isErrorResponse(e) && e.data.message === "INVALID_PASSWORD") {
            setError("oldPassword", {
              message: t("currentPasswordWrong"),
              type: "validate",
            });
          }
        });
    },
    [setError, t, updatePass],
  );
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate id="form-update-pass">
        <Box sx={{ width: "60%" }}>
          <InputForm
            control={control}
            label={t("label.currentPassword")}
            name="oldPassword"
            fullWidth
            required
            error={Boolean(errors.oldPassword)}
            sx={{ marginBottom: "24px" }}
            textFieldProps={{ type: "password" }}
          />
          <InputForm
            control={control}
            label={t("label.newPassword")}
            name="password"
            fullWidth
            required
            sx={{ marginBottom: "24px" }}
            error={Boolean(errors.password)}
            textFieldProps={{ type: "password" }}
          />
          <InputForm
            control={control}
            label={t("label.confirmNewPassword")}
            name="confirmPass"
            fullWidth
            required
            sx={{ marginBottom: "24px" }}
            error={Boolean(errors.confirmPass)}
            textFieldProps={{ type: "password" }}
          />
          <Box width={"100%"} justifyContent={"flex-end"} display={"flex"}>
            <LoadingButton
              variant="contained"
              sx={{ marginTop: "24px" }}
              type="submit"
              loading={isLoading}
            >
              {t("button.saveChange")}
            </LoadingButton>
          </Box>
        </Box>
      </form>
    </>
  );
};

export default FormUpdatePass;
