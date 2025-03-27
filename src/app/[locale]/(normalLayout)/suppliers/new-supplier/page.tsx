import { generateI18nMetadata } from "@/i18n";
import NewSupplierView from "@/screens/suppliers/NewSupplier";
import * as React from "react";

export const generateMetadata = generateI18nMetadata("addSupplier");

export default function Page(): React.JSX.Element {
  return <NewSupplierView />;
}
