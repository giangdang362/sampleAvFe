import { useGetProductStatusQuery } from "@/services/projectMaterialSchedule";
import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fas/pro-regular-svg-icons";
import { useTranslations } from "next-intl";
import TimeAgo from "react-timeago";
import { pathFile } from "@/config/api";

interface StatusProps {
  productId: string;
  handleClose: () => void;
  open: boolean;
}

const StatusHistory = ({ productId, handleClose, open }: StatusProps) => {
  const { data: logStatus } = useGetProductStatusQuery({
    productId: productId,
  });

  const renderStatus = (statusItem: string) => {
    switch (statusItem) {
      case "sample_requested":
        return { name: t("sample_requested"), color: "#D32F2F" };
      case "sample_received":
        return { name: t("sample_received"), color: "#D32F2F" };
      case "quote_requested":
        return { name: t("quote_requested"), color: "#D32F2F" };
      case "quote_received":
        return { name: t("quote_received"), color: "#D32F2F" };
      case "internal_approved":
        return { name: t("internal_approved"), color: "#EF6C00" };
      case "client_approved":
        return { name: t("client_approved"), color: "#2E7D32" };
      case "reject_by_client":
        return { name: t("reject_by_client"), color: "rgba(0, 0, 0, 0.6)" };
      default:
        return { name: "---", color: "black" };
    }
  };

  const t = useTranslations("projects");

  return (
    <Dialog
      onClose={() => {}}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      {/* <form onSubmit={handleSubmit(onSubmit)}> */}
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {t("dialog.history")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          handleClose();
        }}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Typography
          sx={{ fontSize: "14px", color: "GrayText", marginBottom: 3 }}
        >
          {t("statusHistory.historyDes")}
        </Typography>

        <Stack spacing={1}>
          {logStatus &&
            logStatus.data.toReversed().map((item) => (
              <>
                <Stack spacing={1} direction={"row"}>
                  <Avatar
                    sx={{ width: "24px", height: "24px" }}
                    src={`${pathFile}/${item.modifier?.avatar}`}
                  />
                  <Stack spacing={1}>
                    <Stack spacing={1} direction={"row"} alignItems={"center"}>
                      <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
                        {item.modifier.firstName}
                      </Typography>
                      <TimeAgo
                        date={item.createdAt}
                        component={Typography}
                        minPeriod={60}
                        sx={{ fontSize: "12px", color: "GrayText" }}
                      />
                    </Stack>
                    <Stack
                      key={item.id}
                      direction={"row"}
                      alignItems={"center"}
                      spacing={0.7}
                    >
                      <Box
                        bgcolor={renderStatus(item.oldStatus).color}
                        borderRadius={"4px"}
                        padding={"4px 8px"}
                      >
                        <Typography
                          fontSize={"14px"}
                          sx={{ textDecoration: "line-through" }}
                          color={"#FFFFFF"}
                        >
                          {renderStatus(item.oldStatus).name}
                        </Typography>
                      </Box>
                      <FontAwesomeIcon
                        style={{ fontSize: "16px" }}
                        icon={faArrowRight}
                      />
                      <Box
                        bgcolor={renderStatus(item.newStatus).color}
                        borderRadius={"4px"}
                        padding={"4px 8px"}
                      >
                        <Typography fontSize={"14px"} color={"#FFFFFF"}>
                          {renderStatus(item.newStatus).name}
                        </Typography>
                      </Box>
                      <Typography fontSize={"14px"}>{item.reason}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </>
            ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default StatusHistory;
