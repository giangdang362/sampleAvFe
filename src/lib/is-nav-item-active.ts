import type { NavItemConfig } from "@/types/nav";

export function isNavItemActive({
  disabled,
  external,
  href,
  matcher,
  pathname,
}: Pick<NavItemConfig, "disabled" | "external" | "href" | "matcher"> & {
  pathname: string;
}): boolean {
  if (disabled || !href || external) {
    return false;
  }

  if (matcher) {
    const matcherHrefs = Array.isArray(matcher.href)
      ? matcher.href
      : [matcher.href];

    if (matcher.type === "startsWith") {
      return matcherHrefs.some((matcherHref) =>
        pathname.startsWith(matcherHref),
      );
    }

    if (matcher.type === "equals") {
      return matcherHrefs.some((matcherHref) => pathname === matcherHref);
    }

    return false;
  }

  return pathname === href;
}
