import useInfiniteScroll, {
  UseInfiniteScrollHookArgs,
  UseInfiniteScrollHookRefCallback,
} from "react-infinite-scroll-hook";

export function useInfiniteSentry(
  args: UseInfiniteScrollHookArgs,
): UseInfiniteScrollHookRefCallback {
  return useInfiniteScroll({
    delayInMs: 500,
    rootMargin: "0px 0px 100px 0px",
    ...args,
  })[0];
}
