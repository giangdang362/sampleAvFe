import SignUp from "@/screens/auth/signUp/SignUp";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("signUp");

const SignUpPage = () => {
  return <SignUp />;
};

export default SignUpPage;
