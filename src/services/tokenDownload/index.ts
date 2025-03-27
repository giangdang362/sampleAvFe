import { api } from "../api";

export const tokenDownloadApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDownloadToken: build.mutation<{ token: string }, void>({
      query: () => ({
        url: "/me/download",
        method: "POST",
      }),
    }),
  }),
});
export const { useGetDownloadTokenMutation } = tokenDownloadApi;
