import { pathFile } from "@/config/api";
import {
  Backdrop,
  Box,
  BoxProps,
  Button,
  Divider,
  Fade,
  Modal,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import DragAndDrop, { DragAndDropProps } from "./drag-and-drop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@/lib/fas/pro-light-svg-icons";
import { faCircleXmark } from "@/lib/fas/pro-solid-svg-icons";
import ImageWithSkeleton from "./ImageWithSkeleton";

export interface ImageDragAndDropProps extends BoxProps {
  initFile: {
    id: string;
    path: string;
    thumbnail?: string;
  }[];
  files: File[];
  setFiles: (e: File[]) => void;
  maxFile?: number;
  currentMaxFile: number;
  maxSize?: number;
  deleteFile: (idImg: string) => void | Promise<void>;
  disabled?: boolean;
  dndProps?: Omit<
    DragAndDropProps<any>,
    "onFilesSelected" | "type" | "maxFile" | "maxSize" | "disabled"
  >;
  readonly?: boolean;
  previewMode?: "normal" | "product";
}

export function ImageDragAndDrop({
  files,
  setFiles,
  initFile,
  maxFile = 4,
  currentMaxFile = 4,
  maxSize = 20,
  deleteFile,
  disabled,
  dndProps,
  readonly = false,
  previewMode = "product",
  ...rest
}: ImageDragAndDropProps): React.JSX.Element {
  const t = useTranslations("filesUpload");
  const tCommon = useTranslations("common");

  const handleFile = (fileList: File[]) => {
    setFiles([...files, ...fileList]);
  };

  const removeImage = (index: number) => {
    setFiles(files?.filter((_, i) => i !== index));
  };

  const [dialogImageOpened, setDialogImageOpened] = useState(false);
  const [curImage, setCurImage] = useState<string | File>();
  const handleViewImage = (file: { path: string } | { file: File }) => {
    setDialogImageOpened(true);
    setCurImage("path" in file ? file.path : file.file);
  };

  const allItems = [...files?.map((file, i) => ({ file, id: i })), ...initFile];
  const countRest = allItems.length > 4 ? allItems.length - 4 : 0;

  return (
    <>
      <Box
        {...rest}
        sx={[
          {
            width: "fit-content",
            display: !readonly ? "grid" : "flex",
            gridTemplateColumns: "repeat(5, 136px)",
            rowGap: "12px",
            columnGap: "12px",
            mt: 2,
          },
          ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
        ]}
      >
        {allItems?.map((file, index) => (
          <Box
            key={file.id}
            sx={{
              position: "relative",
              "&:hover": {
                ".delete-image": {
                  opacity: 1,
                },
              },
            }}
          >
            <Button
              className="ImgDnD-ImgContainer"
              onClick={() => handleViewImage(file)}
              sx={{
                display: !readonly ? "block" : index < 5 ? "block" : "none",
                height: 136,
                aspectRatio: 1,
                p: 0,
                position: "relative",
                overflow: "hidden",
                "&:hover .marks-box": { opacity: 0.5 },
                "&:hover .marks-box-1": { opacity: 1 },
                "&:hover .marks-box-2": { opacity: 1 },
                "&:hover": {
                  ".tool-tip-image": {
                    opacity: 1,
                  },
                },
              }}
            >
              <ImageWithSkeleton
                className="ImgDnD-Img"
                sx={{
                  display: "block",
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  borderRadius: "4px",
                }}
                alt=""
                src={
                  "path" in file
                    ? `${pathFile}/${file.thumbnail || file.path}`
                    : URL.createObjectURL(file.file)
                }
              />
              <Box
                className="tool-tip-image"
                sx={{
                  transition: "all 0.3s",
                  opacity: 0,
                  background:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 99.33%)",
                  overflow: "hidden",
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  borderRadius: "inherit",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontSize: "44px",
                  fontWeight: 500,
                  pointerEvents: "none",
                  background:
                    readonly && index === 4 ? "rgba(0, 0, 0, 0.35)" : "unset",
                }}
              >
                {readonly && index === 4 ? `+${countRest}` : null}
              </Box>
            </Button>
            <Box
              className="delete-image"
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                opacity: 0,
                transition: "all 0.3s",
              }}
            >
              {!readonly && (
                <Button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if ("file" in file) {
                      removeImage(file.id);
                    } else {
                      deleteFile(file.id);
                    }
                  }}
                  sx={{
                    color: "white",
                    minWidth: "0px",
                    padding: "4px",
                    borderRadius: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    style={{
                      fontSize: "20px",
                      color: "#fff",
                      borderRadius: "9999px",
                      boxShadow: "1px 2px 5px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                </Button>
              )}
            </Box>
          </Box>
        ))}

        {!readonly && files.length + initFile.length < maxFile ? (
          <DragAndDrop
            className="DnD-DragDrop"
            type="image"
            maxSize={maxSize}
            maxFile={currentMaxFile}
            instructionText={t.rich("textInstructionDefault")}
            onFilesSelected={handleFile}
            disabled={disabled}
            {...dndProps}
            sx={[
              {
                minHeight: "136px",
                minWidth: "136px",
                aspectRatio: "1/1",
                flex: 1,
                "& .wrap-content": {
                  mt: "4px",
                },
              },
              ...(Array.isArray(dndProps?.sx) ? dndProps?.sx : [dndProps?.sx]),
            ]}
          />
        ) : (
          <></>
        )}
      </Box>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={dialogImageOpened}
        onClose={() => setDialogImageOpened(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { sx: { zIndex: -1 } } }}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Fade in={dialogImageOpened}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "min(660px, 90vh)",
              background: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 30px",
                alignItems: "center",
                height: "60px",
              }}
            >
              <Typography
                sx={{
                  fontSize: "22px",
                  lineHeight: "28px",
                  fontWeight: 600,
                  color: "#000000DE",
                }}
              >
                {previewMode === "product"
                  ? tCommon("product_image_preview")
                  : tCommon("image_preview")}
              </Typography>
              <Tooltip title={tCommon("close")}>
                <Button
                  variant="text"
                  onClick={() => setDialogImageOpened(false)}
                  sx={{
                    color: "#A5A2AD",
                    padding: "10px",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#242424",
                    },
                    borderRadius: "9999px",
                    minWidth: "0px",
                    mr: "-10px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    style={{ fontSize: "18px", width: "18px", height: "18px" }}
                  />
                </Button>
              </Tooltip>
            </Box>
            <Divider />
            <Box
              sx={{
                height: "100%",
                display: "flex",
                overflow: "auto",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  width: "60vw",
                  maxWidth: "603px",
                  background: "#0000001F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: "min(50px, min(5vw, 10vh))",
                }}
              >
                <ImageWithSkeleton
                  cacheImages
                  fillAvailable
                  sx={{
                    display: "block",
                    borderRadius: "min(16px, min(2vw, 2vh))",
                  }}
                  src={
                    typeof curImage === "string"
                      ? pathFile + "/" + curImage
                      : curImage && URL.createObjectURL(curImage)
                  }
                />
              </Box>

              {files.length + initFile.length > 1 && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Box
                    sx={{
                      width: "25%",
                      maxWidth: "201px",
                      display: "flex",
                      p: 2,
                      overflow: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        width: "130px",
                        display: "flex",
                        justifyContent: "space-between",
                        height: "auto",
                        my: "auto",
                        flexWrap: "wrap",
                        rowGap: "16px",
                      }}
                    >
                      {[
                        ...files?.map((file, i) => ({ file, id: i })),
                        ...initFile,
                      ]?.map((file) => (
                        <Button
                          className="ImgDnD-ImgContainer"
                          key={file.id}
                          onClick={() =>
                            setCurImage("path" in file ? file.path : file.file)
                          }
                          sx={{
                            aspectRatio: 1,
                            width: "57px",
                            height: "57px",
                            minWidth: "0px",
                            p: 0,
                            position: "relative",
                            "&:hover .marks-box": { opacity: 0.5 },
                            "&:hover .marks-box-1": { opacity: 1 },
                            "&:hover .marks-box-2": { opacity: 1 },
                            border:
                              ("path" in file ? file.path : file.file) ===
                              curImage
                                ? "2px solid #000"
                                : "2px solid transparent",
                          }}
                        >
                          <ImageWithSkeleton
                            className="ImgDnD-Img"
                            sx={{
                              display: "block",
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                              borderRadius: "4px",
                              transition: "transform 0.25s",
                              transform: `scale(${
                                ("path" in file ? file.path : file.file) ===
                                curImage
                                  ? "0.9"
                                  : "1"
                              })`,
                            }}
                            alt=""
                            draggable={false}
                            src={
                              "path" in file
                                ? `${pathFile}/${file.thumbnail || file.path}`
                                : URL.createObjectURL(file.file)
                            }
                          />
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}
