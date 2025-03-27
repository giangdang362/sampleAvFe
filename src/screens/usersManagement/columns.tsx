import { pathFile } from "@/config/api";
import { convertDateTime } from "@/utils/common";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

type columnsType = {
  t: (
    t:
      | "full_name"
      | "email"
      | "user_type"
      | "subscription_plan"
      | "status"
      | "last_login"
      | "active_tag"
      | "not_active_tag",
  ) => string;
};

export const columns = ({ t }: columnsType): GridColDef<API.UserItem>[] => {
  return [
    {
      field: "name",
      headerName: t("full_name"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 1,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
            height: "100%",
          }}
        >
          {original.row.avatar ? (
            <Box
              component="img"
              sx={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
              }}
              alt={`avatar`}
              src={`${pathFile}/${original?.row?.avatar}`}
            />
          ) : (
            <Avatar
              sx={{
                width: "24px",
                height: "24px",
                borderRadius: "9999px",
              }}
            />
          )}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#000",
            }}
          >{`${original.row.firstName}`}</Typography>
        </Stack>
      ),
    },
    {
      field: "email",
      headerName: t("email"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 250,
      flex: 1,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#000",
            }}
          >
            {original.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "userType",
      headerName: t("user_type"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 200,
      flex: 0.8,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#000",
            }}
          >
            {original.row.roles?.[0]?.name === "Admin"
              ? `Super Administrator`
              : "User"}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "subscriptionPlan",
      headerName: t("subscription_plan"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 150,
      flex: 0.8,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#000",
            }}
          >
            {original.row.plan?.name}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "active",
      headerName: t("status"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 100,
      flex: 0.8,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 500,
              fontSize: "13px",
              lineHeight: "18px",
              color: original.value ? "#237B4B" : "#EB5769",
              padding: "3px 10px",
              backgroundColor: original.value ? "#5DC98326" : "#EB576926",
              borderRadius: "30px",
            }}
          >
            {original.value ? t("active_tag") : t("not_active_tag")}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "lastLogin",
      headerName: t("last_login"),
      sortable: false,
      resizable: false,
      disableColumnMenu: true,
      minWidth: 180,
      flex: 0.8,
      renderCell: (original) => (
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "17px",
              color: "#000",
            }}
          >
            {convertDateTime(original.value)}
          </Typography>
        </Stack>
      ),
    },
  ];
};
