import ImageLibrary from "@/screens/imageLibrary";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("imageLibrary");

export default function Page() {
  return <ImageLibrary />;
}
