import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { convertDateTime } from "src/utils/common";
import {
  Avatar,
  Box,
  ButtonBase,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@/lib/fas/pro-solid-svg-icons";
import { pathFile } from "@/config/api";
import { Dispatch, SetStateAction } from "react";

type columnsType = {
  t: (
    t:
      | "file_name"
      | "total_record"
      | "process"
      | "error"
      | "upload_at"
      | "author"
      | "success"
      | "wrong_template",
  ) => string;
  setShowErrDetail: Dispatch<SetStateAction<boolean>>;
  setCurRow: Dispatch<SetStateAction<API.ImportResultItem | undefined>>;
};

export const columns = ({
  t,
  setShowErrDetail,
  setCurRow,
}: columnsType): GridColDef<API.ImportResultItem>[] => {
  return [
    {
      field: "fileName",
      headerName: t("file_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 300,
      flex: 0.2,
    },
    {
      field: "totalLine",
      headerName: t("total_record"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 100,
      flex: 0.07,
      renderCell: (original) => <Box>{original.value}</Box>,
    },
    {
      field: "totalError",
      headerName: t("error"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 100,
      flex: 0.07,
      renderCell: (original) => (
        <ButtonBase
          onClick={() => {
            setCurRow(original.row);
            setShowErrDetail(true);
          }}
          sx={{
            padding: "8px 16px",
            minWidth: "80%",
            fontSize: "14px",
            borderRadius: "4px",
            color: "red",
            backgroundColor: "#ffd0d0",
            border: "1px solid #ff8b8b",
          }}
        >
          {original.value}
        </ButtonBase>
      ),
    },
    {
      field: "processed",
      headerName: t("process"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 0.2,
      renderCell: (original: GridRenderCellParams<API.ImportResultItem>) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "16px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={(original.row.processed / original.row.totalLine) * 100}
            sx={{
              width: "80%",
              height: 8,
              borderRadius: "40px",
              backgroundColor: "#0000001F",
              "& span": {
                backgroundColor: "green",
                borderRadius: "40px",
              },
            }}
          />
          {original.row.isFinished ? (
            original.row.processed > 0 ? (
              <Tooltip
                placement="top"
                title={`${t("success")}: ${original.row.processed}/${original.row.totalLine}`}
              >
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  style={{
                    fontSize: "16px",
                    color: "green",
                  }}
                />
              </Tooltip>
            ) : (
              <Typography
                sx={{
                  fontSize: "13px",
                }}
              >{`${((original.row.processed / original.row.totalLine) * 100).toFixed(2)}%`}</Typography>
            )
          ) : (
            <Tooltip
              placement="top"
              title={`${original.row.processed > 0 ? `${original.row.processed}/${original.row.totalLine}` : t("wrong_template")}`}
            >
              <FontAwesomeIcon
                icon={faCircleXmark}
                style={{
                  fontSize: "16px",
                  color: "red",
                }}
              />
            </Tooltip>
          )}
        </Stack>
      ),
    },
    {
      field: "createdAt",
      headerName: t("upload_at"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 180,
      flex: 0.1,
      renderCell: (original: GridRenderCellParams<API.ImportResultItem>) => {
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
    {
      field: "author",
      headerName: t("author"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 150,
      flex: 0.1,
      renderCell: (original: GridRenderCellParams<API.ImportResultItem>) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
            }}
          >
            {original.row.importer?.avatar ? (
              <Box
                component="img"
                sx={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "9999px",
                }}
                alt={`${original?.row.importer?.firstName ?? ""}-avatar`}
                src={`${pathFile}/${original?.row?.importer?.avatar}`}
              />
            ) : (
              <Avatar sx={{ width: 24, height: 24 }} />
            )}
            <Typography variant="body2">
              {original?.row.importer?.firstName ?? ""}
            </Typography>
          </Stack>
        );
      },
    },
  ];
};
