import { PdDetailRow } from "@/components/admin/products/detailProduct/product-detail-row";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useUpdateProductScheduleMutation } from "@/services/projectMaterialSchedule";
import { useGetConstSlugQuery } from "@/services/slug";
import { roleDataProduct } from "@/utils/common";
import { Typography, Box } from "@mui/material";
import { useTranslations } from "next-intl";

export interface ProductSpecificationsSectionProps {
  dataDetailProduct?: API.ProductType;
  id: string;
  scheduleId: string;
  readOnly: boolean;
}

const ProductSpecificationsSection = ({
  dataDetailProduct,
  id,
  scheduleId,
  readOnly,
}: ProductSpecificationsSectionProps) => {
  const [updateProduct] = useUpdateProductScheduleMutation();
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
    <>
      <Typography
        variant="subtitle1"
        sx={{ marginBottom: 1, marginTop: "28px" }}
      >
        {t("product_specifications")}
      </Typography>

      <PdDetailRow
        onChange={() => {}}
        name="Size"
        data={
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
              disabled={
                dataDetailProduct?.roleName !== roleDataProduct[3].value &&
                (readOnly || dataDetailProduct?.isAdminCreated)
              }
              onChange={(e) => {
                updateProduct({
                  scheduleId: scheduleId,
                  id: id,
                  width: parseFloat(e.target.value),
                });
              }}
              suffixValue="mm"
              name={t("width")}
              data={dataDetailProduct?.width || ""}
              type="input"
              typeInput="number"
            />

            <PdDetailRow
              disabled={
                dataDetailProduct?.roleName !== roleDataProduct[3].value &&
                (readOnly || dataDetailProduct?.isAdminCreated)
              }
              onChange={(e) => {
                updateProduct({
                  scheduleId: scheduleId,
                  id: id,
                  length: parseFloat(e.target.value),
                });
              }}
              suffixValue="mm"
              name={t("length")}
              data={dataDetailProduct?.length || ""}
              type="input"
              typeInput="number"
            />
            <PdDetailRow
              disabled={
                dataDetailProduct?.roleName !== roleDataProduct[3].value &&
                (readOnly || dataDetailProduct?.isAdminCreated)
              }
              onChange={(e) => {
                updateProduct({
                  scheduleId: scheduleId,
                  id: id,
                  height: parseFloat(e.target.value),
                });
              }}
              suffixValue="mm"
              name={t("height")}
              data={dataDetailProduct?.height || ""}
              type="input"
              typeInput="number"
            />
            {/* <PdDetailRow
              onChange={(e) => {
                updateProduct({
                  scheduleId: scheduleId,
                  id: id,
                  depth: parseInt(e.target.value),
                });
              }}
              suffixValue="mm"
              name={t("depth")}
              data={dataDetailProduct?.depth?.toString() || ""}
              type="input"
              typeInput="number"
            /> */}
          </Box>
        }
      />
      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productShadeVariation?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              shadeVariation: e.target.value,
            });
          }}
          name={t("shade_variation")}
          data={dataDetailProduct?.shadeVariation || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              shadeVariation: e.target.value,
            });
          }}
          name={t("shade_variation")}
          data={dataDetailProduct?.shadeVariation || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productEdge?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              edge: e.target.value,
            });
          }}
          name={t("edge")}
          data={dataDetailProduct?.edge || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              edge: e.target.value,
            });
          }}
          name={t("edge")}
          data={dataDetailProduct?.edge || ""}
        />
      )}

      <PdDetailRow
        disabled={
          dataDetailProduct?.roleName !== roleDataProduct[3].value &&
          (readOnly || dataDetailProduct?.isAdminCreated)
        }
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
            scheduleId: scheduleId,
            id: id,
            evaSuitable: e.target.value === "Yes" ? "Yes" : "No",
          });
        }}
        name={t("eva_suitable_2")}
        data={dataDetailProduct?.evaSuitable === "Yes" ? "Yes" : "No"}
      />

      <PdDetailRow
        disabled={
          dataDetailProduct?.roleName !== roleDataProduct[3].value &&
          (readOnly || dataDetailProduct?.isAdminCreated)
        }
        name={t("sri")}
        data={dataDetailProduct?.sri || ""}
        onChange={(e) => {
          updateProduct({
            scheduleId: scheduleId,
            id: id,
            sri: e.target.value,
          });
        }}
        type="input"
      />

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productSlipResistance?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              slipResistance: e.target.value,
            });
          }}
          name={t("slip_resistance")}
          data={dataDetailProduct?.slipResistance || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          name={t("slip_resistance")}
          data={dataDetailProduct?.slipResistance || ""}
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              slipResistance: e.target.value,
            });
          }}
          type="input"
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productStainResistance?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              stainResistance: e.target.value,
            });
          }}
          name={t("stain_resistance")}
          data={dataDetailProduct?.stainResistance || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          name={t("stain_resistance")}
          data={dataDetailProduct?.stainResistance || ""}
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              stainResistance: e.target.value,
            });
          }}
          type="input"
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productChemicalResistance?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              chemicalResistance: e.target.value,
            });
          }}
          name={t("chemical_resistance")}
          data={dataDetailProduct?.chemicalResistance || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          name={t("chemical_resistance")}
          data={dataDetailProduct?.chemicalResistance || ""}
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              chemicalResistance: e.target.value,
            });
          }}
          type="input"
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              fireResistance: e.target.value,
            });
          }}
          type="input"
          name={t("fire_resistance")}
          data={dataDetailProduct?.fireResistance || ""}
        />
      ) : (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          name={t("fire_resistance")}
          data={dataDetailProduct?.fireResistance || ""}
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              fireResistance: e.target.value,
            });
          }}
          type="input"
        />
      )}
    </>
  );
};

export default ProductSpecificationsSection;
