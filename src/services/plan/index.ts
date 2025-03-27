import { api } from "../api";

export const planApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlans: build.query<API.CRUDResponse<API.PlanItem>, void>({
      query: () => ({
        url: `/plans`,
        method: "GET",
      }),
      providesTags: ["plan"],
    }),
  }),
});

export const { useGetPlansQuery } = planApi;
