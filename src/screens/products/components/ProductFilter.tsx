import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  NoSsr,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { useGetConstSlugQuery } from "@/services/slug";
import { PRODUCT_OPTION_SLUGS } from "@/constants/common";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@/lib/fas/pro-regular-svg-icons";
import ButtonPrimary from "@/components/common/button-primary";
import { useGetDownloadTokenMutation } from "@/services/tokenDownload";
import { openDownloadFile } from "@/utils/openFile";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useIsUser } from "@/services/helpers";
import { usePathname } from "@/i18n";
import { paths } from "@/paths";

export const styleSelect = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "100px",
  },
  fontSize: "13px",
  "& fieldset": {
    borderColor: "#000",
  },
  "& svg": {
    color: "#000",
  },
};
export interface ProductFilterProps {
  queryBuilder?: RequestQueryBuilder;
  isAiSearchView?: boolean;
  valueSearch?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  brandFilter: string;
  setBrandFilter: Dispatch<SetStateAction<string | null>>;
  materialFilter: string;
  setMaterialFilter: Dispatch<SetStateAction<string | null>>;
  colorFilter: string;
  setColorFilter: Dispatch<SetStateAction<string | null>>;
  application1Filter: string;
  setApplication1Filter: Dispatch<SetStateAction<string | null>>;
  application2Filter: string;
  setApplication2Filter: Dispatch<SetStateAction<string | null>>;
  effectFilter: string;
  setEffectFilter: Dispatch<SetStateAction<string | null>>;
  originFilter: string;
  setOriginFilter: Dispatch<SetStateAction<string | null>>;
  surfaceFilter: string;
  setSurfaceFilter: Dispatch<SetStateAction<string | null>>;
}

const ProductFilter = ({
  queryBuilder,
  isAiSearchView = false,
  valueSearch,
  onChange,
  brandFilter,
  setBrandFilter,
  materialFilter,
  setMaterialFilter,
  colorFilter,
  setColorFilter,
  application1Filter,
  setApplication1Filter,
  application2Filter,
  setApplication2Filter,
  effectFilter,
  setEffectFilter,
  originFilter,
  setOriginFilter,
  surfaceFilter,
  setSurfaceFilter,
}: ProductFilterProps) => {
  const isUser = useIsUser();
  const pathUrl = usePathname();
  const showExportBtn = !isUser && pathUrl !== paths.searchResult;
  const t = useTranslations("products");
  const [getDownloadToken] = useGetDownloadTokenMutation();

  const { data: dataBrand } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productBrand,
  });

  const { data: dataMaterial } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productMaterial,
  });

  const { data: dataColor } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productColor,
  });

  const { data: dataApplicationArea1 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea1,
  });

  const { data: dataApplicationArea2 } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productApplicationArea2,
  });

  const { data: dataEffect } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productEffect,
  });

  const { data: dataOrigin } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productOrigin,
  });

  const { data: dataSurface } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productSurface,
  });

  const dataApplicationArea = dataApplicationArea1?.children?.concat(
    dataApplicationArea2?.children || [],
  );

  return (
    <NoSsr>
      <Stack
        className="filter-wrap"
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "12px",
          minHeight: "40px",
          alignItems: "center",
        }}
      >
        {!isAiSearchView && (
          <OutlinedInput
            placeholder={t("search")}
            type="search"
            value={valueSearch}
            onChange={onChange}
            endAdornment={
              <InputAdornment position="end">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  style={{ fontSize: "16px" }}
                />
              </InputAdornment>
            }
            sx={{
              width: "300px",
              height: "40px",
              borderRadius: "4px",
              marginRight: 2,
            }}
          />
        )}
        <FormControl
          key={!!dataBrand + "dataBrand"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("brand")}
          </InputLabel>
          <Select
            value={brandFilter}
            label={t("brand")}
            onChange={(e) => {
              setBrandFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataBrand?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          key={!!dataMaterial + "dataMaterial"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("material")}
          </InputLabel>
          <Select
            value={materialFilter}
            onChange={(e) => {
              setMaterialFilter(e.target.value);
            }}
            id="grouped-select"
            label={t("material")}
            sx={{ ...styleSelect }}
          >
            <MenuItem value="">{`---`}</MenuItem>
            {dataMaterial &&
              dataMaterial?.children?.flatMap((item) =>
                item.children.length <= 0
                  ? [
                      <MenuItem value={item.enName} key={item.id}>
                        {item.enName}
                      </MenuItem>,
                    ]
                  : item.children?.map((data) => (
                      <MenuItem value={data.enName} key={item.id + data.id}>
                        {data.enName}
                      </MenuItem>
                    )),
              )}
          </Select>
        </FormControl>
        <FormControl
          key={!!dataColor + "dataColor"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("color")}
          </InputLabel>
          <Select
            value={colorFilter}
            label={t("color")}
            onChange={(e) => {
              setColorFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataColor?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          key={
            !!dataApplicationArea1 +
            "dataApplicationArea" +
            !!dataApplicationArea2
          }
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("application")}
          </InputLabel>
          <Select
            value={application1Filter || application2Filter}
            label={t("application")}
            onChange={(e) => {
              const appArea2 = dataApplicationArea2?.children.find(
                (appArea) => appArea.enName === e.target.value,
              );
              if (appArea2) {
                setApplication1Filter("");
                setApplication2Filter(e.target.value);
              } else {
                setApplication1Filter(e.target.value);
                setApplication2Filter("");
              }
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataApplicationArea?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          key={!!dataEffect + "dataEffect"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("effect")}
          </InputLabel>
          <Select
            value={effectFilter}
            label={t("effect")}
            onChange={(e) => {
              setEffectFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataEffect?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          key={!!dataOrigin + "dataOrigin"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("origin")}
          </InputLabel>
          <Select
            value={originFilter}
            label={t("origin")}
            onChange={(e) => {
              setOriginFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataOrigin?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          key={!!dataSurface + "dataSurface"}
          size="small"
          sx={{ maxWidth: "110px", width: "100%" }}
        >
          <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
            {t("surface")}
          </InputLabel>
          <Select
            value={surfaceFilter}
            label={t("surface")}
            onChange={(e) => {
              setSurfaceFilter(e.target.value);
            }}
            sx={{ ...styleSelect }}
          >
            <MenuItem value={""}>{`---`}</MenuItem>
            {dataSurface?.children?.map((item) => (
              <MenuItem key={item.id} value={item.enName}>
                {item.enName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Export Button */}
        {showExportBtn && (
          <ButtonPrimary
            sx={{
              ml: "auto",
            }}
            label={t("export")}
            onClick={() => {
              getDownloadToken()
                .unwrap()
                .then((e: any) => {
                  openDownloadFile(
                    `products/export/excel?${queryBuilder?.query()}`,
                    {
                      token_download: e.token,
                    },
                  );
                });
            }}
          />
        )}
      </Stack>
    </NoSsr>
  );
};

export default ProductFilter;
