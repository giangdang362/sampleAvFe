import {
  GridColDef,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import {
  faCheck,
  faXmark,
  faPen,
  faTrash,
} from "@/lib/fas/pro-light-svg-icons";
import FaIconButton from "@/components/common/FaIconButton";

type columnsType = {
  t: (
    t:
      | "contact_name"
      | "role"
      | "email"
      | "phone"
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
};

export const columnsPartnerMemberCreate = ({
  t,
  rowModesModel,
  handleEdit,
  handleSave,
  handleDelete,
  handleCancel,
}: columnsType): GridColDef<API.PartnerMemberItemTable>[] => {
  return [
    {
      field: "name",
      headerName: t("contact_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      editable: true,
      flex: 1,
    },

    {
      field: "role",
      headerName: t("role"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      editable: true,
      flex: 1,
    },

    {
      field: "email",
      headerName: t("email"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      editable: true,
      flex: 1,
    },

    {
      field: "phone",
      headerName: t("phone"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      width: 186,
      editable: true,
      flex: 1,
    },

    {
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
    },
  ];
};
