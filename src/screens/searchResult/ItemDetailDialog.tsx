import ProductItem from "@/components/admin/products/ProductItem";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import ImageDefault from "@/components/common/ImageDefault";
import SameSeriesFilter, {
  SeriesFilterProduct,
} from "@/components/common/SameSeriesFilter";
import { pathFile } from "@/config/api";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";
import { faXmark } from "@/lib/fas/pro-light-svg-icons";
import { faPlus } from "@/lib/fas/pro-regular-svg-icons";
import { paths } from "@/paths";
import { useAddProductToScheduleMutation } from "@/services/products";
import { useSearchInfiniteProductsBySeriesQuery } from "@/services/search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useRef, useState } from "react";

const styleLabel: SxProps<Theme> = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#00000099",
  mb: "4px",
};

const styleValue: SxProps<Theme> = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#000000DE",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  dataItem: API.ProductItem | undefined;
  setCurItemResult: Dispatch<SetStateAction<API.ProductItem | undefined>>;
}

const ItemDetailDialog = ({
  open,
  onClose,
  dataItem,
  setCurItemResult,
}: DialogProps) => {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState<SeriesFilterProduct>({});

  const prevDetail = useRef(dataItem?.id);
  const isDetailChanged = prevDetail.current !== dataItem?.id;
  prevDetail.current = dataItem?.id;

  if (isDetailChanged) {
    setFilter({});
  }

  const fullFilter = {
    series: dataItem?.series ?? "",
    model: dataItem?.model ?? "",
    excludeId: dataItem?.id,
    ...(isDetailChanged ? undefined : filter),
  };
  const { page, nextPage } = useInfiniteQueryPage(fullFilter);

  const skipBySeries = !(dataItem?.series && dataItem?.model);
  const { data, currentData, isFetching, isError } =
    useSearchInfiniteProductsBySeriesQuery(
      skipBySeries
        ? skipToken
        : {
            ...fullFilter,
            page,
            limit: 30,
          },
    );

  const hasNextPage = !isError && (data ? data.page < data.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isFetching,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
  });

  // Add To
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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          boxShadow: "4px 6px 10px 4px #00000014",
          minWidth: "888px",
          minHeight: "90vh",
          padding: "30px",
          overflow: "unset",
        },
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        },
      }}
    >
      <Tooltip title={tCommon("close")}>
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            color: "#A5A2AD",
            padding: "10px",
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            "&:hover": {
              color: "#242424",
            },
            borderRadius: "9999px",
            minWidth: "0px",
          }}
        >
          <FontAwesomeIcon
            icon={faXmark}
            style={{ fontSize: "18px", width: "18px", height: "18px" }}
          />
        </Button>
      </Tooltip>
      {/* #1 Product detail */}
      <Box>
        <Box
          sx={{
            display: "flex",
            gap: "14px",
          }}
        >
          {dataItem?.images?.[0]?.thumbnail?.length ? (
            <Box
              alt=""
              src={`${pathFile}/${dataItem?.images?.[0]?.thumbnail}`}
              component={"img"}
              sx={{
                width: "230px",
                aspectRatio: "1 / 1",
                borderRadius: "12px",
              }}
            />
          ) : (
            <ImageDefault
              fontSizeIcon="100px"
              sx={{
                width: "230px",
                height: "230px",
                borderRadius: "12px",
              }}
            />
          )}
          <Box
            sx={{
              width: "100%",
              maxWidth: "70%",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#00000099",
                textTransform: "uppercase",
              }}
            >
              {dataItem?.material?.length
                ? dataItem?.material
                : t("na_material")}
            </Typography>
            <Typography
              sx={{
                mt: "4px",
                fontSize: "16px",
                fontWeight: 500,
                color: "#000000DE",
                textTransform: "uppercase",
              }}
            >
              {`${dataItem?.series}-${dataItem?.model}`}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "12px",
                mt: "16px",
                mb: "28px",
              }}
            >
              <Tooltip title={tCommon("go_to_detail")}>
                <Button
                  variant="outlined"
                  href={`${paths.admin.detailProduct}/${dataItem?.id}`}
                >
                  {tCommon("learn_more")}
                </Button>
              </Tooltip>
              <Tooltip title={t("add_to")}>
                <Button
                  variant="contained"
                  sx={{ gap: "8px" }}
                  onClick={() => setOpenAddTo(true)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <Typography sx={{ fontSize: "14px" }}>
                    {t("add_to")}
                  </Typography>
                </Button>
              </Tooltip>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ ...styleLabel }}>{t("brand")}</Typography>
                <Typography sx={{ ...styleValue }}>
                  {dataItem?.brandName && dataItem?.brandName?.length > 0
                    ? dataItem?.brandName
                    : tCommon("n_a")}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ ...styleLabel }}>{t("color")}</Typography>
                <Typography sx={{ ...styleValue }}>
                  {dataItem?.color && dataItem?.color?.length > 0
                    ? dataItem?.color
                    : tCommon("n_a")}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ ...styleLabel }}>{t("size_mm")}</Typography>
                <Typography
                  sx={{ ...styleValue }}
                >{`${dataItem?.width && dataItem?.width > 0 ? dataItem?.width : "--"}x${dataItem?.length && dataItem?.length > 0 ? dataItem?.length : "--"}x${dataItem?.height && dataItem?.height > 0 ? dataItem?.height : "--"}`}</Typography>
              </Box>
              <Box>
                <Typography sx={{ ...styleLabel }}>{t("surface")}</Typography>
                <Typography sx={{ ...styleValue }}>
                  {dataItem?.surface && dataItem?.surface?.length > 0
                    ? dataItem?.surface
                    : tCommon("n_a")}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        {/* #2 Same series */}
        <Box
          sx={{
            mt: "28px",
            height: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#00000099",
              textTransform: "uppercase",
              mb: "6px",
            }}
          >
            {t("same_series")}
          </Typography>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: "20px",
              height: "100%",
              minHeight: "456px",
            }}
          >
            <Box
              sx={{
                maxWidth: "268px",
                width: "33%",
              }}
            >
              {(data?.seriesData.origin === undefined &&
                data?.seriesData.filtered === undefined) ||
              (data?.seriesData.origin.colors.length === 0 &&
                data?.seriesData.origin.sizeGroup.length === 0 &&
                data?.seriesData.origin.surfaces.length === 0 &&
                data?.seriesData.filtered.colors.length === 0 &&
                data?.seriesData.filtered.sizeGroup.length === 0 &&
                data?.seriesData.filtered.surfaces.length === 0) ? (
                <Box sx={{ textAlign: "center" }}>{tCommon("n_a")}</Box>
              ) : (
                <SameSeriesFilter
                  origin={data?.seriesData.origin}
                  filter={filter}
                  setFilter={setFilter}
                />
              )}
            </Box>
            <Divider orientation="vertical" flexItem />
            {currentData?.data.length ? (
              <Box
                sx={{
                  maxWidth: "520px",
                  maxHeight: "524px",
                  overflow: "auto",
                  width: "63%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "15px",
                }}
              >
                {currentData?.data?.map((item) => (
                  <ProductItem
                    key={item.id}
                    dataItem={item}
                    sx={{
                      "& .product-img": {
                        width: "100%",
                        height: "initial",
                        aspectRatio: "1/1",
                      },
                    }}
                    onClick={() => setCurItemResult(item)}
                    addTo={false}
                  />
                ))}
                {/* end list result */}
                {(isFetching || (!skipBySeries && hasNextPage)) && (
                  <CircularProgress
                    ref={sentryRef}
                    size={20}
                    sx={{ display: "block", mx: "auto", mt: 2 }}
                  />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  maxWidth: "520px",
                  width: "63%",
                  textAlign: "center",
                }}
              >
                {tCommon("n_a")}
              </Box>
            )}
          </Box>
        </Box>
        <ActionToProjectFileDialog
          type="schedule"
          action="add"
          open={openAddTo}
          onClose={handleCloseAddTo}
          onSectionSelected={handleAddTo}
        />
      </Box>
    </Dialog>
  );
};

export default ItemDetailDialog;
