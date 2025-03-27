declare namespace API {
  type PartnerMemberItem = {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    partnerId: string;
    partner: API.PartnerItem;
  };
  type PartnerMemberRes = API.CRUDResponse<PartnerMemberItem>;
  type PartnerMemberPayload = {
    partnerId?: string;
    id?: string;
    name?: string;
    role?: string;
    email?: string;
    phone?: string;
  };
}
