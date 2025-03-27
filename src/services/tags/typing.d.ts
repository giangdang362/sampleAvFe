declare namespace API {
  type TagItem = {
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    id: string;
    name: string;
    type: string;
    authorId: string;
  };

  type TagType = "file" | "partner" | "product";
}
