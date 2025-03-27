import CreateProduct from "@/screens/products/CreateProduct";
import * as React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("createProduct");

export default function Page(): React.JSX.Element {
  return <CreateProduct />;
}
