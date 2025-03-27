import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Slide,
} from "@mui/material";
import React, { SyntheticEvent } from "react";
import FaIconButton from "./FaIconButton";
import { faXmark } from "@/lib/fas/pro-regular-svg-icons";
import { TransitionProps } from "@mui/material/transitions";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";

export interface SideDialogProps extends Omit<DialogProps, "onClose"> {
  title?: string;
  customHeader?: React.ReactElement;
  confirmButton?: LoadingButtonProps;
  cancelButton?: ButtonProps;
  advanceButton?: LoadingButtonProps;
  closeOnConfirm?: boolean;
  customAction?: React.ReactElement;
  onClose?: (event: SyntheticEvent<Element, Event>) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const SideDialog: React.FC<SideDialogProps> = ({
  title,
  customHeader,
  confirmButton,
  cancelButton,
  advanceButton,
  closeOnConfirm = true,
  customAction,
  children,
  onClose,
  sx,
  ...rest
}) => {
  return (
    <Dialog
      fullScreen
      TransitionComponent={Transition}
      {...rest}
      onClose={onClose}
      sx={[
        {
          "& .MuiDialog-container": {
            justifyContent: "flex-end",
            "& .MuiPaper-root": {
              width: "min(417px, 100vw)",
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {customHeader ??
        (title !== undefined && (
          <Box display="flex" alignItems="center">
            <DialogTitle sx={{ flex: 1 }}>{title}</DialogTitle>
            <FaIconButton
              title={"close"}
              icon={faXmark}
              wrapperProps={{
                sx: {
                  mr: 1.5,
                },
              }}
              onClick={onClose}
            />
          </Box>
        ))}

      <DialogContent dividers>{children}</DialogContent>

      {!!(cancelButton || confirmButton || customAction) && (
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Box>{customAction}</Box>

          <Box display="flex" gap={1}>
            {cancelButton && (
              <Button
                variant="outlined"
                {...cancelButton}
                title={undefined}
                onClick={(e) => {
                  onClose?.(e);
                  cancelButton.onClick?.(e);
                }}
              >
                {cancelButton.title}
              </Button>
            )}
            {confirmButton && (
              <LoadingButton
                variant="contained"
                {...confirmButton}
                title={undefined}
                onClick={(e) => {
                  closeOnConfirm && onClose?.(e);
                  confirmButton.onClick?.(e);
                }}
              >
                {confirmButton.title}
              </LoadingButton>
            )}
            {advanceButton && (
              <LoadingButton
                variant="outlined"
                {...advanceButton}
                title={undefined}
                onClick={(e) => {
                  // onClose?.(e);
                  advanceButton.onClick?.(e);
                }}
              >
                {advanceButton.title}
              </LoadingButton>
            )}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default SideDialog;
