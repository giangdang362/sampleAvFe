import { GridColDef } from "@mui/x-data-grid";

export const columns = (): GridColDef<API.ProjectItem>[] => {
  return [
    {
      field: "name",
      headerName: "Project File Name",
      width: 342,
    },
    {
      field: "type",
      headerName: "File Type",
      width: 200,
      flex: 1,
    },
    {
      field: "updatedBy",
      headerName: "Modified By",
      width: 200,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Modified",
      width: 130,
      flex: 1,
    },
  ];
};
