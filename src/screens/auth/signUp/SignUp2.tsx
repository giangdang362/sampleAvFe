import { Box, InputAdornment, Typography } from "@mui/material";
import React from "react";
import { Account } from "./zod";
import { Control } from "react-hook-form";
import InputForm from "@/components/common/form/InputForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faUser } from "@/lib/fas/pro-light-svg-icons";
import { useTranslations } from "next-intl";

interface ProfileProps {
  control: Control<Account>;
}

const SignUp2 = ({ control }: ProfileProps) => {
  const t = useTranslations("signUp.signUp2");
  return (
    <Box sx={{ maxWidth: "520px" }}>
      <Typography sx={{ fontSize: "16px", fontWeight: "600", mb: "12px" }}>
        {t("main_title")}
      </Typography>
      <InputForm
        control={control}
        label={t("your_name")}
        name="firstName"
        startAdornment={
          <InputAdornment position="start">
            <FontAwesomeIcon
              icon={faUser}
              color="var(--mui-palette-text-disabled)"
              style={{ width: "1rem", height: "1rem" }}
            />
          </InputAdornment>
        }
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
        sx={{
          mb: "16px",
        }}
      />
      <InputForm
        control={control}
        label={t("your_link")}
        name="social.linkedin"
        startAdornment={
          <InputAdornment position="start">
            <FontAwesomeIcon
              icon={faLink}
              color="var(--mui-palette-text-disabled)"
              style={{ width: "1rem", height: "1rem" }}
            />
          </InputAdornment>
        }
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
      />
    </Box>
  );
};

export default SignUp2;
