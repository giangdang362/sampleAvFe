"use client";

import { faXmark } from "@/lib/fas/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

export type Props = {
  title?: string;
  open: boolean;
  close: () => void;
  confirm: () => void;
  cancelTitle?: string;
  confirmTitle?: string;
  children: React.ReactNode;
};

export function ConfirmDialog(props: Props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.close}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ "& .MuiDialog-paper": { maxHeight: "50vh" } }}
    >
      <DialogTitle
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography fontWeight={500} fontSize="16px" id="alert-dialog-title">
          {props.title}
        </Typography>
        <Typography
          sx={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={props.close}
        >
          <FontAwesomeIcon icon={faXmark} />
        </Typography>
      </DialogTitle>
      <DialogContent dividers>{props.children}</DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            props.close();
          }}
        >
          {props.cancelTitle ?? "Disagree"}
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            props.close();
            props.confirm();
          }}
          autoFocus
        >
          {props.confirmTitle ?? "Agree"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
