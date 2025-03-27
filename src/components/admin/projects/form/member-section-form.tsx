"use client";
import {
  Autocomplete,
  Avatar,
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import { Values } from "./createUpdate";
import { useGetUsersSearchQuery } from "@/services/user";
import SearchIcon from "@mui/icons-material/Search";
import { pathFile } from "@/config/api";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDebounce } from "use-debounce";
import { roleDataLeader } from "@/utils/common";
import { useIsUser } from "@/services/helpers";
import { useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { useConfirmDialog } from "@/components/common/UserDialog";

interface MemberSectionFormProps {
  control: Control<Values>;
  errors?: FieldErrors<Values>;
  dataGetAllUser: API.UserItem[];
  dataMyAccount?: API.UserItem;
}

const MemberSectionForm: FC<MemberSectionFormProps> = ({
  dataMyAccount,
  control,
}) => {
  const t = useTranslations("projects");

  const { fields, remove, replace, update, append } = useFieldArray({
    control,
    name: "projectUsers",
    keyName: "_id",
  });

  const [list, setList] = useState<API.UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  let queryBuilder = RequestQueryBuilder.create();
  const [debounceSearch] = useDebounce(searchTerm, 500);
  if (debounceSearch !== "") {
    queryBuilder = queryBuilder.search({ email: debounceSearch });
  }

  const { data } = useGetUsersSearchQuery({
    page: 1,
    limit: 1000,
    querySearch: queryBuilder.query(),
  });

  const [users, setUsers] = useState<API.UserItem[]>([]);

  const isUser = useIsUser();

  useEffect(() => {
    if (isUser) {
      setUsers(data?.data ?? []);
    } else {
      setUsers(data?.data?.filter((e) => e.id !== dataMyAccount?.id) ?? []);
    }
  }, [data?.data, dataMyAccount?.id, isUser]);

  useEffect(() => {
    if (dataMyAccount && dataMyAccount !== undefined) {
      setList([
        {
          id: dataMyAccount.id,
          permission: roleDataLeader[2].value,
          email: dataMyAccount.email,
          firstName: dataMyAccount.firstName,
          avatar: dataMyAccount.avatar,
        },
      ]);
      setTimeout(() => {
        append({
          email: dataMyAccount.email,
          permission: roleDataLeader[2].value,
          userId: dataMyAccount.id,
        });
      }, 500);
      // append({
      //   email: dataMyAccount.email,
      //   permission: roleDataLeader[2].value,
      //   userId: dataMyAccount.id,
      // });
    }
  }, [append, dataMyAccount]);

  const { openDialog } = useConfirmDialog();

  return (
    <Stack gap="16px" sx={{ marginBottom: "50px" }}>
      <Typography variant="subtitle1">{t("manage.members")}</Typography>
      <Stack gap="20px">
        <Grid
          container
          columns={16}
          columnSpacing={{ xs: 1, sm: 2, md: 2.5 }}
          rowSpacing={{ xs: 1, sm: 2, md: 2.5 }}
        >
          <Grid xs={16}>
            <Autocomplete
              filterOptions={(x) => x}
              filterSelectedOptions
              onChange={(e, value) => {
                const valueNew = value?.map((e) => {
                  if (typeof e === "string") {
                    return {
                      email: e,
                      permission: roleDataLeader[0].value,
                    } satisfies API.UserItem;
                  }
                  return e;
                });

                setList(valueNew);
                replace(
                  valueNew?.map((val) => ({
                    permission: val.permission ?? roleDataLeader[0].value,
                    email: val.email,
                    userId: val.id,
                  })),
                );
              }}
              freeSolo
              multiple
              value={list ?? []}
              id="tags-filled"
              options={users ?? []}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              disableClearable={true}
              getOptionLabel={(option) => {
                if (typeof option === "string") {
                  return option;
                }
                return option?.firstName || option?.email || "";
              }}
              renderTags={(value) =>
                value?.map(() => {
                  return <></>;
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={t("message.inviteMembersByEmail")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                  }}
                />
              )}
            />
          </Grid>

          <Grid xs={16}>
            <Stack gap="8px">
              {fields?.map((member, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack
                    sx={{ alignItems: "center" }}
                    direction="row"
                    spacing={1}
                  >
                    {list[index]?.avatar ? (
                      <Box
                        component="img"
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "9999px",
                        }}
                        alt={`${pathFile}/${list[index]?.avatar}-avatar`}
                        src={`${pathFile}/${list[index]?.avatar}`}
                      />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24 }}></Avatar>
                    )}

                    <Typography variant="body2">
                      {list[index]?.firstName || member.email}
                    </Typography>
                  </Stack>
                  <Stack direction="row">
                    <TextField
                      placeholder={t("button.editor")}
                      select
                      fullWidth
                      sx={{ minWidth: "150px" }}
                      value={member.permission || roleDataLeader[0].value}
                      onChange={(e) => {
                        if (member.permission === roleDataLeader[2].value) {
                          enqueueSnackbar(`${t("projectNeedLeader")}`, {
                            variant: "error",
                          });
                        } else {
                          if (e.target.value === roleDataLeader[2].value) {
                            openDialog({
                              type: "confirm",
                              mainColor: undefined,
                              title: t("dialog.passLeadership"),
                              content: t("message.wantPassLeader", {
                                name: list[index]?.firstName || member.email,
                              }),
                              confirmButtonLabel: t("button.confirm"),
                              icon: undefined,
                              onConfirm: () => {
                                update(index, {
                                  permission: e.target.value,
                                  userId: member.userId,
                                  email: member.email,
                                });
                                for (var i = 0; i < fields.length; i++) {
                                  if (fields[i].userId !== member.userId) {
                                    update(i, {
                                      permission: roleDataLeader[0].value,
                                      userId: fields[i].userId,
                                      email: fields[i].email,
                                    });
                                  }
                                }
                              },
                            });
                          } else {
                            update(index, {
                              permission: e.target.value,
                              userId: member.userId,
                              email: member.email,
                            });
                          }
                        }
                      }}
                    >
                      {roleDataLeader?.map((v, i) => (
                        <MenuItem key={i} value={v.value}>
                          {v.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {member.permission !== roleDataLeader[2].value ? (
                      <IconButton
                        aria-label="clear"
                        disableRipple
                        onClick={() => {
                          remove(index);
                          setList(list?.filter((e, ind) => ind !== index));
                        }}
                      >
                        <CloseRoundedIcon />
                      </IconButton>
                    ) : (
                      <Box marginLeft={"40px"}></Box>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default MemberSectionForm;
