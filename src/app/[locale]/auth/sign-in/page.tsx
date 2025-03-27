import { SignInForm } from "@/screens/auth/SignInForm";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("signIn");

const Page = () => {
  return <SignInForm />;
};

export default Page;
