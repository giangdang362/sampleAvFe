"use client";
import HeaderMain from "@/components/layout/header";
import { Stack } from "@mui/material";
import React, { useState } from "react";
import ProjectList from "@/components/admin/projects/list-projects";
import {
  useGetProjectsQuery,
  useRestoreProjectMutation,
} from "@/services/projects";
import ProjectFilter from "../components/ProjectFilter";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { DialogConfirmProject } from "../components/DialogConfirmProject";
import { useTranslations } from "next-intl";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPageSize } from "@/constants/queryParams";
import { parseAsString } from "nuqs";
import { usePage } from "@/hooks/usePage";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { useIsUser } from "@/services/helpers";

const DeletedListProjects = () => {
  const isUser = useIsUser();
  const t = useTranslations("projects.project_deleted");
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

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };
  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [
        { name: { $cont: searchTerm }, deletedAt: { $notnull: true } },
        {
          clientName: { $cont: searchTerm },
          deletedAt: { $notnull: true },
        },
        {
          "projectUsers.user.firstName": { $cont: searchTerm },
          deletedAt: { $notnull: true },
        },
      ],
    };
  }
  queryBuilder = queryBuilder.setIncludeDeleted(1);
  qbData.$and = [dataSearch, { $or: [{ deletedAt: { $notnull: true } }] }];
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

  const { data: dataListProject, isFetching } =
    useGetProjectsQuery(debouncedParams);

  const handleSearchInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const [openRestore, setOpenRestore] = useState(false);

  const handleClickOpenDl = () => {
    setOpenRestore(true);
  };
  const handleCloseDl = () => {
    setOpenRestore(false);
  };

  const [restoreProject] = useRestoreProjectMutation();
  const [idProjectRestore, setIdProjectRestore] = useState("");

  const restoreProjectFun = () => {
    restoreProject({ id: idProjectRestore }).then(() => {
      handleCloseDl();
    });
  };

  const [nameProjectRestore, setNameProjectRestore] = useState("");

  return (
    <Stack>
      <DialogConfirmProject
        open={openRestore}
        handleClickOpen={handleClickOpenDl}
        handleClose={handleCloseDl}
        handleAgree={restoreProjectFun}
        name={nameProjectRestore}
        type="reStore"
      />
      <HeaderMain title={t("title")} />
      <Stack gap="12px">
        <ProjectFilter
          valueSearch={searchTerm}
          onChangeSearchInput={handleSearchInput}
        />
        <ProjectList
          data={dataListProject?.data ?? []}
          rowsCount={dataListProject?.total ?? -1}
          paginationModel={{ page: page - 1, pageSize }}
          onPaginationModelChange={(paginationModel) => {
            setPage(paginationModel.page + 1);
            setPageSize(paginationModel.pageSize as any);
          }}
          loading={isFetching}
          isDeleted
          handleClickOpenDl={handleClickOpenDl}
          onReStore={(id) => {
            setIdProjectRestore(id);
          }}
          setNameProjectRestore={(name) => {
            setNameProjectRestore(name);
          }}
        />
      </Stack>
    </Stack>
  );
};

export default DeletedListProjects;
