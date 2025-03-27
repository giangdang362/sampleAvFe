import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { ChartPie as ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { AddressBook } from "@phosphor-icons/react/dist/ssr/AddressBook";
import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import { Trash } from "@phosphor-icons/react/dist/ssr/Trash";
import { BookOpen } from "@phosphor-icons/react/dist/ssr/BookOpen";
import { Images } from "@phosphor-icons/react/dist/ssr/Images";
import { UserCircleGear } from "@phosphor-icons/react/dist/ssr/UserCircleGear";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faBookOpenCover,
  faBriefcase,
  faImage,
  faTrashCan,
  faUserGear,
  faPenField,
  faFolderBookmark,
} from "@/lib/fas/pro-duotone-svg-icons";

import {
  faAddressBook as faAddressBookLight,
  faBookOpenCover as faBookOpenCoverLight,
  faBriefcase as faBriefcaseLight,
  faImage as faImageLight,
  faTrashCan as faTrashCanLight,
  faUserGear as faUserGearLight,
  faPenField as faPenFieldLight,
  faFolderBookmark as faFolderBookmarkLight,
} from "@/lib/fas/pro-light-svg-icons";

export const navIcons = {
  "chart-pie": ChartPieIcon,
  projects: Briefcase,
  "delete-project": Trash,
  "product-library": BookOpen,
  images: Images,
  suppliers: AddressBook,
  "user-management": UserCircleGear,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;

export const navIconsDefault = {
  projects: <FontAwesomeIcon icon={faBriefcaseLight} />,
  deleteProject: <FontAwesomeIcon icon={faTrashCanLight} />,
  report: <FontAwesomeIcon icon={faFolderBookmarkLight} />,
  productLibrary: <FontAwesomeIcon icon={faBookOpenCoverLight} />,
  imageLibrary: <FontAwesomeIcon icon={faImageLight} />,
  suppliers: <FontAwesomeIcon icon={faAddressBookLight} />,
  user: <FontAwesomeIcon icon={faUserGearLight} />,
  productAttributeManager: <FontAwesomeIcon icon={faPenFieldLight} />,
} as Record<string, React.JSX.Element>;

export const navIconsActive = {
  projects: <FontAwesomeIcon icon={faBriefcase} />,
  deleteProject: <FontAwesomeIcon icon={faTrashCan} />,
  report: <FontAwesomeIcon icon={faFolderBookmark} />,
  productLibrary: <FontAwesomeIcon icon={faBookOpenCover} />,
  imageLibrary: <FontAwesomeIcon icon={faImage} />,
  suppliers: <FontAwesomeIcon icon={faAddressBook} />,
  user: <FontAwesomeIcon icon={faUserGear} />,
  productAttributeManager: <FontAwesomeIcon icon={faPenField} />,
} as Record<string, React.JSX.Element>;
