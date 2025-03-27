import { api } from "../api";
import { infiniteScrollExtender } from "../infinity";

export const imageLibrary = api.injectEndpoints({
  endpoints: (build) => ({
    getInfiniteImageLibrary: build.query<
      API.ImageLibraryRes,
      API.CURDRequiredQuery
    >({
      query: (params) => ({
        url: `/images-library?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      ...infiniteScrollExtender,
      providesTags: ["imageLibrary"],
    }),
    uploadImagesLibrary: build.mutation<
      { success: boolean },
      { planId?: string; files: File[] | FileList; userId?: string }
    >({
      query: (params) => {
        const formData = new FormData();

        if (params.planId) {
          formData.append("planId", params.planId);
        }

        if (params.userId) {
          formData.append("userId", params.userId);
        }

        for (const file of params.files) {
          formData.append("files", file);
        }
        return {
          url: `images-library/upload/multiple`,
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "imageLibrary" }])
            .filter(
              ({ endpointName }) => endpointName === "getInfiniteImageLibrary",
            )
            .forEach(
              ({ originalArgs }: { originalArgs: API.CURDRequiredQuery }) => {
                dispatch(
                  imageLibrary.endpoints.getInfiniteImageLibrary.initiate(
                    { ...originalArgs, page: 1 },
                    { forceRefetch: true },
                  ),
                );
              },
            );
        } catch {}
      },
    }),
    deleteImageLibrary: build.mutation<void, { ids: string[] }>({
      query: (params) => ({
        url: `images-library`,
        method: "DELETE",
        body: { ids: params.ids },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "imageLibrary" }])
            .filter(
              ({ endpointName }) => endpointName === "getInfiniteImageLibrary",
            )
            .forEach(
              ({ originalArgs }: { originalArgs: API.CURDRequiredQuery }) => {
                dispatch(
                  imageLibrary.util.updateQueryData(
                    "getInfiniteImageLibrary",
                    originalArgs,
                    (draft) => {
                      const deleteIndices: number[] = [];
                      draft.data = draft.data.filter((image, index) => {
                        if (!image.id) return true;

                        if (args.ids.includes(image.id)) {
                          deleteIndices.push(index);
                          return false;
                        }

                        return true;
                      });

                      const lowestDeleteIndex = deleteIndices.reduce<
                        number | undefined
                      >(
                        (lowest, index) =>
                          lowest === undefined
                            ? index
                            : Math.min(lowest, index),
                        undefined,
                      );

                      if (lowestDeleteIndex !== undefined) {
                        const pageSize = Math.ceil(
                          draft.total / draft.pageCount,
                        );
                        const refetchStartPage =
                          Math.floor(lowestDeleteIndex / pageSize) + 1;

                        for (
                          let i = refetchStartPage;
                          i <= originalArgs.page;
                          i++
                        ) {
                          dispatch(
                            imageLibrary.endpoints.getInfiniteImageLibrary.initiate(
                              { ...originalArgs, page: i },
                              { forceRefetch: true },
                            ),
                          );
                        }
                      }
                    },
                  ),
                );
              },
            );
        } catch {}
      },
    }),
    updateImageLibrary: build.mutation<
      API.ImageLibraryItem,
      API.UpdateImageLibraryReq
    >({
      query: (params) => ({
        url: `images-library/${params.id}`,
        method: "PATCH",
        body: params,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "imageLibrary" }])
            .filter(
              ({ endpointName }) => endpointName === "getInfiniteImageLibrary",
            )
            .forEach(
              ({ originalArgs }: { originalArgs: API.CURDRequiredQuery }) => {
                dispatch(
                  imageLibrary.util.updateQueryData(
                    "getInfiniteImageLibrary",
                    originalArgs,
                    (draft) => {
                      draft.data.forEach((image) => {
                        if (image.id === data.id) {
                          Object.assign(image, data);
                        }
                      });
                    },
                  ),
                );
              },
            );
        } catch {}
      },
      invalidatesTags: (_res, _error, request) => [
        ...(request.tags?.some((tag) => tag.id === undefined)
          ? ["tags" as const]
          : []),
      ],
    }),
    uploadImageFromPinterest: build.mutation<void, API.UploadPinterestPayload>({
      query: (params) => ({
        url: `images-library/upload/pinterest`,
        method: "POST",
        body: params,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "imageLibrary" }])
            .filter(
              ({ endpointName }) => endpointName === "getInfiniteImageLibrary",
            )
            .forEach(
              ({ originalArgs }: { originalArgs: API.CURDRequiredQuery }) => {
                dispatch(
                  imageLibrary.endpoints.getInfiniteImageLibrary.initiate(
                    { ...originalArgs, page: 1 },
                    { forceRefetch: true },
                  ),
                );
              },
            );
        } catch {}
      },
    }),
  }),
});

export const {
  useGetInfiniteImageLibraryQuery,
  useUploadImagesLibraryMutation,
  useDeleteImageLibraryMutation,
  useUpdateImageLibraryMutation,
  useUploadImageFromPinterestMutation,
} = imageLibrary;
