"use client";
import { useAvciRouter } from "@/hooks/avci-router";
import { useVerifyAccountMutation } from "@/services/auth";
import { CircularProgress, Link, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const EmailVerified = () => {
  const params = useSearchParams();
  const router = useAvciRouter();
  const [verify, { isSuccess, isError }] = useVerifyAccountMutation();

  useEffect(() => {
    const token = params.get("token");
    const id = params.get("id");

    if (!token || !id) {
      router.push("/");
      return;
    }

    verify({ token, id });
  }, [params, router, verify]);

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        window.location.assign(
          "https://docs.google.com/forms/d/e/1FAIpQLSfNyXtAdULNcrXnVpR43sfB35ISCJk-dtLSytLJXXJXSxjLhg/viewform",
        );
      }, 3000);
    }
  });

  return (
    <Stack spacing={2}>
      {isError ? (
        <Typography variant="h1" sx={{ fontSize: "28px", mt: 2 }}>
          Link Expired.
        </Typography>
      ) : isSuccess ? (
        <>
          <Image
            src="/avci_signup_icons/Party-Confetti.svg"
            width={80}
            height={80}
            alt=""
          />
          <Stack>
            <Typography
              variant="h1"
              sx={{ fontSize: "28px", fontWeight: 600, mt: 2 }}
            >
              Email Verified!
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "400", fontSize: "16px" }}
            >
              Thank you for verifying your email.
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "400", fontSize: "18px" }}
          >
            We are now processing your account verification. You will receive an
            email notification once your account is fully verified.
            <br />
            After 3 seconds, you will be redirected to the survey form.
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "400", fontSize: "14px", color: "GrayText" }}
          >
            If you have any questions, feel free to contact our support team via{" "}
            <Link href={`mailto:avci.support@mail.com`} underline="hover">
              avci.support@mail.com
            </Link>
          </Typography>
        </>
      ) : (
        <CircularProgress />
      )}
    </Stack>
  );
};

export default EmailVerified;
