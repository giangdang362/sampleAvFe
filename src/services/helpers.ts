import access from "@/lib/access";
import { useGetMyAccountQuery } from "./user";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSelectToken } from "@/store/features/auth";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function isErrorResponse(
  error: unknown,
): error is { data: API.ErrorResponse2 } {
  return (
    typeof error === "object" &&
    error != null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data != null &&
    "message" in error.data &&
    typeof error.data.message === "string" &&
    "statusCode" in error.data &&
    typeof error.data.statusCode === "number"
  );
}

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

export const MULTIPLE_APIS_ERROR_KEY = "APIS_ERROR";
export function mergeMultipleApisError(
  ...errs: (FetchBaseQueryError | undefined)[]
): FetchBaseQueryError {
  return {
    status: "CUSTOM_ERROR",
    data: errs,
    error: MULTIPLE_APIS_ERROR_KEY,
  };
}

export const useIsUser = () => {
  const access = useAccess();
  return !access.isAdmin;
};

export const useAccess = () => {
  const token = useSelector(useSelectToken);
  const { data, isLoading } = useGetMyAccountQuery(undefined, { skip: !token });

  return useMemo(
    () => access({ currentUser: data, isLoading }),
    [data, isLoading],
  );
};
