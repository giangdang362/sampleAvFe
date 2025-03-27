import React from "react";
import { Box, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Control, Controller, FieldErrors } from "react-hook-form";

import InputForm from "@/components/common/form/InputForm";
import { ValuesSupplier } from "./FormNewSupplier";
import MuiPhoneNumber from "mui-phone-number";
import { useTranslations } from "next-intl";
export interface SupplierSGeneralSectionProps {
  control: Control<ValuesSupplier>;
  errors: FieldErrors<ValuesSupplier>;
}
export function SupplierSGeneralSection({
  control,
}: SupplierSGeneralSectionProps): React.JSX.Element {
  const t = useTranslations("suppliers");
  return (
    <>
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        General
      </Typography>
      <Box>
        <InputForm
          control={control}
          label={t("newSupplier.companyName")}
          name="companyName"
          fullWidth
          required
        />

        <Box sx={{ marginBottom: "28px" }} />
        <InputForm
          control={control}
          label={t("newSupplier.website")}
          name="website"
          fullWidth
        />

        <Box sx={{ marginBottom: "28px" }} />
        <Grid2
          container
          columns={16}
          columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
          rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        >
          <Grid2 xs={8}>
            <InputForm
              control={control}
              label={t("newSupplier.email")}
              name="address.email"
              fullWidth
              required
            />
          </Grid2>
          <Grid2 xs={8}>
            <Controller
              control={control}
              name="address.phone"
              render={({ field }) => {
                return (
                  <MuiPhoneNumber
                    label={t("newSupplier.phone")}
                    required
                    fullWidth
                    size="medium"
                    variant="outlined"
                    defaultCountry="hk"
                    {...field}
                  />
                );
              }}
            />
          </Grid2>
        </Grid2>
        <Box sx={{ marginBottom: "28px" }} />
      </Box>
    </>
  );
}
