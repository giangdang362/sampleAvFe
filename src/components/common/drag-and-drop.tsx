import Image from "next/image";
import {
  Backdrop,
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IMAGE_FORMATS,
  UploadFileOptions,
  useGetUploadFiles,
  useValidateFiles,
} from "@/hooks/upload-files";
import { Active, useDroppable } from "@dnd-kit/core";

export const DROPPABLE_ID_PREFIX = "droppable-";

export interface DragAndDropProps<CustomData extends unknown>
  extends Omit<ButtonProps, "children" | "variant" | "type">,
    Partial<UploadFileOptions> {
  variant?: "outlined" | "contained";
  icon?: "small" | "large" | "none" | React.ReactNode;
  instructionText?: string | React.ReactNode;
  informationText?:
    | string
    | React.ReactNode
    | ((
        info: UploadFileOptions & {
          formats: "any" | "" | string[];
        },
      ) => string | React.ReactNode);
  onFilesSelected?: (files: File[]) => void;
  loading?: boolean;
  customDroppableId?: string;
  validateCustomData?: (data: unknown) => data is CustomData;
  onCustomDataDropped?: (data: CustomData) => void;
}

function DragAndDrop<CustomData>({
  variant = "outlined",
  icon = "small",
  instructionText,
  informationText,
  type = "any",
  maxFile,
  maxSize = 20,
  onFilesSelected,
  loading,
  customDroppableId,
  validateCustomData,
  onCustomDataDropped,
  disabled,
  sx,
  ...rest
}: DragAndDropProps<CustomData>) {
  let bgColor, bgFocusColor, borderColor;
  switch (variant) {
    case "outlined":
      bgColor = undefined;
      bgFocusColor =
        "rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))";
      borderColor = "var(--mui-palette-divider)";
      break;
    case "contained":
      bgColor = "var(--mui-palette-primary-100)";
      bgFocusColor = "var(--mui-palette-primary-200)";
      borderColor = "var(--mui-palette-primary-300)";
      break;
  }

  const t = useTranslations("filesUpload");
  const validateFiles = useValidateFiles();
  const getUploadFiles = useGetUploadFiles();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFiles = (files: FileList) => {
    onFilesSelected?.(Array.from(files));
  };

  const handleDrop: React.DragEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    if (!isDraggingOver) return;
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (validateFiles(files, { maxFile, maxSize, type })) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    getUploadFiles(handleFiles, {
      maxFile,
      maxSize,
      type,
    });
  };

  const { setNodeRef, active, isOver } = useDroppable({
    disabled: !customDroppableId,
    id: DROPPABLE_ID_PREFIX + customDroppableId,
    data: { maxFile, maxSize, type },
  });

  const isCustomDraggingOver =
    isOver &&
    (active && validateCustomData
      ? validateCustomData(active.data.current)
      : true);

  const activeDataRef = useRef<Active>();
  const validateDataRef = useRef(validateCustomData);
  validateDataRef.current = validateCustomData;
  useEffect(() => {
    if (active && isOver) {
      activeDataRef.current = active;
    } else if (!isOver) {
      if (
        !active &&
        activeDataRef.current &&
        (validateDataRef.current
          ? validateDataRef.current(activeDataRef.current.data.current)
          : true)
      ) {
        onCustomDataDropped?.(activeDataRef.current.data.current as CustomData);
      } else {
        activeDataRef.current = undefined;
      }
    }
  }, [active, isOver]);

  return (
    <Button
      ref={customDroppableId ? setNodeRef : undefined}
      disableRipple
      disabled={disabled || loading}
      {...rest}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: `1px dashed ${borderColor}`,
          borderRadius: 0.5,
          pt: 3.5,
          px: 2,
          pb: 3,
          bgcolor:
            isDraggingOver || isCustomDraggingOver ? bgFocusColor : bgColor,
          position: "relative",
          "&:hover, &:focus-visible": {
            bgcolor: bgFocusColor,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setIsDraggingOver(true);
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault();

        if (
          e.relatedTarget &&
          e.currentTarget.contains(e.relatedTarget as Node)
        ) {
          return;
        }

        setIsDraggingOver(false);
      }}
    >
      {icon !== "none" &&
        (icon === "small" ? (
          <UploadFileIcon
            className="DnD-Icon"
            sx={{
              color: !disabled ? "var(--mui-palette-text-disabled)" : undefined,
            }}
          />
        ) : icon === "large" ? (
          <Image
            className="DnD-Icon"
            src="/assets/drag-and-drop.svg"
            width={48}
            height={48}
            alt="Drag and drop image"
            style={{ opacity: disabled ? 0.5 : 1 }}
            draggable="false"
          />
        ) : (
          icon
        ))}

      <Box className="wrap-content" mt={icon === "none" ? 0 : 2}>
        <Typography
          className="DnD-InstructionText"
          sx={{ fontSize: 14, fontWeight: 500 }}
          textAlign={"center"}
        >
          {instructionText ?? t.rich("instruction")}
        </Typography>

        {!!informationText && (
          <Typography
            className="DnD-InformationText"
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: !disabled ? "GrayText" : undefined,
            }}
            textAlign={"center"}
          >
            {typeof informationText === "function"
              ? informationText({
                  maxSize,
                  maxFile,
                  type,
                  formats: type === "image" ? IMAGE_FORMATS : "any",
                })
              : informationText}
          </Typography>
        )}
      </Box>

      <Backdrop
        open={!!loading}
        sx={{
          position: "absolute",
          bgcolor: "var(--mui-palette-action-disabledBackground)",
        }}
      >
        <CircularProgress />
      </Backdrop>
    </Button>
  );
}

export default DragAndDrop;
