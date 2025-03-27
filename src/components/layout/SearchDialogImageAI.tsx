import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Button, Tooltip, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@/lib/fas/pro-light-svg-icons";
import DragAndDrop from "@/components/common/drag-and-drop";
import { useUploadImageAISearchMutation } from "@/services/search";
import { paths } from "@/paths";
import { useAvciRouter } from "@/hooks/avci-router";

interface DialogProps {
  open: boolean;
  onClose: () => void;
}
export default function SearchDialogImageAI({ onClose, open }: DialogProps) {
  const t = useTranslations("common");
  const router = useAvciRouter();
  const [uploadImages] = useUploadImageAISearchMutation();

  const handleAddFromFile = async (file: File) => {
    try {
      await uploadImages({
        file: file,
      })
        .unwrap()
        .then((res) => {
          router.push(`${paths.imageSearchResult}/${res.key}`);
          onClose();
        });
    } catch {}
  };
  const handleUploadImageDragDrop = async (files: File[]) => {
    await handleAddFromFile(files[0]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          style: { backgroundColor: "transparent" },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          boxShadow: "4px 6px 10px 4px #00000014",
          minWidth: "600px",
          minHeight: "363px",
        },
        style: {
          position: "absolute",
          top: "62px",
          right: "95px",
          margin: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          padding: "30px 30px 24px 30px",
        }}
      >
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
        <Typography
          fontSize={"18px"}
          color={"#000"}
          fontWeight={"500"}
          justifyItems={"center"}
        >
          {t("search_dialog_title")}
        </Typography>
      </DialogTitle>
      <DialogContent
        className="123"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <DragAndDrop
          variant="contained"
          type="image"
          icon={"large"}
          onFilesSelected={handleUploadImageDragDrop}
          maxFile={1}
          instructionText={t.rich("textDrag")}
          sx={{
            width: "100%",
            minHeight: "258px",
            "& .DnD-InstructionText": {
              mx: "auto",
              textAlign: "center",
              whiteSpace: "pre-line",
              fontSize: "12px",
              fontWeight: 500,
              color: "#969696",
            },
          }}
        />
      </DialogContent>
      {/* <DialogActions></DialogActions> */}
    </Dialog>
  );
}
