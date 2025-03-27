import { api } from "../api";
import { infiniteScrollExtender } from "../infinity";

export const productApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<
      API.CRUDResponse<API.ProductItem>,
      API.ProductQuery
    >({
      query: (params) => ({
        url: `/products?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      providesTags: ["products"],
    }),
    // Infinite ProductsUser
    getInfiniteProductsUser: build.query<
      API.CRUDResponse<API.ProductItem>,
      API.CURDRequiredQuery
    >({
      query: (params) => ({
        url: `/products-user?${params.querySearch ? params.querySearch : ""}`,
        method: "GET",
        params: {
          ...params,
          querySearch: undefined,
        },
      }),
      ...infiniteScrollExtender,
      providesTags: ["products"],
    }),
    muProducts: build.mutation<
      API.CRUDResponse<API.ProductItem>,
      API.ProductQuery
    >({
      query: (data) => ({
        url: `/products?${data.querySearch}`,
        method: "GET",
        params: {
          ...data,
          querySearch: undefined,
        },
      }),
      // invalidatesTags: ["products"],
    }),
    getListOptionProduct: build.query<
      API.CRUDResponse<API.ResponseSearchProduct>,
      API.ParamSearchProduct
    >({
      query: (params) => ({
        url: `products/field/values/search?field=${params.field}&keyword${params.keyword}`,
        method: "GET",
        params: params,
      }),
    }),

    getOneProducts: build.query<API.ProductType, { id: string }>({
      query: (params) => ({
        url: `/products/${params.id}`,
        method: "GET",
        params,
      }),
      providesTags: ["products"],
    }),

    getOneProductsUser: build.query<API.ProductType, { id: string }>({
      query: (params) => ({
        url: `/products-user/${params.id}`,
        method: "GET",
        params,
      }),
      providesTags: ["products"],
    }),

    getOneProductsMu: build.mutation<API.ProductType, { id: string }>({
      query: (params) => ({
        url: `/products/${params.id}`,
        method: "GET",
        params,
      }),
      invalidatesTags: ["products"],
    }),

    createUpdateProduct: build.mutation<
      API.ProductPayloadItem,
      API.ProductPayloadItem
    >({
      query: (payload) => ({
        url: payload.id === undefined ? "/products" : `/products/${payload.id}`,
        method: payload.id === undefined ? "POST" : "PATCH",
        body: payload,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "products" }])
            .forEach(({ originalArgs, endpointName }) => {
              if (endpointName === "getInfiniteProductsUser") {
                dispatch(
                  productApi.util.updateQueryData(
                    "getInfiniteProductsUser",
                    originalArgs,
                    (draft) => {
                      draft.data.forEach((item) => {
                        if (item.id === data.id) {
                          Object.assign(item, data);
                        }
                      });
                    },
                  ),
                );
              } else {
                dispatch(api.util.invalidateTags(["products"]));
              }
            });
        } catch {}
      },
      invalidatesTags: (_res, _err, request) => [
        ...(request.tags?.some((tag) => !tag.id)
          ? [{ type: "tags" as const, id: "product" }]
          : []),
      ],
    }),

    deleteProduct: build.mutation<void, { id: string }>({
      query: (body) => ({
        url: `/products/${body.id}`,
        method: "DELETE",
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          api.util
            .selectInvalidatedBy(getState(), [{ type: "products" }])
            .forEach(({ originalArgs, endpointName }) => {
              if (endpointName === "getInfiniteProductsUser") {
                dispatch(
                  productApi.util.updateQueryData(
                    "getInfiniteProductsUser",
                    originalArgs,
                    (draft) => {
                      const indexItem = draft.data.findIndex(
                        (item) => args.id === item.id,
                      );
                      const pageSize = Math.ceil(draft.total / draft.pageCount);
                      const refetchStartPage =
                        Math.floor(indexItem / pageSize) + 1;
                      dispatch(
                        productApi.endpoints.getInfiniteProductsUser.initiate(
                          { ...originalArgs, page: refetchStartPage },
                          { forceRefetch: true },
                        ),
                      );
                    },
                  ),
                );
              } else {
                dispatch(api.util.invalidateTags(["products"]));
              }
            });
        } catch {}
      },
    }),

    uploadImageFiles: build.mutation<
      { success: boolean },
      { id: string; files: File[] }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params.files?.map((file) => {
          bodyFormData.append("files", file);
        });
        bodyFormData.append("productId", params.id);
        return {
          url: "/products/upload/image",
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["products"],
    }),
    uploadAttachment: build.mutation<
      { success: boolean },
      { productId: string; files: File[]; authorId?: string }
    >({
      query: (params) => {
        const bodyFormData = new FormData();
        params.files?.map((file) => {
          bodyFormData.append("files", file);
        });
        bodyFormData.append("productId", params.productId);
        bodyFormData.append("authorId", params?.authorId ?? "");
        return {
          url: "/products/upload/attachment",
          method: "POST",
          body: bodyFormData,
          maxBodyLength: Infinity,
          formData: true,
        };
      },
      invalidatesTags: ["products"],
    }),
    deleteImageProduct: build.mutation<
      void,
      { productId: string; fileId: string }
    >({
      query: (body) => ({
        url: `products/${body.productId}/file/${body.fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["products", "projectFolder"],
    }),
    addProductToSchedule: build.mutation<
      any,
      { scheduleId: string; qd: API.QqAddProductToSchedule }
    >({
      query: (data) => ({
        url: `material-schedule/products/${data.scheduleId}`,
        method: "POST",
        body: data.qd,
      }),
      invalidatesTags: ["products"],
    }),
  }),
});

export const {
  useDeleteImageProductMutation,
  useUploadImageFilesMutation,
  useCreateUpdateProductMutation,
  useGetProductsQuery,
  useGetOneProductsQuery,
  useGetInfiniteProductsUserQuery,
  useLazyGetOneProductsQuery,
  useGetOneProductsUserQuery,
  useLazyGetOneProductsUserQuery,
  useDeleteProductMutation,
  useGetOneProductsMuMutation,
  useMuProductsMutation,
  useUploadAttachmentMutation,
  useAddProductToScheduleMutation,
} = productApi;
