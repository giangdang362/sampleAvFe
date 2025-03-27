declare namespace API {
  type ProjectMaterialScheduleType = {
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    name: string;
    settings?: string;
    type?: string;
    projectId: string;
    attachments: any[];
    sectionIds?: string[];
    roleName: string;
    project: {
      id: string;
      projectUsers: {
        id: number;
        userId?: string;
      }[];
    };
    totalOriginalCost: number;
    totalSaving: number;
    totalFinalMaterialCost: number;
    totalDiscount: number;
    totalSupplier: number;
    sections: Sections[];
  };

  type Sections = {
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    name: string;
    projectFolderId: string;
    itemIds?: string;
    products?: Product[];
    percentageOfWholeProject: number;
    totalFinalCost: number;
    totalOriginalCost: number;
    totalSaving: number;
  };

  type Product = {
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    id: string;
    origin: string;
    series: string;
    model: string;
    effect: string;
    surface: string;
    antiBacterial: string;
    appliBacationArea1: string;
    applicationArea2: string;
    shadeVariation: string;
    edge: string;
    evaSuitable: string;
    sri: string;
    slipResistance: string;
    chemicalResistance: string;
    fireResistance: string;
    stainResistance: string;
    unitRate: number;
    unit: string;
    discount: number;
    isPrivate: boolean;
    type: string;
    name: string;
    status: string;
    description: string;
    detail: string;
    docCode: string;
    leadTime: string;
    url: string;
    brandName: string;
    sku: string;
    width: number;
    height: number;
    length: number;
    depth: number;
    quantity: number;
    color: string;
    material: string;
    rrp: number;
    metadata: any;
    note: string;
    favorite: boolean;
    importantNote: string;
    internalNote: string;
    supplierId: string;
    categoryId: string;
    organizationId: string;
    folderSectionId: string;
    authorId: string;
    imageIds: string;
    planId: string;
    supplier: Supplier;
    images?: {
      id: string;
      path: string;
    }[];
    attachments?: {
      id: string;
      path: string;
    }[];
    folderSection: {
      id: string;
      name: string;
      projectFolder: {
        id: string;
        name: string;
      };
    };
    originalCost: number;
    savings: number;
    finalCost: number;
    roleName: string;
    isAdminCreated: boolean;
  };

  type Supplier = {
    id: string;
    name: string;
    email: string;
    phone: string;
    partner: {
      id: string;
      companyName: string;
      website: string;
      authorId: string;
      logoFile: {
        id: string;
        name: string;
        path: string;
      };
    };
  };

  type RequestCreateProductSchedule = {
    scheduleId: string;
    sectionId: string;
    productId?: string;
    imageId?: string;
    type: string;
  };

  type RequestCreateSectionSchedule = {
    folderId: string;
    name: string;
    projectFolderType: string;
  };

  type StatusHistoryType = {
    data: History[];
  };

  type History = {
    createdAt: string;
    deletedAt: string;
    id: string;
    modifierId: string;
    modifier: {
      id: string;
      firstName: string;
      avatar: string;
    };
    newStatus: string;
    oldStatus: string;
    productId: string;
    reason: string;
    updatedAt: string;
  };
}
