import React from "react";
import { Box, MenuItem, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Control, FieldErrors } from "react-hook-form";
import { ValuesProduct } from "./zod";
import SelectForm from "@/components/common/form/SelectForm";
import { useTranslations } from "next-intl";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import InputForm from "@/components/common/form/InputForm";

export interface ProductSpecificationsSectionProps {
  control: Control<ValuesProduct>;
  errors: FieldErrors<ValuesProduct>;
}
export function ProductSpecificationsSections({
  control,
}: ProductSpecificationsSectionProps): React.JSX.Element {
  const t = useTranslations("products");
  const { data: dataShadeVariation } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productShadeVariation,
  });
  const { data: dataEdge } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productEdge,
  });
  const { data: dataSlipResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSlipResistance,
  });
  const { data: dataStainResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productStainResistance,
  });
  const { data: dataChemicalResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productChemicalResistance,
  });
  return (
    <>
      <Box sx={{ m: 3 }} />
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        {t("product_specifications")}
      </Typography>
      <Stack gap="20px">
        <Grid2
          container
          columns={16}
          columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
          rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        >
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("shade_variation")}
                fullWidth
                name="shadeVariation"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataShadeVariation?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("edge")}
                fullWidth
                name="edge"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataEdge?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
          </Stack>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("eva_suitable")}
                fullWidth
                name="evaSuitable"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                <MenuItem value={"Yes"}>Yes</MenuItem>
                <MenuItem value={"No"}>No</MenuItem>
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("sri")}
                name="sri"
                fullWidth
              />
            </Box>
          </Stack>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("slip_resistance")}
                fullWidth
                name="slipResistance"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataSlipResistance?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("stain_resistance")}
                fullWidth
                name="stainResistance"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataStainResistance?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
          </Stack>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("chemical_resistance")}
                fullWidth
                name="chemicalResistance"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataChemicalResistance?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("fire_resistance")}
                name="fireResistance"
                fullWidth
              />
            </Box>
          </Stack>
        </Grid2>
      </Stack>
    </>
  );
}
