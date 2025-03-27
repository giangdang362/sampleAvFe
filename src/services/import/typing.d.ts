declare namespace API {
  type ImportResultItem = {
    id?: string;
    key?: string;
    fileName?: string;
    totalLine: number;
    processed: number;
    totalError: number;
    errors?: string;
    importer?: {
      id?: string;
      name?: string;
      firstName?: string;
      email?: string;
      avatar?: string;
    };
    isFinished?: boolean;
    createdAt?: string;
    updatedAt?: number;
    deletedAt?: string;
  };
  type ImportErrItem = {
    data?: {
      line?: number;
      excelCell?: string;
      fieldName?: string;
      inputData?: string;
    };
    message?: string;
  };
}
