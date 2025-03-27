import { baseApi } from "@/config/api";
import { RootState } from "@/store";
import paramsCleaner from "@/utils/query-param";
import { z } from "zod";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { UPLOAD_ENDPOINTS } from "./upload-enpoint";

const baseQuery = fetchBaseQuery({
  paramsSerializer: paramsCleaner,
  prepareHeaders: (headers, api) => {
    if (
      !headers.has("content-type") &&
      !UPLOAD_ENDPOINTS.includes(api.endpoint)
    ) {
      headers.set("content-type", "application/json");
    }

    if (headers.get("content-type") === "multipart/form-data") {
      headers.delete("content-type");
    }

    // Do not refresh token with the failed token
    if (headers.has("doRefresh")) {
      headers.delete("doRefresh");
    } else {
      const token = (api.getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
  },
});

const mutex = new Mutex();
const dynamicBaseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;

  const urlEnd = typeof args === "string" ? args : args.url;
  const urlEndWithLeadingSlash = urlEnd.startsWith("/") ? urlEnd : `/${urlEnd}`;
  const adjustedUrl = z.string().url().safeParse(urlEnd).success
    ? urlEnd
    : `${baseApi}${urlEndWithLeadingSlash}`;
  const adjustedArgs =
    typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };

  await mutex.waitForUnlock();
  let result = await baseQuery(adjustedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (mutex.isLocked()) {
      await mutex.waitForUnlock();
      result = await baseQuery(adjustedArgs, api, extraOptions);
    } else {
      const { updateAuthState, logout } = await import("@/store/features/auth");

      const token = state.auth.accessToken;
      const refreshToken = state.auth.refreshToken;
      if (refreshToken) {
        const release = await mutex.acquire();
        try {
          const refreshResult = await baseQuery(
            {
              url: `${baseApi}/auth/refresh-token/`,
              method: "POST",
              body: { refreshToken: refreshToken },
              headers: {
                doRefresh: "true",
              },
            },
            api,
            extraOptions,
          );
          const data = refreshResult.data as API.SignInWithPasswordResponse;

          if (data?.accessToken) {
            api.dispatch(
              updateAuthState({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              }),
            );
            result = await baseQuery(adjustedArgs, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } finally {
          release();
        }
      } else if (token) {
        api.dispatch(logout());
      }
    }
  }
  return result;
};

export const api = createApi({
  baseQuery: dynamicBaseQueryWithReauth,
  tagTypes: [
    "profile",
    "products",
    "slug",
    "partner",
    "partnerMember",
    "projects",
    "projectFolder",
    "projectFolderPinboards",
    "users",
    "role",
    "tags",
    "pinboards",
    "plan",
    "imageLibrary",
    "import",
    "tokenDownloadApi",
    "sampleRequest",
  ],
  endpoints: () => ({}),
});
