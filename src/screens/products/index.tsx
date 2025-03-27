"use client";

import ButtonPrimary from "@/components/common/button-primary";
import HeaderMain from "@/components/layout/header";
import { useHref } from "@/hooks/href";
import { paths } from "@/paths";
import { Box, CircularProgress, NoSsr, Stack } from "@mui/material";
import RouterLink from "next/link";
import DataTable from "./DataTable";
import {
  useAddProductToScheduleMutation,
  useDeleteProductMutation,
  useGetInfiniteProductsUserQuery,
  useGetProductsQuery,
} from "@/services/products";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DialogConfirmProject } from "../projects/components/DialogConfirmProject";
import ProductFilter from "./components/ProductFilter";
import { faPlus } from "@/lib/fas/pro-regular-svg-icons";
import { useIsUser } from "@/services/helpers";
import ProductViewGrid from "./ProductViewGrid";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPageSize } from "@/constants/queryParams";
import { parseAsString } from "nuqs";
import { useGetMyAccountQuery } from "@/services/user";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { PRODUCT_TYPES } from "@/constants/common";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import ImportDialog from "./import/ImportDialog";
import Link from "next/link";
import { useInfiniteQueryPage } from "@/hooks/infinite-scroll/useInfiniteQueryPage";
import { useInfiniteSentry } from "@/hooks/infinite-scroll/useInfiniteSentry";
import { usePage } from "@/hooks/usePage";
import { GridPaginationModel } from "@mui/x-data-grid";
import DataStateOverlay from "@/components/common/DataStateOverflay";

