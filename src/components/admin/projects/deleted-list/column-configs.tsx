import { GridColDef } from "@mui/x-data-grid";
import { convertDateTime } from "src/utils/common";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { pathFile } from "@/config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@/lib/fas/pro-solid-svg-icons";
import ProgressBar from "@/components/common/app-progress-bar";
import ImageDefault from "@/components/common/ImageDefault";

type columnsType = {
  t: (
    t:
      | "table.project_name"
      | "table.created_by"
      | "table.created"
      | "table.deleted",
  ) => string;
  handleClickOpenDl: () => void;
  onReStore: (id: string) => void;
  setNameProjectRestore: (name: string) => void;
};

export const columns = ({
  t,
  handleClickOpenDl,
  onReStore,
  setNameProjectRestore,
}: columnsType): GridColDef<API.ProjectItem>[] => {
  return [
    {
      field: "name",
      headerName: t("table.project_name"),
      minWidth: 350,
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
                  marginRight: "12px",
                  width: "82px",
                  height: "46px",
                  borderRadius: "4px",
                }}
                alt="null"
                src={`${pathFile}/${original?.row?.coverImageFile?.path}` ?? ""}
              />
            ) : (
              <ImageDefault
                width="84px"
                sx={{ marginRight: "12px" }}
                fontSizeIcon="36px"
              />
            )}
            <Typography>{original.value}</Typography>
          </Stack>
        );
      },
    },
    {
      field: "clientName",
      headerName: "Client",
      minWidth: 150,
      flex: 0.18,
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
            <Typography>{original.value ?? ""}</Typography>
          </Stack>
        );
      },
    },
    {
      field: "projectUsers",
      headerName: "Members",
      minWidth: 150,
      flex: 0.18,
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
      headerName: "Progress",
      minWidth: 200,
      flex: 0.165,
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
      field: "deletedAt",
      headerName: t("table.deleted"),
      sortable: false,
      minWidth: 180,
      flex: 0.13,
      renderCell: (original) => {
        return convertDateTime(original.value);
      },
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 100,
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
            <Tooltip title="Restore" arrow placement="top">
              <IconButton
                aria-label="icon button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClickOpenDl();
                  onReStore(original?.row?.id ?? -1);
                  setNameProjectRestore(original?.row?.name ?? -1);
                }}
              >
                <FontAwesomeIcon
                  icon={faArrowRotateLeft}
                  style={{ fontSize: "20px" }}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];
};
