import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

export function useInfiniteQueryPage(filterParams?: unknown): {
  page: number;
  nextPage: () => void;
  setPage: Dispatch<SetStateAction<number>>;
  scrollRef: React.MutableRefObject<HTMLElement | null>;
} {
  const scrollRef = useRef<HTMLElement | null>(null);
  const [page, setPage] = useState(1);

  const serializedFilterParams =
    typeof filterParams === "object"
      ? JSON.stringify(filterParams)
      : filterParams;
  const prevSerializedFilterParamsRef = useRef(serializedFilterParams);

  const filterParamsChanged =
    prevSerializedFilterParamsRef.current !== serializedFilterParams;
  prevSerializedFilterParamsRef.current = serializedFilterParams;

  if (filterParamsChanged) {
    setPage(1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return {
    page: filterParamsChanged ? 1 : page,
    setPage,
    nextPage,
    scrollRef,
  };
}
