import { api } from "../api";
import { isErrorResponse } from "../helpers";

export const projectFolderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getListByProjectId: build.mutation<
      API.CRUDResponse<API.ProjectFolderType>,
      { query: string }
    >({
      query: (params) => ({
        url: `/project-folder?${params.query}`,
        method: "GET",
      }),
      invalidatesTags: ["projectFolder"],
    }),

    createPinBoardOrSchedule: build.mutation<
      API.PinBoardSchedule,
      API.RequestCreatePinBoardOrSchedule
    >({
      query: (data) => ({
        url: `/project-folder`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_response, error, request) =>
        isErrorResponse(error)
          ? []
          : [
              "projectFolder",
              ...(request.type === "pinboard"
                ? (["pinboards", "projectFolderPinboards"] as const)
                : []),
            ],
    }),

    getAllPinBoardAndSchedule: build.query<
      API.CRUDResponse<API.PinBoardSchedule>,
      { query: string }
    >({
      query: (data) => ({
        url: `/project-folder?${data.query}`,
        method: "GET",
      }),
      providesTags: (response) => [
        "projectFolder",
        ...(response?.data.some((el) => el.type === "pinboard")
          ? (["pinboards", "projectFolderPinboards"] as const)
          : []),
      ],
    }),

    createSectionSchedule: build.mutation<
      void,
      API.RequestCreateSectionSchedule
    >({
      query: (data) => ({
        url: `/project-folder/${data.folderId}/sections`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["projectFolder"],
    }),

    duplicateScheduleSection: build.mutation<
      void,
      { folderid: string; sectionId: string }
    >({
      query: (data) => ({
        url: `/project-folder/${data.folderid}/sections/duplicate`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["projectFolder"],
    }),

    deleteSectionSchedule: build.mutation<
      void,
      { folderId: string; ids: string[]; type: string }
    >({
      query: (data) => ({
        url: `/project-folder/${data.folderId}/sections`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["projectFolder"],
    }),

    copyProduct: build.mutation<
      void,
      { scheduleId: string; sectionId: string; productId: string }
    >({
      query: (params) => ({
        url: `/material-schedule/products/${params.scheduleId}`,
        body: {
          type: "schedule",
          sectionId: params.sectionId,
          productId: params.productId,
          quantity: 1,
        },
        method: "POST",
      }),
      invalidatesTags: ["projectFolder"],
    }),
  }),
});

export const {
  useGetListByProjectIdMutation,
  useCreatePinBoardOrScheduleMutation,
  useGetAllPinBoardAndScheduleQuery,
  useCreateSectionScheduleMutation,
  useDeleteSectionScheduleMutation,
  useDuplicateScheduleSectionMutation,
  useCopyProductMutation,
} = projectFolderApi;
