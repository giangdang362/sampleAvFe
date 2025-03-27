"use client";
import DesignList from "@/components/admin/projects/pinboard/DesignList";
import FaIconButton from "@/components/common/FaIconButton";
import { useConfirmDialog } from "@/components/common/UserDialog";
import AddImagePopover from "@/components/layout/AddImagePopover/AddImagePopover";
import HeaderMain from "@/components/layout/header";
import { useAvciRouter } from "@/hooks/avci-router";
import { useHref } from "@/hooks/href";
import {
  faEllipsis,
  faLink,
  faTrashCan,
} from "@/lib/fas/pro-regular-svg-icons";
import { faFilePdf, faTrash } from "@/lib/fas/pro-light-svg-icons";
import { paths } from "@/paths";
import { isErrorResponse, useIsUser } from "@/services/helpers";
import {
  useDeletePinboardMutation,
  useGetPinboardDetailsQuery,
  useLazyGetPinboardDetailsQuery,
  useUpdatePinboardMutation,
  useUploadPinboardImagesMutation,
  useUploadPinboardPinterestImagesMutation,
} from "@/services/pinboards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Switch,
} from "@mui/material";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useCallback, useState } from "react";
import { DialogAddMemberToProject } from "../components/DialogAddMenberToProject";
import { roleDataLeader } from "@/utils/common";
import { openDownloadFile } from "@/utils/openFile";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useGetDownloadTokenMutation } from "@/services/tokenDownload";
import NotFoundWrapper from "@/components/common/NotFoundWrapper";

const PINBOARD_NAME_MAX_LENGTH = 155;

