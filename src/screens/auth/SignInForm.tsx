"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import RouterLink from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z as zod } from "zod";
import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { useLoginMutation } from "@/services/auth";
import { Box, Checkbox, FormControlLabel, InputAdornment } from "@mui/material";
import { isErrorResponse } from "@/services/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLockKeyhole } from "@/lib/fas/pro-light-svg-icons";
import { useTranslations } from "next-intl";
import InputForm from "@/components/common/form/InputForm";
import FaIconButton from "@/components/common/FaIconButton";
import { faEye, faEyeSlash } from "@/lib/fas/pro-solid-svg-icons";
import { LoadingButton } from "@mui/lab";
import { STORAGE_KEYS } from "@/constants/storage";

const schema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
  isRememberMe: zod.boolean(),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "",
  password: "",
  isRememberMe: false,
};

export function SignInForm(): React.JSX.Element {
  const t = useTranslations("signIn");
  const createHref = useHref();
  const [showPassword, setShowPassword] = useState<boolean>();
  const [isLoading, setIsLoading] = useState(false);

  const [login] = useLoginMutation();

  const { control, handleSubmit, setError, setValue } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!!localStorage.getItem(STORAGE_KEYS.IS_REMEMBER_ME)) {
      setValue("email", localStorage.getItem(STORAGE_KEYS.EMAIL) ?? "");
      // setValue("password", localStorage.getItem(STORAGE_KEYS.PASSWORD) ?? "");
      setValue("isRememberMe", true);
    }
  }, [setValue]);

  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      setIsLoading(true);
      const data = await login(values);

      if (data.error) {
        setIsLoading(false);
      }

      if (values.isRememberMe && values.email !== "") {
        localStorage.setItem(STORAGE_KEYS.EMAIL, values.email);
        // localStorage.setItem(STORAGE_KEYS.PASSWORD, values.password);
        localStorage.setItem(
          STORAGE_KEYS.IS_REMEMBER_ME,
          values.isRememberMe ? "1" : "",
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.EMAIL);
        // localStorage.removeItem(STORAGE_KEYS.PASSWORD);
        localStorage.removeItem(STORAGE_KEYS.IS_REMEMBER_ME);
      }

      if (isErrorResponse(data.error)) {
        const errorMes = data.error.data.message;
        switch (errorMes) {
          case "USER_NOT_FOUND":
            setError("email", {
              type: "validate",
              message: t("incorrect_email"),
            });
            break;
          case "USER_NOT_ACTIVE":
            setError("email", {
              type: "validate",
              message: t("user_not_active"),
            });
            break;
          case "INVALID_PASSWORD":
            setError("password", {
              type: "validate",
              message: t("incorrect_password"),
            });
            break;
        }
      }
    },
    [login, setError, t],
  );

  return (
    <Box
      sx={{
        maxWidth: "400px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box flex={1} alignContent="center" my={4}>
        <Typography
          variant="h1"
          sx={{
            fontSize: "28px",
            fontWeight: 600,
            mb: 4,
          }}
        >
          {t("main_title")}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <InputForm
              type="email"
              control={control}
              label={t("email")}
              name="email"
              startAdornment={
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    color="var(--mui-palette-text-disabled)"
                    style={{ width: "1rem", height: "1rem" }}
                  />
                </InputAdornment>
              }
              fullWidth
              required
              sx={{
                mb: "22px",
              }}
            />
            <InputForm
              type={showPassword ? "text" : "password"}
              control={control}
              label={t("password")}
              name="password"
              startAdornment={
                <InputAdornment position="start">
                  <FontAwesomeIcon
                    icon={faLockKeyhole}
                    color="var(--mui-palette-text-disabled)"
                    style={{ width: "1rem", height: "1rem" }}
                  />
                </InputAdornment>
              }
              fullWidth
              required
              endAdornment={
                <InputAdornment position="end">
                  <FaIconButton
                    icon={showPassword ? faEyeSlash : faEye}
                    iconSize={showPassword ? 20 : 18}
                    title={t(showPassword ? "hide_password" : "show_password")}
                    onClick={() => setShowPassword((prev) => !prev)}
                    iconProps={{
                      style: {
                        padding: showPassword ? 0 : 1,
                      },
                    }}
                    sx={{ p: 0.75 }}
                  />
                </InputAdornment>
              }
              sx={{
                mb: "4px",
              }}
            />
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Controller
                control={control}
                name="isRememberMe"
                render={({ field }) => (
                  <FormControlLabel
                    label={t("remember_me")}
                    componentsProps={{
                      typography: {
                        variant: "body2",
                        color: "text.secondary",
                      },
                    }}
                    control={<Checkbox {...field} checked={field.value} />}
                  />
                )}
              />
              <Link
                component={RouterLink}
                href={createHref(paths.auth.resetPassword)}
                variant="subtitle2"
              >
                {t("forgot_password")}
              </Link>
            </Box>

            <LoadingButton
              loading={isLoading}
              type="submit"
              size="large"
              variant="contained"
              fullWidth
            >
              {t("sign_in_btn")}
            </LoadingButton>
          </Box>
        </form>

        <Typography
          sx={{ pb: 4 }}
          mt={2}
          textAlign="center"
          color="text.secondary"
          variant="body2"
        >
          {t("do_not_have_acc")}{" "}
          <Link
            component={RouterLink}
            href={createHref(paths.auth.signUp)}
            variant="subtitle2"
          >
            {t("create_an_acc")}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
