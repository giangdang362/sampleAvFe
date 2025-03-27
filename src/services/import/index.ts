import { api } from "../api";

export const importApi = api.injectEndpoints({
  endpoints: (build) => ({
    getImportResult: build.query<API.CRUDResponse<API.ImportResultItem>, void>({
      query: () => {
        return {
          url: `import`,
          method: "GET",
        };
      },
    }),
  }),
});

export const { useGetImportResultQuery } = importApi;
