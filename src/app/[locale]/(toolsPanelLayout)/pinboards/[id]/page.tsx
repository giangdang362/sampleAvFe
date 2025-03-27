import Pinboard from "@/screens/projects/pinboard";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("pinboard", {
  name: "-",
});

const Page = () => {
  return <Pinboard />;
};

export default Page;
