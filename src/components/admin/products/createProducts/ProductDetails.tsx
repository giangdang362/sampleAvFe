import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Control, Controller, FieldErrors } from "react-hook-form";

import InputForm from "@/components/common/form/InputForm";
import SelectForm from "@/components/common/form/SelectForm";

import { ValuesProduct } from "./zod";
import { useTranslations } from "next-intl";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";

export interface ProductDetailsSectionProps {
  control: Control<ValuesProduct>;
  errors: FieldErrors<ValuesProduct>;
}
export function ProductDetailsSection({
  control,
  errors,
}: ProductDetailsSectionProps): React.JSX.Element {
  const t = useTranslations("products");

  const { data: dataMaterial } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productMaterial,
  });

  const { data: dataBrand } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productBrand,
  });

  const { data: dataOrigin } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productOrigin,
  });

  const { data: dataSeries } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSeries,
  });

  const { data: dataColor } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productColor,
  });

  const { data: dataEffect } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productEffect,
  });

  const { data: dataSurface } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSurface,
  });

  const { data: dataLeadTime } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productLeadTime,
  });

  const { data: dataApplicationArea1 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea1,
  });

  const { data: dataApplicationArea2 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea2,
  });

  return (
    <>
      <Box sx={{ m: 3 }} />
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        {t("product_details")}
      </Typography>
      <Stack gap="20px">
        <Grid2
          container
          columns={16}
          columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
          rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        >
          <Grid2 xs={16}>
            <Controller
              control={control}
              name="material"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel htmlFor="grouped-native-select">
                    {t("material")}
                  </InputLabel>
                  <Select
                    native
                    defaultValue=""
                    id="grouped-native-select"
                    label="Grouping"
                    fullWidth
                    {...field}
                  >
                    <option aria-label="None" value="" />
                    {dataMaterial &&
                      dataMaterial?.children?.map((e, index) =>
                        e.children.length <= 0 ? (
                          <optgroup label={e.enName} key={index}>
                            <option value={e.enName} key={e?.id}>
                              {e.enName}
                            </option>
                          </optgroup>
                        ) : (
                          <>
                            <optgroup label={e.enName}>
                              {e.children?.map((data) => (
                                <option value={data.enName} key={e?.id}>
                                  {data.enName}
                                </option>
                              ))}
                            </optgroup>
                          </>
                        ),
                      )}
                  </Select>
                </FormControl>
              )}
            />
          </Grid2>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("brand")}
              name="brandName"
              defaultValue=""
              fullWidth
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataBrand?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>

          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("origin")}
              name="origin"
              defaultValue=""
              fullWidth
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataOrigin?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("series")}
                fullWidth
                name="series"
                defaultValue=""
                required
                error={Boolean(errors.series)}
              >
                {dataSeries?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("model")}
                name="model"
                fullWidth
                required
              />
            </Box>
          </Stack>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("colour")}
              name="color"
              defaultValue=""
              fullWidth
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataColor?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("effect")}
                fullWidth
                name="effect"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataEffect?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
            <Box width={"50%"}>
              <SelectForm
                control={control}
                label={t("surface_finish")}
                fullWidth
                name="surface"
                defaultValue=""
              >
                <MenuItem value={""}>{`---`}</MenuItem>
                {dataSurface?.children?.map((item) => (
                  <MenuItem key={item.id} value={item.enName}>
                    {item.enName}
                  </MenuItem>
                ))}
              </SelectForm>
            </Box>
          </Stack>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("anti_bacterial")}
              fullWidth
              name="antiBacterial"
              defaultValue=""
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              <MenuItem value={"true"}>Yes</MenuItem>
              <MenuItem value={"false"}>No</MenuItem>
            </SelectForm>
          </Grid2>
          {/* Size */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 1, color: "#9E9E9E", px: "10px" }}
          >
            {t("size")}
          </Typography>
          <Stack flexDirection={"row"} gap={"20px"} p={"10px"} width={"100%"}>
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("width_mm")}
                name="width"
                fullWidth
                inputMode="decimal"
              />
            </Box>
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("length_mm")}
                name="length"
                fullWidth
                inputMode="decimal"
              />
            </Box>
          </Stack>
          <Stack
            flexDirection={"row"}
            gap={"20px"}
            p={"10px"}
            width={"100%"}
            mb={"10px"}
          >
            <Box width={"50%"}>
              <InputForm
                control={control}
                label={t("height_thickness")}
                name="height"
                fullWidth
                inputMode="decimal"
              />
            </Box>
            <Box width={"50%"}>
              {/* <InputForm
                control={control}
                label={t("depth_mm")}
                name="depth"
                fullWidth
                inputMode="decimal"
              /> */}
            </Box>
          </Stack>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("lead_time.title")}
              name="leadTime"
              defaultValue=""
              fullWidth
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataLeadTime?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("application_area_1")}
              name="applicationArea1"
              defaultValue=""
              fullWidth
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataApplicationArea1?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
          <Grid2 xs={16}>
            <SelectForm
              control={control}
              label={t("application_area_2")}
              name="applicationArea2"
              defaultValue=""
              fullWidth
            >
              {dataApplicationArea2?.children?.map((item) => (
                <MenuItem key={item.id} value={item.enName}>
                  {item.enName}
                </MenuItem>
              ))}
            </SelectForm>
          </Grid2>
        </Grid2>
      </Stack>
    </>
  );
}
