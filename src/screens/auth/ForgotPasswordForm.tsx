"use client";
import { useAvciRouter } from "@/hooks/avci-router";
import { useHref } from "@/hooks/href";
import { zodResolver } from "@hookform/resolvers/zod";
import RouterLink from "next/link";
import { InputAdornment, Link, Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z as zod } from "zod";
import { paths } from "@/paths";
import { useForgotPasswordMutation } from "@/services/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@/lib/fas/pro-light-svg-icons";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { faPaperPlane } from "@/lib/fas/pro-duotone-svg-icons";
import InputForm from "@/components/common/form/InputForm";
import { LoadingButton } from "@mui/lab";
import { isErrorResponse } from "@/services/helpers";

const schema = zod.object({
  email: zod.string().email(),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  email: "",
} satisfies Values;

const ForgotPasswordForm = () => {
  const router = useAvciRouter();
  const { openDialog } = useConfirmDialog();
  const createHref = useHref();
  const [isLoading, setIsLoading] = useState(false);

  const [forgotPassword] = useForgotPasswordMutation();
  const { control, handleSubmit, setError } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      setIsLoading(true);
      const res = await forgotPassword(values);
      if (res.error) {
        setIsLoading(false);
        if (isErrorResponse(res.error)) {
          const errorMes = res.error.data.message;
          switch (errorMes) {
            case "USER_NOT_FOUND":
              setError("email", {
                type: "validate",
                message: "User not found",
              });
              break;
          }
        }
      } else {
        router.back();
        openDialog({
          type: "info",
          content: `Click on the link we sent to ${values.email} to finish your account setup.`,
          title: "Check your email",
          icon: faPaperPlane,
        });
      }
    },
    [forgotPassword, setError, router, openDialog],
  );
  return (
    <Stack height={"100%"} width="100%" maxWidth="400px">
      <Stack flex={1} justifyContent={"center"} my={4}>
        <Typography
          variant="h1"
          sx={{ fontSize: "28px", fontWeight: 600, mb: 4 }}
        >
          Forgot your password
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <InputForm
              type="email"
              control={control}
              label="Email"
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
                mb: 1,
              }}
            />

            <LoadingButton
              loading={isLoading}
              type="submit"
              size="large"
              variant="contained"
            >
              Reset password
            </LoadingButton>
          </Stack>
        </form>

        <Typography color="text.secondary" variant="body2" mt={1}>
          Or{" "}
          <Link
            component={RouterLink}
            href={createHref(paths.auth.signIn)}
            variant="subtitle2"
          >
            Sign in
          </Link>
        </Typography>

        <Typography
          color="text.secondary"
          variant="body2"
          textAlign="center"
          mt={3}
        >
          Don&apos;t have an account?{" "}
          <Link
            component={RouterLink}
            href={createHref(paths.auth.signUp)}
            variant="subtitle2"
          >
            Create an Account
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ForgotPasswordForm;
