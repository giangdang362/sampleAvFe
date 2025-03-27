export const paths = {
  home: "/",
  downloadImportTemplate: "import/template/download",
  searchResult: "/search-result",
  imageSearchResult: "/image-search-result",
  auth: {
    prefix: "/auth",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    resetPassword: "/auth/reset-password",
    createNewPassword: "/auth/create-new-password",
  },
  admin: {
    // report
    report: "/report",
    sampleRequest: "/report/sample-request-summary",
    // product
    products: "/products",
    userLibrary: "/user-library",
    editProduct: "/products/edit",
    detailProduct: "/products/detail",
    createProduct: "/products/create-product",
    importResult: "/products/import-result",
    // project
    projects: "/projects",
    projectFiles: "/projects/{{id}}/files",
    projectManage: "/projects/{{id}}/manage",
    createProject: "/projects/create",
    materialSchedule: "/material-schedule",
    productDetail: "/projects/product-detail",
    pinboard: "/pinboards/{{id}}",
    deletedProject: "/deleted-projects",
    // image library
    imageLibrary: "/image-library",
    // supplier
    suppliers: "/suppliers",
    addSupplier: "/suppliers/new-supplier",
    addSupplierMember: "/suppliers/new-member-supplier",
    // userManagement
    userManagement: "/user-management",
    myAccount: "/my-account",
    // productAttributeManager
    productAttributeManager: "/product-attribute-manager",
  },
  app: {
    account: "/account",
    customers: "/customers",
    integrations: "/integrations",
    settings: "/settings",
    // product
    products: "/products",
    detailProduct: "/products/detail",
    // project
    projects: "/projects",
    projectFiles: "/projects/{{id}}/files",
    createProject: "/projects/create",
    materialSchedule: "/material-schedule",
    productDetail: "/projects/product-detail",
    pinboard: "/pinboards/{{id}}",
    deletedProject: "/deleted-projects/",
    // image library
    imageLibrary: "/image-library",
    // supplier
    suppliers: "/suppliers",
  },
  errors: { notFound: "/errors/not-found" },
  share: {
    prefix: "/share",
    share: "/share/{{id}}",
  },
  emailVerified: "/email-verified",
} as const;
