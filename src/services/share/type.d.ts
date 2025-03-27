declare namespace API {
  type Share = {
    id: string;
    email: string | null;
    isActive: boolean;
    type: string;
  };

  type ShareResponse = Pinboard;
}
