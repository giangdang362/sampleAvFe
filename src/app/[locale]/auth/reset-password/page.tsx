import ForgotPasswordForm from "@/screens/auth/ForgotPasswordForm";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("resetPassword");

const Resetpassword = () => {
  return <ForgotPasswordForm />;
};

export default Resetpassword;
