import ViewProjects from "@/screens/projects/list-projects";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("projects");

function Page(): React.JSX.Element {
  return <ViewProjects />;
}

export default Page;
