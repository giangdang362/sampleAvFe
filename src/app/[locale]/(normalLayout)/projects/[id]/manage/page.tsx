import ManageProjectView from "@/screens/projects/manage-project";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("projectManage", {
  name: "-",
});

function Page() {
  return <ManageProjectView />;
}

export default Page;
