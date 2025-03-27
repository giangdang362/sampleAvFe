/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

const checkRole = (currentUser: API.UserItem | undefined) => {
  return (roles: string[]): boolean => {
    if (!currentUser || !currentUser.perms) {
      return false;
    }

    const per = currentUser.perms;
    if (per.includes("all")) {
      return true;
    }

    return roles.every((role) => per.includes(role));
  };
};

export default function access(
  initialState: { currentUser?: API.UserItem; isLoading?: boolean } | undefined,
): API.Access & { userAvailable: boolean; userLoading?: boolean } {
  const { currentUser, isLoading } = initialState ?? {};
  const c = checkRole(currentUser);

  return {
    userAvailable: !!currentUser,
    userLoading: isLoading,

    isAdmin: c(["IS_ADMIN"]),

    getUser: c(["GET_USER"]),
    createUser: c(["CREATE_USER"]),
    updateUser: c(["UPDATE_USER"]),
    updateUserRole: c(["UPDATE_USER_ROLE"]),
    updateUserBan: c(["UPDATE_USER_BAN"]),
    deleteUser: c(["DELETE_USER"]),

    getSetting: c(["GET_SETTING"]),
    createSetting: c(["CREATE_SETTING"]),
    updateSetting: c(["UPDATE_SETTING"]),
    deleteSetting: c(["DELETE_SETTING"]),

    getCategory: c(["GET_CATEGORY"]),
    createUpdateCategory: c(["CREATE_UPDATE_CATEGORY"]),
    deleteCategory: c(["DELETE_CATEGORY"]),

    getAllProduct: c(["GET_ALL_PRODUCT"]),
    getProduct: c(["GET_PRODUCT"]),
    createUpdateProduct: c(["CREATE_UPDATE_PRODUCT"]),
    deleteProduct: c(["DELETE_PRODUCT"]),

    getRole: c(["GET_ROLE"]),
    createUpdateRole: c(["CREATE_UPDATE_ROLE"]),
    deleteRole: c(["DELETE_ROLE"]),

    sendMail: c(["SEND_MAIL"]),
    deleteMail: c(["DELETE_MAIL"]),
    sendSms: c(["SEND_SMS"]),

    getNotification: c(["GET_NOTIFICATION"]),
    createUpdateNotification: c(["CREATE_UPDATE_NOTIFICATION"]),
    deleteNotification: c(["DELETE_NOTIFICATION"]),

    deleteFile: c(["DELETE_FILE"]),
    uploadFile: c(["UPLOAD_FILE"]),
    getFile: c(["GET_FILE"]),

    getPlan: c(["GET_PLAN"]),
    updatePlan: c(["UPDATE_PLAN"]),

    getAllOrganization: c(["GET_ALL_ORGANIZATION"]),
    getOrganization: c(["GET_ORGANIZATION"]),
    createUpdateOrganization: c(["CREATE_UPDATE_ORGANIZATION"]),
    deleteOrganization: c(["DELETE_ORGANIZATION"]),

    getAllPartner: c(["GET_ALL_PARTNER"]),
    getPartner: c(["GET_PARTNER"]),
    createUpdatePartner: c(["CREATE_UPDATE_PARTNER"]),
    deletePartner: c(["DELETE_PARTNER"]),

    getAllProject: c(["GET_ALL_PROJECT"]),
    getProject: c(["GET_PROJECT"]),
    createUpdateProject: c(["CREATE_UPDATE_PROJECT"]),
    deleteProject: c(["DELETE_PROJECT"]),

    getAllProjectFolder: c(["GET_ALL_PROJECT_FOLDER"]),
    getProjectFolder: c(["GET_PROJECT_FOLDER"]),
    createUpdateProjectFolder: c(["CREATE_UPDATE_PROJECT_FOLDER"]),
    deleteProjectFolder: c(["DELETE_PROJECT_FOLDER"]),

    getAllImage: c(["GET_ALL_IMAGE"]),
  };
}
