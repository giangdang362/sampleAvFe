"use client";
import { InputAdornment, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useAvciRouter } from "@/hooks/avci-router";
import { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForgotPasswordVerifiedMutation } from "@/services/auth";
import { enqueueSnackbar } from "notistack";
import { paths } from "@/paths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLockKeyhole } from "@/lib/fas/pro-light-svg-icons";
import { faEye, faEyeSlash } from "@/lib/fas/pro-solid-svg-icons";
import InputForm from "@/components/common/form/InputForm";
import FaIconButton from "@/components/common/FaIconButton";
import { LoadingButton } from "@mui/lab";

const schema = zod
  .object({
    password: zod
      .string()
      .min(8, { message: "Password must be more than 8 characters" })
      .max(32, { message: "Password must be less than 32 characters" })
      .regex(
        RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]*$",
        ),
        {
          message:
            "Password must contains at least 1 uppercase, 1 lowercase, 1 special character, 1 number",
        },
      ),
    rePassword: zod.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords don't match",
    path: ["rePassword"],
  });

type Values = zod.infer<typeof schema>;

const defaultValues = {
  password: "",
  rePassword: "",
} satisfies Values;

const CreateNewPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>();
  const [showRePassword, setReShowPassword] = useState<boolean>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useAvciRouter();
  const params = useSearchParams();
  const [createNewPassword] = useForgotPasswordVerifiedMutation();

  const { control, handleSubmit } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      setIsLoading(true);
      const res = await createNewPassword({
        token: params.get("otp") ?? "",
        email: params.get("email") ?? "",
        newPassword: values.password,
      });
      if (res.error) {
        setIsLoading(false);
        enqueueSnackbar("Something went wrong", { variant: "error" });
      } else {
        enqueueSnackbar("Reset password successfully", { variant: "success" });
        router.replace(paths.auth.signIn);
      }
    },
    [createNewPassword, params, router],
  );
  return (
    <Stack height={"100%"} width="100%" maxWidth="400px">
      <Stack flex={1} justifyContent={"center"} py={4}>
        <Typography
          variant="h1"
          sx={{ fontSize: "28px", fontWeight: 600, mb: 4 }}
        >
          Create a New Password!
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <InputForm
              type={showPassword ? "text" : "password"}
              control={control}
              label="Password"
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
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    iconProps={{ style: { padding: showPassword ? 0 : 1 } }}
                    sx={{ p: 0.75 }}
                  />
                </InputAdornment>
              }
              sx={{
                mb: 1,
              }}
            />

            <InputForm
              type={showRePassword ? "text" : "password"}
              control={control}
              label="Confirm Password"
              name="rePassword"
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
                    icon={showRePassword ? faEyeSlash : faEye}
                    iconSize={showRePassword ? 20 : 18}
                    title={showRePassword ? "Hide password" : "Show password"}
                    onClick={() => setReShowPassword((prev) => !prev)}
                    iconProps={{ style: { padding: showRePassword ? 0 : 1 } }}
                    sx={{ p: 0.75 }}
                  />
                </InputAdornment>
              }
              sx={{
                mb: 1,
              }}
            />

            <LoadingButton
              loading={isLoading}
              type="submit"
              size="large"
              variant="contained"
            >
              Submit
            </LoadingButton>
          </Stack>
        </form>
      </Stack>
    </Stack>
  );
};

export default CreateNewPassword;
