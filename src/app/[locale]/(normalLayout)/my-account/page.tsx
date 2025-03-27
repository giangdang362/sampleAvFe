import MyAccount from "@/screens/myAccount/myAccount";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("myAccount");

const Page = () => {
  return (
    <>
      <MyAccount />
    </>
  );
};

export default Page;
