import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { PropsWithChildren } from "react";
import MessageLine from "./MessageLine";
import { SerializedError } from "@reduxjs/toolkit";
import { TypographyProps } from "@mui/material";

export interface NotFoundWrapperProps extends PropsWithChildren {
  error: FetchBaseQueryError | SerializedError | undefined;
  notFoundMessage: string;
  messageProps?: TypographyProps;
}

function NotFoundWrapper({
  error,
  notFoundMessage,
  messageProps,
  children,
}: NotFoundWrapperProps) {
  const isNotFound =
    !!error &&
    "status" in error &&
    (error.status === 404 ||
      (error.status === 400 &&
        typeof error.data === "object" &&
        error.data &&
        "message" in error.data &&
        typeof error.data.message === "string" &&
        error.data.message.toLowerCase().includes("not_found")));

  return isNotFound ? (
    <MessageLine mt={4} mb={2} {...messageProps}>
      {notFoundMessage}
    </MessageLine>
  ) : (
    children
  );
}

export default NotFoundWrapper;
