"use client";

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Theme,
  alpha,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
  useState,
} from "react";

export type DialogOptions = {
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  icon?: IconProp;
  mainColor?: Omit<ButtonProps["color"], "inherit">;
  iconColor?: string | ((theme: Theme) => string);
  dialogProps?: Omit<DialogProps, "open" | "onClose">;
} & (
  | {
      type: "confirm";
      confirmButtonLabel?: string;
      cancelButtonLabel?: string;
      onConfirm?: () => (void | boolean) | Promise<void | boolean>;
    }
  | {
      type: "info";
      okButtonLabel?: string;
    }
);

type ContextType = {
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<ContextType>({
  openDialog: () => {},
  closeDialog: () => {},
});

type OpenDialogAction = {
  type: "open";
  payload: DialogOptions;
};
type CloseDialogAction = { type: "close" };
type ResetDialogAction = { type: "reset" };
type Actions = OpenDialogAction | CloseDialogAction | ResetDialogAction;
type State = { open: boolean } & DialogOptions;

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case "open":
      return { ...state, ...action.payload, open: true };
    case "close":
      return { ...state, open: false };
    case "reset":
      return initialState;
    default:
      return state;
  }
};

const initialState: State = {
  open: false,
  title: "",
  content: "",
  type: "info",
};

export const UserDialogProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const t = useTranslations("common");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [value, dispatch] = useReducer(reducer, initialState);
  const {
    open,
    title,
    content,
    type,
    icon,
    mainColor = "primary",
    iconColor,
    dialogProps,
  } = value;
  const iconSize = 25;

  const openDialog = (options: DialogOptions) =>
    dispatch({ type: "open", payload: options });
  const closeDialog = () => dispatch({ type: "close" });
  const handleExited = () => {
    dispatch({ type: "reset" });
    setConfirmLoading(false);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog
        open={open}
        onClose={confirmLoading ? undefined : closeDialog}
        maxWidth="sm"
        {...dialogProps}
        TransitionProps={{
          onExited: handleExited,
          ...dialogProps?.TransitionProps,
        }}
      >
        {!!icon && (
          <Box
            display="flex"
            paddingX={3}
            paddingTop={3}
            justifyContent={type === "confirm" ? undefined : "center"}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              color={iconColor || `${mainColor}.main`}
              bgcolor={(theme) =>
                alpha(
                  iconColor
                    ? typeof iconColor === "string"
                      ? iconColor
                      : iconColor(theme)
                    : (
                        theme.palette[
                          (mainColor as keyof typeof theme.palette) ?? "primary"
                        ] as any
                      )?.main,
                  0.1,
                )
              }
              width={(theme) =>
                `calc(${iconSize}px + ${theme.spacing(1.7)} * 2)`
              }
              borderRadius={2}
              sx={{ aspectRatio: 1 }}
            >
              <FontAwesomeIcon
                icon={icon}
                style={{ width: iconSize, height: iconSize }}
              />
            </Box>
          </Box>
        )}
        <DialogTitle
          textAlign={type === "confirm" ? undefined : "center"}
          sx={{ textTransform: "capitalize", px: 3, pb: 1 }}
        >
          {title}
        </DialogTitle>

        <DialogContent>
          {typeof content === "string" ? (
            <DialogContentText
              textAlign={type === "confirm" ? undefined : "center"}
            >
              {content}
            </DialogContentText>
          ) : (
            content
          )}
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid",
            borderColor: "var(--mui-palette-divider)",
          }}
        >
          <Button
            onClick={closeDialog}
            variant="outlined"
            size="medium"
            disabled={confirmLoading}
          >
            {type === "confirm"
              ? value.cancelButtonLabel ?? t("cancel")
              : value.okButtonLabel ?? t("ok")}
          </Button>

          {type === "confirm" && (
            <LoadingButton
              loading={confirmLoading}
              onClick={() => {
                const result = value.onConfirm?.();
                if (typeof result !== "boolean" && result) {
                  setConfirmLoading(true);
                  result.then((willClose) => {
                    if (willClose !== false) {
                      closeDialog();
                    } else {
                      setConfirmLoading(false);
                    }
                  });
                } else if (result !== false) {
                  closeDialog();
                }
              }}
              variant="contained"
              size="medium"
              color={mainColor as ButtonProps["color"]}
            >
              {value.confirmButtonLabel ?? t("confirm")}
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useConfirmDialog = () => useContext(DialogContext);
