import ViewProjectFiles from "@/screens/projects/project-files";
import React from "react";

export default function Page(): React.JSX.Element {
  return (
    <div>
      <ViewProjectFiles isDeleted />
    </div>
  );
}
