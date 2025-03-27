import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { faChevronDown } from "@/lib/fas/pro-light-svg-icons";
import { useGetConstSlugQuery } from "@/services/slug";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Typography,
  CircularProgress,
  BoxProps,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

export type FilterType =
  | "brand"
  | "material"
  | "color"
  | "application"
  | "effect"
  | "origin";

export interface FilterPanelProps extends BoxProps {
  topOffset?: number;
  opened?: boolean;
  filter?: { [key in FilterType]: string[] };
  onFilterChange?: (type: FilterType, name: string, checked: boolean) => void;
}

export default function FilterPanel({
  topOffset = 0,
  opened,
  filter,
  onFilterChange,
  ...rest
}: FilterPanelProps): React.JSX.Element {
  const t = useTranslations("products");
  const locale = useLocale();

  const firstOpenedRef = React.useRef(false);
  firstOpenedRef.current = opened || firstOpenedRef.current;

  const { data: dataBrand } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productBrand },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataMaterial } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productMaterial },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataColor } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productColor },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataApplicationArea1 } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productApplicationArea1 },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataApplicationArea2 } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productApplicationArea2 },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataEffect } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productEffect },
    { skip: !firstOpenedRef.current },
  );
  const { data: dataOrigin } = useGetConstSlugQuery(
    { slug: PRODUCT_OPTION_SLUGS.productOrigin },
    { skip: !firstOpenedRef.current },
  );

  const filterData: { type: FilterType; data: API.SlugItem[] | undefined }[] = [
    { type: "brand" as FilterType, data: dataBrand?.children },
    { type: "material" as FilterType, data: dataMaterial?.children },
    { type: "color" as FilterType, data: dataColor?.children },
    {
      type: "application" as FilterType,
      data:
        dataApplicationArea1 && dataApplicationArea2
          ? [...dataApplicationArea1.children, ...dataApplicationArea2.children]
          : undefined,
    },
    { type: "effect" as FilterType, data: dataEffect?.children },
    { type: "origin" as FilterType, data: dataOrigin?.children },
  ].map((item) => ({
    ...item,
    data: item.data?.flatMap((dataItem) =>
      dataItem.children.length ? dataItem.children : [dataItem],
    ),
  }));

  return (
    <Box
      component="aside"
      position="fixed"
      height="100%"
      top={0}
      left="calc(var(--ToolsPanel--TabBar-width) + var(--ToolsPanel--ImagePanel-width))"
      pt={`${topOffset}px`}
      zIndex="var(--ToolsPanel--SubPanel-zIndex)"
      {...rest}
      sx={[
        {
          transition: "transform 0.3s",
          transform: `translateX(${opened ? 0 : -100}%)`,
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
      <Box
        width="clamp(80px, 25vw, 280px)"
        height="100%"
        bgcolor="var(--mui-palette-background-default)"
        position="relative"
        sx={{
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
            opacity: opened ? 1 : 0,
            transition: "opacity 0.3s",
            boxShadow: "3px 0px 10px 0px #0000001A",
          },
        }}
      >
        <Box
          height="100%"
          py={2}
          sx={{ overflowY: "auto", scrollbarGutter: "stable" }}
        >
          {filterData.every(({ data }) => !!data) ? (
            filterData?.map(({ type, data }) => (
              <Accordion
                key={type}
                sx={{
                  m: "0 !important",
                  boxShadow: "none",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  sx={{
                    px: 2,
                    py: 1,
                    minHeight: "auto !important",
                    justifyContent: "flex-start",
                    gap: 0.5,
                    "& .MuiAccordionSummary-content": {
                      m: "0 !important",
                      flexGrow: 0,
                    },
                  }}
                  expandIcon={
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      style={{ width: "12px", height: "12px" }}
                    />
                  }
                >
                  <Typography
                    fontSize="12px"
                    lineHeight="normal"
                    fontWeight="500"
                    color="var(--mui-palette-text-secondary)"
                    textTransform="uppercase"
                  >
                    {t(type)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, py: 0 }}>
                  <FormControl component="fieldset" variant="standard">
                    {data?.map(({ id, enName, zhoName }) => (
                      <FormControlLabel
                        key={id}
                        control={
                          <Checkbox
                            checked={!!filter?.[type].find((v) => v === enName)}
                            onChange={(e) =>
                              onFilterChange?.(type, enName, e.target.checked)
                            }
                            name={enName}
                            sx={{ p: 0.5, mx: 0.5 }}
                          />
                        }
                        label={locale.startsWith("zh") ? zhoName : enName}
                        sx={{
                          "& .MuiFormControlLabel-label": {
                            fontSize: "12px",
                            lineHeight: "normal",
                          },
                        }}
                      />
                    ))}
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
