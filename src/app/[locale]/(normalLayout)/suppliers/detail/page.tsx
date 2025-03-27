import DetailSuppliers from "@/screens/suppliers/DetailSuppliers";
import * as React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("supplierDetail", {
  name: "-",
});

export default function Page(): React.JSX.Element {
  return <DetailSuppliers />;
}
