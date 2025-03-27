"use client";

import AttributeManageTable from "@/components/admin/products/productAttributeManager/AttributeManageTable";
import HeaderMain from "@/components/layout/header";
import { useHashState } from "@/hooks/useHashState";
import { Box, List, ListItem, ListItemButton } from "@mui/material";
import { useTranslations } from "next-intl";
import Link from "next/link";

const ATTRIBUTES = [
  {
    slug: "product_material",
    labelKey: "material",
    hash: "material",
    twoLevel: true,
  },
  { slug: "product_brand", labelKey: "brand", hash: "brand" },
  { slug: "product_origin", labelKey: "origin", hash: "origin" },
  { slug: "product_series", labelKey: "series", hash: "series" },
  { slug: "product_color", labelKey: "color", hash: "color" },
  { slug: "product_effect", labelKey: "effect", hash: "effect" },
  { slug: "product_surface", labelKey: "surface_finish", hash: "surface" },
  {
    slug: "product_lead_time",
    labelKey: "lead_time.title",
    hash: "lead_time",
  },
  {
    slug: ["product_application_area1", "product_application_area2"],
    labelKey: "application_area_1_2",
    titleKey: ["application_area_1", "application_area_2"],
    hash: "application_area_1_&_2",
  },
  {
    slug: "product_shade_variation",
    labelKey: "shade_variation",
    hash: "shade_variation",
  },
  { slug: "product_edge", labelKey: "edge", hash: "edge" },
  {
    slug: "product_slip_resistance",
    labelKey: "slip_resistance",
    hash: "slip_resistance",
  },
  {
    slug: "product_stain_resistance",
    labelKey: "stain_resistance",
    hash: "stain_resistance",
  },
  {
    slug: "product_chemical_resistance",
    labelKey: "chemical_resistance",
    hash: "chemical_resistance",
  },
] as const;

const ProductAttributeManager = () => {
  const t = useTranslations("products");
  const attrHash = useHashState(
    ATTRIBUTES.map((attr) => attr.hash),
    ATTRIBUTES[0].hash,
  );
  const selectedAttr = ATTRIBUTES.find((attr) => attr.hash === attrHash)!;

  return (
    <>
      <HeaderMain title={t("productAttributeManager")} useExternalPaddingTop />
      <Box display="flex" alignItems="flex-start">
        <List
          sx={{
            flex: 0.16,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            pb: 3,
            mr: "8%",
          }}
        >
          {ATTRIBUTES.map((attr) => {
            const { labelKey, slug } = attr;
            const active = slug === selectedAttr.slug;

            return (
              <ListItem
                key={typeof slug === "string" ? slug : slug[0] + slug[1]}
                disablePadding
                dense
              >
                <ListItemButton
                  component={Link}
                  href={`#${attr.hash}`}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontSize: "14px",
                    color: `rgba(var(--mui-palette-primary-mainChannel) / ${active ? 1 : 0.6})`,
                    fontWeight: active ? "500" : "400",
                    bgcolor: active
                      ? "var(--mui-palette-action-selected)"
                      : undefined,
                  }}
                >
                  {t(labelKey)}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box flex={1} display="flex" alignItems="flex-start">
          {typeof selectedAttr.slug === "string" ? (
            <AttributeManageTable
              slug={selectedAttr.slug}
              title={t(selectedAttr.labelKey)}
              twoLevel={"twoLevel" in selectedAttr && selectedAttr.twoLevel}
              sx={{ flex: 1, mr: "25%" }}
            />
          ) : (
            <>
              <AttributeManageTable
                slug={selectedAttr.slug[0]}
                title={t(selectedAttr.titleKey[0])}
                sx={{ flex: 1, mr: 2 }}
              />
              <AttributeManageTable
                slug={selectedAttr.slug[1]}
                title={t(selectedAttr.titleKey[1])}
                sx={{ flex: 1, mr: "5%" }}
              />
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ProductAttributeManager;
