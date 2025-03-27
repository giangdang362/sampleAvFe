declare namespace API {
  type ProjectFolderType = {
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    name: string;
    settings?: string;
    type?: string;
    projectId: string;
    sectionIds?: string;
    project?: {
      id: string;
      projectUsers?: [];
    };
  };

  type RequestCreatePinBoardOrSchedule = {
    name: string;
    projectId: string;
    type: string;
  };

  type PinBoardSchedule = {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    id: string;
    name: string;
    settings?: string;
    type: string;
    projectId: string;
    sectionIds?: string;
    project?: {
      id: string;
      projectUsers: {
        id: number;
        userId?: string;
      }[];
    };
    folderSections: FolderSections[];
    thumbnail: {
      thumbnail: string;
    } | null;
  };

  type FolderSections = {
    id: string;
    name: string;
    itemIds?: string[];
  };

  type ResSection = {
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    id: string;
    name: string;
    projectFolderId: string;
    itemIds?: string;
  };
}
