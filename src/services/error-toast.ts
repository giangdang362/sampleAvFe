import { tRef } from "@/app/[locale]/ClientProviders";
import { isRejected } from "@reduxjs/toolkit";
import { enqueueSnackbar } from "notistack";
import { Middleware, MiddlewareAPI } from "redux";
import { MULTIPLE_APIS_ERROR_KEY } from "./helpers";

export const mutationErrorToast: Middleware =
  (_api: MiddlewareAPI) => (next) => (action) => {
    if (!isRejected(action)) return next(action);

    if (
      !(
        typeof action.meta.arg === "object" &&
        action.meta.arg &&
        "type" in action.meta.arg &&
        action.meta.arg.type === "mutation" &&
        "payload" in action &&
        typeof action.payload === "object" &&
        action.payload !== null
      )
    )
      return next(action);

    const payload = action.payload;
    let errors = [payload];

    if (
      "status" in payload &&
      payload.status === "CUSTOM_ERROR" &&
      "error" in payload &&
      payload.error === MULTIPLE_APIS_ERROR_KEY &&
      "data" in payload &&
      Array.isArray(payload.data)
    ) {
      errors = payload.data.filter((item) => item && typeof item === "object");
    }

    for (const error of errors) {
      const isServerError =
        "status" in error &&
        typeof error.status === "number" &&
        error.status >= 500;
      const isCustomServerError =
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string" &&
        (error.data.message === "SOMETHING_WENT_WRONG" ||
          error.data.message.toLowerCase().includes("failed"));
      const isFetchError = "status" in error && error.status === "FETCH_ERROR";

      if (isServerError || isCustomServerError || isFetchError) {
        enqueueSnackbar(tRef.current("common.errorMsg"), { variant: "error" });
        break;
      }
    }

    return next(action);
  };
