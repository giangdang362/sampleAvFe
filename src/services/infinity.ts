import { jsonStringifyEqualityCheck } from "@/utils/json";

type PageArg = { page: number };
type PagingArg = PageArg & { limit: number };

/**
 * WARN: Infinite scroll is not compatible with tag invalidation.
 * Use [Pessimistic Updates](https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#pessimistic-updates) to update data.
 */
export const infiniteScrollExtender = {
  merge: <T, R extends API.CRUDResponse<T>>(currentCache: R, newCache: R) => {
    /**
     * If we're receiving data from the first page, we should return that!
     * i.e.: We update an item from the first page
     */
    if (newCache.page === 1) return newCache;

    const perPage = Math.ceil(newCache.total / newCache.pageCount);

    /**
     * If we're receiving data from the same page that isn't the first one,
     * we should update the cache entries from that page with the new cache,
     * keeping the cache for the previous pages
     * i.e.: We update an item from the third page and we have fetched 3 pages already
     */
    if (currentCache.page > 1 && newCache.page === currentCache.page) {
      const start = perPage * (currentCache.page - 1);
      currentCache.data.splice(start, newCache.data.length, ...newCache.data);
      return;
    }
    /**
     * If we're receiving data from a page smaller than the current page
     * that isn't the first one, we should update the cache entries from
     * that page with the new cache, keeping the cache for the previous
     * pages
     * i.e.: We update an item from the second page and we have
     * fetched 3 pages already
     */
    if (currentCache.page > 1 && newCache.page < currentCache.page) {
      const amountToKeep = perPage * (newCache.page - 1);
      const intialData = currentCache.data.splice(0, amountToKeep);
      Object.assign(currentCache, {
        ...newCache,
        data: [...intialData, ...newCache.data],
      });
      return;
    }

    /**
     * Update the current cache with the new cache data and append the new
     * data from the dataKey.
     * i.e.: Infinite Scrolling
     */
    Object.assign(currentCache, {
      ...newCache,
      data: [...currentCache.data, ...newCache.data],
    });
  },
  serializeQueryArgs: ({ queryArgs }: { queryArgs: PagingArg }) =>
    JSON.stringify({ ...queryArgs, page: undefined }),
  forceRefetch: ({
    currentArg,
    previousArg,
  }: {
    currentArg: PagingArg | undefined;
    previousArg: PagingArg | undefined;
  }) => !jsonStringifyEqualityCheck(currentArg, previousArg),
};

/**
 * WARN: Infinite scroll is not compatible with tag invalidation.
 * Use [Pessimistic Updates](https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#pessimistic-updates) to update data.
 */
export const simpleInfiniteScrollExtender = {
  transformResponse: (data: unknown) => {
    if (!Array.isArray(data)) {
      throw new Error("Data have to be an array");
    }

    return { data, hasNextPage: data.length > 0 };
  },
  merge: <T, R extends { data: T[]; hasNextPage: boolean }>(
    currentCache: R,
    newCache: R,
    otherArgs: { arg: PageArg },
  ) => {
    const { arg } = otherArgs;

    if (arg.page === 1) {
      return newCache;
    }

    currentCache.data.push(...newCache.data);
    currentCache.hasNextPage = newCache.hasNextPage;
  },
  serializeQueryArgs: ({ queryArgs }: { queryArgs: PageArg }) =>
    JSON.stringify({ ...queryArgs, page: undefined }),
  forceRefetch: ({
    currentArg,
    previousArg,
  }: {
    currentArg: PageArg | undefined;
    previousArg: PageArg | undefined;
  }) => !jsonStringifyEqualityCheck(currentArg, previousArg),
};
