import { api } from "@/services/api";

export const sampleRequest = api.injectEndpoints({
  endpoints: (build) => ({
    getAllSampleRequest: build.query<
      API.CRUDResponse<API.SampleRequest>,
      API.CURDQuery
    >({
      query: (params) => ({
        url: `/report/requests?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["sampleRequest"],
    }),
  }),
});
export const { useGetAllSampleRequestQuery } = sampleRequest;
