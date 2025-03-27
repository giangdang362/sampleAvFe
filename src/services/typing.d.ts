declare namespace API {
  type Access = {
    isAdmin: boolean;
    getUser: boolean;
    createUser: boolean;
    updateUser: boolean;
    updateUserRole: boolean;
    updateUserBan: boolean;
    deleteUser: boolean;
    getSetting: boolean;
    createSetting: boolean;
    updateSetting: boolean;
    deleteSetting: boolean;
    getCategory: boolean;
    createUpdateCategory: boolean;
    deleteCategory: boolean;
    getAllProduct: boolean;
    getProduct: boolean;
    createUpdateProduct: boolean;
    deleteProduct: boolean;
    getRole: boolean;
    createUpdateRole: boolean;
    deleteRole: boolean;
    sendMail: boolean;
    deleteMail: boolean;
    sendSms: boolean;
    getNotification: boolean;
    createUpdateNotification: boolean;
    deleteNotification: boolean;
    deleteFile: boolean;
    uploadFile: boolean;
    getFile: boolean;
    getPlan: boolean;
    updatePlan: boolean;
    getAllOrganization: boolean;
    getOrganization: boolean;
    createUpdateOrganization: boolean;
    deleteOrganization: boolean;
    getAllPartner: boolean;
    getPartner: boolean;
    createUpdatePartner: boolean;
    deletePartner: boolean;
    getAllProject: boolean;
    getProject: boolean;
    createUpdateProject: boolean;
    deleteProject: boolean;
    getAllProjectFolder: boolean;
    getProjectFolder: boolean;
    createUpdateProjectFolder: boolean;
    deleteProjectFolder: boolean;
    getAllImage: boolean;
  };
  type CRUDResponse<T> = {
    data: T[];
    count: number;
    pageCount: number;
    page: number;
    total: number;
  };
  type CURDQuery = {
    limit?: number;
    page?: number;
    querySearch?: string;
  };
  type CURDRequiredQuery = {
    limit: number;
    page: number;
    querySearch?: string;
  };
  type ErrorResponse<T extends any = {}> = {
    data?: {
      message: string;
      statusCode?: string;
      data?: T;
    };
    status: number;
  };
  type ErrorResponse2 = {
    message: string;
    statusCode: number;
  };
}
