import { faFileLines, faImage } from "@/lib/fas/pro-light-svg-icons";
import { faXmark } from "@/lib/fas/pro-light-svg-icons/faXmark";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { isImage } from "@/utils/is-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, BoxProps, IconButton, Tooltip, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useKeyGen } from "react-key-from-object";
import { useConfirmDialog } from "./UserDialog";
import DragAndDrop, { DragAndDropProps } from "./drag-and-drop";
import { pathFile } from "@/config/api";

type ExternalFile = { id: string; name: string; path: string };

export interface FileDragAndDropProps<T extends File | ExternalFile>
  extends Omit<DragAndDropProps<any>, "onFilesSelected" | "type" | "size"> {
  files: T[];
  addFiles: (e: File[]) => void | Promise<void>;
  deleteFile: (file: T) => void | Promise<void>;
  containerProps?: BoxProps;
  size?: "normal" | "compact";
  readonly?: boolean;
  isExcelFile?: boolean;
}

export function FileDragAndDrop<T extends File | ExternalFile>({
  files,
  addFiles,
  deleteFile,
  maxFile,
  containerProps,
  informationText,
  size = "normal",
  readonly = false,
  isExcelFile = false,
  sx,
  ...rest
}: FileDragAndDropProps<T>): React.JSX.Element {
  const keyGen = useKeyGen();
  const t = useTranslations("filesUpload");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFiles = async (files: File[]) => {
    if (!files.length) return;

    setIsLoading(true);
    await addFiles(files);
    setIsLoading(false);
  };

  const { openDialog } = useConfirmDialog();
  const handleDeleteFile = (file: File | ExternalFile) => {
    if ("id" in file) {
      openDialog({
        type: "confirm",
        mainColor: "error",
        title: t("deleteFile"),
        content: tCommon.rich("deleteContent", { name: file.name }),
        confirmButtonLabel: t("deleteFile"),
        icon: faTrashCan,
        onConfirm: async () => {
          await deleteFile(file as T);
        },
      });
    } else {
      deleteFile(file as T);
    }
  };

  return (
    <Box {...containerProps}>
      {!readonly && (maxFile === undefined || files.length < maxFile) && (
        <DragAndDrop
          type={isExcelFile ? "excel" : "any"}
          maxSize={50}
          loading={isLoading}
          onFilesSelected={handleAddFiles}
          {...rest}
          maxFile={maxFile !== undefined ? maxFile - files.length : undefined}
          informationText={
            typeof informationText === "function"
              ? (info) => informationText({ ...info, maxFile })
              : informationText
          }
          icon={size === "compact" ? "none" : undefined}
          sx={[
            {
              p: 1.5,
              "& .DnD-InstructionText":
                size === "compact"
                  ? {
                      color: "var(--mui-palette-text-disabled)",
                    }
                  : undefined,
              "& .MuiCircularProgress-root":
                size === "compact"
                  ? {
                      width: "20px !important",
                      height: "20px !important",
                    }
                  : undefined,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        />
      )}

      {files?.map((file, i) => (
        <TypeFileRender
          key={"id" in file ? file.id : keyGen.getKey(file)}
          fileName={file.name}
          onDelete={() => handleDeleteFile(file)}
          isLoading={isLoading}
          mt={i === 0 ? 1.5 : 1}
          fileUrl={"path" in file ? `${pathFile}/${file.path}` : undefined}
          readonly={readonly}
        />
      ))}
    </Box>
  );
}

interface TypeFileRenderProps extends BoxProps {
  isLoading?: boolean;
  fileName: string;
  onDelete: () => void;
  fileUrl?: string;
  readonly?: boolean;
}

const TypeFileRender = ({
  isLoading,
  fileName,
  onDelete,
  fileUrl,
  readonly,
  sx,
  ...rest
}: TypeFileRenderProps) => {
  const type = isImage(fileName) ? "image" : "doc";

  return (
    <Box
      {...rest}
      onClick={() => {
        if (fileUrl) {
          window.location.href = fileUrl;
        }
      }}
      sx={[
        {
          cursor: fileUrl ? "pointer" : undefined,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          p: 0.25,
          pl: 1.5,
          "& .delete-btn": {
            transition: "opacity 0.3s",
            opacity: 0,
          },
          transition: "background-color 0.3s",
          "&:hover": {
            backgroundColor: "var(--mui-palette-action-hover)",
            ".delete-btn": {
              opacity: 1,
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FontAwesomeIcon
        icon={type === "doc" ? faFileLines : faImage}
        style={{
          width: 16,
          height: 16,
          color: "GrayText",
          marginRight: "8px",
        }}
      />

      <Tooltip title={fileName}>
        <Typography variant="body2" noWrap flex={1} mr={1}>
          {fileName}
        </Typography>
      </Tooltip>
      {!readonly && (
        <IconButton
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isLoading}
        >
          <FontAwesomeIcon
            icon={faXmark}
            style={{ fontSize: "16px", color: "#D32F2F" }}
          />
        </IconButton>
      )}
    </Box>
  );
};
