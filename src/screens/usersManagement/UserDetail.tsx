"use client";
import HeaderMain from "@/components/layout/header";
import { useAvciRouter } from "@/hooks/avci-router";
import { faTrash } from "@/lib/fas/pro-regular-svg-icons";
import { paths } from "@/paths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Input,
  InputAdornment,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useBanOrActiveUserMutation,
  useDeleteOneUserMutation,
  useGetOneUserQuery,
  useUpdateOneUserMutation,
  useUpdateRoleUserMutation,
  useUploadAvatarUserMutation,
} from "@/services/user";
import { pathFile } from "@/config/api";
import { convertDateTime, calculatorLastLogin } from "@/utils/common";
import { useGetAllRoleQuery } from "@/services/role";
import { ChangeEvent, useEffect, useState } from "react";
import { faCamera } from "@/lib/fas/pro-solid-svg-icons/faCamera";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { faTrashCan } from "@/lib/fas/pro-light-svg-icons";
import { usePageTitle } from "@/hooks/usePageTitle";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

const inputStyles = {
  border: "none",
  "&:hover:not(.Mui-disabled):before": {
    border: "none",
  },
  "&:before": {
    border: "none",
  },
  "&:after": {
    border: "none",
  },
  "&.Mui-focused:after": {
    border: "#c4c4c4",
  },
  "&.Mui-focused:before": {
    border: "none",
  },
  "&.Mui-visited": {
    border: "none",
  },
  "& input": {
    borderRadius: "2px",
    padding: "2px 4px",
  },
  "& input:focus-visible": {
    outline: "1px solid #212121",
  },
  fontSize: "16px",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
};

const styleSelect = {
  "& .MuiSelect-select": {
    padding: "7px 14px",
  },
  border: "none",
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "4px",
  },
  fontSize: "16px",
  width: "100%",
};

type UserDetailProps = {
  id: string;
};

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  linkedIn: z.string().optional(),
  company: z.string().optional(),
  projectCreated: z.number().optional(),
});

export type ValuesUser = z.infer<typeof schema>;

