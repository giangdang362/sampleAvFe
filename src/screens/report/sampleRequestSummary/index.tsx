"use client";

import ButtonPrimary from "@/components/common/button-primary";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import HeaderMain from "@/components/layout/header";
import {
  CREATED_DATE_SUPPLIER,
  PAGE_SIZE_OPTIONS,
  PRODUCT_OPTION_SLUGS,
  REPORT_TYPE,
  SUBMIT_DATE_FORMAT,
} from "@/constants/common";
import {
  parseAsPageSize,
  parseAsDate as parseAsDateWithoutFormat,
} from "@/constants/queryParams";
import { usePage } from "@/hooks/usePage";
import { faArrowUpFromBracket } from "@/lib/fas/pro-light-svg-icons";
import { useIsUser } from "@/services/helpers";
import { useGetAllSampleRequestQuery } from "@/services/report/sampleRequest";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  NoSsr,
  OutlinedInput,
  Select,
} from "@mui/material";
import { DataGrid, GridSlots } from "@mui/x-data-grid";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useTranslations } from "next-intl";
import { parseAsString, parseAsStringLiteral } from "nuqs";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import { useGetConstSlugQuery } from "@/services/slug";
import { faMagnifyingGlass } from "@/lib/fas/pro-regular-svg-icons";
import { useGetDownloadTokenMutation } from "@/services/tokenDownload";
import { openDownloadFile } from "@/utils/openFile";
import { format, subMonths, subWeeks } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import DateRangePicker from "@/components/common/form/DateRangePicker";
// import { useHref } from "@/hooks/href";

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

const parseAsCreatedDate = parseAsStringLiteral([
  ...Object.values(CREATED_DATE_SUPPLIER).filter(
    (item) => item !== "customRange",
  ),
  "",
]);

const parseAsDate = parseAsDateWithoutFormat(SUBMIT_DATE_FORMAT);

