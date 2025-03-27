import { PdDetailRow } from "@/components/admin/products/detailProduct/product-detail-row";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useUpdateProductScheduleMutation } from "@/services/projectMaterialSchedule";
import { useGetConstSlugQuery } from "@/services/slug";
import { roleDataProduct } from "@/utils/common";
import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export interface DetailProductSectionProps {
  dataDetailProduct?: API.ProductType;
  id: string;
  scheduleId: string;
  readOnly: boolean;
}

const DetailProductSection = ({
  dataDetailProduct,
  id,
  scheduleId,
  readOnly,
}: DetailProductSectionProps) => {
  const [updateProduct] = useUpdateProductScheduleMutation();
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
  // const { data: productModel } = useGetConstSlugQuery({
  //   slug: PRODUCT_OPTION_SLUGS.productModel,
  // });
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
    <>
      <Typography
        variant="subtitle1"
        sx={{ marginBottom: 1, marginTop: "28px" }}
      >
        {t("product_details")}
      </Typography>

      <PdDetailRow
        disabled={readOnly}
        type="input"
        onChange={(e) => {
          updateProduct({
            scheduleId: scheduleId,
            id: id,
            docCode: e.target.value,
          });
        }}
        name={t("doc_code")}
        data={dataDetailProduct?.docCode || ""}
      />

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          dataDropDow={productMaterial?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              material: e.target.value,
            });
          }}
          name={t("material")}
          data={dataDetailProduct?.material || ""}
          type="dropDow"
          isGroupView
        />
      ) : (
        <PdDetailRow
          disabled={readOnly || dataDetailProduct?.isAdminCreated}
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              material: e.target.value,
            });
          }}
          name={t("material")}
          data={dataDetailProduct?.material || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          dataDropDow={productBrand?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              brandName: e.target.value,
            });
          }}
          name={t("brand")}
          data={dataDetailProduct?.brandName || ""}
          type="dropDow"
        />
      ) : (
        <PdDetailRow
          disabled={readOnly || dataDetailProduct?.isAdminCreated}
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              brandName: e.target.value,
            });
          }}
          name={t("brand")}
          data={dataDetailProduct?.brandName || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          dataDropDow={productOrigin?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              origin: e.target.value,
            });
          }}
          name={t("origin")}
          data={dataDetailProduct?.origin || ""}
          type="dropDow"
        />
      ) : (
        <PdDetailRow
          disabled={readOnly || dataDetailProduct?.isAdminCreated}
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              origin: e.target.value,
            });
          }}
          name={t("origin")}
          data={dataDetailProduct?.origin || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          dataDropDow={productSeries?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              series: e.target.value,
            });
          }}
          name={t("series")}
          data={dataDetailProduct?.series || ""}
          type="dropDow"
        />
      ) : (
        <PdDetailRow
          disabled={readOnly || dataDetailProduct?.isAdminCreated}
          type="input"
          onChange={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              series: e.target.value,
            });
          }}
          name={t("series")}
          data={dataDetailProduct?.series || ""}
        />
      )}

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
            model: e.target.value,
          });
        }}
        name={t("model")}
        data={dataDetailProduct?.model || ""}
      />

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productColor?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              color: e.target.value,
            });
          }}
          name={t("color")}
          data={dataDetailProduct?.color || ""}
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
              color: e.target.value,
            });
          }}
          name={t("color")}
          data={dataDetailProduct?.color || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productEffect?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              effect: e.target.value,
            });
          }}
          name={t("effect")}
          data={dataDetailProduct?.effect || ""}
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
              effect: e.target.value,
            });
          }}
          name={t("effect")}
          data={dataDetailProduct?.effect || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productSurface?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              surface: e.target.value,
            });
          }}
          name={t("surface")}
          data={dataDetailProduct?.surface || ""}
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
              surface: e.target.value,
            });
          }}
          name={t("surface")}
          data={dataDetailProduct?.surface || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productLeadTime?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              leadTime: e.target.value,
            });
          }}
          name={t("lead_time.title")}
          data={dataDetailProduct?.leadTime || ""}
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
              leadTime: e.target.value,
            });
          }}
          name={t("lead_time.title")}
          data={dataDetailProduct?.leadTime || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productApplicationArea1?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              applicationArea1: e.target.value,
            });
          }}
          name={t("application_area_1")}
          data={dataDetailProduct?.applicationArea1 || ""}
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
              applicationArea1: e.target.value,
            });
          }}
          name={t("application_area_1")}
          data={dataDetailProduct?.applicationArea1 || ""}
        />
      )}

      {dataDetailProduct?.roleName === roleDataProduct[3].value ? (
        <PdDetailRow
          disabled={
            dataDetailProduct?.roleName !== roleDataProduct[3].value &&
            (readOnly || dataDetailProduct?.isAdminCreated)
          }
          type="dropDow"
          dataDropDow={productApplicationArea2?.children ?? []}
          onChangeDropDow={(e) => {
            updateProduct({
              scheduleId: scheduleId,
              id: id,
              applicationArea2: e.target.value,
            });
          }}
          name={t("application_area_2")}
          data={dataDetailProduct?.applicationArea2 || ""}
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
              applicationArea2: e.target.value,
            });
          }}
          name={t("application_area_2")}
          data={dataDetailProduct?.applicationArea2 || ""}
        />
      )}
    </>
  );
};

export default DetailProductSection;
