import React from "react";
import { Box, MenuItem, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Control, FieldErrors } from "react-hook-form";

import InputForm from "@/components/common/form/InputForm";
import { ValuesSupplier } from "./FormNewSupplier";
import ErrorFormMes from "@/components/common/error-form-mes";
import SelectForm from "@/components/common/form/SelectForm";
import { useGetCountriesQuery } from "@/services/projects";
import { useTranslations } from "next-intl";

export interface SupplierProjectAddressSectionProps {
  control: Control<ValuesSupplier>;
  errors: FieldErrors<ValuesSupplier>;
}
export function SupplierProjectAddressSection({
  control,
  errors,
}: SupplierProjectAddressSectionProps): React.JSX.Element {
  const { data: countries } = useGetCountriesQuery({ slug: "country" });
  const t = useTranslations("suppliers");
  return (
    <>
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        {t("newSupplier.address")}
      </Typography>
      <Grid2
        container
        columns={16}
        columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
      >
        <Grid2 xs={16}>
          <Box>
            <Box>
              <InputForm
                control={control}
                label={t("newSupplier.address")}
                name="address.addressLine1"
                fullWidth
                required
              />
            </Box>
            <Box sx={{ marginBottom: "28px" }} />
            <Grid2
              container
              columns={15}
              columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
              rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
            >
              <Grid2 xs={5}>
                <InputForm
                  control={control}
                  label={t("newSupplier.city")}
                  name="address.city"
                  fullWidth
                  required
                />
              </Grid2>
              <Grid2 xs={5}>
                <SelectForm
                  control={control}
                  error={Boolean(
                    errors.address?.countryId &&
                      errors.address?.countryId.message,
                  )}
                  label={t("newSupplier.country")}
                  name="address.countryId"
                  defaultValue=""
                  fullWidth
                  required
                >
                  {countries?.children?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.enName}
                    </MenuItem>
                  ))}
                </SelectForm>
                {errors.address?.countryId ? (
                  <ErrorFormMes mes={errors.address?.countryId.message ?? ""} />
                ) : null}
              </Grid2>
              <Grid2 xs={5}>
                <InputForm
                  control={control}
                  label={t("newSupplier.postcode")}
                  name="address.postcode"
                  fullWidth
                />
              </Grid2>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
    </>
  );
}
