import { api } from "../api";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<
      API.SignInWithPasswordResponse,
      API.SignInWithPasswordPayload
    >({
      query: (data: API.SignInWithPasswordPayload) => ({
        url: "/auth/login/",
        method: "POST",
        body: data,
      }),
    }),
    logout: build.mutation<API.LogoutResponse, API.LogoutPayload>({
      query: (body: API.LogoutPayload) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: build.mutation<any, API.ForgotPasswordResquest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    forgotPasswordVerified: build.mutation<any, API.CreateNewPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password/verify",
        method: "POST",
        body,
      }),
    }),
    register: build.mutation<any, API.CreateAccountRequest>({
      query: (body) => ({
        url: "/auth/create-account",
        method: "POST",
        body,
      }),
    }),
    verifyAccount: build.mutation<any, { token: string; id: string }>({
      query: (body) => ({
        url: "/auth/create-account/verify",
        method: "POST",
        body,
      }),
    }),
    resendEmail: build.mutation<boolean, { email: string }>({
      query: (body) => ({
        url: "/auth/create-account/resend",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useForgotPasswordVerifiedMutation,
  useRegisterMutation,
  useResendEmailMutation,
  useVerifyAccountMutation,
} = authApi;
