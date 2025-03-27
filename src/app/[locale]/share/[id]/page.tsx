import Pinboard from "@/screens/share/pinboard";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("share", {
  name: "-",
});

const Page = () => {
  return <Pinboard />;
};

export default Page;
