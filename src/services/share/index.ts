import { api } from "../api";

export const shareApi = api.injectEndpoints({
  endpoints: (build) => ({
    getShareData: build.query<API.ShareResponse, { id: string }>({
      query: (params) => ({
        url: `share/${params.id}/data`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetShareDataQuery } = shareApi;
