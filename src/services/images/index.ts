import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const pinterestApi = createApi({
  reducerPath: "pinterestApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.pinterest.com/v3/" }),
  endpoints: (build) => ({
    getPinterestImages: build.query<
      API.PinterestPinResponse,
      API.PinterestPinQuery
    >({
      query: (params) =>
        "pinId" in params
          ? {
              url: "pidgets/pins/info/",
              method: "GET",
              params: {
                pin_ids: params.pinId,
              },
            }
          : {
              url: params.boardId
                ? "pidgets/boards/" +
                  params.userId +
                  "/" +
                  params.boardId +
                  "/pins/"
                : "pidgets/users/" + params.userId + "/pins/",
              method: "GET",
            },
      transformResponse: (response: {
        data: null | { pins: API.PinterestPin[] } | API.PinterestPin[];
      }) => {
        return response.data
          ? Array.isArray(response.data)
            ? response.data
            : response.data.pins
          : [];
      },
    }),
  }),
});

export const { useLazyGetPinterestImagesQuery } = pinterestApi;
export default pinterestApi;
