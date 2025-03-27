import { api } from "../api";
import { infiniteScrollExtender } from "../infinity";

export const projectApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<
      API.CRUDResponse<API.ProjectItem>,
      API.ProjectQuery
    >({
      query: (params) => ({
        url: `/projects?${params?.querySearch || ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["projects"],
    }),
    getInfiniteProjects: build.query<
      API.CRUDResponse<API.ProjectItem>,
      API.CURDRequiredQuery
    >({
      query: (params) => ({
        url: `/projects?${params?.querySearch || ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      ...infiniteScrollExtender,
      providesTags: ["projects"],
    }),
    createOrUpdate: build.mutation<
      API.CreateProjectRequest,
      API.CreateProjectRequest
    >({
      query: (payload) => ({
        url: payload.id ? `/projects/${payload.id}` : "/projects",
        method: payload.id ? "PATCH" : "POST",
        body: payload,
      }),
      invalidatesTags: ["projects"],
    }),

    updateBanner: build.mutation<any, { id: string; body: API.UpdateBanner }>({
      query: (data) => ({
        url: `/projects/${data.id}`,
        method: "PATCH",
        body: data.body,
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "projects" }])
            .forEach(({ endpointName, originalArgs }) => {
              switch (endpointName) {
                case "getProjects":
                  dispatch(
                    projectApi.util.updateQueryData(
                      endpointName,
                      originalArgs,
                      (draft) => {
                        draft.data.forEach((item) => {
                          if (item.id === args.id) {
                            item.coverInfo = args.body.coverInfo;
                          }
                        });
                      },
                    ),
                  );
                  break;
                case "getProjectById":
                  dispatch(
                    projectApi.util.updateQueryData(
                      endpointName,
                      originalArgs,
                      (draft) => {
                        if (draft.id === args.id) {
                          draft.coverInfo = args.body.coverInfo;
                        }
                      },
                    ),
                  );
                  break;
              }
            });
        } catch {}
      },
    }),

    addMemberToProject: build.mutation<
      void,
      { projectId: string; projectUsers: API.memberAddToProjectRequest }
    >({
      query: (data) => ({
        url: `/projects/${data.projectId}/members`,
        method: "POST",
        body: data.projectUsers,
      }),
      invalidatesTags: ["projects"],
    }),

    softDeleteOne: build.mutation<{ success: boolean }, { ids: string[] }>({
      query: (payload) => ({
        url: "/projects/delete/soft",
        method: "DELETE",
        body: payload,
      }),
      invalidatesTags: ["projects"],
    }),
    restoreProject: build.mutation<{ success: boolean }, { id: string }>({
      query: (params) => ({
        url: `/projects/restore/${params.id}`,
        method: "PUT",
        params,
      }),
      invalidatesTags: ["projects"],
    }),
    getCountries: build.query<API.CountriesRes, { slug: string }>({
      query: (params) => ({
        url: `/const/slug/${params.slug}`,
        method: "GET",
      }),
    }),
    getProjectById: build.query<
      API.ProjectItem,
      { id: string; query?: string }
    >({
      query: (params) => ({
        url: `projects/${params.id}?${params.query || ""}`,
        method: "GET",
      }),
      providesTags: ["projects"],
    }),
    uploadImage: build.mutation<
      { success: boolean },
      { id: string; file: File }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", params.file);
        return {
          url: `projects/${params.id}/upload/image`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["projects"],
    }),
    getMemberProject: build.query<
      API.CRUDResponse<API.PjMember>,
      { projectId: string; body: API.RqMemberQuery }
    >({
      query: (data) => ({
        url: `project-members/${data.projectId}/members`,
        method: "GET",
        params: data.body,
      }),
      providesTags: ["projects"],
    }),
    deleteMemberProject: build.mutation<
      void,
      { projectId: string; memberId: number }
    >({
      query: (data) => ({
        url: `projects/${data.projectId}/members/${data.memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["projects"],
    }),
    updateMemberProject: build.mutation<
      any,
      { projectId: string; body: API.RqUpdateMemberPj }
    >({
      query: (data) => ({
        url: `projects/${data.projectId}/members`,
        method: "PATCH",
        body: data.body,
      }),
      invalidatesTags: ["projects"],
    }),
    deleteImageProject: build.mutation<any, { projectId: string }>({
      query: (data) => ({
        url: `projects/${data.projectId}/coverImage`,
        method: "DELETE",
      }),
      invalidatesTags: ["projects"],
    }),
  }),
});
export const {
  useGetProjectByIdQuery,
  useAddMemberToProjectMutation,
  useUploadImageMutation,
  useGetProjectsQuery,
  useGetInfiniteProjectsQuery,
  useGetCountriesQuery,
  useCreateOrUpdateMutation,
  useSoftDeleteOneMutation,
  useRestoreProjectMutation,
  useGetMemberProjectQuery,
  useDeleteMemberProjectMutation,
  useUpdateMemberProjectMutation,
  useDeleteImageProjectMutation,
  useUpdateBannerMutation,
} = projectApi;
