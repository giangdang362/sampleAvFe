import {
  Box,
  BoxProps,
  CircularProgress,
  CircularProgressProps,
  TypographyProps,
} from "@mui/material";
import MessageLine from "./MessageLine";
import { PropsWithChildren } from "react";
import { useTranslations } from "next-intl";

export interface DataStateOverlayProps extends PropsWithChildren {
  isError: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  wrapperProps?: BoxProps;
  messageProps?: TypographyProps;
  progressProps?: CircularProgressProps;
}

function DataStateOverlay({
  isError,
  isEmpty,
  isFetching,
  wrapperProps,
  messageProps,
  progressProps,
  children,
}: DataStateOverlayProps) {
  const t = useTranslations("common");

  const internalWrapperProps = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    mt: 2,
    mb: 4,
  };

  return isError ? (
    <Box {...internalWrapperProps} {...wrapperProps}>
      <MessageLine {...messageProps}>{t("errorMsg")}</MessageLine>
    </Box>
  ) : isEmpty ? (
    <Box {...internalWrapperProps} {...wrapperProps}>
      <MessageLine {...messageProps}>{t("empty_data")}</MessageLine>
    </Box>
  ) : isFetching ? (
    <Box {...internalWrapperProps} {...wrapperProps}>
      <CircularProgress
        {...progressProps}
        sx={[
          { display: "block", mx: "auto" },
          ...(Array.isArray(progressProps?.sx)
            ? progressProps.sx
            : [progressProps?.sx]),
        ]}
      />
    </Box>
  ) : (
    children
  );
}

export default DataStateOverlay;
