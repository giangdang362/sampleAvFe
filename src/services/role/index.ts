import { api } from "../api";

export const roleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllRole: build.query<API.Role[], void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      providesTags: ["role"],
    }),
  }),
});
export const { useGetAllRoleQuery } = roleApi;
