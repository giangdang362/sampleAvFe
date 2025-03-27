declare namespace API {
  type SampleRequest = {
    id: string;
    requesterId?: string;
    productId?: string;
    content?: string;
    type?: string;
    status?: string;
    modifierId?: string;
    modifier?: API.UserItem;
    requester?: {
      id?: string;
      firstName?: string;
      avatar?: string;
    };
    product?: {
      id?: string;
      series?: string;
      model?: string;
      material?: string;
      brandName?: string;
      originId?: string;
    };

    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
  };
}
