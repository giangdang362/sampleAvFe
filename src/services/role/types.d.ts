declare namespace API {
  type Role = {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: number;
    slug: string;
    name: string;
    permissions: string[];
    isCanEdit: boolean;
    isActive: boolean;
    roleId?: string;
    parent?: string;
  };
}
