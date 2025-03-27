declare namespace API {
  type PinboardImage = {
    id: string;
    type: "pin_board_image" | "pin_board_text";
    path?: string;
    thumbnail?: string;
    mime?: string;
    note?: string | null;
    link?: string | null;
    comment?: string | null;
    colSpan: number;
    xAxis: number;
  };
  type PinboardSection = FolderSections & {
    images: PinboardImage[];
  };
  type Pinboard = {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: string;
    name: string;
    settings?: string;
    type: string;
    projectId: string;
    sectionIds?: string[];
    roleName: string;
    project: {
      id: string;
      projectUsers: {
        id: number;
        userId?: string;
      }[];
      name: string;
    } | null;
    sections: PinboardSection[];
    thumbnailId: string | null;
    shares: Share[];
  };

  type QdAddImagePinboard = {
    fileIds: string[];
    sectionId: string;
  };
}
