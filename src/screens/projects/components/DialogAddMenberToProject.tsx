import {
  Box,
  IconButton,
  DialogContent,
  DialogActions,
  Dialog,
  Autocomplete,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Avatar,
} from "@mui/material";
import * as React from "react";
import CloseIcon from "@mui/icons-material/Close";
import ButtonSecondary from "../../../components/common/button-secondary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAddMemberToProjectMutation } from "@/services/projects";
import { useGetUsersSearchQuery } from "@/services/user";
import { pathFile } from "@/config/api";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { roleData } from "@/utils/common";
import { useTranslations } from "next-intl";
import { isErrorResponse } from "@/services/helpers";
import { LoadingButton } from "@mui/lab";

export interface DialogAddMemberToProjectProps {
  title?: string;
  confirmButtonTitle?: string;
  customAction?: React.ReactNode;
  handleClose: () => void;
  handleClickOpen?: () => void;
  open: boolean;
  idProject: string;
  roleName?: string;
}

const emailSchema = z.string().email();
const schema = z.object({
  projectUsers: z.object({ email: emailSchema }).array(),
});
type Values = z.infer<typeof schema>;

const defaultValues = {
  projectUsers: [],
};

export function DialogAddMemberToProject({
  title,
  confirmButtonTitle,
  customAction,
  handleClose,
  open,
  idProject,
}: DialogAddMemberToProjectProps): React.JSX.Element {
  const t = useTranslations("projects");
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [role, setRole] = useState<(typeof roleData)[number]["value"]>(
    roleData[0].value,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "projectUsers",
  });

  let queryBuilder = RequestQueryBuilder.create();
  const [debounceSearch] = useDebounce(searchTerm, 500);
  if (debounceSearch !== "") {
    queryBuilder = queryBuilder.search({ email: debounceSearch });
  }
  const skipSearchingUsers =
    !debounceSearch ||
    fields.some(
      ({ email }) => email.toLowerCase() === debounceSearch.toLowerCase(),
    );

  const { data: dataAllUsers, currentData: currentDataAllUsers } =
    useGetUsersSearchQuery(
      {
        page: 1,
        limit: 1000,
        querySearch: queryBuilder.query(),
      },
      {
        skip: skipSearchingUsers,
        refetchOnMountOrArgChange: true,
      },
    );
  const userOptions = !skipSearchingUsers
    ? currentDataAllUsers?.data ?? []
    : [];

  const userInfoMapRef = useRef<Record<string, API.UserItem>>({});
  const userInfoMap = useMemo(() => {
    const newMap = {
      ...userInfoMapRef.current,
      ...Object.fromEntries(
        dataAllUsers?.data.map((user) => [
          user.email?.toLowerCase() ?? "",
          user,
        ]) ?? [],
      ),
    };
    userInfoMapRef.current = newMap;

    return newMap;
  }, [dataAllUsers?.data]);

  useEffect(() => {
    if (open) {
      inputRef?.focus();
      reset();
      setRole(roleData[0].value);
      setSearchTerm("");
      userInfoMapRef.current = {};
    }
  }, [inputRef, open, reset]);

  const [addMemberToProject, { isLoading }] = useAddMemberToProjectMutation();

  const onSubmit = (data: Values) => {
    const memberEmails = [...data.projectUsers];

    if (!memberEmails.length && searchTerm) {
      if (!emailSchema.safeParse(searchTerm).success) {
        setError("projectUsers", {
          message: t("invalidEmail"),
        });

        return;
      }

      memberEmails.push({ email: searchTerm });
    }

    addMemberToProject({
      projectId: idProject,
      projectUsers: {
        members: memberEmails.map((user) => ({
          ...user,
          userId: userInfoMap[user.email.toLowerCase()]?.id,
          permission: role,
        })),
      },
    })
      .unwrap()
      .then(handleClose)
      .catch((errorApi) => {
        if (
          isErrorResponse(errorApi) &&
          errorApi.data.message === "USER_ALREADY_EXISTS"
        ) {
          setError("projectUsers", {
            message: t("message.projectMembersExist", {
              count: memberEmails.length,
            }),
          });
        }
      });
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
      <Typography sx={{ m: 0, p: 2 }} variant="h6">
        {title ?? `${t("dialog.selectMember")}`}
      </Typography>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent dividers>
        <Autocomplete
          filterOptions={(x) => x}
          filterSelectedOptions
          onChange={(_, value) => {
            setError("projectUsers", {});
            replace(
              value.map((item) => ({
                email: typeof item === "string" ? item : item.email ?? "",
              })),
            );
          }}
          freeSolo
          multiple
          value={fields}
          options={userOptions}
          disableClearable={true}
          getOptionLabel={(option) => {
            if (typeof option === "string") {
              return option;
            }
            return option?.firstName || option?.email || "";
          }}
          renderTags={(value, getTagProps) =>
            value?.map((option, index: number) => {
              const userInfo = option.email
                ? userInfoMap[option.email.toLowerCase()]
                : undefined;

              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  icon={
                    userInfo?.avatar ? (
                      <Box
                        component="img"
                        sx={{
                          marginRight: "12px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "9999px",
                        }}
                        alt={`${userInfo.firstName || userInfo.email} avatar`}
                        src={`${pathFile}/${userInfo.avatar}`}
                      />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24 }} />
                    )
                  }
                  variant="outlined"
                  label={userInfo?.firstName || option.email}
                  key={key}
                  {...tagProps}
                />
              );
            })
          }
          inputValue={searchTerm}
          onInputChange={(_, newInputValue) => {
            setError("projectUsers", {});
            setSearchTerm(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              inputProps={{
                ...params.inputProps,
                onKeyDown: (e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    if (!emailSchema.safeParse(e.currentTarget.value).success) {
                      setError("projectUsers", {
                        message: t("invalidEmail"),
                      });
                      e.stopPropagation();
                      return;
                    }

                    if (
                      fields.find(
                        (user) =>
                          user.email.toLowerCase() ===
                          e.currentTarget.value.toLowerCase(),
                      )
                    ) {
                      setError("projectUsers", {
                        message: t("message.duplicatedEmail"),
                      });
                      e.stopPropagation();
                      return;
                    }
                  }
                },
              }}
              inputRef={setInputRef}
              size="medium"
              label={t("dialog.member")}
              error={!!errors.projectUsers?.message}
              helperText={errors.projectUsers?.message}
            />
          )}
        />

        <Typography
          variant="caption"
          color="var(--mui-palette-text-secondary)"
          display="block"
          my={0.5}
        >
          {t.rich("addMemberEmailGuide")}
        </Typography>

        <FormControl fullWidth sx={{ marginTop: "16px" }}>
          <InputLabel id="role-label">{t("dialog.role")}</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            value={role}
            label={t("dialog.role")}
            onChange={(e) =>
              setRole(e.target.value as (typeof roleData)[number]["value"])
            }
          >
            {roleData?.map((v, i) => (
              <MenuItem key={i} value={v.value}>
                <Typography variant="body2">{v.label}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Box>{customAction}</Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <ButtonSecondary title={t("button.cancel")} onClick={handleClose} />
          <LoadingButton
            variant="contained"
            type="submit"
            disabled={!fields.length && !searchTerm}
            loading={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {confirmButtonTitle ?? `${t("button.addMember")}`}
          </LoadingButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
