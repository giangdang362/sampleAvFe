import CreateNewPassword from "@/screens/auth/CreateNewPassword";
import { generateI18nMetadata } from "@/i18n";

export const generateMetadata = generateI18nMetadata("createNewPassword");

const CreateNewpassword = () => {
  return <CreateNewPassword />;
};

export default CreateNewpassword;