const UserDetail = ({ id }: UserDetailProps) => {
  const t = useTranslations("userManagement");
  const router = useAvciRouter();

  const {
    data: curUser,
    isLoading,
    error,
  } = useGetOneUserQuery({
    id: id ?? "",
  });
  usePageTitle(
    "userManagementDetail",
    curUser && (curUser.firstName ?? "null"),
  );

  const [deleteUser] = useDeleteOneUserMutation();

  const [uploadAvatar] = useUploadAvatarUserMutation();

  const [updateUser] = useUpdateOneUserMutation();

  const [updateRoleUser] = useUpdateRoleUserMutation();

  const [banOrActiveUser] = useBanOrActiveUserMutation();

  const { data: dataRole } = useGetAllRoleQuery();

  const [active, setActive] = useState<boolean>();

  useEffect(() => {
    setActive(curUser?.active);
  }, [curUser]);

  const {
    control,
    // formState: { errors },
  } = useForm<ValuesUser>({
    resolver: zodResolver(schema),
    values: curUser ?? {},
  });
  console.log("🚀 ~ UserDetail ~ control:", control);

  const handleUploadClick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar({ id, file });
    }
  };

  const { openDialog } = useConfirmDialog();

  const handleDeleteUser = async () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("delete_user"),
      content: t.rich("deleteContent", { name: curUser?.firstName }),
      confirmButtonLabel: t("delete_user"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deleteUser({ id: id })
            .unwrap()
            .then(() => {
              router.push(`${paths.admin.userManagement}`);
            });
        } catch {}
      },
    });
  };

  return (
    <Box pb={"48px"}>
      <HeaderMain
        title={t("title_detail")}
        haveBackBtn={true}
        backBtnHref={{ isUser: false, path: "userManagement" }}
        buttonBlock={
          <Button
            variant="text"
            startIcon={
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: "16px" }} />
            }
            sx={{ color: "red" }}
            onClick={handleDeleteUser}
          >
            {t("delete_user")}
          </Button>
        }
      />

      <NotFoundWrapper error={error} notFoundMessage={t("user_not_found")}>
        <Box
          sx={{
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              mb: "24px",
            }}
          >
            {curUser?.avatar ? (
              <Box
                sx={{
                  position: "relative",
                  width: "fit-content",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "9999px",
                  }}
                  alt={`avatar-user`}
                  src={`${pathFile}/${curUser?.avatar}`}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-upload-avatar"
                  type="file"
                  onChange={handleUploadClick}
                />
                <label htmlFor="icon-upload-avatar">
                  <InputAdornment
                    position="end"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      position: "absolute",
                      bottom: 0,
                      right: 4,
                      width: "28px",
                      height: "28px",
                      background: "#fff",
                      borderRadius: "9999px",
                      cursor: "pointer",
                      color: "#9e9e9e",
                      transition: "color 0.3s",
                      "&:hover": {
                        color: "#000",
                      },
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCamera}
                      style={{ fontSize: "16px" }}
                    />
                  </InputAdornment>
                </label>
              </Box>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  width: "fit-content",
                }}
              >
                <Avatar
                  sx={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "9999px",
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-upload-avatar"
                  type="file"
                  onChange={handleUploadClick}
                />
                <label htmlFor="icon-upload-avatar">
                  <InputAdornment
                    position="end"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      position: "absolute",
                      bottom: 0,
                      right: 4,
                      width: "28px",
                      height: "28px",
                      background: "#fff",
                      borderRadius: "9999px",
                      cursor: "pointer",
                      color: "#9e9e9e",
                      transition: "color 0.3s",
                      "&:hover": {
                        color: "#000",
                      },
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCamera}
                      style={{ fontSize: "16px" }}
                    />
                  </InputAdornment>
                </label>
              </Box>
            )}
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                gap: "6px",
                my: "8px",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                  height: "22px",
                }}
              >
                {isLoading ? (
                  <Skeleton width="200px" />
                ) : (
                  `${curUser?.firstName}`
                )}
              </Typography>
              {!!curUser?.plan?.name && (
                <Chip
                  variant="outlined"
                  label={curUser?.plan?.name}
                  sx={{
                    backgroundColor: "#3A3939",
                    textTransform: "capitalize",
                    color: "#fff",
                    width: "fit-content",
                    border: "none",
                    height: "20px",
                    lineHeight: "12px",
                    fontSize: "10px",
                    fontWeight: 500,
                    padding: "4px 8px",
                    "& span": {
                      padding: 0,
                    },
                  }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                color: "#9e9e9e",
                fontWeight: 400,
                fontSize: "12px",
                height: "15px",
                mb: "4px",
              }}
            >{`${t("last_login_detail")} ${calculatorLastLogin(curUser?.lastLogin ?? "")}`}</Typography>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "4px",
              }}
            >
              <Typography
                sx={{
                  color: "#9e9e9e",
                  fontWeight: 400,
                  fontSize: "12px",
                  height: "15px",
                }}
              >{`${t("registeredOn")}`}</Typography>
              <Typography
                sx={{
                  color: "#666",
                  fontWeight: 500,
                  fontSize: "12px",
                  height: "15px",
                }}
              >
                {convertDateTime(curUser?.createdAt ?? "")}
              </Typography>
            </Stack>
          </Box>
          <Box>
            <Box sx={{ borderBottom: "1px solid #e0e0e0" }}></Box>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography sx={{ minWidth: "150px" }}>
                {t("full_name_detail")}
              </Typography>
              <Input
                defaultValue={curUser?.firstName ?? ""}
                onChange={(e) => {
                  updateUser({ id: id, firstName: e.target.value ?? "" });
                }}
                placeholder={curUser?.firstName ? "" : "..."}
                sx={{
                  width: "100%",
                  ...inputStyles,
                }}
              />
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography sx={{ minWidth: "150px" }}>{t("email")}</Typography>
              <Typography sx={{ minWidth: "150px" }}>
                {curUser?.email ?? ""}
              </Typography>
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography sx={{ minWidth: "150px" }}>
                {t("linkedIn")}
              </Typography>
              <Input
                defaultValue={curUser?.social?.linkedin ?? ""}
                onChange={(e) => {
                  updateUser({
                    id: id,
                    social: { linkedin: e.target.value ?? "" },
                  });
                }}
                placeholder={curUser?.social?.linkedin ? "" : "..."}
                sx={{
                  width: "100%",
                  ...inputStyles,
                  color: "#0288D1",
                }}
              />
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography sx={{ minWidth: "150px" }}>{t("company")}</Typography>
              <Input
                defaultValue={curUser?.company ?? ""}
                onChange={(e) => {
                  updateUser({ id: id, company: e.target.value ?? "" });
                }}
                placeholder={curUser?.company ? "" : "..."}
                sx={{
                  width: "100%",
                  ...inputStyles,
                }}
              />
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography sx={{ minWidth: "150px" }}>
                {t("user_type")}
              </Typography>
              <Select
                value={curUser?.roles ? curUser?.roles[0]?.id : 0}
                onChange={(e) => {
                  updateRoleUser({
                    userId: id,
                    roleIds: [e.target.value.toString()],
                  });
                }}
                sx={{ ...styleSelect }}
              >
                {dataRole?.map((item, index) => (
                  <MenuItem key={index} value={item.id}>
                    {item.name === "Admin" ? "Super Administrator" : "User"}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  minWidth: "150px",
                }}
              >
                {t("active")}
              </Typography>
              <Switch
                checked={active}
                onChange={(e) => {
                  setActive(e.target.checked);
                  banOrActiveUser({
                    userId: id,
                    isBan: !e.target.checked,
                  });
                }}
                sx={{ ml: "-12px" }}
              />
            </Stack>
            <Stack
              sx={{
                flexDirection: "row",
                padding: "20px 12px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography
                sx={{
                  minWidth: "150px",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#9e9e9e",
                }}
              >
                {t("projects_created")}
              </Typography>
              <Typography
                sx={{
                  width: "100%",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {curUser?.projectCount ? curUser?.projectCount : 0}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </NotFoundWrapper>
    </Box>
  );
};

export default UserDetail;
