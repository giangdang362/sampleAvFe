import { useRouter } from "next-nprogress-bar";
import { useHref } from "./href";
import { useMemo } from "react";
import {
  NavigateOptions,
  PrefetchOptions,
} from "next/dist/shared/lib/app-router-context.shared-runtime";

export const useAvciRouter = () => {
  const router = useRouter();
  const createHref = useHref();

  return useMemo(
    () => ({
      ...router,
      push: (
        url: string,
        params?: Record<string, string>,
        options?: NavigateOptions,
      ) => {
        router.push(createHref(url, params), options);
      },
      replace: (
        url: string,
        params?: Record<string, string>,
        options?: NavigateOptions,
      ) => {
        router.replace(createHref(url, params), options);
      },
      prefetch: (
        url: string,
        params?: Record<string, string>,
        options?: PrefetchOptions,
      ) => {
        router.prefetch(createHref(url, params), options);
      },
    }),
    [createHref, router],
  );
};
