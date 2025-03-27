import * as React from "react";
import ProductList from "@/screens/products";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("products");

export default function Page(): React.JSX.Element {
  return <ProductList />;
}
