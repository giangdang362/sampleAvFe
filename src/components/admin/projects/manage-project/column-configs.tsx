import { GridColDef } from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { pathFile } from "@/config/api";
import { roleDataLeader, roleData } from "@/utils/common";

type columnsType = {
  onDelete: (id: number, name: string) => void;
  handleClickOpenDl: () => void;
  role: string;
  setRole: (role: string) => void;
  isDeleted?: boolean;
  onChangeRole: (
    id: number,
    permission: string,
    currentPermission: string,
    currentName: string,
  ) => void;
  roleName?: string;
  isUser?: boolean;
};

export const columns = ({
  onDelete,
  handleClickOpenDl,
  isDeleted,
  onChangeRole,
  roleName,
  isUser,
}: columnsType): GridColDef<API.PjMember>[] => {
  return [
    {
      field: "name",
      headerName: "Name",
      width: 500,
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
            {original.row.user?.avatar ? (
              <Box
                component="img"
                sx={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "9999px",
                }}
                alt={`${original?.row.user?.firstName ?? ""}-avatar`}
                src={`${pathFile}/${original?.row?.user?.avatar}`}
              />
            ) : (
              <Avatar sx={{ width: 24, height: 24 }} />
            )}
            {original?.row.status !== "pending" ? (
              <Typography variant="body2">
                {original.row.user?.firstName}
              </Typography>
            ) : (
              <Typography
                sx={{ fontStyle: "italic" }}
                variant="body2"
                color={"#00000090"}
              >{`${original.row.email} (Invite sent)`}</Typography>
            )}
          </Stack>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      width: 400,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (original) => {
        return (
          <Box
            sx={{
              height: "100%",
              alignContent: "center",
            }}
          >
            {original?.row.status !== "pending" && (
              <Typography variant="body2">{original.value}</Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 400,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (original) => {
        return (
          <Box
            sx={{
              height: "100%",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            {!isDeleted &&
            ((original.row.permission !== roleDataLeader[2].value &&
              roleName !== roleDataLeader[1].value) ||
              !isUser) ? (
              <FormControl sx={{ mt: 2, minWidth: 50 }}>
                <Select
                  value={original.row.permission}
                  disableUnderline
                  variant="standard"
                  onChange={(event) => {
                    event.stopPropagation();
                    onChangeRole(
                      original?.row?.id ?? -1,
                      event.target?.value ?? "",
                      original.row?.permission,
                      original.row?.user?.firstName ??
                        original.row?.email ??
                        "",
                    );
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                >
                  {roleDataLeader?.map((v, i) => (
                    <MenuItem key={i} value={v.value}>
                      <Typography variant="body2">{v.label}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : roleName === roleDataLeader[0]?.value ? (
              original.row.permission === roleDataLeader[0]?.value ? (
                <FormControl sx={{ mt: 2, minWidth: 50 }}>
                  <Select
                    value={original.row.permission}
                    disableUnderline
                    variant="standard"
                    onChange={(event) => {
                      event.stopPropagation();
                      onChangeRole(
                        original?.row?.id ?? -1,
                        event.target?.value ?? "",
                        original.row?.permission,
                        original.row?.user?.firstName ??
                          original.row?.email ??
                          "",
                      );
                    }}
                    displayEmpty
                    inputProps={{ "aria-label": "Without label" }}
                  >
                    {roleData?.map((v, i) => (
                      <MenuItem key={i} value={v.value}>
                        <Typography variant="body2">{v.label}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography variant="body2">Leader</Typography>
              )
            ) : (
              <Typography variant="body2">
                {roleDataLeader.find(
                  (role) => role.value === original.row.permission,
                )?.label ?? original.row.permission}
              </Typography>
            )}
          </Box>
        );
      },
    },

    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 150,
      renderCell: (original) => {
        return (
          <>
            {!isDeleted &&
              (roleName !== roleDataLeader[1].value || !isUser) &&
              original?.row?.permission !== roleDataLeader[2].value && (
                <Stack
                  sx={{
                    flexDirection: "row",
                    gap: "10px",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      aria-label="icon button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClickOpenDl();
                        onDelete(
                          original?.row?.id ?? -1,
                          original?.row?.user?.firstName ??
                            original?.row?.email ??
                            "",
                        );
                      }}
                    >
                      <DeleteIcon sx={{ color: "GrayText" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
          </>
        );
      },
    },
  ];
};
