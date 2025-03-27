"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import ButtonPrimary from "@/components/common/button-primary";
import ButtonSecondary from "@/components/common/button-secondary";

import { MobileNav } from "./mobile-nav";
import { Button, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import { LoadingButton } from "@mui/lab";
interface FooterMainProps {
  children?: React.ReactNode;
  show?: boolean;
  formId?: string;
  type?: "step" | "normal" | "custom";
  isActiveNextStep2?: boolean;
  onNext?: () => void;
  onBack?: () => void;
  cusView?: React.ReactNode;
  isLoading?: boolean;
  setStep?: any;
  step?: number;
}

const FooterMain: React.FC<FooterMainProps> = ({
  show = true,
  formId,
  type = "normal",
  isActiveNextStep2,
  onNext,
  onBack,
  cusView,
  isLoading,
  setStep,
  step,
}): React.JSX.Element => {
  const t = useTranslations("common");
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      {type === "custom" ? (
        <React.Fragment>
          <Box
            component="footer"
            sx={{
              borderTop: "1px solid var(--mui-palette-divider)",
              backgroundColor: "var(--mui-palette-background-paper)",
              position: "sticky",
              bottom: 0,
              zIndex: "var(--mui-zIndex-appBar)",
              padding: "12px 24px",
              height: "60px",
              width: "100%",
            }}
          >
            {cusView}
          </Box>
          <MobileNav
            onClose={() => {
              setOpenNav(false);
            }}
            open={openNav}
          />
        </React.Fragment>
      ) : (
        <>
          {show && (
            <React.Fragment>
              {type === "normal" ? (
                <React.Fragment>
                  <Box
                    component="footer"
                    sx={{
                      borderTop: "1px solid var(--mui-palette-divider)",
                      backgroundColor: "var(--mui-palette-background-paper)",
                      position: "sticky",
                      bottom: 0,
                      zIndex: "var(--mui-zIndex-appBar)",
                      padding: "12px 24px",
                      height: "60px",
                      width: "100%",
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Stack direction={"row"} gap={"12px"}>
                        <ButtonPrimary
                          label={t("save")}
                          type="submit"
                          form={formId}
                        />
                        <ButtonSecondary title={t("add_to")} />
                      </Stack>
                    </Stack>
                  </Box>
                  <MobileNav
                    onClose={() => {
                      setOpenNav(false);
                    }}
                    open={openNav}
                  />
                </React.Fragment>
              ) : (
                <Box
                  component="footer"
                  sx={{
                    borderTop: "1px solid var(--mui-palette-divider)",
                    backgroundColor: "var(--mui-palette-background-paper)",
                    position: "sticky",
                    bottom: 0,
                    zIndex: "var(--mui-zIndex-appBar)",
                    padding: "12px 24px",
                    height: "70px",
                    width: "100%",
                  }}
                >
                  <Stack
                    direction={"row"}
                    gap={"12px"}
                    justifyContent={"space-between"}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {" "}
                        {step === 1
                          ? t("title_step_1")
                          : t("title_step_2")}{" "}
                      </Typography>
                      <Typography sx={{ fontSize: "16px" }}>
                        {" "}
                        {step === 1
                          ? t("subtitle_step_1")
                          : t("subtitle_step_2")}{" "}
                      </Typography>
                    </Box>
                    <Box>
                      {step === 1 ? (
                        <Button
                          variant="contained"
                          disabled={!isActiveNextStep2}
                          onClick={() => {
                            onNext && onNext();
                            setStep(2);
                          }}
                        >
                          {t("next")}
                        </Button>
                      ) : (
                        <Stack direction={"row"} gap={"12px"}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setStep(1);
                              onBack && onBack();
                            }}
                          >
                            {t("back")}
                          </Button>
                          <LoadingButton
                            type="submit"
                            form={formId}
                            loading={isLoading}
                            variant="contained"
                          >
                            {t("save")}
                          </LoadingButton>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Box>
              )}
            </React.Fragment>
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default FooterMain;
