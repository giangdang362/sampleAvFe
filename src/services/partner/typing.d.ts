declare namespace API {
  type PartnerQuery = API.CURDQuery & {
    filter?: string;
  };
  type PartnersRes = API.CRUDResponse<PartnerItem>;
  type PartnerItem = {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id?: string;
    companyName?: string;
    author?: {
      id?: string;
      firstName?: string;
      lastName?: string;
    };
    website?: string;
    type?: string;
    organizationId?: string;
    addressId?: string;
    address?: Address;
    note?: string;
    partnerMembers?: PartnerMemberItem[];
    tags?: {
      id?: string;
      name?: string;
      createdAt?: string;
    }[];
    logoFile?: {
      id?: string;
      path?: string;
    };
    attachments: {
      id: string;
      mime: string;
      name: string;
      path: string;
      type: string;
    }[];
  };

  type Address = {
    id?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    email?: string;
    phone?: string;
    countryId?: string;
  };

  type CreatePartnerReq = {
    id?: string;
    companyName?: string;
    logo?: string;
    website?: string;
    type?: string;
    address: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      email?: string;
      phone?: string;
      countryId?: number;
    };
    tags: {
      name?: string;
    }[];
    note?: string;
    partnerMembers?: {
      name?: string;
      role?: string;
      email?: string;
      phone?: string;
    }[];
  };

  type MuOnePartner = {
    organizationId?: string;
    companyName: string;
    logo?: string;
    website: string;
    email?: string;
    phone?: string;
    country: number;
    type: string;
    address: {
      addressLine1?: string;
      addressLine2?: string;
      city: string;
      state: string;
      postcode: string;
      email: string;
      phone: string;
      countryId: string;
    };
    tags: {
      id?: string;
      name?: string;
    }[];
    notes?: string;
  };

  type getOnePartnerType = {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    companyName: string;
    logo?: string;
    website?: string;
    type: string;
    address: {
      id: string;
      city?: string;
      state?: string;
      postcode?: string;
      email?: string;
      phone?: string;
      countryId?: number;
    };
    partnerMembers: API.PartnerMemberItem[];
    logoFile?: string;
    tags: {
      id?: string;
      name?: string;
    }[];
    notes?: string;
  };
  type PartnerPayload = {
    id?: string;
    userId?: string;
    companyName?: string;
    logo?: string;
    website?: string;
    type?: string;
    note?: string;
    address?: {
      id?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postcode?: string;
      email?: string;
      phone?: string;
      countryId?: 0;
    };
    tags?: {
      id?: string;
      name?: string;
    }[];
    logoFile?: {
      id?: string;
      path?: string;
    };
  };

  type NewGet1Partner = {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    companyName: string;
    logo?: any;
    website: string;
    type: string;
    isAdminCreated: boolean;
    note?: string;
    organizationId: null;
    addressId: string;
    authorId: string;
    address: {
      id: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state?: string;
      postcode: string;
      email: string;
      phone: string;
      countryId: number;
      country: {
        id: number;
        slug: string;
        enName: string;
        zhoName: string;
      };
    };
    partnerMembers: any[];
    logoFile?: any;
    tags: any[];
    author: {
      id: string;
      firstName: string;
      lastName: string;
    };
    attachments: any[];
  };
}
