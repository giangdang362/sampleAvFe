import ImageSearchResult from "@/screens/searchResult/ImageSearchResult";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("imageSearchResult");

function Page({ params }: { params: { id: string } }): React.JSX.Element {
  return <ImageSearchResult imageId={params.id} />;
}

export default Page;
