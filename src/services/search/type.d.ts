declare namespace API {
  type SearchProductRequest = {
    s?: string;
    brand?: string[];
    material?: string[];
    color?: string[];
    application?: string[];
    effect?: string[];
    origin?: string[];
    limit: number;
    page: number;
  };

  type SearchProduct = {
    id: string;
    brandName?: string;
    origin?: string;
    series?: string;
    model?: string;
    surface?: string;
    color?: string;
    sizeGroup?: string;
    material?: string;
    images: {
      id: string;
      path: string;
      thumbnail?: string;
    }[];
  };

  type SearchProductResponse = CRUDResponse<SearchProduct>;

  type SearchProductBySeriesRequest = {
    series: string;
    model: string;
    color?: string;
    surface?: string;
    sizeGroup?: string;
    excludeId?: string;
    limit: number;
    page: number;
  };

  type SeriesData = {
    colors: string[];
    surfaces: string[];
    sizeGroup: string[];
  };

  type SearchProductBySeriesResponse = CRUDResponse<SearchProduct> & {
    seriesData: {
      origin: SeriesData;
      filtered: SeriesData;
    };
  };

  type SearchImageRequest = {
    s?: string;
    limit: number;
    page: number;
  };

  type SearchImage = {
    id: string;
    name: string;
    path: string;
    thumbnail: string;
  };

  type SearchImageResponse = CRUDResponse<SearchImage>;

  type AiSearchProduct = SearchProduct & {
    score: number;
  };

  type AiSearchPayload = {
    key: string;
    width: number;
    height: number;
    left: number;
    top: number;
    limit?: number;
    page?: number;
  };

  type InfiniteAiSearchPayload = {
    querySearch?: string;
    key: string;
    width: number;
    height: number;
    left: number;
    top: number;
    limit: number;
    page: number;
    searchByColor?: boolean;
  };
}
