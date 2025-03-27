import ImageDefault from "@/components/common/ImageDefault";
import { pathFile } from "@/config/api";
import { faPlus } from "@/lib/fas/pro-regular-svg-icons";
import { paths } from "@/paths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, ButtonBase, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { Dispatch, FC, memo, SetStateAction } from "react";

interface ProductViewGridProps {
  data: API.ProductItem[];
  setOpenAddTo: Dispatch<SetStateAction<boolean>>;
  setCurId: Dispatch<SetStateAction<string>>;
}

const ProductViewGrid: FC<ProductViewGridProps> = ({
  data,
  setOpenAddTo,
  setCurId,
}) => {
  const t = useTranslations("products");
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          xl: "repeat(auto-fill, 270px)",
        },
        rowGap: "38px",
        columnGap: { xs: "16px", xl: "24px" },
      }}
    >
      {data?.map((item) => (
        <Box
          key={item.id}
          sx={{
            position: "relative",
            "&:hover": {
              ".tool-tip-image": {
                opacity: 1,
              },
            },
          }}
        >
          <ButtonBase
            sx={{
              display: "block",
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: "12px",
            }}
            href={`${paths.admin.detailProduct}/${item.id}`}
          >
            {item.images?.length ? (
              <Box
                component="img"
                sx={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "270 / 204",
                  borderRadius: "12px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                alt={`${item.series}-${item.model}-image`}
                src={`${pathFile}/${item.images?.[0]?.thumbnail}`}
              />
            ) : (
              <ImageDefault
                fontSizeIcon="100px"
                sx={{
                  width: "100%",
                  height: "unset",
                  aspectRatio: "270 / 204",
                  borderRadius: "12px",
                }}
              />
            )}

            <Box sx={{ padding: "8px 4px 4px 4px" }}>
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: 400,
                  color: "#00000099",
                  textTransform: "uppercase",
                }}
              >
                {item.material?.length ? item.material : t("na_material")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#000000DE",
                  textTransform: "uppercase",
                }}
              >
                {item.series || (
                  <span style={{ fontStyle: "italic" }}>{t("na_series")}</span>
                )}
                {" - "}
                {item.model || (
                  <span style={{ fontStyle: "italic" }}>{t("na_model")}</span>
                )}
                {" - "}
                {item.width || "--"}x{item.length || "--"}x{item.height || "--"}
                {" - "}
                {item.surface || (
                  <span style={{ fontStyle: "italic" }}>{t("na_surface")}</span>
                )}
              </Typography>
              <Typography
                sx={{
                  mt: "4px",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#00000099",
                  textTransform: "uppercase",
                }}
              >
                {`${item.brandName?.length ? item.brandName : t("na_brand")} ${item.origin?.length ? `(${item.origin})` : ""}`}
              </Typography>
            </Box>
          </ButtonBase>
          <Button
            className="tool-tip-image"
            sx={{
              position: "absolute",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              top: "8px",
              right: "8px",
              width: "28px",
              minWidth: "0px",
              height: "28px",
              padding: "0px !important",
              borderRadius: "9999px",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#dddddd",
              },
              transition: "opacity 0.1s",
              opacity: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setCurId(item.id);
              setOpenAddTo(true);
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              fontSize={"16px"}
              color="#00000099"
            />
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default memo(ProductViewGrid);
