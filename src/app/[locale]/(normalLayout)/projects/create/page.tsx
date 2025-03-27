import CreateProjectView from "@/screens/projects/create-project";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("createProject");

export default function Pages(): React.JSX.Element {
  return (
    <div>
      <CreateProjectView />
    </div>
  );
}
