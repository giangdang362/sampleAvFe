import { NO_AUTH_PATHS } from "@/constants/path";
import { STORAGE_KEYS } from "@/constants/storage";
import { paths } from "@/paths";
import { authApi } from "@/services/auth";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  accessToken?: string | null;
  refreshToken?: string | null;
}

const initialState: AuthState = {
  accessToken:
    typeof window !== "undefined"
      ? localStorage?.getItem(STORAGE_KEYS.AUTH_TOKEN)
      : undefined,
  refreshToken:
    typeof window !== "undefined"
      ? localStorage?.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN)
      : undefined,
};

const logoutReducer = (redirect?: boolean) => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);

  const [_, locale, ...pathFragments] = window.location.pathname.split("/");
  const pathname = "/" + pathFragments.join("/");

  if (NO_AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    return {};
  }

  const redirectPath = redirect
    ? pathname + window.location.search + window.location.hash
    : undefined;
  window.location.href = `/${locale}${paths.auth.signIn}${
    redirectPath && redirectPath !== paths.home
      ? `?redirect=${encodeURIComponent(redirectPath)}`
      : ""
  }`;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthState: (_state, action: PayloadAction<AuthState>) => {
      localStorage.setItem(
        STORAGE_KEYS.AUTH_TOKEN,
        action.payload.accessToken as string,
      );
      localStorage.setItem(
        STORAGE_KEYS.AUTH_REFRESH_TOKEN,
        action.payload.refreshToken as string,
      );
      return action.payload;
    },
    logout: () => logoutReducer(true),
  },
  selectors: {
    useSelectToken: (state) => state.accessToken,
  },
  extraReducers: (builder) => {
    builder
      // Login successful
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          const token = payload?.accessToken;
          const refreshToken = payload?.refreshToken;
          state.accessToken = token;
          state.refreshToken = refreshToken;
          localStorage.setItem(
            STORAGE_KEYS.AUTH_TOKEN,
            payload.accessToken as string,
          );
          localStorage.setItem(
            STORAGE_KEYS.AUTH_REFRESH_TOKEN,
            payload.refreshToken as string,
          );
        },
      )
      .addMatcher(authApi.endpoints.logout.matchFulfilled, () =>
        logoutReducer(),
      );
  },
});

export const { updateAuthState, logout } = authSlice.actions;
export const { useSelectToken } = authSlice.selectors;

export default authSlice;
