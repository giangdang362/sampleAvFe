import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { useLocale } from "next-intl";
import { paths } from "@/paths";

export default function IndexPage() {
  const locale = useLocale();
  redirect(`/${locale}${paths.admin.projects}`);
}

export const metadata: Metadata = {
  title: "Landing page",
};
