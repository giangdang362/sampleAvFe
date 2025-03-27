import { FileDragAndDrop } from "@/components/common/app-upload-file";
import ButtonPrimary from "@/components/common/button-primary";
import { baseApi } from "@/config/api";
import { faXmark } from "@/lib/fas/pro-light-svg-icons";
import { faUpload } from "@/lib/fas/pro-solid-svg-icons";
import { useAppSelector } from "@/store";
import { useSelectToken } from "@/store/features/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Dialog,
  Divider,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const ImportDialog = ({ open, onClose }: DialogProps) => {
  const t = useTranslations("common");
  const [files, setFiles] = useState<File[]>([]);
  const token = useAppSelector(useSelectToken);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);

  const handleUploadExcelFile = async () => {
    if (!token) {
      return;
    }
    const formData = new FormData();
    formData.append("file", files[0]);
    const xhr = new XMLHttpRequest();
    setLoaded(0);
    setTotal(files[0].size);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setLoaded(event.loaded);
        setTotal(event.total);
      }
    });
    setIsLoading(true);
    xhr.open("POST", `${baseApi}/import`, true);
    // xhr.setRequestHeader("Content-Type", "undefined");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.addEventListener("loadend", () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          // setIsSuccess(true);
        } else {
          // setIsSuccess(false);
        }
        setIsLoading(false);
      }
    });
    xhr.send(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          boxShadow: "4px 6px 10px 4px #00000014",
          width: "80%",
          maxWidth: "660px",
          overflow: "unset",
        },
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        },
      }}
    >
      {/* 1st step - import */}
      {!isLoading && (
        <>
          <Typography
            variant="h5"
            sx={{
              padding: "16px 30px",
              fontSize: "22px",
              fontWeight: 600,
              color: "#000000DE",
            }}
          >
            {t("import_data")}
          </Typography>
          <Divider />
          <Tooltip title={t("close")}>
            <Button
              variant="text"
              onClick={onClose}
              sx={{
                color: "#A5A2AD",
                padding: "10px",
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                "&:hover": {
                  color: "#242424",
                },
                borderRadius: "9999px",
                minWidth: "0px",
              }}
            >
              <FontAwesomeIcon
                icon={faXmark}
                style={{ fontSize: "18px", width: "18px", height: "18px" }}
              />
            </Button>
          </Tooltip>
          {/* Drag drop */}
          <Box
            sx={{
              padding: "24px 30px",
            }}
          >
            {files.length > 0 ? (
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#191919",
                }}
              >
                {t("make_sure_excel_file")}
              </Typography>
            ) : null}
            <FileDragAndDrop
              isExcelFile={true}
              files={files}
              addFiles={(newFiles) =>
                setFiles((prev) => [...prev, ...newFiles])
              }
              deleteFile={(file) =>
                setFiles((prev) => prev.filter((f) => f !== file))
              }
              maxFile={1}
              sx={{
                width: "100%",
                height: "136px",
              }}
              informationText={t("import_text_inf")}
            />
          </Box>
          <Divider />
          <Box
            sx={{
              padding: "16px 30px",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <ButtonPrimary
              variant="outlined"
              label={t("cancel")}
              onClick={() => {
                onClose();
              }}
            />
            <ButtonPrimary
              onClick={handleUploadExcelFile}
              disabled={files.length > 0 ? false : true}
              startIcon={
                <FontAwesomeIcon icon={faUpload} style={{ fontSize: "16px" }} />
              }
              label={t("import")}
            />
          </Box>
        </>
      )}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "80%",
              maxWidth: "320px",
              py: "42px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: "20px",
                fontSize: "22px",
                fontWeight: 600,
                color: "#191919",
                textAlign: "center",
              }}
            >
              {t("uploading_data")}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(loaded / total) * 100}
              sx={{
                height: 10,
                borderRadius: "40px",
                backgroundColor: "#0000001F",
                "& span": {
                  borderRadius: "40px",
                },
              }}
            />
            <Typography
              sx={{
                mt: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#00000061",
                textAlign: "center",
              }}
            >
              {`${(loaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB ...`}
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              mb: "20px",
              fontSize: "16px",
              fontWeight: 400,
              color: "#00000099",
              textAlign: "center",
            }}
          >
            {t("do_not_close")}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
};

export default ImportDialog;
