import ImageDefault from "@/components/common/ImageDefault";
import { pathFile } from "@/config/api";
import { faPlus } from "@/lib/fas/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  ButtonBase,
  SxProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ActionToProjectFileDialog from "../projects/ActionToProjectFileDialog";
import { useAddProductToScheduleMutation } from "@/services/products";
import { useAvciRouter } from "@/hooks/avci-router";
import { paths } from "@/paths";

interface ProductItemProps {
  dataItem: API.SearchProduct;
  sx?: SxProps;
  onClick?: () => void;
  addTo?: boolean;
  linkToDetail?: boolean;
  additionalInfo?: string;
}

const ProductItem = ({
  dataItem,
  onClick,
  sx,
  addTo = true,
  linkToDetail = false,
  additionalInfo,
}: ProductItemProps) => {
  const router = useAvciRouter();
  const t = useTranslations("products");
  const [openAddTo, setOpenAddTo] = useState(false);
  const [addProductToSchedule] = useAddProductToScheduleMutation();

  const handleCloseAddTo = () => {
    setOpenAddTo(false);
  };
  const handleAddTo = async (scheduleId: string, sectionId: string) => {
    await addProductToSchedule({
      scheduleId,
      qd: {
        type: "library",
        productId: dataItem?.id ?? "",
        sectionId,
        quantity: 0,
      },
    }).unwrap();
  };

  return (
    <Box
      component={"div"}
      key={dataItem?.id}
      sx={{
        position: "relative",
        height: "fit-content",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          ".tool-tip-image": {
            opacity: 1,
          },
        },
        ...sx,
      }}
    >
      <ButtonBase
        sx={{ display: "block", textAlign: "unset", borderRadius: "12px" }}
        onClick={() => {
          onClick && onClick();
          if (linkToDetail) {
            router.push(`${paths.admin.detailProduct}/${dataItem.id}`);
          }
        }}
      >
        {dataItem?.images?.length ? (
          <Box
            className="product-img"
            component="img"
            sx={{
              display: "block",
              width: "180px",
              height: "180px",
              borderRadius: "12px",
              objectFit: "cover",
              objectPosition: "center",
            }}
            alt={`${dataItem?.series}-${dataItem?.model}-image`}
            src={`${pathFile}/${dataItem?.images?.[0]?.thumbnail}`}
          />
        ) : (
          <ImageDefault
            className="product-img"
            fontSizeIcon="100px"
            sx={{
              borderRadius: "12px",
              width: "180px",
              height: "180px",
            }}
          />
        )}
        <Box sx={{ padding: "4px 4px 4px 4px" }}>
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 400,
              color: "#00000099",
              textTransform: "uppercase",
            }}
          >
            {dataItem?.material?.length ? dataItem?.material : t("na_material")}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#000000DE",
              textTransform: "uppercase",
            }}
          >
            {`${dataItem?.series}-${dataItem?.model}`}
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
            {`${dataItem?.surface?.length ? dataItem?.surface : t("na_surface")}`}
          </Typography>

          {!!additionalInfo && (
            <Typography variant="caption" width="100%" textAlign="start">
              {additionalInfo}
            </Typography>
          )}
        </Box>
      </ButtonBase>
      {addTo && (
        <Tooltip title={t("add_to")}>
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
              setOpenAddTo(true);
            }}
          >
            <FontAwesomeIcon
              icon={faPlus}
              fontSize={"16px"}
              color="#00000099"
            />
          </Button>
        </Tooltip>
      )}
      <ActionToProjectFileDialog
        type="schedule"
        action="add"
        open={openAddTo}
        onClose={handleCloseAddTo}
        onSectionSelected={handleAddTo}
      />
    </Box>
  );
};

export default ProductItem;
