import DetailProduct from "@/screens/projects/material/material-schedule/ProductDetail/DetailProduct";
import * as React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("materialScheduleDetail", {
  name: "-",
});

export default function Page({
  params,
}: {
  params: { pro_id: string; id: string };
}): React.JSX.Element {
  return <DetailProduct scheduleId={params.id} id={params.pro_id} />;
}
