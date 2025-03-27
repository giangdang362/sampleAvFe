import React from "react";
import ViewSuppliers from "@/screens/suppliers";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("suppliers");

function Page(): React.JSX.Element {
  return <ViewSuppliers />;
}

export default Page;
