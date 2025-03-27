"use client";

import { useAddProductToScheduleMutation } from "@/services/products";
import { Box, TablePagination, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import ProductFilter from "../products/components/ProductFilter";
import { useDebounce } from "use-debounce";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { usePage } from "@/hooks/usePage";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPageSize } from "@/constants/queryParams";
import { parseAsString } from "nuqs";
import { useState } from "react";
import { useAppSelector } from "@/store";
import { searchParam } from "@/store/product";
import ItemDetailDialog from "./ItemDetailDialog";
import useDialog from "@/hooks/dialog";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import ProductItem from "@/components/admin/products/ProductItem";
import { useSearchProductsQuery } from "@/services/search";
import DataStateOverlay from "@/components/common/DataStateOverflay";

const SearchResult = () => {
  const t = useTranslations("common");
  const searchTerm = useAppSelector(searchParam);
  const [openAddTo, setOpenAddTo] = useState(false);
  const useDialogResultItem = useDialog();
  const [addProductToSchedule] = useAddProductToScheduleMutation();
  const [curItemResult, setCurItemResult] = useState<API.ProductItem>();

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

  const [pageSize, setPageSize] = useQueryParamState(
    "pageSize",
    parseAsPageSize,
    25,
  );

  const [brandFilter, setBrandFilter] = useQueryParamState(
    "brandName",
    parseAsString,
    "",
  );
  const [materialFilter, setMaterialFilter] = useQueryParamState(
    "material",
    parseAsString,
    "",
  );
  const [colorFilter, setColorFilter] = useQueryParamState(
    "color",
    parseAsString,
    "",
  );
  const [application1Filter, setApplication1Filter] = useQueryParamState(
    "applicationArea1",
    parseAsString,
    "",
  );
  const [application2Filter, setApplication2Filter] = useQueryParamState(
    "applicationArea2",
    parseAsString,
    "",
  );
  const [effectFilter, setEffectFilter] = useQueryParamState(
    "effect",
    parseAsString,
    "",
  );
  const [originFilter, setOriginFilter] = useQueryParamState(
    "origin",
    parseAsString,
    "",
  );

  const [surfaceFilter, setSurfaceFilter] = useQueryParamState(
    "surface",
    parseAsString,
    "",
  );

  const [debouncedParams] = useDebounce(
    {
      s: searchTerm,
      brand: [brandFilter],
      material: [materialFilter],
      color: [colorFilter],
      application: [application1Filter, application2Filter],
      effect: [effectFilter],
      origin: [originFilter],
      surface: [surfaceFilter],
    },
    700,
    { equalityFn: jsonStringifyEqualityCheck },
  );
  const [page, setPage] = usePage(debouncedParams);

  const {
    data: dataSearchResult,
    isFetching,
    isError,
  } = useSearchProductsQuery(
    {
      page: page,
      limit: pageSize,
      ...debouncedParams,
    },
    {
      skip: debouncedParams.s === undefined,
    },
  );

  return (
    <Box
      sx={{
        py: "48px",
        px: 3,
        width: "100%",
        maxWidth: "1440px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", gap: "4px", minWidth: "100px" }}>
          <Typography
            sx={{
              color: "#212121",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            {`${dataSearchResult?.total ?? 0}`}
          </Typography>
          <Typography
            sx={{
              color: "#9e9e9e",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            {dataSearchResult && dataSearchResult?.total > 1
              ? t("results")
              : t("result")}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "-webkit-fill-available",
            flex: "flex-end",
            "& .filter-wrap": {
              justifyContent: "right",
            },
          }}
        >
          <ProductFilter
            isAiSearchView={true}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            materialFilter={materialFilter}
            setMaterialFilter={setMaterialFilter}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            application1Filter={application1Filter}
            setApplication1Filter={setApplication1Filter}
            application2Filter={application2Filter}
            setApplication2Filter={setApplication2Filter}
            effectFilter={effectFilter}
            setEffectFilter={setEffectFilter}
            originFilter={originFilter}
            setOriginFilter={setOriginFilter}
            surfaceFilter={surfaceFilter}
            setSurfaceFilter={setSurfaceFilter}
          />
        </Box>
      </Box>
      <DataStateOverlay
        isError={isError}
        isFetching={isFetching}
        isEmpty={dataSearchResult?.data.length === 0}
        wrapperProps={{ height: "300px" }}
      >
        {/* Grid Layout */}
        <Box
          sx={{
            mt: "24px",
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: { xs: "16px", xl: "24px" },
          }}
        >
          {dataSearchResult?.data?.map((item) => (
            <ProductItem
              key={item.id}
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
            />
          ))}
        </Box>
      </DataStateOverlay>

      <TablePagination
        component="div"
        count={dataSearchResult?.total ?? -1}
        page={page - 1}
        onPageChange={(_e, newPage) => {
          setPage(newPage + 1);
        }}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10) as any);
          setPage(1);
        }}
      />
      <ActionToProjectFileDialog
        type="schedule"
        action="add"
        open={openAddTo}
        onClose={handleCloseAddTo}
        onSectionSelected={handleAddTo}
      />
      <ItemDetailDialog
        open={useDialogResultItem.open}
        onClose={useDialogResultItem.onClose}
        dataItem={curItemResult}
        setCurItemResult={setCurItemResult}
      />
    </Box>
  );
};

export default SearchResult;
