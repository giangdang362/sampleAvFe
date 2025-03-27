"use client";

import HeaderMain from "@/components/layout/header";
import { Box, Stack } from "@mui/material";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/services/products";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { DialogConfirmProject } from "../projects/components/DialogConfirmProject";
import DataTable from "./DataTable";
import ProductFilter from "./components/ProductFilter";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPageSize } from "@/constants/queryParams";
import { parseAsString } from "nuqs";
import { usePage } from "@/hooks/usePage";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { useIsUser } from "@/services/helpers";
import { PRODUCT_TYPES } from "@/constants/common";

const UserProductsList = () => {
  const t = useTranslations("products");
  const isUser = useIsUser();
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
  const [materialFilter, setMaterialFilter] = useQueryParamState(
    "material",
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
      ],
    };
  }

  const lastFilter: any = {};
  if (materialFilter) {
    lastFilter.material = {
      $eq: materialFilter,
    };
  }
  qbData.$and = [
    dataSearch,
    lastFilter,
    { type: PRODUCT_TYPES.PROJECT_PRODUCT },
    { isAdminCreated: { $eq: false } },
  ];
  queryBuilder = queryBuilder.search(qbData);

  const [page, setPage] = usePage(queryBuilder.query());
  const [debouncedParams] = useDebounce(
    {
      page: page,
      limit: pageSize,
      querySearch: queryBuilder.query(),
    },
    700,
    { equalityFn: jsonStringifyEqualityCheck },
  );

  const { data: dataProductList, isFetching } =
    useGetProductsQuery(debouncedParams);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const [openDl, setOpenDl] = useState(false);

  const handleClickOpenDl = () => {
    setOpenDl(true);
  };
  const handleCloseDl = () => {
    setOpenDl(false);
  };

  const [deleteProduct] = useDeleteProductMutation();
  const [idDl, seyIdDL] = useState("");
  const [nameProduct, setNameProduct] = useState("");

  const deleteProd = () => {
    deleteProduct({ id: idDl }).then(() => {});
    handleCloseDl();
  };

  return (
    <Box>
      <DialogConfirmProject
        open={openDl}
        handleClickOpen={handleClickOpenDl}
        handleClose={handleCloseDl}
        handleAgree={deleteProd}
        name={nameProduct}
        type="delete"
        deleteName="product"
      />

      <HeaderMain title={t("user_title")} />
      <Stack spacing={3}>
        <ProductFilter
          valueSearch={searchTerm}
          onChange={handleSearch}
          materialFilter={materialFilter}
          setMaterialFilter={setMaterialFilter}
        />
        <DataTable
          handleClickOpen={() => {}}
          data={dataProductList?.data ?? []}
          rowsCount={dataProductList?.total ?? -1}
          paginationModel={{
            page: page - 1,
            pageSize: pageSize,
          }}
          onPaginationModelChange={(paginationModel) => {
            setPage(paginationModel.page + 1);
            setPageSize(paginationModel.pageSize as any);
          }}
          loading={isFetching}
          handleClickOpenDl={handleClickOpenDl}
          onAdd={(id) => {
            seyIdDL(id);
          }}
          onDelete={(id) => {
            seyIdDL(id);
          }}
          setNameProduct={(name) => {
            setNameProduct(name);
          }}
        />
      </Stack>
    </Box>
  );
};

export default UserProductsList;
