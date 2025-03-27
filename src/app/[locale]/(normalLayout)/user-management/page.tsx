import React from "react";
import ViewUserManagement from "@/screens/usersManagement";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("userManagement");

function Page(): React.JSX.Element {
  return <ViewUserManagement />;
}

export default Page;
