"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { ReactElement } from "react";

export type AppDialogProp = {
  dialogTitle?: string;
  dialogContentText?: string | ReactElement;
  open: boolean;
  handleClickOpen: () => void;
  handleClose: () => void;
  handleAgree: () => void;
};

export function AppDialog(Props: AppDialogProp): React.JSX.Element {
  return (
    <Box>
      <React.Fragment>
        <Dialog
          open={Props.open}
          onClose={Props.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{Props.dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {Props.dialogContentText}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                Props.handleClose();
              }}
            >
              Disagree
            </Button>
            <Button
              onClick={() => {
                Props.handleClose();
                Props.handleAgree();
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </Box>
  );
}
