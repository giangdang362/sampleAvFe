import { api } from "../api";

export const partnerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPartner: build.query<API.PartnersRes, API.PartnerQuery>({
      query: (params) => ({
        url: `/partners?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["partner"],
    }),
    getOnePartner: build.query<API.PartnerItem, { id: string }>({
      query: (params) => ({
        url: `/partners/${params.id}`,
        method: "GET",
        params,
      }),
      providesTags: ["partner"],
    }),
    muGetOneSuppliers: build.mutation<API.NewGet1Partner, { id: string }>({
      query: (params) => ({
        url: `/partners/${params.id}`,
        method: "GET",
      }),
      invalidatesTags: ["partner"],
    }),
    updatePartner: build.mutation<API.PartnerItem, API.PartnerPayload>({
      query: (payload) => ({
        url: `/partners/${payload.id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_res, _error, request) => [
        "partner",
        ...(request.tags?.some((tag) => !tag.id)
          ? [{ type: "tags" as const, id: "partner" }]
          : []),
      ],
    }),

    getOnePartnerMu: build.mutation<API.PartnerItem, { id: string }>({
      query: (params) => ({
        url: `/partners/${params.id}`,
        method: "GET",
        params,
      }),
      invalidatesTags: ["partner"],
    }),
    deletePartnerMember: build.mutation<void, { ids: string[] }>({
      query: (data) => ({
        url: `/partners/${data.ids}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partner"],
    }),

    deletePartner: build.mutation<void, { id: string }>({
      query: (params) => ({
        url: `partners/${params.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "partner",
        "projectFolder",
        "products",
        "projects",
        "partnerMember",
      ],
    }),

    deleteLogoPartner: build.mutation<void, { id: string }>({
      query: (params) => ({
        url: `partners/logo/${params.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["partner"],
    }),

    createPartnerMember: build.mutation<API.PartnerItem, API.CreatePartnerReq>({
      query: (body) => ({
        url: body.id === undefined ? "/partners" : `/partners/${body.id}`,
        method: body.id === undefined ? "POST" : "PATCH",
        body,
      }),
      invalidatesTags: ["partner"],
    }),
    uploadLogo: build.mutation<
      { success: boolean },
      { id: string; file: File }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        bodyFormData.append("file", params.file);
        return {
          url: `partners/upload/logo/${params.id}`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["partner"],
    }),
    uploadAttachments: build.mutation<
      { success: boolean },
      { id: string; files: File[] }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params.files.forEach((file) => {
          bodyFormData.append(`files`, file);
        });
        return {
          url: `partners/upload/attachments/${params.id}`,
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["partner"],
    }),

    deleteAttachment: build.mutation<
      any,
      {
        partnerId: string;
        body: {
          ids: string[];
        };
      }
    >({
      query: (data) => ({
        url: `/partners/attachments/${data.partnerId}`,
        method: "DELETE",
        body: data.body,
      }),
      invalidatesTags: ["partner"],
    }),
  }),
});

export const {
  useGetPartnerQuery,
  useLazyGetPartnerQuery,
  useMuGetOneSuppliersMutation,
  useUploadLogoMutation,
  useCreatePartnerMemberMutation,
  useDeletePartnerMemberMutation,
  useGetOnePartnerQuery,
  useGetOnePartnerMuMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useDeleteLogoPartnerMutation,
  useUploadAttachmentsMutation,
  useDeleteAttachmentMutation,
} = partnerApi;
