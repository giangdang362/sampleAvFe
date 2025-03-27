import EmailVerified from "@/screens/auth/signUp/EmailVerified";
import React from "react";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("emailVerified");

const Emailverified = () => {
  return <EmailVerified />;
};

export default Emailverified;