const SampleRequestSummary = () => {
  const t = useTranslations("report");
  const [getDownloadToken] = useGetDownloadTokenMutation();
  const isUser = useIsUser();

  // const createHref = useHref();
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
  const [createdDateFilter, setCreatedDateFilter] = useQueryParamState(
    "requestDate",
    parseAsCreatedDate,
    "",
  );
  const [startDate, setStartDate] = useQueryParamState(
    "startDate",
    parseAsDate,
  );
  const [endDate, setEndDate] = useQueryParamState("endDate", parseAsDate);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  useEffect(() => {
    if (!createdDateFilter && startDate && endDate) {
      setShowDatePicker(true);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [createdDateFilter, endDate, setEndDate, setStartDate, startDate]);

  const isExistedParamsDate = (startDate && endDate) || createdDateFilter;

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };

  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [
        { "requester.firstName": { $cont: searchTerm } },
        {
          "product.series": { $cont: searchTerm },
          type: REPORT_TYPE.GET_SAMPLE,
        },
        {
          "product.model": { $cont: searchTerm },
          type: REPORT_TYPE.GET_SAMPLE,
        },
        {
          "product.brandName": { $cont: searchTerm },
          type: REPORT_TYPE.GET_SAMPLE,
        },
        {
          "product.material": { $cont: searchTerm },
          type: REPORT_TYPE.GET_SAMPLE,
        },
      ],
    };
  }

  const lastFilter: any = {};
  if (brandFilter) {
    lastFilter["product.brandName"] = {
      $eq: brandFilter,
    };
  }
  if (materialFilter) {
    lastFilter["product.material"] = {
      $eq: materialFilter,
    };
  }

  const createdDates = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }

    const now = new Date();
    switch (createdDateFilter) {
      case "":
        return undefined;
      case "last7Days":
        return { start: subWeeks(now, 1), end: now };
      case "last30Days":
        return { start: subMonths(now, 1), end: now };
    }
  }, [createdDateFilter, endDate, startDate]);

  if (createdDates) {
    lastFilter.createdAt = {
      $between: [
        format(createdDates.start, SUBMIT_DATE_FORMAT) + " 00:00:00.000",
        format(createdDates.end, SUBMIT_DATE_FORMAT) + " 23:59:59.999",
      ],
    };
  }

  qbData.$and = [dataSearch, lastFilter, { type: REPORT_TYPE.GET_SAMPLE }];
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

  const { data: dataSampleRequest, isFetching } =
    useGetAllSampleRequestQuery(debouncedParams);
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };
  const { data: dataBrand } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productBrand,
  });

  const { data: dataMaterial } = useGetConstSlugQuery({
    slug: PRODUCT_OPTION_SLUGS.productMaterial,
  });

  return (
    <Box>
      <HeaderMain
        haveBackBtn={true}
        backBtnHref={{
          isUser: false,
          path: "report",
        }}
        title={t("sampleRequest.title")}
        buttonBlock={
          <ButtonPrimary
            onClick={() => {
              getDownloadToken()
                .unwrap()
                .then((e: any) => {
                  const now = new Date();
                  const dateDefault = {
                    createdAt: {
                      $between: [
                        format(subMonths(now, 1), SUBMIT_DATE_FORMAT) +
                          " 00:00:00.000",
                        format(now, SUBMIT_DATE_FORMAT) + " 23:59:59.999",
                      ],
                    },
                  };
                  let qbDataNew: { $and: any } = { $and: [] };
                  qbDataNew.$and = [
                    dataSearch,
                    lastFilter,
                    dateDefault,
                    { type: REPORT_TYPE.GET_SAMPLE },
                  ];

                  let queryBuilderExport = RequestQueryBuilder.create();
                  queryBuilderExport = queryBuilder.search(qbDataNew);

                  openDownloadFile(
                    `report/requests/download?${isExistedParamsDate ? queryBuilder?.query() : queryBuilderExport.query()}`,
                    {
                      token_download: e.token,
                    },
                  );
                });
            }}
            startIcon={
              <FontAwesomeIcon
                icon={faArrowUpFromBracket}
                style={{ fontSize: "14px", color: "#fff" }}
              />
            }
            label={t("sampleRequest.exportBtn")}
          />
        }
      />
      {/* Filter */}
      <NoSsr>
        <Box
          className="filter-wrap"
          sx={{
            mt: "24px",
            mb: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            minHeight: "40px",
            alignItems: "center",
          }}
        >
          <OutlinedInput
            placeholder={t("sampleRequest.search")}
            type="search"
            value={searchTerm}
            onChange={handleSearch}
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
          <FormControl
            key={!!dataBrand + "dataBrand"}
            size="small"
            sx={{ maxWidth: "110px", width: "100%" }}
          >
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("sampleRequest.table.brand")}
            </InputLabel>
            <Select
              value={brandFilter}
              label={t("sampleRequest.table.brand")}
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
              {t("sampleRequest.table.material")}
            </InputLabel>
            <Select
              value={materialFilter}
              onChange={(e) => {
                setMaterialFilter(e.target.value);
              }}
              id="grouped-select"
              label={t("sampleRequest.table.material")}
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
          <FormControl size="small" sx={{ maxWidth: "150px", width: "100%" }}>
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("sampleRequest.request_date")}
            </InputLabel>
            <Select
              label={t("sampleRequest.request_date")}
              value={
                !createdDateFilter && ((startDate && endDate) || showDatePicker)
                  ? CREATED_DATE_SUPPLIER.customRange
                  : createdDateFilter
              }
              onChange={(e) => {
                if (e.target.value === CREATED_DATE_SUPPLIER.customRange) {
                  setCreatedDateFilter("");
                  setShowDatePicker(true);
                } else {
                  setCreatedDateFilter(e.target.value as any);
                  setShowDatePicker(false);
                  setStartDate(null);
                  setEndDate(null);
                }
              }}
              sx={{ ...styleSelect }}
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              <MenuItem value={CREATED_DATE_SUPPLIER.last7Days}>
                {t("sampleRequest.last_7_days")}
              </MenuItem>
              <MenuItem value={CREATED_DATE_SUPPLIER.last30Days}>
                {t("sampleRequest.last_30_days")}
              </MenuItem>
              <MenuItem value={CREATED_DATE_SUPPLIER.customRange}>
                {t("sampleRequest.custom_range")}
              </MenuItem>
            </Select>
          </FormControl>
          {showDatePicker && (
            <DateRangePicker
              initialStartDate={startDate}
              initialEndDate={endDate}
              onChange={(value) => {
                setStartDate(value?.startDate ?? null);
                setEndDate(value?.endDate ?? null);
              }}
              startLabel={t("sampleRequest.start_date")}
              endLabel={t("sampleRequest.end_date")}
              sx={{
                fontSize: "13px",
              }}
              disableFuture
            />
          )}
        </Box>
      </NoSsr>
      {/* DataTable */}
      <DataGrid
        rows={dataSampleRequest?.data || []}
        columns={columns({
          t,
        })}
        rowCount={dataSampleRequest?.total ?? -1}
        loading={isFetching}
        paginationMode="server"
        paginationModel={{
          page: page - 1,
          pageSize: pageSize,
        }}
        onPaginationModelChange={(paginationModel) => {
          setPage(paginationModel.page + 1);
          setPageSize(paginationModel.pageSize as any);
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        sx={{
          border: "none",
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
    </Box>
  );
};

export default SampleRequestSummary;
