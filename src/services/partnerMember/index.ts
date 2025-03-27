import { CondOperator, RequestQueryBuilder } from "@nestjsx/crud-request";
import { api } from "../api";

export const partnerMemberApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPartnerMember: build.query<API.PartnerMemberRes, API.CURDQuery>({
      query: (data) => ({
        url:
          data?.querySearch !== "" && data?.querySearch !== undefined
            ? `/partner-members?${data.querySearch}`
            : `/partner-members`,
        method: "GET",
        params: {
          ...data,
          querySearch: undefined,
        },
      }),
      providesTags: ["partnerMember"],
    }),
    searchPartnerMember: build.mutation<API.PartnerMemberRes, API.CURDQuery>({
      query: (data) => ({
        url: `/partner-members?${data.querySearch}`,
        method: "GET",
        params: {
          ...data,
          querySearch: undefined,
        },
      }),
      invalidatesTags: ["partnerMember"],
    }),
    getOnePartnerMember: build.query<API.PartnerMemberItem, { id: string }>({
      query: (params) => ({
        url: `/partner-members/${params.id}`,
        method: "GET",
      }),
      providesTags: ["partnerMember"],
    }),
    getPartnerMembers: build.query<
      API.CRUDResponse<API.PartnerMemberItem>,
      { id: string }
    >({
      query: (params) => {
        const qb = RequestQueryBuilder.create();
        qb.setFilter({
          field: "partnerId",
          operator: CondOperator.EQUALS,
          value: params.id,
        });
        return {
          url: `/partner-members?` + qb.query(),
          method: "GET",
        };
      },
      providesTags: ["partnerMember"],
    }),
    createPartnerMember1: build.mutation<
      API.PartnerMemberItem,
      API.PartnerMemberPayload
    >({
      query: (payload) => ({
        url: `/partner-members`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["partnerMember"],
    }),
    updatePartnerMember: build.mutation<
      API.PartnerMemberItem,
      API.PartnerMemberPayload
    >({
      query: (payload) => ({
        url: `/partner-members/${payload.id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["partnerMember"],
    }),
    deleteOnePartnerMember: build.mutation<void, { ids: string[] }>({
      query: (payload) => ({
        url: `/partner-members/delete`,
        method: "DELETE",
        body: payload,
      }),
      invalidatesTags: ["partnerMember"],
    }),
    getListPartnerMember: build.query<
      API.CRUDResponse<API.PartnerMemberItem>,
      void
    >({
      query: () => ({
        url: `/partner-members`,
        method: "GET",
      }),
      providesTags: ["partnerMember"],
    }),
    getOnePartnerMenber: build.query<API.PartnerMemberItem, { id: string }>({
      query: (params) => ({
        url: `/partner-members/${params.id}`,
        method: "GET",
      }),
      providesTags: ["partnerMember"],
    }),
  }),
});

export const {
  useGetOnePartnerMemberQuery,
  useDeleteOnePartnerMemberMutation,
  useSearchPartnerMemberMutation,
  useCreatePartnerMember1Mutation,
  useUpdatePartnerMemberMutation,
  useGetPartnerMembersQuery,
  useGetPartnerMemberQuery,
  useGetListPartnerMemberQuery,
} = partnerMemberApi;
