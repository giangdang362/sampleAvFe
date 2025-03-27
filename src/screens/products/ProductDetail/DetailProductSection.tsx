import { PdDetailRow } from "@/components/admin/products/detailProduct/product-detail-row";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useCreateUpdateProductMutation } from "@/services/products";
import { useGetConstSlugQuery } from "@/services/slug";
import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export interface DetailProductSectionProps {
  dataDetailProduct?: API.ProductType;
  id: string;
}

const DetailProductSection = ({
  dataDetailProduct,
  id,
}: DetailProductSectionProps) => {
  const [updateProduct] = useCreateUpdateProductMutation();
  const t = useTranslations("products");
  const { data: productMaterial } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productMaterial,
  });
  const { data: productBrand } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productBrand,
  });
  const { data: productOrigin } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productOrigin,
  });
  const { data: productSeries } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSeries,
  });
  const { data: productColor } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productColor,
  });
  const { data: productEffect } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productEffect,
  });
  const { data: productSurface } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSurface,
  });
  const { data: productApplicationArea1 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea1,
  });
  const { data: productApplicationArea2 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea2,
  });
  const { data: productLeadTime } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productLeadTime,
  });
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        {t("product_details")}
      </Typography>

      <PdDetailRow
        dataDropDow={productMaterial?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            material: e.target.value,
          });
        }}
        name={t("material")}
        data={dataDetailProduct?.material || ""}
        type="dropDow"
        isGroupView
      />

      <PdDetailRow
        dataDropDow={productBrand?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            brandName: e.target.value,
          });
        }}
        name={t("brand")}
        data={dataDetailProduct?.brandName || ""}
        type="dropDow"
      />

      <PdDetailRow
        dataDropDow={productOrigin?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            origin: e.target.value,
          });
        }}
        name={t("origin")}
        data={dataDetailProduct?.origin || ""}
        type="dropDow"
      />

      <PdDetailRow
        dataDropDow={productSeries?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            series: e.target.value,
          });
        }}
        name={t("series")}
        data={dataDetailProduct?.series || ""}
        type="dropDow"
      />

      <PdDetailRow
        type="input"
        onChange={(e) => {
          updateProduct({
            id: id,
            model: e.target.value,
          });
        }}
        name={t("model")}
        data={dataDetailProduct?.model || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productColor?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            color: e.target.value,
          });
        }}
        name={t("color")}
        data={dataDetailProduct?.color || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productEffect?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            effect: e.target.value,
          });
        }}
        name={t("effect")}
        data={dataDetailProduct?.effect || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productSurface?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            surface: e.target.value,
          });
        }}
        name={t("surface")}
        data={dataDetailProduct?.surface || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productLeadTime?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            leadTime: e.target.value,
          });
        }}
        name={t("lead_time.title")}
        data={dataDetailProduct?.leadTime || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productApplicationArea1?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            applicationArea1: e.target.value,
          });
        }}
        name={t("application_area_1")}
        data={dataDetailProduct?.applicationArea1 || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productApplicationArea2?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            applicationArea2: e.target.value,
          });
        }}
        name={t("application_area_2")}
        data={dataDetailProduct?.applicationArea2 || ""}
      />
    </Box>
  );
};

export default DetailProductSection;
