import { PatchCollection } from "@reduxjs/toolkit/dist/query/core/buildThunks";
import { api } from "../api";
import { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "@/store";
import { mergeMultipleApisError, MULTIPLE_APIS_ERROR_KEY } from "../helpers";

export const projectFolderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPinboardDetails: build.query<API.Pinboard, { id: string }>({
      query: (params) => ({
        url: `pinboard/${params.id}/sections`,
        method: "GET",
      }),
      providesTags: ["pinboards"],
    }),
    updatePinboard: build.mutation<
      API.Pinboard,
      { id: string; updateType?: "optimistic" | "pessimistic" } & Partial<
        Pick<API.Pinboard, "name" | "sectionIds" | "thumbnailId">
      >
    >({
      queryFn: async (
        { id, updateType: _updateType, ...body },
        { getState },
        _,
        baseQuery,
      ) => {
        if (body.sectionIds) {
          const sectionIds = body.sectionIds;
          const { data } = projectFolderApi.endpoints.getPinboardDetails.select(
            { id },
          )(getState() as RootState);
          if (data) {
            let firstImageId: string | undefined;
            for (const sectionId of sectionIds) {
              const section = data.sections.find(
                (section) => section.id === sectionId,
              );
              if (!section) continue;

              firstImageId = section.images.find(
                (image) => image.type === "pin_board_image",
              )?.id;
              if (firstImageId) break;
            }

            if (firstImageId) {
              body = { thumbnailId: firstImageId, ...body };
            }
          }
        }

        return baseQuery({
          url: `project-folder/${id}`,
          method: "PATCH",
          body: { ...body, type: "pinboard" },
        }) as ReturnType<
          BaseQueryFn<unknown, API.Pinboard, FetchBaseQueryError>
        >;
      },
      invalidatesTags: ["projectFolderPinboards"],
      async onQueryStarted(
        { id, updateType = "pessimistic", ...patches },
        { dispatch, queryFulfilled },
      ) {
        let patchResult: PatchCollection | undefined;

        try {
          if (updateType === "pessimistic") {
            await queryFulfilled;
          }

          patchResult = dispatch(
            projectFolderApi.util.updateQueryData(
              "getPinboardDetails",
              { id },
              (draft) => {
                Object.assign(draft, patches);

                draft.sections.sort(
                  (a, b) =>
                    (patches.sectionIds?.indexOf(a.id) ?? 0) -
                    (patches.sectionIds?.indexOf(b.id) ?? 0),
                );
              },
            ),
          );

          if (updateType === "optimistic") {
            await queryFulfilled;
          }
        } catch {
          if (updateType === "optimistic") {
            patchResult?.undo();
          }
        }
      },
    }),
    createPinboardSection: build.mutation<
      API.FolderSections,
      { id: string; name: string }
    >({
      query: (body) => ({
        url: `project-folder/${body.id}/sections`,
        method: "POST",
        body: { name: body.name, projectFolderType: "pinboard" },
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: newSection } = await queryFulfilled;
          dispatch(
            projectFolderApi.util.updateQueryData(
              "getPinboardDetails",
              { id },
              (draft) => {
                draft.sections.push({ ...newSection, images: [] });
                draft.sectionIds?.push(newSection.id);
              },
            ),
          );
        } catch {}
      },
    }),
    updatePinboardSection: build.mutation<
      void,
      {
        id: string;
        sectionId: API.FolderSections["id"];
        items?: {
          id: string;
          note?: string;
          link?: string;
          colSpan?: number;
          xAxis?: number;
        }[];
        updateType?: "optimistic" | "pessimistic";
      } & Partial<Omit<API.FolderSections, "id" | "itemIds">>
    >({
      async queryFn(
        { id, sectionId, items, updateType: _updateType, ...rest },
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        const willUpdateItemInfos = !!items?.some((item) =>
          Object.entries(item)
            .filter(([key]) => key !== "id")
            .some(([_, value]) => value !== undefined),
        );

        const results = await Promise.all([
          fetchWithBQ({
            url: `project-folder/${id}/sections`,
            method: "PATCH",
            body: {
              id: sectionId,
              itemIds: items?.map((item) => item.id),
              ...rest,
              projectFolderType: "pinboard",
            },
          }),
          willUpdateItemInfos
            ? fetchWithBQ({
                url: `pinboard/${id}/images/infos`,
                method: "PATCH",
                body: {
                  images: items?.map((i) => ({
                    ...i,
                    colSpan: undefined,
                    span: i.colSpan,
                  })),
                },
              })
            : undefined,
        ]);

        if (results[0]?.error || results[1]?.error) {
          return {
            error: mergeMultipleApisError(results[0]?.error, results[1]?.error),
          };
        }

        return { data: null as unknown as void };
      },
      async onQueryStarted(
        { id, sectionId, items, updateType = "pessimistic", ...patches },
        { dispatch, queryFulfilled, getState },
      ) {
        let sectionError = false;
        let itemsError = false;
        const waitForQueryFulfilled = async () => {
          try {
            await queryFulfilled;
          } catch (e) {
            const error = (e as { error: FetchBaseQueryError })?.error;

            if (
              error.status === "CUSTOM_ERROR" &&
              error.error === MULTIPLE_APIS_ERROR_KEY
            ) {
              const errData = error.data as [
                FetchBaseQueryError | undefined,
                FetchBaseQueryError | undefined,
              ];

              sectionError = !!errData[0];
              itemsError = !!errData[1];
            } else {
              sectionError = true;
              itemsError = true;
            }
          }
        };

        if (updateType === "pessimistic") {
          await waitForQueryFulfilled();
        }

        const sectionPatch = dispatch(
          projectFolderApi.util.updateQueryData(
            "getPinboardDetails",
            { id },
            (draft) => {
              const section = draft.sections.find((s) => s.id === sectionId);
              if (section) {
                if (!sectionError) {
                  Object.assign(section, patches);
                }

                if (items && !sectionError) {
                  const itemIds = items.map((item) => item.id);
                  section.images.sort(
                    (a, b) =>
                      (itemIds.indexOf(a.id) ?? 0) -
                      (itemIds.indexOf(b.id) ?? 0),
                  );
                }
              }
            },
          ),
        );

        const itemsPatch = dispatch(
          projectFolderApi.util.updateQueryData(
            "getPinboardDetails",
            { id },
            (draft) => {
              const section = draft.sections.find((s) => s.id === sectionId);
              if (section && items && !itemsError) {
                for (const image of section.images) {
                  for (const imageInfo of items) {
                    if (image.id === imageInfo.id) {
                      Object.assign(image, imageInfo);
                    }
                  }
                }
              }
            },
          ),
        );

        if (updateType === "optimistic") {
          await waitForQueryFulfilled();

          if (sectionError) sectionPatch.undo();
          if (itemsError) itemsPatch.undo();
        }

        if (!items || sectionError) return;
        const itemIds = items.map((item) => item.id);

        const { data } = projectFolderApi.endpoints.getPinboardDetails.select({
          id,
        })(getState());
        if (!data) return;

        const firstSection = data.sections[0];
        if (data.sections[0]?.id !== sectionId) return;

        let firstImageId: string | undefined;
        for (const itemId of itemIds) {
          const item = firstSection.images.find(
            (item) => item.id === itemId && item.type === "pin_board_image",
          );
          if (!item) continue;

          firstImageId = item.id;
          if (firstImageId) break;
        }

        if (firstImageId && firstImageId !== data.thumbnailId) {
          dispatch(
            projectFolderApi.endpoints.updatePinboard.initiate({
              id,
              thumbnailId: firstImageId,
            }),
          );
        }
      },
    }),
    deletePinboardSection: build.mutation<
      void,
      { id: string; sectionIds: API.PinboardSection["id"][] }
    >({
      query: ({ id, ...rest }) => ({
        url: `project-folder/${id}/sections`,
        method: "DELETE",
        body: { ids: rest.sectionIds, type: "pinboard" },
      }),
      async onQueryStarted(
        { id, sectionIds },
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          await queryFulfilled;
          dispatch(
            projectFolderApi.util.updateQueryData(
              "getPinboardDetails",
              { id },
              (draft) => {
                let i = draft.sections.length;
                while (i--) {
                  if (sectionIds.includes(draft.sections[i].id)) {
                    draft.sections.splice(i, 1);
                  }
                }
              },
            ),
          );

          const { data } = projectFolderApi.endpoints.getPinboardDetails.select(
            { id },
          )(getState() as RootState);
          if (!data) return;

          let firstImageId: string | undefined;
          for (const section of data.sections) {
            if (sectionIds.includes(section.id)) continue;

            firstImageId = section.images.find(
              (image) => image.type === "pin_board_image",
            )?.id;
            if (firstImageId) break;
          }

          if (firstImageId) {
            dispatch(
              projectFolderApi.endpoints.updatePinboard.initiate({
                id,
                thumbnailId: firstImageId,
              }),
            );
          }
        } catch {}
      },
    }),
    uploadPinboardImages: build.mutation<
      void,
      {
        id: string;
        data: {
          files: File[];
          sectionId: API.PinboardSection["id"];
        };
      }
    >({
      query: ({ id, data: { files, sectionId } }) => {
        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }
        formData.append("sectionId", sectionId);

        return {
          url: `pinboard/${id}/upload/files`,
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
          formData: true,
        };
      },
      invalidatesTags: ["pinboards"],
    }),
    uploadPinboardPinterestImages: build.mutation<
      void,
      {
        id: string;
        data: {
          imageUrl: string;
          sectionId: API.PinboardSection["id"];
        }[];
      }
    >({
      query: ({ id, ...body }) => ({
        url: `pinboard/${id}/upload/pinterest`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["pinboards"],
    }),
    updatePinboardImage: build.mutation<
      void,
      {
        id: string;
        imageId: string;
        updateType?: "optimistic" | "pessimistic";
      } & (
        | {
            note?: string;
            link?: string;
            colSpan?: number;
            xAxis?: number;
          }
        | {
            file: string;
          }
      )
    >({
      query: ({ id, imageId, updateType: _updateType, ...rest }) => ({
        url: `pinboard/${id}/images/${"file" in rest ? "change" : "info"}`,
        method: "PATCH",
        body: {
          ...rest,
          id: imageId,
          span: "file" in rest ? undefined : rest.colSpan,
        },
      }),
      async onQueryStarted(
        { id, imageId, updateType = "pessimistic", ...rest },
        { dispatch, queryFulfilled },
      ) {
        let patchResult: PatchCollection | undefined;

        try {
          if (updateType === "pessimistic") {
            await queryFulfilled;
          }

          patchResult = dispatch(
            projectFolderApi.util.updateQueryData(
              "getPinboardDetails",
              { id },
              (draft) => {
                outerLoop: for (const section of draft.sections) {
                  for (const image of section.images) {
                    if (image.id === imageId) {
                      Object.assign(image, rest);
                      break outerLoop;
                    }
                  }
                }
              },
            ),
          );

          if (updateType === "optimistic") {
            await queryFulfilled;
          }
        } catch {
          if (updateType === "optimistic") {
            patchResult?.undo();
          }
        }
      },
    }),
    deletePinboardImage: build.mutation<
      void,
      { id: string; imageIds: string[] }
    >({
      query: ({ id, ...rest }) => ({
        url: `pinboard/${id}/images`,
        method: "DELETE",
        body: { ids: rest.imageIds },
      }),
      async onQueryStarted({ id, imageIds }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            projectFolderApi.util.updateQueryData(
              "getPinboardDetails",
              { id },
              (draft) => {
                for (const section of draft.sections) {
                  let i = section.images.length;
                  while (i--) {
                    if (imageIds.includes(section.images[i].id)) {
                      section.images.splice(i, 1);
                    }
                  }
                }
              },
            ),
          );
        } catch {}
      },
    }),
    deletePinboard: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `project-folder/${id}`,
        method: "DELETE",
        body: { type: "pinboard" },
      }),
      invalidatesTags: ["pinboards"],
    }),
    cropPinboardImage: build.mutation<
      void,
      {
        id: string;
        imageId: string;
        width: number;
        height: number;
        left: number;
        top: number;
      }
    >({
      query: ({ id, imageId, ...rest }) => ({
        url: `pinboard/${id}/images/crop`,
        method: "PATCH",
        body: { fileId: imageId, ...rest },
      }),
      invalidatesTags: ["pinboards"],
    }),
    addImageLibraryToPinBoard: build.mutation<
      void,
      {
        pinboardId: string;
        fileId: string;
        sectionId: string;
      }
    >({
      query: ({ pinboardId, ...params }) => ({
        url: `pinboard/${pinboardId}/upload/img-library`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["pinboards"],
    }),
    addPinboard: build.mutation<
      void,
      { pinboardId: string; qd: API.QdAddImagePinboard }
    >({
      query: ({ pinboardId, ...params }) => ({
        url: `pinboard/${pinboardId}/upload/schedule`,
        method: "POST",
        body: params.qd,
      }),
      invalidatesTags: ["pinboards"],
    }),
    addProductToPinBoard: build.mutation<
      void,
      {
        pinboardId: string;
        productId: string;
        sectionId: string;
      }
    >({
      query: ({ pinboardId, ...params }) => ({
        url: `pinboard/${pinboardId}/upload/product-library`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["pinboards"],
    }),
    addTextCard: build.mutation<
      void,
      { pinboardId: string; sectionId: string }
    >({
      query: ({ pinboardId, ...params }) => ({
        url: `pinboard/${pinboardId}/upload/text-card`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["pinboards"],
    }),
  }),
});

export const {
  useGetPinboardDetailsQuery,
  useLazyGetPinboardDetailsQuery,
  useUpdatePinboardMutation,
  useCreatePinboardSectionMutation,
  useUpdatePinboardSectionMutation,
  useDeletePinboardSectionMutation,
  useUploadPinboardPinterestImagesMutation,
  useUpdatePinboardImageMutation,
  useUploadPinboardImagesMutation,
  useDeletePinboardImageMutation,
  useDeletePinboardMutation,
  useCropPinboardImageMutation,
  useAddImageLibraryToPinBoardMutation,
  useAddPinboardMutation,
  useAddProductToPinBoardMutation,
  useAddTextCardMutation,
} = projectFolderApi;
