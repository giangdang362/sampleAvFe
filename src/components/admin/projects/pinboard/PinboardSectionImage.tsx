import { zodResolver } from "@hookform/resolvers/zod";
import InputForm from "@/components/common/form/InputForm";
import ReactCrop, { PixelCrop, type Crop } from "react-image-crop";
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  InputAdornment,
  Typography,
} from "@mui/material";
import React, { useRef, useState, useEffect, useContext, memo } from "react";
import "react-image-crop/dist/ReactCrop.css";
import FaIconButton from "@/components/common/FaIconButton";
import { faCheck, faXmark } from "@/lib/fas/pro-solid-svg-icons";
import {
  faArrowUpRightFromSquare,
  faLink,
  faTrash,
  faTrashCan,
} from "@/lib/fas/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideDialog from "@/components/common/side-dialog";
import {
  bindDialog,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { pathFile } from "@/config/api";
import {
  useCropPinboardImageMutation,
  useDeletePinboardImageMutation,
  useUpdatePinboardImageMutation,
} from "@/services/pinboards";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { PinboardInfoContext } from "./DesignList";
import PinboardSectionCardToolbar from "./PinboardSectionCardToolbar";
import { GridDashContext } from "@/components/common/grid-dash/GridDash";

export interface PinboardSectionImageProps
  extends Omit<BoxProps, "id">,
    Pick<API.PinboardImage, "id" | "path" | "colSpan" | "note" | "link"> {
  onCropStateChange?: (id: string, cropMode: boolean) => void;
  onColSpanChange?: (id: string, colSpan: number) => void;
}

const imageInfoSchema = z.object({
  notes: z.string().max(350),
  link: z.string().url().or(z.literal("")),
});
type ImageInfo = z.infer<typeof imageInfoSchema>;

const defaultCrop: Crop = {
  unit: "%",
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

const PinboardSectionImage: React.FC<PinboardSectionImageProps> = ({
  onCropStateChange,
  onColSpanChange,
  sx,
  id,
  path,
  colSpan,
  note,
  link,
  ...rest
}) => {
  const image = { id, path, colSpan, note, link };

  const pinboardContext = useContext(PinboardInfoContext);
  if (!pinboardContext) throw new Error("Missing pinboard context");
  const { pinboardId, noteMode, readOnly } = pinboardContext;

  const t = useTranslations();
  const gridDashContext = useContext(GridDashContext);
  const openDetailButtonRef = useRef<HTMLButtonElement>(null);
  const imageDialogState = usePopupState({
    variant: "dialog",
    popupId: "image-detail-dialog",
  });

  const { control, handleSubmit, reset } = useForm<ImageInfo>({
    resolver: zodResolver(imageInfoSchema),
    values: {
      notes: image.note ?? "",
      link: image.link ?? "",
    },
  });

  const [updatePinboardImage, { isLoading }] = useUpdatePinboardImageMutation();
  const [cropImage] = useCropPinboardImageMutation();

  const handleSaveImageInfo = () => {
    handleSubmit(({ notes, link }) => {
      updatePinboardImage({
        id: pinboardId,
        imageId: image.id,
        note: notes,
        link,
      })
        .unwrap()
        .then(() => {
          imageDialogState.close();
        });
    })();
  };

  const [cropMode, setCropMode] = useState(false);
  const [crop, setCrop] = useState<Crop>(defaultCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const setCropModeAndReport = (newCropMode: boolean) => {
    setCropMode(newCropMode);
    onCropStateChange?.(image.id, newCropMode);
  };

  const [cropLoading, setCropLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const handleCrop = async () => {
    const imageEl = imgRef.current;
    if (!imageEl || !completedCrop) return;

    const scaleX = imageEl.naturalWidth / imageEl.width;
    const scaleY = imageEl.naturalHeight / imageEl.height;

    try {
      setCropLoading(true);
      await cropImage({
        id: pinboardId,
        imageId: image.id,
        width: Math.floor(completedCrop.width * scaleX),
        height: Math.floor(completedCrop.height * scaleY),
        top: Math.floor(completedCrop.y * scaleY),
        left: Math.floor(completedCrop.x * scaleX),
      }).unwrap();

      setCropModeAndReport(false);
    } catch {
      setCropLoading(false);
    }
  };

  const handleImageLoaded = () => {
    setCropLoading(false);
    setCrop(defaultCrop);
    gridDashContext?.forceRelayout();
  };

  useEffect(() => {
    if (noteMode) {
      gridDashContext?.forceRelayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nodeMode changed handled outside
  }, [image.note, image.link, gridDashContext]);

  const [deleteImage] = useDeletePinboardImageMutation();
  const { openDialog } = useConfirmDialog();
  const handleDeleteImage = async (callback?: () => void) => {
    openDialog({
      type: "confirm",
      mainColor: "error",
      title: t("pinboard.card.deleteCard", { type: "image" }),
      content: t("pinboard.image.deleteImageContent"),
      confirmButtonLabel: t("pinboard.card.deleteCard", { type: "image" }),
      icon: faTrashCan,
      onConfirm: async () => {
        try {
          await deleteImage({
            id: pinboardId,
            imageIds: [image.id],
          }).unwrap();

          callback?.();
        } catch {}
      },
    });
    return;
  };

  useEffect(() => {
    if (imageDialogState.isOpen) {
      reset();
    }
  }, [imageDialogState.isOpen, reset]);

  const img = (
    <img
      ref={imgRef}
      className="with-width-transition"
      src={pathFile + "/" + image.path}
      alt=""
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        ...(readOnly
          ? undefined
          : {
              pointerEvents: "none",
              userSelect: "none",
            }),
      }}
      onLoad={handleImageLoaded}
    />
  );

  return (
    <>
      <Box
        {...rest}
        sx={[
          {
            "& .pinboard-card-toolbar": {
              transition: "opacity 0.3s",
              opacity: 0,
            },
            "&:hover .pinboard-card-toolbar, & .pinboard-card-toolbar:focus-within":
              {
                opacity: 1,
              },
            "& .ReactCrop.ReactCrop--disabled > .ReactCrop__child-wrapper": {
              overflow: "initial",
            },
            "& .ReactCrop:not(.ReactCrop--disabled) > .ReactCrop__child-wrapper *":
              {
                pointerEvents: "none",
              },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {readOnly ? (
          img
        ) : (
          <ReactCrop
            disabled={!cropMode || cropLoading}
            crop={cropMode && !cropLoading ? crop : undefined}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={setCompletedCrop}
            ruleOfThirds
            style={{ width: "100%", display: "block" }}
          >
            <Button
              ref={openDetailButtonRef}
              className="non-interactable-when-dragging"
              disableRipple
              sx={{
                width: "100%",
                minWidth: 0,
                p: 0,
                borderRadius: 0,
                "&:focus-visible": {
                  outline: "2px solid black",
                },
              }}
              {...bindTrigger(imageDialogState)}
              onClick={(e) => {
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                bindTrigger(imageDialogState).onClick(e);
              }}
            >
              {img}
            </Button>
            {cropLoading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "#ffffff44",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </ReactCrop>
        )}

        {!cropMode && !readOnly && (
          <PinboardSectionCardToolbar
            className="with-pos-x-transition"
            type="image"
            position="absolute"
            top="calc(var(--cqw) / 2)"
            right="calc(var(--cqw) / 2)"
            ml="calc(var(--cqw) / 2)"
            activeColSpan={image.colSpan}
            onDelete={handleDeleteImage}
            onCrop={() => setCropModeAndReport(true)}
            onColSpanChanged={(colSpan) =>
              colSpan !== image.colSpan && onColSpanChange?.(image.id, colSpan)
            }
          />
        )}

        {noteMode && (
          <>
            <Typography
              variant="subtitle2"
              lineHeight={1.2}
              color="var(--mui-palette-text-secondary)"
              mt={image.note || image.link ? 0.5 : 0}
              sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {image.note}
            </Typography>
            {!!image.link && (
              <Typography
                component="a"
                href={image.link}
                target="_blank"
                variant="caption"
                color="var(--mui-palette-text-secondary)"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <span
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {image.link}
                </span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              </Typography>
            )}
          </>
        )}
      </Box>

      {cropMode && !cropLoading && (
        <Box
          position="absolute"
          top={-4}
          right={0}
          zIndex={1100}
          sx={{
            transform: "translateY(-100%)",
            "& .MuiButtonBase-root": {
              bgcolor: "var(--mui-palette-neutral-200)",
              "&:hover": { bgcolor: "var(--mui-palette-neutral-100)" },
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
            },
          }}
        >
          <FaIconButton
            icon={faCheck}
            title={t("common.save")}
            color="success"
            wrapperProps={{
              sx: { mr: 1 },
            }}
            onClick={handleCrop}
            tooltipBottomOffset={0}
          />
          <FaIconButton
            icon={faXmark}
            title={t("common.cancel")}
            color="error"
            onClick={() => {
              setCrop(defaultCrop);
              setCropModeAndReport(false);
            }}
            tooltipBottomOffset={0}
          />
        </Box>
      )}

      <SideDialog
        customHeader={<></>}
        customAction={
          <Button
            color="error"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => {
              handleDeleteImage(imageDialogState.close);
            }}
            sx={{
              lineHeight: "normal",
            }}
          >
            {t("common.delete")}
          </Button>
        }
        confirmButton={{
          title: t("common.save"),
          onClick: handleSaveImageInfo,
          loading: isLoading,
        }}
        cancelButton={{ title: t("common.cancel") }}
        closeOnConfirm={false}
        sx={{
          "& .MuiDialogContent-root": {
            p: 0,
          },
        }}
        {...bindDialog(imageDialogState)}
        onClose={isLoading ? undefined : bindDialog(imageDialogState).onClose}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <img
          src={pathFile + "/" + image.path}
          alt=""
          style={{ width: "100%", height: "auto" }}
        />

        <Box p={3}>
          <InputForm
            control={control}
            name="notes"
            label={t("pinboard.image.notes")}
            multiline
            row={5}
            fullWidth
            sx={{ mb: 3 }}
            textFieldProps={{ required: false }}
          />
          <InputForm
            control={control}
            name="link"
            label={t("pinboard.image.link")}
            fullWidth
            textFieldProps={{
              required: false,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon width="1rem" height="1rem" icon={faLink} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </SideDialog>
    </>
  );
};

export default memo(PinboardSectionImage);
