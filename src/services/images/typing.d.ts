declare namespace API {
  type PinterestPinQuery =
    | {
        pinId: string;
      }
    | {
        userId: string;
        boardId?: string;
      };

  type PinterestPin =
    | {
        images: {
          [key: string]: {
            width: number;
            height: number;
            url: string;
          };
        };
      }
    | {
        id: string;
        error: string;
      };
  type PinterestPinResponse = PinterestPin[];
}
