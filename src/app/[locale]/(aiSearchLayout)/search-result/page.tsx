import SearchResult from "@/screens/searchResult/SearchResult";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("searchResult");

function Page(): React.JSX.Element {
  return <SearchResult />;
}

export default Page;
