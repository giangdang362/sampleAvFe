declare namespace API {
  type UserItem = {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    timeZone?: string;
    username?: string;
    active?: boolean;
    externalId?: string;
    email?: string;
    organizationId?: string;
    planId?: string;
    lastLogin?: string;
    avatar?: string;
    plan?: {
      id?: string;
      name?: string;
    };
    roles?: {
      id: number;
      name: string;
    }[];
    roleIds?: number[];
    perms?: string[];
    social?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
    company?: string;
    projectCount?: number;
    permission?: string;
    active?: string;
  };

  type RolePayload = {
    userId?: string;
    roleIds?: string[];
  };

  type UserQuery = API.CURDQuery & {};

  type typeMeRes = UserItem;

  type UpdateMePass = {
    oldPassword: string;
    password: string;
  };

  type ReUpdateMe = {
    firstName: string;
    timeZone: string;
    avatar: string;
    social: {
      linkedin: string;
    };
    company: string;
  };
}
