import { Box, LinearProgress } from "@mui/material";
import { DataGrid, GridSlots } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { columns } from "./columns";
import HeaderMain from "@/components/layout/header";
import { useGetImportResultQuery } from "@/services/import";
import NoRowsOverlay from "@/components/common/NoRowOverlay";
import { PAGE_SIZE_OPTIONS } from "@/constants/common";
import ImportErrorDialog from "../ImportErrorDialog";
import { useState } from "react";
import { useIsUser } from "@/services/helpers";

const ImportResultTable = () => {
  const isUser = useIsUser();
  const t = useTranslations("products.import_table");
  const [curRow, setCurRow] = useState<API.ImportResultItem>();
  const [showErrDetail, setShowErrDetail] = useState(false);
  const { data, isFetching } = useGetImportResultQuery(undefined, {
    pollingInterval: 5000,
    skipPollingIfUnfocused: true,
  });

  return (
    <Box pb={"40px"}>
      <HeaderMain
        title={t("title")}
        haveBackBtn={true}
        backBtnHref={{ isUser, path: "products" }}
      />
      <DataGrid
        rows={data?.data ?? []}
        columns={columns({ t, setShowErrDetail, setCurRow })}
        rowCount={data?.count ?? 0}
        loading={isFetching}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        sx={{
          border: "none",
          "& > .MuiDataGrid-main .MuiDataGrid-virtualScroller .MuiDataGrid-filler":
            {
              // ...
            },
        }}
        slots={{
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
          noRowsOverlay: NoRowsOverlay,
        }}
      />
      <ImportErrorDialog
        data={curRow?.errors}
        open={showErrDetail}
        onClose={() => setShowErrDetail(false)}
      />
    </Box>
  );
};

export default ImportResultTable;
