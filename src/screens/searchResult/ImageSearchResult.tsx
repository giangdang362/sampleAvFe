"use client";

import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { useRef, useState } from "react";
import { useSearchInfiniteProductsByImagesQuery } from "@/services/search";
import { skipToken } from "@reduxjs/toolkit/query";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import { useAddProductToScheduleMutation } from "@/services/products";
import ProductItem from "@/components/admin/products/ProductItem";
import ItemDetailDialog from "./ItemDetailDialog";
import useDialog from "@/hooks/dialog";
import { pathFileStatic } from "@/config/api";
import ImageSearchCrop, {
  SearchCrop,
} from "@/components/common/ImageSearchCrop";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { useTranslations } from "next-intl";
import { parseAsAiSearchFilterType } from "@/constants/queryParams";
import { AI_SEARCH_FILTER_TYPE } from "@/constants/common";
import { useIsUser } from "@/services/helpers";
import DataStateOverlay from "@/components/common/DataStateOverflay";

const styleSelect = {
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

const ImageSearchResult = ({ imageId }: { imageId: string }) => {
  const t = useTranslations("common");
  const isAdmin = !useIsUser();

  const [openAddTo, setOpenAddTo] = useState(false);
  const useDialogResultItem = useDialog();
  const [addProductToSchedule] = useAddProductToScheduleMutation();
  const [curItemResult, setCurItemResult] = useState<API.ProductItem>();
  const [filterType, setFilterType] = useQueryParamState(
    "sortBy",
    parseAsAiSearchFilterType,
    "pattern",
  );

  const handleCloseAddTo = () => {
    setOpenAddTo(false);
  };
  const handleAddTo = async (scheduleId: string, sectionId: string) => {
    await addProductToSchedule({
      scheduleId,
      qd: {
        type: "library",
        productId: curItemResult?.id ?? "",
        sectionId,
        quantity: 0,
      },
    }).unwrap();
  };

  const [searchCrop, setSearchCrop] = useState<SearchCrop>();
  const prevSearchImageId = useRef<string>();
  const searchImageIdChanged = prevSearchImageId.current !== imageId;
  prevSearchImageId.current = imageId;
  if (searchImageIdChanged) {
    setSearchCrop(undefined);
  }
  const aiSearchParams =
    searchCrop && imageId && !searchImageIdChanged
      ? {
          key: imageId,
          width: searchCrop.width,
          height: searchCrop.height,
          top: searchCrop.y,
          left: searchCrop.x,
          searchByColor: filterType === "color",
        }
      : undefined;

  const { page, nextPage } = useInfiniteQueryPage(aiSearchParams);

  const { currentData, isFetching, isError } =
    useSearchInfiniteProductsByImagesQuery(
      aiSearchParams
        ? {
            ...aiSearchParams,
            page,
            limit: 40,
          }
        : skipToken,
    );
  const dataImageResults = currentData?.data;
  const hasNextPage = currentData?.hasNextPage ?? true;

  const sentryRef = useInfiniteSentry({
    loading: isFetching,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
  });

  const isMobileScreen = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("md"),
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "unset" },
        gap: "24px",
        py: "48px",
        width: "100%",
        maxWidth: "1440px",
        minHeight: "calc(100vh - 100px)",
        px: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          width: { xs: "100%", md: "31%" },
          maxWidth: "372px",
        }}
      >
        <Box>
          <ImageSearchCrop
            src={`${pathFileStatic}/${imageId}`}
            maxHeight="min(max(500px, 70vh), 70vw)"
            onChange={setSearchCrop}
          />
          <FormControl
            size="small"
            sx={{ maxWidth: "130px", width: "100%", mt: "24px" }}
          >
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("sortBy")}
            </InputLabel>
            <Select
              label={t("sortBy")}
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as (typeof AI_SEARCH_FILTER_TYPE)[number],
                )
              }
              size="small"
              sx={{ ...styleSelect }}
            >
              <MenuItem value={"pattern"}>{t("pattern")}</MenuItem>
              <MenuItem value={"color"}>{t("color")}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Divider
        orientation={isMobileScreen ? "horizontal" : "vertical"}
        flexItem
      />
      <Box
        sx={{
          width: { xs: "100%", md: "69%" },
        }}
      >
        <DataStateOverlay
          isError={isError}
          isEmpty={dataImageResults?.length === 0}
          wrapperProps={{ mt: 5 }}
        >
          {/* Grid Layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: { xs: "16px", xl: "24px" },
            }}
          >
            {dataImageResults?.map((item) => (
              <ProductItem
                key={item.id + item.images[0]?.id}
                dataItem={item}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  "& > button:first-of-type": {
                    width: "100%",
                  },
                  "& .product-img": {
                    width: "100%",
                    height: "unset",
                    aspectRatio: "1/1",
                  },
                }}
                onClick={() => {
                  setCurItemResult(item);
                  useDialogResultItem?.onClickOpen();
                }}
                additionalInfo={
                  isAdmin ? (item.score * 100).toFixed(5) + "%" : undefined
                }
              />
            ))}
          </Box>

          {(isFetching || hasNextPage) && !isError && (
            <CircularProgress
              ref={sentryRef}
              sx={{ display: "block", mx: "auto", mt: 4 }}
            />
          )}
        </DataStateOverlay>

        <ItemDetailDialog
          open={useDialogResultItem.open}
          onClose={useDialogResultItem.onClose}
          dataItem={curItemResult}
          setCurItemResult={setCurItemResult}
        />
        <ActionToProjectFileDialog
          type="schedule"
          action="add"
          open={openAddTo}
          onClose={handleCloseAddTo}
          onSectionSelected={handleAddTo}
        />
      </Box>
    </Box>
  );
};

export default ImageSearchResult;
