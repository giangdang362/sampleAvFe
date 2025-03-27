import EditableTypography from "@/components/common/EditableTypography";
import FaIconButton from "@/components/common/FaIconButton";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import {
  faChevronDown,
  faChevronUp,
  faPlus,
  faTextSize,
  faTrash,
} from "@/lib/fas/pro-light-svg-icons";
import { Box, BoxProps, Divider, Stack } from "@mui/material";
import { bindPopover } from "material-ui-popup-state";
import { bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useTranslations } from "next-intl";
import React, { useContext, useState } from "react";
import AddImagePopover from "@/components/layout/AddImagePopover/AddImagePopover";
import {
  useAddTextCardMutation,
  useDeletePinboardSectionMutation,
  useUpdatePinboardMutation,
  useUpdatePinboardSectionMutation,
  useUploadPinboardImagesMutation,
  useUploadPinboardPinterestImagesMutation,
} from "@/services/pinboards";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { PinboardDataContext, PinboardInfoContext } from "./DesignList";
import { PINBOARD_SECTION_HEADER_HEIGHT } from "./pageDimension";

export interface PinboardSectionHeaderProps extends BoxProps {
  sectionId: string;
  sectionName: string;
}

const PINBOARD_SECTION_NAME_MAX_LENGTH = 155;

const PinboardSectionHeader: React.FC<PinboardSectionHeaderProps> = ({
  sectionId,
  sectionName,
  ...rest
}) => {
  const pinboard = useContext(PinboardDataContext);
  const pinboardContext = useContext(PinboardInfoContext);
  if (!pinboard || !pinboardContext)
    throw new Error("Missing pinboard context");

  const { readOnly } = pinboardContext;
  const pinboardId = pinboard.id;

  const t = useTranslations("pinboard");
  const tCommon = useTranslations("common");

  const [isAddPopoverVisible, setIsAddPopoverVisible] = useState(false);
  const addPopoverState = usePopupState({
    variant: "popover",
    popupId: "pinboard-section-add-popup",
  });

  const [updatePinboard] = useUpdatePinboardMutation();
  const [updateSection] = useUpdatePinboardSectionMutation();
  const [deleteSection] = useDeletePinboardSectionMutation();
  const [uploadFileImages] = useUploadPinboardImagesMutation();
  const [uploadPinterestImages] = useUploadPinboardPinterestImagesMutation();
  const [addTextCard] = useAddTextCardMutation();

  const sectionIds = pinboard?.sections?.map((s) => s.id);
  const sectionIndex = sectionIds?.findIndex((id) => id === sectionId);

  const handleTitleChange = async (newName: string) => {
    if (newName.length > PINBOARD_SECTION_NAME_MAX_LENGTH) {
      return {
        error: t("validation.pinboardSectionNameMaxLength", {
          count: PINBOARD_SECTION_NAME_MAX_LENGTH,
        }),
      };
    }

    await updateSection({
      id: pinboardId,
      sectionId,
      name: newName,
    });
  };

  const handleOrderChange = async (direction: "up" | "down") => {
    if (!sectionIds || sectionIndex === undefined || sectionIndex === -1) {
      return;
    }

    const newSectionIds = [...sectionIds];
    const newIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    const otherSection = newSectionIds[newIndex];
    newSectionIds[newIndex] = newSectionIds[sectionIndex];
    newSectionIds[sectionIndex] = otherSection;

    await updatePinboard({
      id: pinboardId,
      sectionIds: newSectionIds,
      updateType: "optimistic",
    });
  };

  const { openDialog } = useConfirmDialog();
  const handleDeleteSection = async () => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("section.deleteSection"),
      content: tCommon.rich("deleteContent", { name: sectionName }),
      confirmButtonLabel: t("section.deleteSection"),
      icon: faTrashCan,
      onConfirm: async () => {
        await deleteSection({
          id: pinboardId,
          sectionIds: [sectionId],
        });
      },
    });
    return;
  };

  return (
    <Box
      {...rest}
      sx={[
        {
          "& .pinboard--section-action-group": {
            opacity: isAddPopoverVisible ? 1 : 0,
            transition: "opacity 0.2s",
          },
          "&:hover .pinboard--section-action-group, & .pinboard--section-action-group:focus-within":
            {
              opacity: 1,
            },
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
      <Divider
        sx={{
          position: "relative",
          "& .MuiDivider-wrapper": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <EditableTypography
          enabled={!readOnly}
          value={sectionName}
          onEditingFinish={handleTitleChange}
          editLabel={t("section.editSectionName")}
          placeholder={t("section.editSectionNamePlaceholder")}
          wrapperProps={{
            justifyContent: "center",
            minWidth: "200px",
            sx: {
              height: `calc(var(--cqw) * ${PINBOARD_SECTION_HEADER_HEIGHT})`,
              "& .MuiFormHelperText-root.Mui-error": {
                mx: 0,
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              },
            },
          }}
          textFieldSx={{
            width: "min(300px, 20vw)",
          }}
          sx={{
            fontWeight: 600,
            fontSize: "var(--cqw)",
            lineHeight: "calc(var(--cqw) * 1.5)",
            maxWidth: "calc(var(--cqw) * 45)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "center",
          }}
        />

        {!readOnly && (
          <Stack
            className="pinboard--section-action-group invisible-when-moving"
            bgcolor="var(--mui-palette-background-default)"
            position="absolute"
            pl={2}
            right={0}
            direction="row"
          >
            <FaIconButton
              title={t("section.moveSectionUp")}
              icon={faChevronUp}
              color="primary"
              onClick={() => handleOrderChange("up")}
              disabled={sectionIndex === 0}
              tooltipProps={{ PopperProps: { disablePortal: true } }}
            />
            <FaIconButton
              title={t("section.moveSectionDown")}
              icon={faChevronDown}
              color="primary"
              onClick={() => handleOrderChange("down")}
              disabled={sectionIndex === (sectionIds?.length ?? 1) - 1}
              tooltipProps={{ PopperProps: { disablePortal: true } }}
            />

            <FaIconButton
              title={t("section.addToSection")}
              icon={faPlus}
              color="primary"
              {...bindTrigger(addPopoverState)}
              tooltipProps={{ PopperProps: { disablePortal: true } }}
            />
            <AddImagePopover
              TransitionProps={{
                onEnter: () => setIsAddPopoverVisible(true),
                onExited: () => setIsAddPopoverVisible(false),
              }}
              {...bindPopover(addPopoverState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              onFileImagesSelected={async (files) => {
                await uploadFileImages({
                  id: pinboardId,
                  data: { files, sectionId },
                });
              }}
              onPinterestImagesSelected={async (images) => {
                await uploadPinterestImages({
                  id: pinboardId,
                  data: images?.map((imageUrl) => ({ imageUrl, sectionId })),
                });
              }}
              additionalItems={[
                {
                  icon: faTextSize,
                  label: t("addTextCard"),
                  onClick: async () => {
                    await addTextCard({ pinboardId, sectionId });
                  },
                },
              ]}
            />

            <FaIconButton
              title={t("section.deleteSection")}
              icon={faTrash}
              color="primary"
              onClick={handleDeleteSection}
              tooltipProps={{ PopperProps: { disablePortal: true } }}
            />
          </Stack>
        )}
      </Divider>
    </Box>
  );
};

export default PinboardSectionHeader;
