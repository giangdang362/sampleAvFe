import DeletedListProjects from "@/screens/projects/deleted-list";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("deletedProject");

function Page(): React.JSX.Element {
  return <DeletedListProjects />;
}

export default Page;
