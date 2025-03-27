declare namespace API {
  type ProductItem = {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    origin?: string;
    series?: string;
    model?: string;
    effect?: string;
    surface?: string;
    antiBacterial?: number;
    applicationArea1?: string;
    applicationArea2?: string;
    shadeVariation?: string;
    edge?: string;
    evaSuitable?: number;
    sri?: string;
    slipResistance?: string;
    chemicalResistance?: string;
    fireResistance?: string;
    stainResistance?: string;
    unitRate?: string;
    unit?: string;
    discount?: number;
    isPrivate?: boolean;
    type?: string;
    name?: string;
    status?: string;
    description?: string;
    detail?: string;
    docCode?: string;
    leadTime?: string;
    url?: string;
    brandName?: string;
    sku?: string;
    width?: number;
    height?: number;
    length?: number;
    depth?: number;
    quantity?: string;
    color?: string;
    material?: string;
    rrp?: string;
    metadata?: SpecificationItem[];
    note?: string;
    favorite?: boolean;
    importantNote?: string;
    internalNote?: string;
    supplierId?: string;
    categoryId?: string;
    organizationId?: string;
    folderSectionId?: string;
    authorId?: string;
    imageIds?: string;
    planId?: string;
    supplier?: string;
    images: {
      id: string;
      mine?: string;
      name?: string;
      path: string;
      thumbnail?: string;
    }[];
    author?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    attachments?: {
      id: string;
      name: string;
      path: string;
    }[];
  };

  type SpecificationItem = {
    id: string;
    label?: string;
    detail?: string;
  };

  type PartnerMemberItemTable = {
    id: string;
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
  };

  type ProductItemOld = {
    id?: string;
    type?: string;
    name?: string;
    statusId?: string;
    description?: string;
    detail?: string;
    docCode?: string;
    isPrivate?: boolean;
    leadTime?: string;
    url?: string;
    brandName?: string;
    sku?: string;
    width?: number;
    height?: number;
    length?: number;
    depth?: number;
    quantity?: number;
    color?: string;
    material?: string;
    rrp?: number;
    tradePrice?: number;
    createdAt?: string;
    // @TODO: Remove
    images?: {
      id: string;
      path: string;
    }[];
    author?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };

  type ParamSearchProduct = {
    field?: string;
    keyword?: string;
  };
  type ResponseSearchProduct = {};
  type ProductPayloadItem = {
    id?: string;
    name?: string;
    origin?: string;
    series?: string;
    model?: string;
    effect?: string;
    surface?: string;
    antiBacterial?: string | boolean;
    applicationArea1?: string;
    applicationArea2?: string;
    shadeVariation?: string;
    edge?: string;
    evaSuitable?: string | boolean;
    sri?: string;
    slipResistance?: string;
    stainResistance?: string;
    chemicalResistance?: string;
    fireResistance?: string;
    unitRate?: number;
    unit?: string;
    quantity?: number;
    discount?: number;
    status?: string;
    description?: string;
    detail?: string;
    docCode?: string;
    leadTime?: string;
    url?: string;
    brandName?: string;
    sku?: string;
    width?: number;
    height?: number;
    length?: number;
    depth?: number;
    color?: string;
    material?: string;
    rrp?: number;
    metadata?: {
      label?: string;
      detail?: string;
    }[];
    categoryId?: number;
    markup?: {};
    authorId?: string;
    planId?: string;
    isPrivate?: boolean;
    type?: string;
    supplierId?: string | null;
    importantNote?: string;
    internalNote?: string;
    note?: string;
    favorite?: boolean;
    imageIds?: string[];
    tags?: { id?: string; name?: string }[];
  };

  type ProductType = {
    id?: string;
    name: string;
    status: string;
    statusId?: string;
    description: string;
    detail: string;
    docCode?: string;
    leadTime: string;
    url: string;
    brandName: string;
    sku: string;
    width: number;
    height: number;
    length: number;
    depth: number;
    quantity?: number;
    color: string;
    material: string;
    rrp: number;
    finish: string;
    tradePrice: number;
    metadata?: DataSpecifications[];
    categoryId: number;
    images?: {
      id: string;
      path: string;
      thumbnail: string;
    }[];
    attachments?: {
      id: string;
      name: string;
      path: string;
    }[];
    markup?: object;
    organizationId?: string;
    planId?: string;
    isPrivate: boolean;
    type: string;
    supplier?: Supplier & {
      partner: Pick<
        API.PartnerItem,
        "companyName" | "id" | "logoFile" | "website"
      >;
    };
    supplierId?: string;
    note?: string;
    origin?: string;
    series?: string;
    model?: string;
    effect?: string;
    surface?: string;
    applicationArea1?: string;
    applicationArea2?: string;
    shadeVariation?: string;
    edge?: string;
    evaSuitable?: string;
    sri?: string;
    slipResistance?: string;
    stainResistance?: string;
    chemicalResistance?: string;
    fireResistance?: string;
    unitRate?: string;
    unit?: string;
    discount?: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    originalCost: number;
    savings: number;
    finalCost: number;
    roleName: string;
    isAdminCreated: boolean;
    productTags: { id: number; tag: { id: string; name: string } }[];
  };
  type ProductQuery = API.CURDQuery & {};

  type QqAddProductToSchedule = {
    type: string;
    productId: string;
    sectionId: string;
    quantity: number;
  };
}
