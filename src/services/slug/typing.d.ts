declare namespace API {
  type SlugItem = {
    id: number;
    slug: string;
    enName: string;
    zhoName: string;
    description?: string;
    children: SlugItem[];
  };

  type SlugRes = SlugItem;

  type SlugCreateReq = Pick<SlugItem, "slug" | "enName" | "zhoName"> &
    Partial<Pick<SlugItem, "description">> & {
      parent: {
        id: number;
      };
    };
  type SlugCreateRes = Pick<
    SlugItem,
    "id" | "slug" | "enName" | "zhoName" | "description"
  >;

  type SlugPatchReq = Pick<SlugItem, "id"> &
    Partial<Pick<SlugItem, "enName" | "zhoName" | "description">>;
  type SlugPatchRes = SlugCreateRes;
}
