"use client";
import HeaderMain from "@/components/layout/header";
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import React from "react";
import RouterLink from "next/link";
import { useHref } from "@/hooks/href";
import ButtonPrimary from "@/components/common/button-primary";
import { paths } from "@/paths";
import { useGetProjectsQuery } from "@/services/projects";
import ProjectFilter from "../components/ProjectFilter";
import { useDebounce } from "use-debounce";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useIsUser } from "@/services/helpers";
import { pathFile } from "@/config/api";
import ImageDefault from "@/components/common/ImageDefault";
import ProgressBar from "@/components/common/app-progress-bar";
import { getDifferenceTime } from "@/utils/fun";
import { useTranslations } from "next-intl";
import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsString } from "nuqs";
import { parseAsPageSize } from "@/constants/queryParams";
import { usePage } from "@/hooks/usePage";
import { jsonStringifyEqualityCheck } from "@/utils/json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@/lib/fas/pro-regular-svg-icons";
import DataStateOverlay from "@/components/common/DataStateOverflay";

const ViewProjects = () => {
  const t = useTranslations("projects");
  const isUser = useIsUser();
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

  let queryBuilder = RequestQueryBuilder.create();
  const qbData: { $and: any } = { $and: [] };
  let dataSearch = {};
  if (searchTerm) {
    dataSearch = {
      $or: [
        { "projectUsers.user.firstName": { $cont: searchTerm } },
        { clientName: { $cont: searchTerm } },
        { name: { $cont: searchTerm } },
      ],
    };
  }
  qbData.$and = [dataSearch];
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

  const {
    data: dataListProject,
    isFetching,
    isError,
  } = useGetProjectsQuery(debouncedParams);

  const handleSearchInput = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  return (
    <Stack pb={"40px"}>
      <HeaderMain
        title={t("list.projects")}
        buttonBlock={
          <ButtonPrimary
            component={RouterLink}
            href={createHref(
              !isUser ? paths.admin.createProject : paths.app.createProject,
            )}
            startIcon={
              <FontAwesomeIcon
                icon={faPlus}
                style={{ fontSize: "16px", color: "#fff" }}
              />
            }
            label={t("list.createProject")}
          />
        }
      />
      <Stack gap="12px">
        <ProjectFilter
          valueSearch={searchTerm}
          onChangeSearchInput={handleSearchInput}
        />

        <DataStateOverlay
          isError={isError}
          isFetching={isFetching}
          isEmpty={dataListProject?.data.length === 0}
          wrapperProps={{ height: "260px" }}
        >
          <Stack
            sx={{
              mt: "24px",
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                xl: "repeat(auto-fill, 260px)",
              },
              gap: { xs: "16px", xl: "24px" },
              mb: "12px",
            }}
          >
            {dataListProject?.data?.map((item, index) => (
              <Card sx={{ borderRadius: "16px" }} key={index}>
                <CardActionArea
                  href={`${!isUser ? paths.admin.projects : paths.app.projects}/${item?.id}/files`}
                  // target="_blank"
                  sx={{ height: "100%" }}
                >
                  {item?.coverImageFile ? (
                    <CardMedia
                      sx={{
                        aspectRatio: "260 / 195",
                      }}
                      component="img"
                      src={`${pathFile}/${item?.coverImageFile?.path}` ?? ""}
                      alt={`${item.name}-cover-img`}
                    />
                  ) : (
                    <ImageDefault
                      sx={{
                        width: "100%",
                        height: "unset",
                        aspectRatio: "260 / 195",
                      }}
                      fontSizeIcon="100px"
                    />
                  )}

                  <CardContent sx={{ p: "12px" }}>
                    <Typography
                      variant="subtitle2"
                      component="div"
                      height={"20px"}
                      lineHeight={"20px"}
                      mb={"4px"}
                    >
                      {item.name}
                    </Typography>
                    <ProgressBar
                      red={item?.progress?.stuckPercent}
                      green={item?.progress?.donePercent}
                      yellow={item?.progress?.workingPercent}
                    />
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      sx={{ marginTop: "4px" }}
                    >
                      <Typography
                        color={"#00000061"}
                        fontSize={"12px"}
                        fontWeight={400}
                      >{`${t("modified")} ${getDifferenceTime(item?.updatedAt)}`}</Typography>
                      <AvatarGroup
                        max={3}
                        sx={{
                          height: "20px",
                          "& .MuiAvatar-root": {
                            width: "20px",
                            height: "20px",
                            fontSize: "10px",
                          },
                        }}
                      >
                        {item?.projectUsers?.map((item, index) => {
                          return (
                            <Avatar
                              key={index}
                              sx={{ width: "20px", height: "20px" }}
                              src={
                                item?.user?.avatar
                                  ? `${pathFile}/${item.user?.avatar}`
                                  : undefined
                              }
                            />
                          );
                        })}
                      </AvatarGroup>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </DataStateOverlay>

        <TablePagination
          component="div"
          count={dataListProject?.total ?? -1}
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
      </Stack>
    </Stack>
  );
};

export default ViewProjects;
