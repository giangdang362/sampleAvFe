import InputForm from "@/components/common/form/InputForm";
import {
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Typography,
} from "@mui/material";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { Account } from "./zod";
import SelectForm from "@/components/common/form/SelectForm";
import { useGetCountriesQuery } from "@/services/projects";
import MuiPhoneNumber from "mui-phone-number";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface CompanyProps {
  control: Control<Account>;
  setValue: UseFormSetValue<Account>;
}

const SignUp4 = ({ control, setValue }: CompanyProps) => {
  const t = useTranslations("signUp.signUp4");
  const { data: countries, isFetching } = useGetCountriesQuery({
    slug: "country",
  });

  useEffect(() => {
    if (
      !control.getFieldState("organization.address.countryId").isDirty &&
      countries?.children
    ) {
      const id = countries.children.find(
        (country) => country.slug === "ct_HK",
      )?.id;
      if (id !== undefined) {
        setValue("organization.address.countryId", id);
      }
    }
  }, [control, countries?.children, setValue]);

  return (
    <Box
      className="giangdn"
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: "20px",
        width: "100%",
      }}
    >
      <Typography sx={{ fontSize: "16px", fontWeight: "600" }}>
        {t("main_title")}
      </Typography>

      <Controller
        control={control}
        name="organization.phone"
        render={({ field: { ref, ...field }, fieldState: { error } }) => {
          return (
            <MuiPhoneNumber
              label={t("phone")}
              required
              fullWidth
              size="medium"
              variant="outlined"
              defaultCountry="hk"
              helperText={error?.message}
              error={!!error?.message}
              {...field}
              inputRef={ref}
            />
          );
        }}
      />

      <InputForm
        control={control}
        label={t("company_address")}
        name="organization.address.addressLine1"
        fullWidth
        required
        textFieldProps={{ hideAsteriskWhenShrink: true }}
      />

      <SelectForm
        control={control}
        label={t("country")}
        name="organization.address.countryId"
        fullWidth
        required
        selectProps={
          isFetching
            ? {
                disabled: true,
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 3 }}>
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }
            : undefined
        }
      >
        <MenuItem disabled value="">
          <em>{t("country")}</em>
        </MenuItem>
        {countries?.children?.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.enName}
          </MenuItem>
        ))}
      </SelectForm>
    </Box>
  );
};

export default SignUp4;
