import { PdDetailRow } from "@/components/admin/products/detailProduct/product-detail-row";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useCreateUpdateProductMutation } from "@/services/products";
import { useGetConstSlugQuery } from "@/services/slug";
import { Typography, Box } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useTranslations } from "next-intl";

export interface ProductSpecificationsSectionProps {
  dataDetailProduct?: API.ProductType;
  id: string;
}

const ProductSpecificationsSection = ({
  dataDetailProduct,
  id,
}: ProductSpecificationsSectionProps) => {
  const [updateProduct] = useCreateUpdateProductMutation();
  const t = useTranslations("products");
  const { data: productShadeVariation } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productShadeVariation,
  });
  const { data: productEdge } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productEdge,
  });
  const { data: productSlipResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSlipResistance,
  });
  const { data: productStainResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productStainResistance,
  });
  const { data: productChemicalResistance } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productChemicalResistance,
  });
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
        {t("product_specifications")}
      </Typography>

      <Grid2 container columns={16} rowSpacing={{ md: 4 }}>
        <Grid2 xs={4}>
          <Typography
            sx={{ color: "GrayText", marginRight: "" }}
            variant="body2"
          >
            {t("size")}
          </Typography>
        </Grid2>
        <Grid2 xs={12}>
          <Box
            sx={{
              flex: 1,
              mr: 10,
              border: "1px solid",
              padding: "12px",
              width: "270px",
              borderRadius: "6px",
              borderColor: "grey.300",
            }}
          >
            <PdDetailRow
              onChange={(e) => {
                updateProduct({
                  id: id,
                  width: parseFloat(e.target.value),
                });
              }}
              name={t("width")}
              data={dataDetailProduct?.width || ""}
              type="input"
              suffixValue="mm"
              maxLength={15}
              typeInput="number"
            />

            <PdDetailRow
              onChange={(e) => {
                updateProduct({
                  id: id,
                  length: parseFloat(e.target.value),
                });
              }}
              name={t("length")}
              data={dataDetailProduct?.length || ""}
              type="input"
              suffixValue="mm"
              typeInput="number"
              maxLength={15}
            />
            <PdDetailRow
              onChange={(e) => {
                updateProduct({
                  id: id,
                  height: parseFloat(e.target.value),
                });
              }}
              name={t("height")}
              data={dataDetailProduct?.height || ""}
              type="input"
              suffixValue="mm"
              typeInput="number"
              maxLength={15}
            />
            {/* <PdDetailRow
              onChange={(e) => {
                updateProduct({
                  id: id,
                  depth: parseInt(e.target.value),
                });
              }}
              name={t("depth")}
              data={dataDetailProduct?.depth || ""}
              type="input"
              suffixValue="mm"
              typeInput="number"
              maxLength={15}
            /> */}
          </Box>
        </Grid2>
      </Grid2>

      <PdDetailRow
        type="dropDow"
        dataDropDow={productShadeVariation?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            shadeVariation: e.target.value,
          });
        }}
        name={t("shade_variation")}
        data={dataDetailProduct?.shadeVariation || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productEdge?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            edge: e.target.value,
          });
        }}
        name={t("edge")}
        data={dataDetailProduct?.edge || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={[
          {
            id: 1,
            enName: "Yes",
            slug: "",
            zhoName: "",
            description: "",
            children: [],
          },
          {
            id: 2,
            enName: "No",
            slug: "",
            zhoName: "",
            description: "",
            children: [],
          },
        ]}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            evaSuitable: e.target.value === "Yes" ? "Yes" : "No",
          });
        }}
        name={t("eva_suitable_2")}
        data={dataDetailProduct?.evaSuitable === "Yes" ? "Yes" : "No"}
      />

      <PdDetailRow
        name={t("sri")}
        data={dataDetailProduct?.sri || ""}
        onChange={(e) => {
          updateProduct({
            id: id,
            sri: e.target.value,
          });
        }}
        type="input"
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productSlipResistance?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            slipResistance: e.target.value,
          });
        }}
        name={t("slip_resistance")}
        data={dataDetailProduct?.slipResistance || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productStainResistance?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            stainResistance: e.target.value,
          });
        }}
        name={t("stain_resistance")}
        data={dataDetailProduct?.stainResistance || ""}
      />

      <PdDetailRow
        type="dropDow"
        dataDropDow={productChemicalResistance?.children ?? []}
        onChangeDropDow={(e) => {
          updateProduct({
            id: id,
            chemicalResistance: e.target.value,
          });
        }}
        name={t("chemical_resistance")}
        data={dataDetailProduct?.chemicalResistance || ""}
      />

      <PdDetailRow
        onChange={(e) => {
          updateProduct({
            id: id,
            fireResistance: e.target.value,
          });
        }}
        type="input"
        name={t("fire_resistance")}
        data={dataDetailProduct?.fireResistance || ""}
      />
    </Box>
  );
};

export default ProductSpecificationsSection;
