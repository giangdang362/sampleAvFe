import { Link, Stack, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import { UseFormWatch } from "react-hook-form";
import { Account } from "./zod";
import { useResendEmailMutation } from "@/services/auth";
import { enqueueSnackbar } from "notistack";

interface ResendEmailProps {
  watch: UseFormWatch<Account>;
}

const ResendEmail = ({ watch }: ResendEmailProps) => {
  const [resendEmail] = useResendEmailMutation();
  const email = watch("email");

  const handleResend = () => {
    resendEmail({ email })
      .unwrap()
      .then(() => {
        enqueueSnackbar("Success", { variant: "success" });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <Stack>
      <Image
        src="/avci_signup_icons/Ai-Email-Generator-Spark.svg"
        width={80}
        height={80}
        alt=""
      />
      <Typography
        variant="h1"
        sx={{ fontSize: "28px", fontWeight: 600, mt: 2, mb: 1 }}
      >
        Check your email
      </Typography>
      <Typography>We’ve sent an email to</Typography>
      <Typography fontWeight={"600"} mb={1}>
        {email}
      </Typography>
      <Typography mb={2}>It contains a link to verify your account.</Typography>

      <Link
        component="button"
        onClick={handleResend}
        sx={{ fontSize: "14px", fontWeight: "600", width: "fit-content" }}
      >
        Resend email
      </Link>
    </Stack>
  );
};

export default ResendEmail;
