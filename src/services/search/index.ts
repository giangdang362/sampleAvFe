import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { api } from "../api";
import {
  infiniteScrollExtender,
  simpleInfiniteScrollExtender,
} from "../infinity";
import {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import {
  BaseQueryMeta,
  QueryReturnValue,
} from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { userApi } from "../user";
import access from "@/lib/access";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";

const searchProductQuery = (params: API.SearchProductRequest) => ({
  url: "search/products",
  method: "GET",
  params: Object.entries(params).flatMap((entry) =>
    Array.isArray(entry[1])
      ? entry[1].flatMap((v): [string, string][] => (v ? [[entry[0], v]] : []))
      : [entry],
  ),
});

const searchQueryFn =
  <
    A,
    T extends string | FetchArgs,
    B extends BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    V extends unknown,
    R extends QueryReturnValue<
      V,
      FetchBaseQueryError,
      BaseQueryMeta<BaseQueryFn<B>>
    >,
  >(
    query: (args: A) => T,
    transformResponse?: (
      baseQueryReturnValue: unknown,
      meta: {} | undefined,
      arg: A,
    ) => MaybePromise<V>,
  ) =>
  async (
    args: A,
    api: BaseQueryApi,
    _extraOptions: unknown,
    baseQuery: (arg: T) => ReturnType<B>,
  ): Promise<R> => {
    const { data } = await api.dispatch(
      userApi.endpoints.getMyAccount.initiate(),
    );
    const isAdmin = access({ currentUser: data }).isAdmin;

    let apiQuery = query(args);
    if (isAdmin && typeof apiQuery === "object") {
      const params = apiQuery.params ?? apiQuery.body;
      const paramType =
        apiQuery.params !== undefined && apiQuery.params !== null
          ? "params"
          : "body";

      if (Array.isArray(params)) {
        apiQuery = {
          ...apiQuery,
          [paramType]: [...params, ["all", true]],
        } as T;
      } else if (typeof params === "object" && params) {
        apiQuery = { ...apiQuery, [paramType]: { ...params, all: true } } as T;
      }
    }

    try {
      const result = (await baseQuery(apiQuery)) as R;
      if (result.data && transformResponse) {
        const response = await transformResponse(
          result.data,
          result.meta,
          args,
        );
        return { ...result, data: response };
      }

      return result;
    } catch (error) {
      return { error } as R;
    }
  };

export const searchApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchProducts: build.query<
      API.SearchProductResponse,
      API.SearchProductRequest
    >({
      queryFn: searchQueryFn(searchProductQuery),
    }),
    searchInfiniteProducts: build.query<
      API.SearchProductResponse,
      API.SearchProductRequest
    >({
      queryFn: searchQueryFn(searchProductQuery),
      ...infiniteScrollExtender,
    }),
    searchInfiniteProductsBySeries: build.query<
      API.SearchProductBySeriesResponse,
      API.SearchProductBySeriesRequest
    >({
      queryFn: searchQueryFn((params) => ({
        url: "search/products/by-series",
        method: "GET",
        params,
      })),
      ...infiniteScrollExtender,
    }),
    searchInfiniteImages: build.query<
      API.SearchImageResponse,
      API.SearchImageRequest
    >({
      query: (params) => ({
        url: `search/images?${RequestQueryBuilder.create({
          search: params.s
            ? {
                $or: [
                  { name: { $cont: params.s } },
                  { "tagFiles.tag.name": { $cont: params.s } },
                ],
              }
            : undefined,
          limit: params.limit,
          page: params.page,
        }).query()}`,
        method: "GET",
      }),
      ...infiniteScrollExtender,
    }),
    uploadImageAISearch: build.mutation<
      {
        message: string;
        statusCode: string;
        key: string;
      },
      { file: File }
    >({
      query: (params) => {
        const formData = new FormData();
        formData.append("files", params.file);
        return {
          url: `search/products/upload/images`,
          method: "POST",
          body: formData,
          // headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
          formData: true,
        };
      },
    }),
    getSearchKeyByImageId: build.mutation<
      {
        message: string;
        statusCode: string;
        key: string;
      },
      { imageId: string }
    >({
      query: (params) => ({
        url: `search/products/get-product-image/${params.imageId}`,
        method: "POST",
      }),
    }),
    searchInfiniteProductsByImages: build.query<
      { data: API.AiSearchProduct[]; hasNextPage: boolean },
      API.InfiniteAiSearchPayload
    >({
      queryFn: searchQueryFn((payload) => {
        return {
          url: `search/products/by-images?${payload?.querySearch ? payload.querySearch : ""}`,
          method: "POST",
          body: payload,
        };
      }, simpleInfiniteScrollExtender.transformResponse),
      ...simpleInfiniteScrollExtender,
      transformResponse: undefined,
    }),
  }),
});

export const {
  useSearchProductsQuery,
  useSearchInfiniteProductsQuery,
  useSearchInfiniteProductsBySeriesQuery,
  useSearchInfiniteImagesQuery,
  useUploadImageAISearchMutation,
  useSearchInfiniteProductsByImagesQuery,
  useGetSearchKeyByImageIdMutation,
} = searchApi;
