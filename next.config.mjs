import createNextIntlPlugin from "next-intl/plugin";
import withBundleAnalyzerFn from "@next/bundle-analyzer";
const withBundleAnalyzer = withBundleAnalyzerFn({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react/dist/ssr"],
  },
};

// export default nextConfig;
export default withBundleAnalyzer(withNextIntl(nextConfig));
