import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";
import { MessageKeys } from "next-intl";

export const adminNavItems = (
  t: (
    t: MessageKeys<
      IntlMessages,
      | "projects.title"
      | "products.title"
      | "suppliers.title"
      | "imageLibrary.title"
      | "userManagement.title"
      | "products.attributeManager"
      | "report.title"
    >,
  ) => string,
) => {
  return [
    {
      key: "projects",
      title: t("projects.title"),
      href: paths.admin.projects,
      icon: "projects",
      matcher: {
        type: "startsWith",
        href: [paths.admin.projects, paths.admin.materialSchedule],
      },
    },
    {
      key: "projectsDeleted",
      title: "Deleted Project",
      href: paths.admin.deletedProject,
      icon: "deleteProject",
      permissions: ["createUpdateProject"],
    },
    {
      key: "report",
      title: t("report.title"),
      href: paths.admin.report,
      icon: "report",
      permissions: ["createUpdateProject"],
      matcher: {
        type: "startsWith",
        href: [paths.admin.report, paths.admin.sampleRequest],
      },
    },
    {
      key: "products",
      title: t("products.title"),
      href: paths.admin.products,
      icon: "productLibrary",
      matcher: {
        type: "startsWith",
        href: [paths.admin.products, paths.admin.detailProduct],
      },
    },
    {
      key: "userLibrary",
      title: "User Product Library",
      href: paths.admin.userLibrary,
      icon: "userLibrary",
      permissions: ["createUpdateProject"],
      matcher: {
        type: "startsWith",
        href: [paths.admin.userLibrary, paths.admin.detailProduct],
      },
    },
    {
      key: "imageLibrary",
      title: t("imageLibrary.title"),
      href: paths.admin.imageLibrary,
      icon: "imageLibrary",
    },
    {
      key: "suppliers",
      title: t("suppliers.title"),
      href: paths.admin.suppliers,
      icon: "suppliers",
      matcher: {
        type: "startsWith",
        href: paths.admin.suppliers,
      },
    },
    {
      key: "userManagement",
      title: t("userManagement.title"),
      href: paths.admin.userManagement,
      icon: "user",
      permissions: ["createUpdateProduct"],
      matcher: {
        type: "startsWith",
        href: paths.admin.userManagement,
      },
    },
    {
      key: "productAttributeManager",
      title: t("products.attributeManager"),
      href: paths.admin.productAttributeManager,
      icon: "productAttributeManager",
      permissions: ["createUpdateProduct"],
      matcher: {
        type: "startsWith",
        href: paths.admin.productAttributeManager,
      },
    },
  ] satisfies NavItemConfig[];
};
