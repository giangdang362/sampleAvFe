import { api } from "../api";

export const tagApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTagsList: build.query<
      API.CRUDResponse<API.TagItem> & { deduplicatedTags: string[] },
      { type?: API.TagType } | void
    >({
      query: (params) => ({
        url: `/tags`,
        method: "GET",
        params: {
          filter: `type||$eq||${params?.type ?? "partner"}`,
        },
      }),
      transformResponse: (baseReturn: API.CRUDResponse<API.TagItem>) => {
        return {
          ...baseReturn,
          deduplicatedTags: Array.from(
            new Set(baseReturn.data?.map((item) => item.name)),
          ),
        };
      },
      providesTags: (_res, _error, request) => [
        { type: "tags", id: request?.type ?? "partner" },
      ],
    }),
  }),
});

export const { useGetTagsListQuery } = tagApi;
