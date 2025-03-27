"use client";

import ButtonPrimary from "@/components/common/button-primary";
import HeaderMain from "@/components/layout/header";
import { paths } from "@/paths";
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  NoSsr,
  OutlinedInput,
  Select,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import { useGetPartnerQuery } from "@/services/partner";
import { pathFile } from "@/config/api";
import ImageDefault from "@/components/common/ImageDefault";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { CREATED_DATE_SUPPLIER, SUBMIT_DATE_FORMAT } from "@/constants/common";
import DateRangePicker from "@/components/common/form/DateRangePicker";
import { format, subMonths, subWeeks } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus } from "@/lib/fas/pro-regular-svg-icons";
import {
  parseAsDate as parseAsDateWithoutFormat,
  parseAsPageSize,
} from "@/constants/queryParams";
import { parseAsString, parseAsStringLiteral } from "nuqs";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { usePage } from "@/hooks/usePage";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import TagContainer from "./TagContainer/TagContainer";
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

const parseAsCreatedDate = parseAsStringLiteral([
  ...Object.values(CREATED_DATE_SUPPLIER).filter(
    (item) => item !== "customRange",
  ),
  "",
]);
const parseAsDate = parseAsDateWithoutFormat(SUBMIT_DATE_FORMAT);

const ViewSuppliers = () => {
  const t = useTranslations("suppliers");
  const createHref = useHref();

  const [pageSize, setPageSize] = useQueryParamState(
    "pageSize",
    parseAsPageSize,
    25,
  );
  const [searchTerm, setSearchTerm] = useQueryParamState(
    "search",
    parseAsString,
    "",
  );
  const [createdDateFilter, setCreatedDateFilter] = useQueryParamState(
    "createdDate",
    parseAsCreatedDate,
    "",
  );
  const [startDate, setStartDate] = useQueryParamState(
    "createdDateFrom",
    parseAsDate,
  );
  const [endDate, setEndDate] = useQueryParamState(
    "createdDateTo",
    parseAsDate,
  );

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  useEffect(() => {
    if (!createdDateFilter && startDate && endDate) {
      setShowDatePicker(true);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  }, [createdDateFilter, endDate, setEndDate, setStartDate, startDate]);

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };
  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [
        { companyName: { $cont: searchTerm } },
        { "tags.name": { $cont: searchTerm } },
        { "address.addressLine1": { $cont: searchTerm } },
        { "address.city": { $cont: searchTerm } },
        { "partnerMembers.name": { $cont: searchTerm } },
      ],
    };
  }
  const lastFilter: any = {};

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

  qbData.$and = [dataSearch, lastFilter];
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

  const { data, isFetching, isError } = useGetPartnerQuery(debouncedParams);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  return (
    <Box pb={"40px"}>
      <HeaderMain
        title={t("title")}
        buttonBlock={
          <ButtonPrimary
            component={RouterLink}
            href={createHref(paths.admin.addSupplier)}
            startIcon={
              <FontAwesomeIcon
                icon={faPlus}
                style={{ fontSize: "16px", color: "#fff" }}
              />
            }
            label={t("add_suppliers")}
          />
        }
      />
      <Stack
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <OutlinedInput
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          type="search"
          placeholder={t("search")}
          endAdornment={
            <InputAdornment position="end">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                style={{ fontSize: "16px" }}
              />
            </InputAdornment>
          }
          sx={{
            maxWidth: "300px",
            maxHeight: "40px",
            borderRadius: "4px",
            marginRight: 2,
          }}
        />
        <NoSsr>
          <FormControl size="small" sx={{ maxWidth: "150px", width: "100%" }}>
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("created_date")}
            </InputLabel>
            <Select
              label={t("created_date")}
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
                {t("last_7_days")}
              </MenuItem>
              <MenuItem value={CREATED_DATE_SUPPLIER.last30Days}>
                {t("last_30_days")}
              </MenuItem>
              <MenuItem value={CREATED_DATE_SUPPLIER.customRange}>
                {t("custom_range")}
              </MenuItem>
            </Select>
          </FormControl>
        </NoSsr>
        {showDatePicker && (
          <DateRangePicker
            initialStartDate={startDate}
            initialEndDate={endDate}
            onChange={(value) => {
              setStartDate(value?.startDate ?? null);
              setEndDate(value?.endDate ?? null);
            }}
            startLabel={t("start_date")}
            endLabel={t("end_date")}
            sx={{
              fontSize: "13px",
            }}
            disableFuture
          />
        )}
      </Stack>
      <DataStateOverlay
        isError={isError}
        isFetching={isFetching}
        isEmpty={data?.data.length === 0}
        wrapperProps={{ height: "120px" }}
      >
        <Stack
          sx={{
            mt: "24px",
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              xl: "repeat(auto-fill, 366px)",
            },
            gap: { xs: "16px", xl: "24px" },
            flexWrap: "wrap",
          }}
        >
          {data?.data?.map((item) => (
            <Box
              component={RouterLink}
              href={createHref(
                `${paths.admin.suppliers}/detail?supplier_id=${item?.id && item.id}`,
              )}
              key={item?.id}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "16px",
                px: "24px",
                py: "20px",
                color: "inherit",
                textDecoration: "none",
                transition: "all 0.3s",
                "&: hover": {
                  border: "1px solid #212121",
                },
              }}
            >
              <Stack
                sx={{
                  mb: "16px",
                  height: "54px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "18px",
                  }}
                >
                  {item.logoFile?.path ? (
                    <Box
                      component={"img"}
                      src={`${pathFile}/${item.logoFile?.path}`}
                      width={"54px"}
                      height={"54px"}
                      sx={{
                        borderRadius: "8px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  ) : (
                    <ImageDefault
                      width="54px"
                      height="54px"
                      fontSizeIcon="36px"
                      borderRadius="8px"
                    />
                  )}
                  <Box>
                    <Typography
                      sx={{
                        mb: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "17px",
                        height: "17px",
                        color: "#000",
                      }}
                    >
                      {item.companyName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "17px",
                        height: "17px",
                        color: "#000",
                      }}
                    >
                      {item.address?.city}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              <TagContainer tags={item.tags ?? []} />
            </Box>
          ))}
        </Stack>
      </DataStateOverlay>

      <TablePagination
        component="div"
        count={data?.total ?? -1}
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
    </Box>
  );
};

export default ViewSuppliers;
