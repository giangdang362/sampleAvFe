import {
  MaybeDrafted,
  PatchCollection,
} from "@reduxjs/toolkit/dist/query/core/buildThunks";
import { api } from "../api";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const clientOrderTagSuffix = "-client-order";

const slugTags = (
  res: API.SlugRes | undefined,
  err: FetchBaseQueryError | undefined,
) =>
  err || !res
    ? []
    : [
        { type: "slug" as const, id: "LIST" },
        { type: "slug" as const, id: res.id },
        ...res.children
          .flatMap((item) => [item, ...item.children])
          .map((item) => ({ type: "slug" as const, id: item.id })),
      ];

const findSlugItem = (
  item: MaybeDrafted<API.SlugItem>,
  id: number,
): [API.SlugItem, API.SlugItem | undefined] | undefined => {
  if (item.id === id) {
    return [item, undefined];
  }

  for (const child of item.children) {
    if (child.id === id) {
      return [child, item];
    }

    for (const grandchild of child.children) {
      if (grandchild.id === id) {
        return [grandchild, child];
      }
    }
  }
};

export const slugApi = api.injectEndpoints({
  endpoints: (build) => ({
    getConstSlug: build.query<API.SlugRes, { slug: string }>({
      query: (params) => ({
        url: `/const/slug/${params.slug}`,
        method: "GET",
      }),
      providesTags: slugTags,
    }),
    getClientOrderConstSlug: build.query<API.SlugRes, { slug: string }>({
      query: (params) => ({
        url: `/const/slug/${params.slug}`,
        method: "GET",
      }),
      providesTags: (res, err) =>
        slugTags(res, err).map((tag) => ({
          type: tag.type,
          id: tag.id + clientOrderTagSuffix,
        })),
    }),
    createConstSlug: build.mutation<API.SlugCreateRes, API.SlugCreateReq>({
      query: (body) => ({
        url: "/const",
        method: "POST",
        body,
      }),
      async onQueryStarted({ parent }, { dispatch, queryFulfilled, getState }) {
        try {
          const result = await queryFulfilled;

          for (const {
            endpointName,
            originalArgs,
          } of slugApi.util.selectInvalidatedBy(getState(), [
            { type: "slug" as const, id: parent.id + clientOrderTagSuffix },
          ])) {
            if (endpointName !== "getClientOrderConstSlug") continue;

            dispatch(
              slugApi.util.updateQueryData(
                endpointName,
                originalArgs,
                (draft) => {
                  const item = findSlugItem(draft, parent.id)?.[0];
                  if (item) {
                    item.children.unshift({ ...result.data, children: [] });
                  }
                },
              ),
            );
          }
        } catch {}
      },
      invalidatesTags: (_, err, args) =>
        err ? [] : [{ type: "slug" as const, id: args.parent.id }],
    }),
    patchConstSlug: build.mutation<API.SlugPatchRes, API.SlugPatchReq>({
      query: ({ id, ...body }) => ({
        url: `/const/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted(
        { id, ...body },
        { dispatch, queryFulfilled, getState },
      ) {
        const patchResult: PatchCollection[] = [];

        try {
          for (const {
            endpointName,
            originalArgs,
          } of slugApi.util.selectInvalidatedBy(getState(), [
            { type: "slug" as const, id: id + clientOrderTagSuffix },
          ])) {
            if (endpointName !== "getClientOrderConstSlug") continue;

            patchResult.push(
              dispatch(
                slugApi.util.updateQueryData(
                  endpointName,
                  originalArgs,
                  (draft) => {
                    const item = findSlugItem(draft, id)?.[0];
                    if (item) {
                      Object.assign(item, body);
                    }
                  },
                ),
              ),
            );
          }

          await queryFulfilled;
        } catch {
          patchResult.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_, err, args) =>
        err ? [] : [{ type: "slug" as const, id: args.id }],
    }),
    deleteConstSlug: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/const/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;

          for (const {
            endpointName,
            originalArgs,
          } of slugApi.util.selectInvalidatedBy(getState(), [
            { type: "slug" as const, id: "LIST" + clientOrderTagSuffix },
          ])) {
            if (endpointName !== "getClientOrderConstSlug") continue;

            dispatch(
              slugApi.util.updateQueryData(
                endpointName,
                originalArgs,
                (draft) => {
                  const parent = findSlugItem(draft, id)?.[1];
                  if (parent) {
                    parent.children.splice(
                      parent.children.findIndex((item) => item.id === id),
                      1,
                    );
                  }
                },
              ),
            );
          }
        } catch {}
      },
      invalidatesTags: (_, err) =>
        err ? [] : [{ type: "slug" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetConstSlugQuery,
  useGetClientOrderConstSlugQuery,
  usePatchConstSlugMutation,
  useCreateConstSlugMutation,
  useDeleteConstSlugMutation,
} = slugApi;
