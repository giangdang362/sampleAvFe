import * as React from "react";
import ProductAttributeManager from "@/screens/productAttributeManager";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("attributeManager");

export default function Page(): React.JSX.Element {
  return <ProductAttributeManager />;
}
