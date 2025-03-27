declare namespace API {
  type ProjectItem = {
    coverInfo?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    website: string;
    name: string;
    coverImageFile?: {
      path: string;
      thumbnail: string;
      id: string;
    };
    coverImage?: string;
    description: string;
    isArchive?: false;
    addressId: string;
    organizationId: string;
    authorId: string;
    modifierId?: string;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      email?: string;
      avatar?: string;
    };
    modifier?: {
      avatar?: string;
      firstName?: string;
      lastName?: string;
    };
    address: {
      createdAt: string;
      updatedAt: string;
      deletedAt?: string;
      id: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postcode: string;
      email: string;
      phone: string;
      countryId?: number;
      country: ?{
        id?: number;
        enName?: string;
        zhoName?: string;
      };
    };
    projectUsers?: {
      id: number;
      permission: string;
      email: string;
      status: string;
      userId: string;
      projectId: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string;
      };
    }[];
    progress: {
      totalClientApprove: number;
      totalRequest: number;
      totalInternalApprove: number;
      total: number;
      donePercent: number;
      workingPercent: number;
      stuckPercent: number;
    };
    roleName: string;
  };

  type ProjectType = {
    id?: number;
    enName?: string;
    zhoName?: string;
  };

  type pjUser = {
    id: number;
    permission: "owner";
    email: null;
    status: "pending";
    userId: null;
    projectId: "4acdbe07-c4e0-4b46-bfc7-705a29b8aed3";
    user: null;
  };

  type ProjectUsers = {
    id: string;
    firstname: string;
    lastname: string;
    avatar: string;
    email: string;
    permissions: string;
  };

  type ProjectAddress = {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    countryId?: number;
  };

  type Modifier = {
    id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    email?: string;
  };

  type CreateDto = {
    address: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postcode: string;
      countryId: number;
    };
    name: string;
    website: string;
    description: string;
    organizationId?: string;
    typeId: number;
    id?: string;
    projectUsers?: ProjectUsers[];
  };

  type CountriesRes = {
    id: number;
    slug: string;
    enName: string;
    zhoName: string;
    description: string;
    children: CountriesRes[];
  };

  type ProjectQuery =
    | (API.CURDQuery & {
        include_deleted?: string;
      })
    | void;

  type UpdateBanner = {
    coverInfo?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };

  type CreateProjectRequest = {
    coverInfo?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    id?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    address?: {
      id?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      email?: string;
      phone?: string;
      countryId: number;
    };
    name?: string;
    website?: string;
    coverImage?: string;
    description?: string;
    isArchive?: boolean;
    projectUsers?: {
      id?: number;
      permission?: string | null;
      email?: string;
      userId?: string | null;
    }[];
    authorId?: string;
    typeId?: number;
  };

  type projectUsers = {
    permission?: string;
    email?: string;
    userId?: string;
  }[];

  type memberAddToProjectRequest = {
    members: memberRequest[];
  };

  type memberRequest = {
    permission: string;
    email: string;
    userId?: string;
  };

  type PjMember = {
    id: number;
    permission: string;
    email?: string;
    status: string;
    userId?: string;
    projectId: string;
    user?: {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };

  type RqUpdateMemberPj = {
    id: number;
    permission: string;
  };

  type RqMemberQuery = API.CURDQuery & {};
}
