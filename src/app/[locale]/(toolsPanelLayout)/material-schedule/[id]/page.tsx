import React from "react";
import MaterialSchedule from "@/screens/projects/material/material-schedule";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("materialSchedule", {
  name: "-",
});

function Page({ params }: { params: { id: string } }): React.JSX.Element {
  return <MaterialSchedule id={params.id} />;
}

export default Page;
