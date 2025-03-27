import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { convertDateTime } from "src/utils/common";
import { Stack, Typography } from "@mui/material";

type columnsType = {
  t: (
    t:
      | "sampleRequest.table.name"
      | "sampleRequest.table.productName"
      | "sampleRequest.table.material"
      | "sampleRequest.table.series"
      | "sampleRequest.table.brand"
      | "sampleRequest.table.requestDate",
  ) => string;
};

export const columns = ({
  t,
}: columnsType): GridColDef<API.SampleRequest>[] => {
  return [
    {
      field: "name",
      headerName: t("sampleRequest.table.name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 0.15,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {original.row.requester?.firstName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "productName",
      headerName: t("sampleRequest.table.productName"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 300,
      flex: 0.3,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {`${original?.row.product?.series} - ${original?.row?.product?.model}`}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "material",
      headerName: t("sampleRequest.table.material"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 150,
      flex: 0.13,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {original.row.product?.material}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "series",
      headerName: t("sampleRequest.table.series"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 150,
      flex: 0.13,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {original.row.product?.series}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "brand",
      headerName: t("sampleRequest.table.brand"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 150,
      flex: 0.13,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {original.row.product?.brandName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "requestDate",
      headerName: t("sampleRequest.table.requestDate"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 180,
      flex: 0.13,
      renderCell: (original: GridRenderCellParams<API.SampleRequest>) => {
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
              {convertDateTime(original.row.createdAt ?? "")}
            </Typography>
          </Stack>
        );
      },
    },
  ];
};