const ProductList = () => {
  const [showImport, setShowImport] = useState(false);
  const isUser = useIsUser();
  const { data: me } = useGetMyAccountQuery();
  const t = useTranslations("products");
  const createHref = useHref();
  const [pageSize, setPageSize] = useQueryParamState(
    "pageSize",
    parseAsPageSize,
    isUser ? 25 : 100,
  );
  const [searchTerm, setSearchTerm] = useQueryParamState(
    "search",
    parseAsString,
    "",
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

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };

  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [
        { model: { $cont: searchTerm } },
        // { "supplier.name": { $cont: searchTerm } },
        // { "author.firstName": { $cont: searchTerm } },
        { series: { $cont: searchTerm } },
        { brandName: { $cont: searchTerm } },
        { material: { $cont: searchTerm } },
        { color: { $cont: searchTerm } },
        { applicationArea1: { $cont: searchTerm } },
        { applicationArea2: { $cont: searchTerm } },
        { effect: { $cont: searchTerm } },
        { origin: { $cont: searchTerm } },
        { "productTags.tag.name": { $cont: searchTerm } },
        { surface: { $cont: searchTerm } },
      ],
    };
  }

  const lastFilter: any = {};
  if (brandFilter) {
    lastFilter.brandName = {
      $eq: brandFilter,
    };
  }
  if (materialFilter) {
    lastFilter.material = {
      $eq: materialFilter,
    };
  }
  if (colorFilter) {
    lastFilter.color = {
      $eq: colorFilter,
    };
  }
  if (application1Filter) {
    lastFilter.applicationArea1 = {
      $eq: application1Filter,
    };
  }
  if (application2Filter) {
    lastFilter.applicationArea2 = {
      $eq: application2Filter,
    };
  }
  if (effectFilter) {
    lastFilter.effect = {
      $eq: effectFilter,
    };
  }
  if (originFilter) {
    lastFilter.origin = {
      $eq: originFilter,
    };
  }
  if (surfaceFilter) {
    lastFilter.surface = {
      $eq: surfaceFilter,
    };
  }

  qbData.$and = [dataSearch, lastFilter, { type: PRODUCT_TYPES.PLAN_PRODUCT }];
  queryBuilder = queryBuilder.search(qbData);

  const [page, setPage] = usePage(queryBuilder.query());
  const {
    page: pageInfinite,
    nextPage,
    setPage: setPageInfinite,
  } = useInfiniteQueryPage(queryBuilder.query());

  const [debouncedParams] = useDebounce(
    {
      page: !isUser ? page : pageInfinite,
      limit: pageSize,
      querySearch: queryBuilder.query(),
    },
    700,
    { equalityFn: jsonStringifyEqualityCheck },
  );

  const { data: dataProductList, isFetching } = useGetProductsQuery(
    debouncedParams,
    { skip: !me || isUser },
  );
  const {
    data,
    currentData: dataProductListUser,
    isFetching: isFetchingUser,
    isError,
  } = useGetInfiniteProductsUserQuery(debouncedParams, {
    skip: !me || !isUser,
  });

  useLayoutEffect(() => {
    if (!dataProductListUser) return;

    setPageInfinite((pre) =>
      dataProductListUser.page < pre ? dataProductListUser.page : pre,
    );
  }, [dataProductListUser, setPageInfinite]);

  const hasNextPage = !isError && (data ? data.page < data.pageCount : true);
  const sentryRef = useInfiniteSentry({
    loading: isFetchingUser,
    hasNextPage,
    onLoadMore: nextPage,
    disabled: isError,
    rootMargin: "0px 0px 200px 0px",
  });

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const [openAddTo, setOpenAddTo] = useState(false);
  const [addProductToSchedule] = useAddProductToScheduleMutation();

  const handleClickOpenAddTo = useCallback(() => {
    setOpenAddTo(true);
  }, []);
  const handleCloseAddTo = () => {
    setOpenAddTo(false);
  };
  const handleAddTo = async (scheduleId: string, sectionId: string) => {
    await addProductToSchedule({
      scheduleId,
      qd: {
        type: "library",
        productId: curId,
        sectionId,
        quantity: 0,
      },
    }).unwrap();
  };

  const [openDelete, setOpenDelete] = useState(false);

  const handleClickOpenDelete = useCallback(() => {
    setOpenDelete(true);
  }, []);
  const handleCloseDl = () => {
    setOpenDelete(false);
  };

  const [deleteProduct] = useDeleteProductMutation();
  const [curId, setCurId] = useState("");
  const [nameProduct, setNameProduct] = useState("");

  const deleteProd = () => {
    deleteProduct({ id: curId }).then(() => {});
    handleCloseDl();
  };

  const paginationModel = useMemo(
    () => ({
      page: page - 1,
      pageSize: pageSize,
    }),
    [page, pageSize],
  );

  const onPaginationModelChange = useCallback(
    (paginationModel: GridPaginationModel) => {
      setPage(paginationModel.page + 1);
      setPageSize(paginationModel.pageSize as any);
    },
    [setPage, setPageSize],
  );

  return (
    <Box pb={"40px"}>
      <DialogConfirmProject
        open={openDelete}
        handleClickOpen={handleClickOpenDelete}
        handleClose={handleCloseDl}
        handleAgree={deleteProd}
        name={nameProduct}
        type="delete"
        deleteName="product"
      />
      <ActionToProjectFileDialog
        type="schedule"
        action="add"
        open={openAddTo}
        onClose={handleCloseAddTo}
        onSectionSelected={handleAddTo}
      />
      <ImportDialog open={showImport} onClose={() => setShowImport(false)} />
      <HeaderMain
        title={!isUser ? t("title") : t("product_library")}
        buttonBlock={
          !isUser ? (
            <Box
              sx={{
                display: "flex",
                gap: "12px",
              }}
            >
              <ButtonPrimary
                LinkComponent={Link}
                href={createHref(paths.admin.importResult)}
                variant="outlined"
                label={t("import_result")}
              />
              <ButtonPrimary
                variant="outlined"
                label={t("import")}
                onClick={() => setShowImport(true)}
              />
              <ButtonPrimary
                component={RouterLink}
                href={createHref(paths.admin.createProduct)}
                startIcon={
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: "16px" }} />
                }
                label={t("create_product")}
              />
            </Box>
          ) : null
        }
      />
      <NoSsr>
        <Stack spacing={3}>
          <ProductFilter
            queryBuilder={queryBuilder}
            valueSearch={searchTerm}
            onChange={handleSearch}
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
          {!isUser ? (
            <DataTable
              handleClickOpen={handleClickOpenAddTo}
              data={dataProductList?.data ?? []}
              rowsCount={dataProductList?.total ?? -1}
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              loading={isFetching}
              handleClickOpenDl={handleClickOpenDelete}
              setCurId={setCurId}
              setNameProduct={setNameProduct}
            />
          ) : (
            <>
              <DataStateOverlay
                isError={isError}
                isEmpty={dataProductListUser?.data.length === 0}
                wrapperProps={{ mt: 7 }}
              >
                <ProductViewGrid
                  data={dataProductListUser?.data ?? []}
                  setOpenAddTo={setOpenAddTo}
                  setCurId={setCurId}
                />
              </DataStateOverlay>
              {/* <TablePagination
                component="div"
                count={dataProductListUser?.total ?? -1}
                page={page - 1}
                onPageChange={(_e, newPage) => {
                  setPage(newPage + 1);
                }}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10) as any);
                  setPage(1);
                }}
              /> */}
            </>
          )}
          {(isFetchingUser || hasNextPage) && isUser && (
            <CircularProgress
              ref={sentryRef}
              sx={{ display: "block", mx: "auto", my: 4 }}
            />
          )}
        </Stack>
      </NoSsr>
    </Box>
  );
};

export default ProductList;
