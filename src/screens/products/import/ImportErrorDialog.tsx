import { faXmark } from "@/lib/fas/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import ImportErrorTable from "./importErrorTable/ImportErrorTable";

interface DialogProps {
  data?: string;
  open: boolean;
  onClose: () => void;
}

const ImportErrorDialog = ({ open, onClose, data }: DialogProps) => {
  const t = useTranslations("common");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          boxShadow: "4px 6px 10px 4px #00000014",
          width: "80%",
          maxWidth: "1200px",
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
      <Typography
        variant="h5"
        sx={{
          padding: "16px 30px",
          fontSize: "22px",
          fontWeight: 600,
          color: "#000000DE",
        }}
      >
        {t("import_error")}
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
      <Box
        sx={{
          padding: "16px 30px",
          minHeight: "450px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          rowGap: "12px",
          overflow: "auto",
        }}
      >
        <ImportErrorTable data={data} />
      </Box>
    </Dialog>
  );
};

export default ImportErrorDialog;
