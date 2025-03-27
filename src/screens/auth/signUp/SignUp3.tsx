import { Box, Typography } from "@mui/material";
import { Control } from "react-hook-form";
import { Account } from "./zod";
import InputForm from "@/components/common/form/InputForm";
import { useTranslations } from "next-intl";

interface CompanyProps {
  control: Control<Account>;
}

const SignUp3 = ({ control }: CompanyProps) => {
  const t = useTranslations("signUp.signUp3");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: "20px",
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ mb: "4px" }}>
          {t("main_title")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontSize: "14px", color: "GrayText" }}
        >
          {t("main_desc")}
        </Typography>
      </Box>
      <InputForm
        control={control}
        label={t("company_name")}
        name="organization.name"
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
      />
      <InputForm
        control={control}
        label={t("company_link")}
        name="organization.website"
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
      />
      <Typography
        variant="subtitle2"
        sx={{ fontSize: "12px", color: "GrayText" }}
      >
        {t("link_desc")}
      </Typography>
    </Box>
  );
};

export default SignUp3;
