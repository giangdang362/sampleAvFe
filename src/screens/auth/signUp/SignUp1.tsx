import { Box, InputAdornment, Typography } from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import { Control, UseFormTrigger } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Account } from "./zod";
import { useTranslations } from "next-intl";
import InputForm from "@/components/common/form/InputForm";
import { faEnvelope } from "@/lib/fas/pro-light-svg-icons";
import FaIconButton from "@/components/common/FaIconButton";
import { faEye, faEyeSlash } from "@/lib/fas/pro-solid-svg-icons";

interface SignUpProps {
  control: Control<Account>;
  trigger: UseFormTrigger<Account>;
  isStepValid: boolean;
}

const SignUp1 = ({ control, trigger, isStepValid }: SignUpProps) => {
  const t = useTranslations("signUp.signUp1");
  const [showPassword, setShowPassword] = useState<boolean>();
  const [showRePassword, setReShowPassword] = useState<boolean>();
  return (
    <Box sx={{ maxWidth: "520px" }}>
      <Box>
        <Image
          src="/avci_signup_icons/Indoor-Plant-14.svg"
          width={80}
          height={80}
          alt="Indoor-Plant-14.svg"
          style={{ marginRight: "15px" }}
        />
        <Typography
          variant="h1"
          sx={{ fontSize: "28px", fontWeight: 600, mt: "8px", mb: "4px" }}
        >
          {t("main_title")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontSize: "14px", color: "GrayText", mb: "28px" }}
          fontWeight="400"
        >
          {t("main_desc")}
        </Typography>
      </Box>
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
        textFieldProps={{ hideAsteriskWhenShrink: true }}
      />
      <Typography
        variant="subtitle2"
        sx={{ fontSize: "12px", color: "GrayText", mt: 1, mb: 3 }}
        fontWeight="400"
      >
        {t("email_desc")}
      </Typography>

      <InputForm
        type={showPassword ? "text" : "password"}
        control={control}
        label={t("password")}
        name="password"
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
        onChange={() => {
          if (!isStepValid && control.getFieldState("password").isTouched) {
            trigger("rePassword");
          }
        }}
        endAdornment={
          <InputAdornment position="end">
            <FaIconButton
              icon={showPassword ? faEyeSlash : faEye}
              iconSize={showPassword ? 20 : 18}
              title={t(showPassword ? "hide_password" : "show_password")}
              onClick={() => setShowPassword((prev) => !prev)}
              iconProps={{ style: { padding: showPassword ? 0 : 1 } }}
              sx={{ p: 0.75 }}
            />
          </InputAdornment>
        }
        sx={{
          mb: 2,
        }}
      />

      <InputForm
        type={showRePassword ? "text" : "password"}
        control={control}
        label={t("confirm_password")}
        name="rePassword"
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
        endAdornment={
          <InputAdornment position="end">
            <FaIconButton
              icon={showRePassword ? faEyeSlash : faEye}
              iconSize={showRePassword ? 20 : 18}
              title={t(showRePassword ? "hide_password" : "show_password")}
              onClick={() => setReShowPassword((prev) => !prev)}
              iconProps={{ style: { padding: showRePassword ? 0 : 1 } }}
              sx={{ p: 0.75 }}
            />
          </InputAdornment>
        }
      />
    </Box>
  );
};

export default SignUp1;
