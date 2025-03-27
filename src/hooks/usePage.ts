import { useQueryParamState } from "@/components/common/query-param-state/useQueryParamState";
import { parseAsPage } from "@/constants/queryParams";
import { useRef } from "react";

/**
 * reset the page when filterParams changed
 */
export function usePage(
  filterParams: unknown,
): [number, React.Dispatch<React.SetStateAction<number | null>>] {
  const [page, setPage] = useQueryParamState("page", parseAsPage, 1);

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
  }

  return [filterParamsChanged ? 1 : page, setPage];
}
