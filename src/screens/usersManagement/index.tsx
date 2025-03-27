"use client";

import HeaderMain from "@/components/layout/header";
import { faSearch } from "@/lib/fas/pro-light-svg-icons";
import { useGetUsersQuery } from "@/services/user";
import { useDebounce } from "use-debounce";
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
  Stack,
} from "@mui/material";
import { DataGrid, GridSlots } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { columns } from "./columns";
import { paths } from "@/paths";
import { useAvciRouter } from "@/hooks/avci-router";
import { useGetPlansQuery } from "@/services/plan";
import { PAGE_SIZE_OPTIONS, USER_LAST_LOGIN } from "@/constants/common";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { formatISO, subDays, subMonths, subWeeks } from "date-fns";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPageSize } from "@/constants/queryParams";
import { parseAsString, parseAsStringEnum, parseAsStringLiteral } from "nuqs";
import { usePage } from "@/hooks/usePage";
import { jsonStringifyEqualityCheck } from "@/utils/json";

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

enum Status {
  null = "",
  activated = "activated",
  not_activated = "not_activated",
}

const parseAsLastLogin = parseAsStringLiteral([
  ...Object.values(USER_LAST_LOGIN),
  "",
]);

const ViewUserManagement = () => {
  const t = useTranslations("userManagement");
  const router = useAvciRouter();
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
  const [lastLoginFilter, setLastLoginFilter] = useQueryParamState(
    "lastLogin",
    parseAsLastLogin,
    "",
  );

  const { data: dataSubscription } = useGetPlansQuery();

  const [planFilter, setPlanFilter] = useQueryParamState(
    "plan.id",
    useMemo(
      () =>
        dataSubscription
          ? parseAsStringLiteral(
              dataSubscription.data.flatMap((plan) =>
                plan.id ? [plan.id] : [],
              ),
            )
          : parseAsString,
      [dataSubscription],
    ),
    "",
  );

  const [statusFilter, setStatusFilter] = useQueryParamState(
    "status",
    parseAsStringEnum<Status>(Object.values(Status)).withDefault(Status.null),
  );

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };

  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [{ firstName: { $cont: searchTerm } }],
    };
  }
  const lastFilter: any = {};

  const lastLoginDate = useMemo(() => {
    switch (lastLoginFilter) {
      case "":
        return;
      case USER_LAST_LOGIN.lastThreeDays:
        return subDays(new Date(), 3);
      case USER_LAST_LOGIN.lastWeek:
        return subWeeks(new Date(), 1);
      case USER_LAST_LOGIN.lastThreeDays:
        return subMonths(new Date(), 1);
    }
  }, [lastLoginFilter]);

  if (lastLoginDate) {
    lastFilter.lastLogin = {
      $gte: formatISO(lastLoginDate),
    };
  }

  if (planFilter) {
    lastFilter["plan.id"] = {
      $eq: planFilter,
    };
  }

  if (statusFilter) {
    if (statusFilter === Status.activated) {
      lastFilter.active = {
        $eq: true,
      };
    }
    if (statusFilter === Status.not_activated) {
      lastFilter.active = {
        $eq: false,
      };
    }
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

  const { data: userData, isFetching } = useGetUsersQuery(debouncedParams, {
    skip:
      planFilter !== "" &&
      !dataSubscription?.data.find((plan) => plan.id === planFilter),
  });

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  return (
    <Box>
      <HeaderMain title={t("title")} />
      <NoSsr>
        <Stack
          sx={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <OutlinedInput
            placeholder={t("search_text")}
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            endAdornment={
              <InputAdornment position="end">
                <FontAwesomeIcon icon={faSearch} style={{ fontSize: "14px" }} />
              </InputAdornment>
            }
            sx={{
              width: "300px",
              height: "40px",
              borderRadius: "4px",
              marginRight: 2,
            }}
          />
          <FormControl size="small" sx={{ maxWidth: "150px", width: "100%" }}>
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("last_login")}
            </InputLabel>
            <Select
              label={t("last_login")}
              value={lastLoginFilter}
              onChange={(e) => setLastLoginFilter(`${e.target.value}` as any)}
              sx={{ ...styleSelect }}
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              <MenuItem value={USER_LAST_LOGIN.lastThreeDays}>
                {t("last_three_days")}
              </MenuItem>
              <MenuItem value={USER_LAST_LOGIN.lastWeek}>
                {t("last_week")}
              </MenuItem>
              <MenuItem value={USER_LAST_LOGIN.lastMonth}>
                {t("last_month")}
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ maxWidth: "150px", width: "100%" }}>
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("subscription_plan")}
            </InputLabel>
            <Select
              label={t("subscription_plan")}
              value={planFilter}
              onChange={(e) => setPlanFilter(`${e.target.value}`)}
              size="small"
              sx={{ ...styleSelect }}
            >
              <MenuItem value={""}>{`---`}</MenuItem>
              {dataSubscription?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ maxWidth: "150px", width: "100%" }}>
            <InputLabel sx={{ fontSize: "13px", color: "#000" }}>
              {t("status")}
            </InputLabel>
            <Select
              label={t("status")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status)}
              size="small"
              sx={{ ...styleSelect }}
            >
              <MenuItem value={Status.null}>{`---`}</MenuItem>
              <MenuItem value={Status.activated}>{t("active_tag")}</MenuItem>
              <MenuItem value={Status.not_activated}>
                {t("not_active_tag")}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </NoSsr>
      <DataGrid
        rows={userData?.data ?? []}
        columns={columns({ t })}
        rowCount={userData?.count ?? 0}
        loading={isFetching}
        paginationMode="server"
        paginationModel={{
          page: page - 1,
          pageSize: pageSize,
        }}
        onPaginationModelChange={(paginationModel) => {
          setPage(paginationModel.page + 1);
          setPageSize(
            paginationModel.pageSize as (typeof PAGE_SIZE_OPTIONS)[number],
          );
        }}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        sx={{
          border: "none",
          "& > .MuiDataGrid-main .MuiDataGrid-virtualScroller .MuiDataGrid-filler":
            {
              // ...
            },
        }}
        onRowClick={(item) => {
          router.push(`${paths.admin.userManagement}/${item.id}`);
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
    </Box>
  );
};

export default ViewUserManagement;
