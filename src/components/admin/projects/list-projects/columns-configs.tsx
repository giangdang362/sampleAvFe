import { GridColDef } from "@mui/x-data-grid";
// import Image from "next/image";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { convertDateTime } from "@/utils/common";
import { pathFile } from "@/config/api";
import ProgressBar from "@/components/common/app-progress-bar";
import ImageDefault from "@/components/common/ImageDefault";

type columnsType = {
  t: (
    t:
      | "table.project_name"
      | "table.client"
      | "table.members"
      | "table.progress"
      | "table.modified_by"
      | "table.modified",
  ) => string;
};

export const columns = ({ t }: columnsType): GridColDef<API.ProjectItem>[] => {
  return [
    {
      field: "name",
      headerName: t("table.project_name"),
      width: 500,
      flex: 0.3,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
              position: "relative",
            }}
          >
            {original?.row?.coverImageFile ? (
              <Box
                component="img"
                sx={{
                  width: "82px",
                  height: "46px",
                  borderRadius: "4px",
                }}
                alt="null"
                src={`${pathFile}/${original?.row?.coverImageFile?.path}` ?? ""}
              />
            ) : (
              <ImageDefault width="84px" fontSizeIcon="36px" />
            )}

            <Typography variant="body2">{original.value}</Typography>
          </Stack>
        );
      },
    },
    {
      field: "clientName",
      headerName: t("table.client"),
      width: 200,
      flex: 0.165,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2">{original.value ?? ""}</Typography>
          </Stack>
        );
      },
    },
    {
      field: "projectUsers",
      headerName: t("table.members"),
      width: 220,
      flex: 0.12,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              height: "100%",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            {original.row?.projectUsers?.slice(0, 5)?.map((item) => {
              return (
                <Box sx={{ width: 15 }} key={item.id}>
                  {item?.user?.avatar ? (
                    <Avatar
                      sx={{ width: 24, height: 24 }}
                      src={`${pathFile}/${item.user?.avatar}`}
                    />
                  ) : (
                    <Avatar sx={{ width: 24, height: 24 }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        );
      },
    },
    {
      field: "progress",
      headerName: t("table.progress"),
      width: 220,
      flex: 0.15,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              height: "100%",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <ProgressBar
                red={original?.row?.progress?.stuckPercent}
                green={original?.row?.progress?.donePercent}
                yellow={original?.row?.progress?.workingPercent}
              />
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "modifiedBy",
      headerName: t("table.modified_by"),
      width: 220,
      flex: 0.15,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            {original.row.modifier?.avatar ? (
              <Avatar
                sx={{ width: 24, height: 24 }}
                src={`${pathFile}/${original.row.modifier?.avatar}`}
              />
            ) : (
              <Avatar
                sx={{ width: 24, height: 24 }}
                src={`${pathFile}/${original.row.modifier?.avatar}`}
              />
            )}
            <Typography variant="body2">
              {original.row.modifier?.firstName ?? ""}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: t("table.modified"),
      width: 220,
      flex: 0.12,
      renderCell: (original) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2">
              {convertDateTime(original.value)}
            </Typography>
          </Stack>
        );
      },
    },
  ];
};
