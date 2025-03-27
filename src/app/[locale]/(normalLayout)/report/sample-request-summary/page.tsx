import * as React from "react";
import { generateI18nMetadata } from "@/i18n";
import SampleRequestSummary from "@/screens/report/sampleRequestSummary";

export const generateMetadata = generateI18nMetadata("report");

export default function Page(): React.JSX.Element {
  return <SampleRequestSummary />;
}
