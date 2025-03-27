import UserDetail from "@/screens/usersManagement/UserDetail";
import * as React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("userManagementDetail", {
  name: "-",
});

export default function Page({
  params,
}: {
  params: { id: string };
}): React.JSX.Element {
  return <UserDetail id={params.id} />;
}
