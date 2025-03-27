declare namespace API {
  type ImageLibraryRes = API.CRUDResponse<ImageLibraryItem>;

  type UpdateImageLibraryReq = {
    id: string;
    name?: string;
    comment?: string;
    tags?: {
      id?: string | null;
      name?: string;
    }[];
    note?: string;
  };

  type ImageLibraryItem = {
    author?: {
      id?: string;
      firstName?: string;
      avatar?: string;
    };
    colSpan?: number;
    comment?: string;
    createdAt?: string;
    deletedAt?: string;
    folderSectionId?: string;
    id?: string;
    isArchive?: string;
    link?: string;
    mime?: string;
    name?: string;
    note?: string;
    organizationId?: string;
    originId?: string;
    partnerId?: string;
    path?: string;
    planId?: string;
    productAttachmentId?: string;
    productImgId?: string;
    scheduleId?: string;
    size?: number;
    thumbnail?: string;
    type?: string;
    updatedAt?: string;
    xAxis?: number;
    description?: string;
    tagFiles?: { id: string; tag: TagItem }[];
  };
  type UploadPinterestPayload = {
    imageUrls?: string[];
    planId?: string;
    userId?: string;
  };
}
