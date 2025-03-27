"use client";
import { Box, LinearProgress, Link, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/services/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isErrorResponse } from "@/services/helpers";
import CompanyExpertise from "./CompanyExpertise";
import TypeOfClients from "./TypeOfClients";
import PrimarilyWorkIn from "./PrimarilyWorkIn";
import SignUp1 from "./SignUp1";
import { faArrowLeft, faArrowRight } from "@/lib/fas/pro-regular-svg-icons";
import { Account, defaultAccount, signUpZodResolver } from "./zod";
import SignUp2 from "./SignUp2";
import SignUp3 from "./SignUp3";
import SignUp4 from "./SignUp4";
import { enqueueSnackbar } from "notistack";
import { useCheckEmailExistMutation } from "@/services/user";
import ResendEmail from "./ResendEmail";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@mui/lab";

const VALIDATING_FIELDS_BY_STEP = [
  ["email", "password", "rePassword"],
  ["firstName", "social.linkedin"],
  ["organization.name", "organization.website"],
  [
    "organization.phone",
    "organization.address.addressLine1",
    "organization.address.countryId",
  ],
  ["organization.data.expertise.list", "organization.data.expertise.other"],
  ["organization.data.clientTypes.list", "organization.data.clientTypes.other"],
  ["data.primarilyWork.list", "data.primarilyWork.other"],
] as const;

const SignUp = () => {
  const t = useTranslations("signUp");
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [checkEmail, { isLoading: isCheckingEmail }] =
    useCheckEmailExistMutation();
  const [activeStep, setActiveStep] = React.useState(0);
  const createHref = useHref();
  const [isStepValid, setIsStepValid] = useState(true);

  const renderSteps = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SignUp1
            control={control}
            trigger={trigger}
            isStepValid={isStepValid}
          />
        );
      case 1:
        return <SignUp2 control={control} />;
      case 2:
        return <SignUp3 control={control} />;
      case 3:
        return <SignUp4 control={control} setValue={setValue} />;
      case 4:
        return <CompanyExpertise control={control} />;
      case 5:
        return <TypeOfClients control={control} />;
      case 6:
        return <PrimarilyWorkIn control={control} />;
      case 7:
        return <ResendEmail watch={watch} />;
    }
  };

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    trigger,
    watch,
    getValues,
  } = useForm<Account>({
    defaultValues: defaultAccount,
    resolver: signUpZodResolver,
  });

  useEffect(() => {
    if (isStepValid) return;
    const subscription = watch((_, { name, type }) => {
      if (name && type === "change") {
        if (name.endsWith(".other")) {
          trigger([name, (name.slice(0, -5) + "list") as any]);
        } else {
          trigger(name);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [isStepValid, trigger, watch]);

  const stepVisitedRef = useRef<boolean[]>(
    Array.from({ length: VALIDATING_FIELDS_BY_STEP.length }, () => false),
  );
  useEffect(() => {
    if (!stepVisitedRef.current[activeStep]) return;

    trigger(VALIDATING_FIELDS_BY_STEP[activeStep], {
      shouldFocus: true,
    });

    const subscription = watch((_, { name, type }) => {
      if (
        name &&
        VALIDATING_FIELDS_BY_STEP[activeStep].includes(name as never) &&
        type === "change"
      ) {
        trigger(name, { shouldFocus: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [activeStep, trigger, watch]);

  const handlePrev = () => {
    setActiveStep((preActiveStep) => preActiveStep - 1);
  };

  const handleNext = async () => {
    let isValid = await trigger(VALIDATING_FIELDS_BY_STEP[activeStep], {
      shouldFocus: true,
    });

    if (isValid && activeStep === 0) {
      const res = await checkEmail({ email: getValues("email") });
      if (res.data) {
        setError("email", { type: "validate", message: t("exist_acc") });
        isValid = false;
      }
    }

    if (isValid) {
      if (activeStep === 6) {
        handleSubmit(onSubmit)();
      } else {
        stepVisitedRef.current[activeStep] = true;
        setActiveStep((preActiveStep) => preActiveStep + 1);
      }
    }

    setIsStepValid(isValid);
  };

  const onSubmit = useCallback(
    async (values: Account): Promise<void> => {
      const res = await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        social: values.social,
        data: values.data,
        organization: values.organization,
      });
      if (res.error) {
        console.log("err", res);

        if (isErrorResponse(res.error)) {
          const errorMessage = res.error.data.message;
          if (errorMessage === "USER_ALREADY_EXISTS")
            setError("email", { type: "validate", message: t("exist_acc") });
          else if (errorMessage === "YOU_REQUESTED_PLEASE_CHECK_YOUR_EMAIL") {
            enqueueSnackbar(t("check_email"), {
              variant: "info",
            });
          }
        }
      } else {
        setActiveStep((preActiveStep) => preActiveStep + 1);
        // enqueueSnackbar(
        //   "Submitted registration request successfully, Please wait for admin approval",
        //   {
        //     variant: "success",
        //   }
        // );
      }
      // Refresh the auth state
      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      // router.back();
    },
    [register, setError, t],
  );
  return (
    <Box
      sx={{
        maxWidth: "520px",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
    >
      {activeStep !== 0 && activeStep !== 7 ? (
        <Box position="absolute" top={0} left={0} right={0} zIndex={1} pt={3}>
          <LinearProgress
            variant="determinate"
            value={(activeStep / 6) * 100}
            sx={{
              width: "70%",
              height: 10,
              mx: "auto",
              borderRadius: 5,
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
              },
            }}
          />
        </Box>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNext();
        }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box flex={1} alignContent="center" py={7}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              rowGap: "20px",
            }}
          >
            {renderSteps(activeStep)}
          </Box>
          <Box sx={{ mt: 2 }}>
            {activeStep < 7 && (
              <Box display="flex" gap={3}>
                {activeStep > 0 && (
                  <LoadingButton
                    disabled={isCheckingEmail || isRegistering}
                    startIcon={
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        style={{ width: "16px", height: "16px" }}
                      />
                    }
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handlePrev}
                  >
                    {t("back")}
                  </LoadingButton>
                )}

                <LoadingButton
                  // disabled={ isValid}
                  loading={isCheckingEmail || isRegistering}
                  endIcon={
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      style={{ width: "16px", height: "16px" }}
                    />
                  }
                  variant="contained"
                  fullWidth
                  size="large"
                  type="submit"
                >
                  {t(activeStep < 6 ? "continue" : "create_acc")}
                </LoadingButton>
              </Box>
            )}
          </Box>

          {activeStep === 0 && (
            <Typography
              textAlign="center"
              pb={4}
              mt={2}
              fontSize={"14px"}
              fontWeight={400}
              color="text.secondary"
            >
              {t("already_acc")}{" "}
              <Link
                component={RouterLink}
                href={createHref(paths.auth.signIn)}
                variant="subtitle2"
              >
                {t("sign_in")}
              </Link>
            </Typography>
          )}
        </Box>

        {activeStep === 6 && (
          <Typography
            pb={4}
            fontSize={"14px"}
            fontWeight={"400"}
            textAlign={"center"}
            color="var(--mui-palette-text-disabled)"
          >
            {t("term.1")}
            <br />
            <Link href="#" underline="hover">
              {t("term.2")}
            </Link>{" "}
            {t("term.3")}{" "}
            <Link href="#" underline="hover">
              {t("term.4")}
            </Link>
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default SignUp;
