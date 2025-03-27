"use client";

import ButtonPrimary from "@/components/common/button-primary";
import ButtonSecondary from "@/components/common/button-secondary";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import { faArrowRotateLeft } from "@/lib/fas/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import React from "react";

export type AppDialogProp = {
  open: boolean;
  handleClickOpen: () => void;
  handleClose: () => void;
  handleAgree: () => void;
  name?: string;
  type?: "delete" | "reStore";
  deleteName?: string;
};

export function DialogConfirmProject({
  open,
  handleClose,
  handleAgree,
  name,
  type,
  deleteName,
}: AppDialogProp): React.JSX.Element {
  const t = useTranslations("projects");
  return (
    <Box>
      <React.Fragment>
        <Dialog
          onClose={() => {
            handleClose();
          }}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <DialogContent dividers sx={{}}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width={"52px"}
              height={"52px"}
              bgcolor={type === "reStore" ? "ButtonShadow" : "#FDEDED"}
              borderRadius={"16px"}
            >
              <FontAwesomeIcon
                icon={type === "reStore" ? faArrowRotateLeft : faTrashCan}
                style={{
                  fontSize: "28px",
                  color: type === "reStore" ? undefined : "#D32F2F",
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{ marginTop: "20px", marginBottom: "8px" }}
            >
              {type === "reStore"
                ? `${t("manage.restoreProject")}`
                : `${t("dialog.deletePs", { name: deleteName ?? "" })}`}
            </Typography>
            <Stack sx={{ flexDirection: "row", alignItems: "center" }}>
              <Typography variant="body2" sx={{ marginRight: "5px" }}>
                {type === "reStore"
                  ? `${t("message.youWantRestore")}`
                  : `${t("message.youWantDelete")}`}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ marginRight: "5px" }}
              >
                {` ${name} `}
              </Typography>
              <Typography variant="body2">?</Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <ButtonSecondary title={t("button.cancel")} onClick={handleClose} />
            <ButtonPrimary
              sx={{ background: type === "delete" ? "#D32F2F" : undefined }}
              label={
                type === "reStore"
                  ? `${t("button.restore")}`
                  : `${t("dialog.deletePs", { name: deleteName ?? "" })}`
              }
              onClick={handleAgree}
            />
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </Box>
  );
}
