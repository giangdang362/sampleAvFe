import UserProductsList from "@/screens/userProductsLibrary/UserProductsList";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("userLibrary");

function Page(): React.JSX.Element {
  return <UserProductsList />;
}

export default Page;
