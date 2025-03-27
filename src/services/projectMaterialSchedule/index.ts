import { PatchCollection } from "@reduxjs/toolkit/dist/query/core/buildThunks";
import { api } from "../api";

export const projectMaterialScheduleApi = api.injectEndpoints({
  endpoints: (build) => ({
    getListProductMaterialScheduleId: build.query<
      API.ProjectMaterialScheduleType,
      { id: string; querySearch?: string }
    >({
      query: (params) => ({
        url: `/material-schedule/products/${params.id}?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          id: undefined,
          querySearch: undefined,
        },
      }),
      providesTags: ["projectFolder"],
    }),
    updateMaterialSchedule: build.mutation<
      API.ProjectMaterialScheduleType,
      { id: string; updateType?: "optimistic" | "pessimistic" } & Partial<
        Pick<API.ProjectMaterialScheduleType, "name" | "sectionIds">
      >
    >({
      query: ({ id, updateType: _updateType, ...body }) => ({
        url: `project-folder/${id}`,
        method: "PATCH",
        body: { ...body, type: "schedule" },
      }),
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
            projectMaterialScheduleApi.util.updateQueryData(
              "getListProductMaterialScheduleId",
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
      invalidatesTags: ["projectFolder"],
    }),
    updateScheduleSection: build.mutation<
      void,
      { id: string; sectionId: API.FolderSections["id"] } & Partial<
        Omit<API.FolderSections, "id">
      >
    >({
      query: ({ id, sectionId, ...rest }) => ({
        url: `project-folder/${id}/sections`,
        method: "PATCH",
        body: { id: sectionId, ...rest, projectFolderType: "schedule" },
      }),
      async onQueryStarted(
        { id, sectionId, ...patches },
        { dispatch, queryFulfilled, getState },
      ) {
        const queries = projectMaterialScheduleApi.util.selectInvalidatedBy(
          getState(),
          ["projectFolder"],
        );
        const patchResults = queries.flatMap(
          ({ endpointName, originalArgs }) => {
            if (endpointName === "getListProductMaterialScheduleId") {
              return [
                dispatch(
                  projectMaterialScheduleApi.util.updateQueryData(
                    "getListProductMaterialScheduleId",
                    originalArgs,
                    (draft) => {
                      if (draft.id !== id) return;

                      const section = draft.sections.find(
                        (s) => s.id === sectionId,
                      );
                      if (section) {
                        Object.assign(section, patches);
                        const itemIds = section.itemIds;
                        if (itemIds) {
                          section.products?.sort(
                            (a, b) =>
                              itemIds.indexOf(a.id) - itemIds.indexOf(b.id),
                          );
                        }
                      }
                    },
                  ),
                ),
              ];
            } else {
              const promise = dispatch(
                projectMaterialScheduleApi.endpoints[
                  endpointName as keyof typeof projectMaterialScheduleApi.endpoints
                ].initiate(originalArgs, { forceRefetch: true }) as any,
              );
              promise.finally(() => {
                promise.unsubscribe();
              });

              return [];
            }
          },
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo());
        }
      },
    }),
    getOneProductsSchedule: build.query<
      API.ProductType & { roleName: string },
      { scheduleId: string; id: string }
    >({
      query: (params) => ({
        url: `material-schedule/products/${params.scheduleId}/${params.id}`,
        method: "GET",
        params,
      }),
      providesTags: ["projectFolder"],
    }),
    updateProductSchedule: build.mutation<
      API.Product,
      { scheduleId: string } & API.ProductPayloadItem
    >({
      query: (params) => ({
        url: `material-schedule/products/${params.scheduleId}/${params.id}`,
        method: "PATCH",
        body: params,
      }),
      invalidatesTags: (_res, _err, request) => [
        "projectFolder",
        "projects",
        ...(request.tags?.some((tag) => !tag.id)
          ? [{ type: "tags" as const, id: "product" }]
          : []),
      ],
    }),

    updateProductStatusSchedule: build.mutation<
      API.Product,
      { scheduleId: string; id: string; newStatus: string; reason: string }
    >({
      query: (params) => ({
        url: `material-schedule/products/${params.scheduleId}/${params.id}/status`,
        method: "PATCH",
        body: params,
      }),
      invalidatesTags: ["projectFolder", "projects"],
    }),

    createProductSchedule: build.mutation<
      void,
      API.RequestCreateProductSchedule
    >({
      query: (data) => ({
        url: `/material-schedule/products/${data.scheduleId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["projectFolder"],
    }),

    deleteProductsSchedule: build.mutation<
      void,
      { scheduleId: string; ids: string[] }
    >({
      query: (data) => ({
        url: `/material-schedule/products/${data.scheduleId}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["projectFolder"],
    }),
    deleteSchedule: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `project-folder/${id}`,
        method: "DELETE",
        body: { type: "schedule" },
      }),
      invalidatesTags: ["projectFolder"],
    }),

    uploadImageFilesSchedule: build.mutation<
      { success: boolean },
      { scheduleId: string; id: string; files: File[] }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params?.files?.map((file) => bodyFormData.append("files", file));
        bodyFormData.append("productId", params.id);
        return {
          url: `/material-schedule/products/${params.scheduleId}/upload/image`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["projectFolder"],
    }),

    uploadAttachmentProductSchedule: build.mutation<
      { success: boolean },
      { productId: string; files: File[]; scheduleId: string }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params.files?.forEach((file) => {
          bodyFormData.append("file", file);
        });
        bodyFormData.append("productId", params.productId);
        return {
          url: `/material-schedule/products/${params.scheduleId}/upload/attachment`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["projectFolder"],
    }),

    deleteImageProductSchedule: build.mutation<
      void,
      { productId: string; fileId: string; scheduleId: string }
    >({
      query: (body) => ({
        url: `/material-schedule/products/${body.scheduleId}/file/delete`,
        method: "DELETE",
        body: { productId: body.productId, fileId: body.fileId },
      }),
      invalidatesTags: ["projectFolder"],
    }),

    contactSupplierSchedule: build.mutation<
      void,
      { scheduleId: string } & {
        type: string;
        productId: string;
        message: string;
      }
    >({
      query: (data) => ({
        url: `/material-schedule/products/${data.scheduleId}/contact/supplier`,
        method: "POST",
        body: data,
      }),
    }),
    uploadAttachmentsSchedule: build.mutation<
      { success: boolean },
      { files: File[]; folderID: string }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params.files?.forEach((file) => {
          bodyFormData.append("file", file);
        });
        bodyFormData.append("folderID", params.folderID);
        return {
          url: `/project-folder/${params.folderID}/attachment`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["projectFolder"],
    }),
    deleteAttachments: build.mutation<
      void,
      { folderID: string; fileId: string }
    >({
      query: (params) => ({
        url: `/project-folder/${params.folderID}/attachment/${params.fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["projectFolder"],
    }),
    duplicateSchedule: build.mutation<
      void,
      { folderId: string; toProjectId: string }
    >({
      query: (params) => ({
        url: `/project-folder/${params.folderId}/duplicate`,
        body: { toProjectId: params.toProjectId, type: "schedule" },
        method: "POST",
      }),
      invalidatesTags: ["projectFolder"],
    }),

    getProductStatus: build.query<API.StatusHistoryType, { productId: string }>(
      {
        query: (params) => ({
          url: `log-product-status/${params.productId}`,
          method: "GET",
        }),
        providesTags: ["projectFolder"],
      },
    ),
  }),
});
export const {
  useGetListProductMaterialScheduleIdQuery,
  useCreateProductScheduleMutation,
  useDeleteProductsScheduleMutation,
  useUpdateMaterialScheduleMutation,
  useUpdateScheduleSectionMutation,
  useGetOneProductsScheduleQuery,
  useDeleteScheduleMutation,
  useUpdateProductScheduleMutation,
  useUploadImageFilesScheduleMutation,
  useUploadAttachmentProductScheduleMutation,
  useContactSupplierScheduleMutation,
  useUploadAttachmentsScheduleMutation,
  useDeleteAttachmentsMutation,
  useDuplicateScheduleMutation,
  useDeleteImageProductScheduleMutation,
  useUpdateProductStatusScheduleMutation,
  useGetProductStatusQuery,
} = projectMaterialScheduleApi;
