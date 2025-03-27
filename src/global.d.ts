import common from "../messages/en/common.json";
import menu from "../messages/en/menu.json";
import products from "../messages/en/products.json";
import suppliers from "../messages/en/suppliers.json";
import pinboard from "../messages/en/pinboard.json";
import projects from "../messages/en/projects.json";
import addImages from "../messages/en/addImages.json";
import filesUpload from "../messages/en/filesUpload.json";
import userManagement from "../messages/en/userManagement.json";
import toolsPanel from "../messages/en/toolsPanel.json";
import imageLibrary from "../messages/en/imageLibrary.json";
import tErrorMsg from "../messages/en/errorMsg.json";
import myAccount from "../messages/en/myAccount.json";
import pageTitle from "../messages/en/pageTitle.json";
import signUp from "../messages/en/signUp.json";
import signIn from "../messages/en/signIn.json";
import report from "../messages/en/report.json";

type Messages = typeof common &
  typeof menu &
  typeof products &
  typeof suppliers &
  typeof pinboard &
  typeof projects &
  typeof addImages &
  typeof filesUpload &
  typeof userManagement &
  typeof toolsPanel &
  typeof imageLibrary &
  typeof myAccount &
  typeof tErrorMsg &
  typeof pageTitle &
  typeof signUp &
  typeof signIn &
  typeof report;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
