import { IMPORT_ERR } from "@/constants/common";
import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

type columnsType = {
  t: (
    t:
      | "line"
      | "excel_cell"
      | "field_name"
      | "input_data"
      | "message"
      | "get_file_from_s3_failed"
      | "get_import_file_from_s3_failed"
      | "supplier_not_found"
      | "get_list_images_from_s3_error"
      | "get_attachment_from_s3_failed"
      | "get_image_from_s3_failed"
      | "create_thumbnail_failed"
      | "load_excel_failed"
      | "n_a"
      | "invalid_field",
  ) => string;
};

export const columns = ({
  t,
}: columnsType): GridColDef<API.ImportErrItem>[] => {
  return [
    {
      field: "line",
      headerName: t("line"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      flex: 0.03,
      renderCell: (original) => <Box>{original.row.data?.line}</Box>,
    },
    {
      field: "excelCell",
      headerName: t("excel_cell"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 100,
      flex: 0.05,
      renderCell: (original) => <Box>{original.row.data?.excelCell}</Box>,
    },
    {
      field: "fieldName",
      headerName: t("field_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      flex: 0.07,
      renderCell: (original) => <Box>{original.row.data?.fieldName}</Box>,
    },
    {
      field: "inputData",
      headerName: t("input_data"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 200,
      flex: 0.2,
      renderCell: (original) => <Box>{original.row.data?.inputData}</Box>,
    },
    {
      field: "message",
      headerName: t("message"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 150,
      flex: 0.1,
      renderCell: (original) => (
        <Box>
          {original.value === IMPORT_ERR.GET_FILE_FROM_S3_FAILED
            ? t("get_file_from_s3_failed")
            : original.value === IMPORT_ERR.GET_IMPORT_FILE_FROM_S3_FAILED
              ? t("get_import_file_from_s3_failed")
              : original.value === IMPORT_ERR.SUPPLIER_NOT_FOUND
                ? t("supplier_not_found")
                : original.value === IMPORT_ERR.GET_LIST_IMAGES_FROM_S3_ERROR
                  ? t("get_list_images_from_s3_error")
                  : original.value === IMPORT_ERR.GET_ATTACHMENT_FROM_S3_FAILED
                    ? t("get_attachment_from_s3_failed")
                    : original.value === IMPORT_ERR.GET_IMAGE_FROM_S3_FAILED
                      ? t("get_image_from_s3_failed")
                      : original.value === IMPORT_ERR.CREATE_THUMBNAIL_FAILED
                        ? t("create_thumbnail_failed")
                        : original.value === IMPORT_ERR.LOAD_EXCEL_FAILED
                          ? t("load_excel_failed")
                          : original.value === IMPORT_ERR.INVALID_FIELD
                            ? t("invalid_field")
                            : t("n_a")}
        </Box>
      ),
    },
  ];
};
