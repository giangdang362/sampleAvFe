import DetailProduct from "@/screens/products/ProductDetail/DetailProduct";
import * as React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("productDetail", {
  name: "-",
});

export default function Page({
  params,
}: {
  params: { id: string };
}): React.JSX.Element {
  return <DetailProduct id={params.id} />;
}
