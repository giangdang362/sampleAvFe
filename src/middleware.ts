import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { i18nConfig } from "./i18n";

export default async function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware(i18nConfig);
  const response = handleI18nRouting(request);
  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(zh|en)/:path*"],
};
// Test build
