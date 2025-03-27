import ViewProjectFiles from "@/screens/projects/project-files";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("projectFiles", {
  name: "-",
});

export default function Page(): React.JSX.Element {
  return (
    <div>
      <ViewProjectFiles />
    </div>
  );
}
