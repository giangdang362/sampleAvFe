declare namespace API {
  type PlanItem = {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id?: string;
    name?: string;
    description?: string;
    level?: number;
    settings?: {
      maxUser?: number;
      maxProject?: number;
      maxStorage?: number;
      monthlyPrice?: number;
    };
  };
}
