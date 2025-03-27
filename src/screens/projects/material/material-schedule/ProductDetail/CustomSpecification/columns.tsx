import FaIconButton from "@/components/common/FaIconButton";
import { faCheck, faXmark } from "@/lib/fas/pro-light-svg-icons";
import { faPen, faTrash } from "@/lib/fas/pro-solid-svg-icons";
import {
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";

type columnsType = {
  t: (
    t:
      | "specification_label"
      | "specification_detail"
      | "edit"
      | "save"
      | "cancel"
      | "delete",
  ) => string;
  rowModesModel: GridRowModesModel;
  handleEdit: (id: GridRowId) => void;
  handleSave: (id: GridRowId) => void;
  handleDelete: (id: GridRowId) => void;
  handleCancel: (id: GridRowId) => void;
  readonly: boolean;
};

export const columns = ({
  t,
  rowModesModel,
  handleEdit,
  handleSave,
  handleDelete,
  handleCancel,
  readonly = false,
}: columnsType): GridColDef<API.SpecificationItem>[] => {
  const defaultColumns: GridColDef<API.SpecificationItem>[] = [
    {
      field: "label",
      headerName: t("specification_label"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 200,
      editable: true,
    },
    {
      field: "detail",
      headerName: t("specification_detail"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      flex: 1,
      editable: true,
    },
  ];

  const actionColumn: GridColDef<API.SpecificationItem> = {
    field: "actions",
    type: "actions",
    headerName: "",
    sortable: false,
    resizable: false,
    disableColumnMenu: true,
    width: 138,
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <FaIconButton
            key="save"
            icon={faCheck}
            title={t("save")}
            onClick={() => handleSave(id)}
          />,
          <FaIconButton
            key="cancel"
            icon={faXmark}
            title={t("cancel")}
            onClick={() => handleCancel(id)}
          />,
        ];
      }

      return [
        <FaIconButton
          key="edit"
          icon={faPen}
          title={t("edit")}
          onClick={() => handleEdit(id)}
        />,
        <FaIconButton
          key="delete"
          icon={faTrash}
          title={t("delete")}
          onClick={() => handleDelete(id)}
        />,
      ];
    },
  };

  return readonly ? defaultColumns : [...defaultColumns, actionColumn];
};
