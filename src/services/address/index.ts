import { api } from "../api";

export const addressApi = api.injectEndpoints({
  endpoints: (build) => ({
    updateOneAddress: build.mutation<API.AddressItem, API.AddressItem>({
      query: (payload) => ({
        url: `/address/${payload.id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["partner"],
    }),
  }),
});

export const { useUpdateOneAddressMutation } = addressApi;
