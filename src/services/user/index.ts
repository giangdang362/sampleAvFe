import { api } from "../api";
import { infiniteScrollExtender } from "../infinity";

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<API.CRUDResponse<API.UserItem>, API.CURDQuery>({
      query: (params) => ({
        url: `/users?${params?.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["users"],
    }),
    getInfiniteUsers: build.query<
      API.CRUDResponse<API.UserItem>,
      API.CURDRequiredQuery
    >({
      query: (params) => ({
        url: `/users?${params?.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      ...infiniteScrollExtender,
    }),
    getUsersSearch: build.query<API.CRUDResponse<API.UserItem>, API.CURDQuery>({
      query: (params) => ({
        url: `/users-search?${params?.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["users"],
    }),
    getOneUser: build.query<API.UserItem, { id: string }>({
      query: (params) => ({
        url: `/users/${params.id}`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),
    updateOneUser: build.mutation<API.UserItem, API.UserItem>({
      query: (payload) => ({
        url: `/users/${payload.id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["users"],
    }),
    banOrActiveUser: build.mutation<any, { userId: string; isBan: boolean }>({
      query: (payload) => ({
        url: `/users/ban/${payload.userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["users"],
    }),
    updateRoleUser: build.mutation<API.UserItem, API.RolePayload>({
      query: (payload) => ({
        url: `/users/role/update/${payload.userId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["users"],
    }),
    uploadAvatarUser: build.mutation<
      { success: boolean },
      { id: string; file: File }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", params.file);
        return {
          url: `/users/${params.id}/avatar`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["users"],
    }),
    deleteOneUser: build.mutation<void, { id: string }>({
      query: (payload) => ({
        url: `/users/${payload.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
    getMyAccount: build.query<API.typeMeRes, void>({
      query: () => ({
        url: `/me`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),
    updateMePassword: build.mutation<void, API.UpdateMePass>({
      query: (formData) => ({
        url: `/me/password/update`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["users"],
    }),
    updateMe: build.mutation<void, API.ReUpdateMe>({
      query: (data) => ({
        url: `/me`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["users"],
    }),
    uploadAvaMe: build.mutation<any, { file: File }>({
      query: (params) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", params.file);
        return {
          url: `/me/upload/avatar`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["users"],
    }),
    checkEmailExist: build.mutation<boolean, { email: string }>({
      query: (params) => ({
        url: `/users/check/email-exist`,
        method: "GET",
        params: params,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetInfiniteUsersQuery,
  useLazyGetUsersQuery,
  useGetUsersSearchQuery,
  useGetOneUserQuery,
  useUpdateOneUserMutation,
  useUpdateRoleUserMutation,
  useUploadAvatarUserMutation,
  useDeleteOneUserMutation,
  useGetMyAccountQuery,
  useUpdateMePasswordMutation,
  useUpdateMeMutation,
  useUploadAvaMeMutation,
  useCheckEmailExistMutation,
  useBanOrActiveUserMutation,
} = userApi;