const Pinboard = () => {
  const t = useTranslations("pinboard");
  const tCommon = useTranslations("common");
  const rt = useAvciRouter();
  const createHref = useHref();
  const [getDownloadToken] = useGetDownloadTokenMutation();

  const isUser = useIsUser();

  const [noteMode, setNoteMode] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const searchParams = useParams();
  const pinboardId = searchParams.id + "";
  const { data, isLoading, error } = useGetPinboardDetailsQuery({
    id: pinboardId,
  });
  const readOnly =
    isLoading ||
    !!error ||
    data?.roleName === roleDataLeader[1].value ||
    data?.project === null;
  usePageTitle("pinboard", data?.name);

  const menuPopoverState = usePopupState({
    variant: "popover",
    popupId: "pinboard-menu-popup",
  });
  const newPopoverState = usePopupState({
    variant: "popover",
    popupId: "pinboard-new-popup",
  });

  const [updatePinboard] = useUpdatePinboardMutation();
  const [uploadFileImages] = useUploadPinboardImagesMutation();
  const [uploadPinterestImages] = useUploadPinboardPinterestImagesMutation();
  const [deletePinboard] = useDeletePinboardMutation();

  const handleTitleChange = async (newName: string) => {
    if (newName.length < 1) {
      return { error: t("validation.pinboardNameEmpty") };
    }
    if (newName.length > PINBOARD_NAME_MAX_LENGTH) {
      return {
        error: t("validation.pinboardNameMaxLength", {
          count: PINBOARD_NAME_MAX_LENGTH,
        }),
      };
    }

    try {
      await updatePinboard({ id: pinboardId, name: newName }).unwrap();
    } catch (e) {
      if (isErrorResponse(e) && e.data.message === "PROJECT_FOLDER_EXIST") {
        return { error: t("validation.pinboardExists") };
      }
    }
  };

  const { openDialog } = useConfirmDialog();
  const handleDeletePinboard = async () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("deletePinboard"),
      content: tCommon.rich("deleteContent", { name: data?.name }),
      confirmButtonLabel: t("deletePinboard"),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deletePinboard({
            id: pinboardId,
          }).unwrap();

          if (data?.projectId) {
            rt.replace(
              !isUser ? paths.admin.projectFiles : paths.app.projectFiles,
              { id: data.projectId },
            );
          } else {
            rt.replace(!isUser ? paths.admin.projects : paths.app.projects);
          }
        } catch {}
      },
    });
    return;
  };

  const handleCopyShare = () => {
    if (data?.shares[0]) {
      navigator.clipboard
        .writeText(
          new URL(
            createHref(paths.share.share, { id: data.shares[0].id }),
            document.baseURI,
          ).href,
        )
        .then(() => {
          enqueueSnackbar(
            tCommon("actionSuccessfully", { action: tCommon("copyLink") }),
            {
              variant: "success",
            },
          );
        });
    }
  };

  const [getPinboardDetails] = useLazyGetPinboardDetailsQuery();
  const handleGetLastestPinboard = useCallback(() => {
    if (!data?.id) {
      throw new Error("Missing pinboard data");
    }

    return getPinboardDetails({ id: data.id }, true).unwrap();
  }, [data?.id, getPinboardDetails]);

  return (
    <Stack gap={3} mt={5}>
      <HeaderMain
        mode="contextSource"
        title={isLoading || !!error ? "..." : data?.name}
        titleEditable={!isLoading && !readOnly}
        editTitleLabel={t("editPinboardName")}
        editTitlePlaceholder={t("editPinboardNamePlaceholder")}
        onTitleChange={handleTitleChange}
        haveBackBtn
        backBtnHref={
          isLoading
            ? undefined
            : {
                isUser,
                ...(data?.projectId
                  ? {
                      path: "projectFiles",
                      params: { id: data.projectId },
                    }
                  : { path: "projects" }),
              }
        }
        buttonBlock={
          <Stack direction={"row"}>
            <FormControlLabel
              labelPlacement="start"
              value={noteMode}
              onChange={(_e, checked) => setNoteMode(checked)}
              control={<Switch />}
              label={t("notes")}
              slotProps={{
                typography: {
                  variant: "subtitle2",
                  color: "text.secondary",
                  fontWeight: 600,
                  lineHeight: 1.215,
                },
              }}
              sx={{ mr: 3 }}
            />

            <FaIconButton
              title={t("menu")}
              icon={faEllipsis}
              iconSize="1em"
              color="primary"
              wrapperProps={{
                sx: { mr: readOnly ? 0 : 2 },
              }}
              {...bindTrigger(menuPopoverState)}
              disabled={isLoading || !!error}
            />
            <Popover
              {...bindPopover(menuPopoverState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <List>
                <ListItemButton
                  onClick={() => {
                    getDownloadToken()
                      .unwrap()
                      .then((e: any) => {
                        openDownloadFile(`pinboard/${pinboardId}/pdf`, {
                          token_download: e.token,
                        });
                        menuPopoverState.close();
                      });
                  }}
                >
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faFilePdf} />
                  </ListItemIcon>
                  <ListItemText primary={t("exportAsPdf")} />
                </ListItemButton>

                {!readOnly &&
                  (isUser
                    ? data?.roleName === roleDataLeader[2].value
                    : true) && (
                    <>
                      <Divider />

                      <ListItemButton onClick={handleDeletePinboard}>
                        <ListItemIcon>
                          <FontAwesomeIcon
                            color="var(--mui-palette-error-main)"
                            icon={faTrash}
                          />
                        </ListItemIcon>
                        <ListItemText
                          sx={{ color: "var(--mui-palette-error-main)" }}
                          primary={t("delete")}
                        />
                      </ListItemButton>
                    </>
                  )}
              </List>
            </Popover>

            {!readOnly && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faLink} />}
                  disabled={!data?.projectId}
                  onClick={() => setOpenShareDialog(true)}
                >
                  {t("share")}
                </Button>

                <AddImagePopover
                  {...bindPopover(newPopoverState)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: -6,
                    horizontal: "right",
                  }}
                  onFileImagesSelected={async (files) => {
                    if (!data) return;

                    try {
                      await uploadFileImages({
                        id: pinboardId,
                        data: { files, sectionId: data.sections[0].id },
                      }).unwrap();
                    } catch {}
                  }}
                  onPinterestImagesSelected={async (images) => {
                    if (!data) return;

                    try {
                      await uploadPinterestImages({
                        id: pinboardId,
                        data: images?.map((imageUrl) => ({
                          imageUrl,
                          sectionId: data.sections[0].id,
                        })),
                      }).unwrap();
                    } catch {}
                  }}
                />
              </>
            )}
          </Stack>
        }
      />

      <NotFoundWrapper
        error={error}
        notFoundMessage={t("pinboardNotFound")}
        messageProps={{ mt: "80px" }}
      >
        {isLoading ? (
          <CircularProgress sx={{ mx: "auto" }} />
        ) : (
          !!data && (
            <DesignList
              pinboard={data}
              getLastestPinboard={handleGetLastestPinboard}
              noteMode={noteMode}
              readOnly={readOnly}
            />
          )
        )}

        {!!data?.projectId && !readOnly && (
          <DialogAddMemberToProject
            title={t("shareProject")}
            confirmButtonTitle={tCommon("share")}
            handleClose={() => setOpenShareDialog(false)}
            open={openShareDialog}
            idProject={data?.projectId}
            customAction={
              data?.shares[0] ? (
                <Button
                  startIcon={<FontAwesomeIcon icon={faLink} />}
                  onClick={handleCopyShare}
                >
                  {tCommon("copyLink")}
                </Button>
              ) : undefined
            }
          />
        )}
      </NotFoundWrapper>
    </Stack>
  );
};

export default Pinboard;
