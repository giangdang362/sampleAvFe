import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { convertDateTime } from "src/utils/common";
import Avatar from "@mui/material/Avatar";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ICreateLinkFunc } from "@/hooks/href";
import { pathFile } from "@/config/api";
import ImageDefault from "@/components/common/ImageDefault";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@/lib/fas/pro-solid-svg-icons";

type columnsType = {
  t: (
    t:
      | "product_name"
      | "supplier"
      | "created_by"
      | "created_at"
      | "add_to"
      | "delete"
      | "na_series"
      | "na_model"
      | "na_surface",
  ) => string;
  handleClickOpen: () => void;
  createHref: ICreateLinkFunc;
  onDelete: (id: string) => void;
  onAdd: (id: string) => void;
  handleClickOpenDl: () => void;
  setNameProduct: (name: string) => void;
};

export const columns = ({
  t,
  onDelete,
  handleClickOpenDl,
  setNameProduct,
}: columnsType): GridColDef<API.ProductItem>[] => {
  return [
    {
      field: "name",
      headerName: t("product_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 300,
      flex: 0.4,
      renderCell: (original: GridRenderCellParams<API.ProductItem>) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          {original?.row?.images?.length ? (
            <Box
              component="img"
              sx={{
                width: "46px",
                height: "46px",
                borderRadius: "4px",
              }}
              alt={`${original.value}-image`}
              src={`${pathFile}/${original?.row?.images?.[0]?.thumbnail}`}
            />
          ) : (
            <ImageDefault flexShrink={0} borderRadius="4px" />
          )}

          <Typography variant="body2">
            {original?.row?.series || (
              <span style={{ fontStyle: "italic" }}>{t("na_series")}</span>
            )}
            {" - "}
            {original?.row?.model || (
              <span style={{ fontStyle: "italic" }}>{t("na_model")}</span>
            )}
            {" - "}
            {original?.row?.width || "--"}x{original?.row?.length || "--"}x
            {original?.row?.height || "--"}
            {" - "}
            {original?.row?.surface || (
              <span style={{ fontStyle: "italic" }}>{t("na_surface")}</span>
            )}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "supplier",
      headerName: t("supplier"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 0.2,
      valueGetter: (e: { name: string }) => {
        return e?.name || "";
      },
    },
    {
      field: "createBy",
      headerName: t("created_by"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 0.15,
      renderCell: (original: GridRenderCellParams<API.ProductItem>) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          {original.row.author?.avatar ? (
            <Box
              component="img"
              sx={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
              }}
              alt={`${original?.row.author?.firstName ?? ""}-avatar`}
              src={`${pathFile}/${original?.row?.author?.avatar}`}
            />
          ) : (
            <Avatar sx={{ width: 24, height: 24 }} />
          )}
          <Typography variant="body2">
            {original?.row.author?.firstName ?? ""}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "createdAt",
      headerName: t("created_at"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 180,
      flex: 0.1,
      renderCell: (original: GridRenderCellParams<API.ProductItem>) => {
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
      field: "action",
      headerName: "",
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 100,
      renderCell: (original: GridRenderCellParams<API.ProductItem>) => {
        return (
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              height: "100%",
              justifyContent: "flex-end",
              marginRight: "40px",
            }}
          >
            <Tooltip title={t("delete")} arrow>
              <IconButton
                aria-label="icon button"
                onClick={(event) => {
                  setNameProduct(
                    `${original.row.series} ${original.row.model}`,
                  );
                  event.stopPropagation();
                  handleClickOpenDl();
                  onDelete(original?.row?.id ?? "");
                }}
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: "20px" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];
};
