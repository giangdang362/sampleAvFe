export const PRODUCT_TYPES = {
  PLAN_PRODUCT: "plan_product",
  ORGANIZATION_PRODUCT: "organization_product",
  PROJECT_PRODUCT: "project_product",
};

export const REPORT_TYPE = {
  QUOTE: "quote",
  GET_SAMPLE: "get_sample",
};

export const IMPORT_ERR = {
  GET_FILE_FROM_S3_FAILED: "GET_FILE_FROM_S3_FAILED",
  GET_IMPORT_FILE_FROM_S3_FAILED: "GET_IMPORT_FILE_FROM_S3_FAILED",
  SUPPLIER_NOT_FOUND: "SUPPLIER_NOT_FOUND",
  GET_LIST_IMAGES_FROM_S3_ERROR: "GET_LIST_IMAGES_FROM_S3_ERROR",
  GET_ATTACHMENT_FROM_S3_FAILED: "GET_ATTACHMENT_FROM_S3_FAILED",
  GET_IMAGE_FROM_S3_FAILED: "GET_IMAGE_FROM_S3_FAILED",
  CREATE_THUMBNAIL_FAILED: "CREATE_THUMBNAIL_FAILED",
  LOAD_EXCEL_FAILED: "LOAD_EXCEL_FAILED",
  INVALID_FIELD: "INVALID_FIELD",
};

export const USER_STATUS = {
  ACTIVATED: "ACTIVATED",
  NOT_ACTIVATED: "NOT_ACTIVATED",
};

export const VALUE_SEARCH_PRODUCT = {
  origin: "origin",
  series: "series",
  model: "model",
  effect: "effect",
  applicationArea1: "applicationArea1",
  applicationArea2: "applicationArea2",
  shadeVariation: "shadeVariation",
  edge: "edge",
  slipResistance: "slipResistance",
  chemicalResistance: "chemicalResistance",
  brandName: "brandName",
  material: "material",
  color: "color",
  stainResistance: "stainResistance",
};

export const PROJECT_TYPES = {
  singleResidential: "Single Residential",
  multiResidential: "Multi Residential",
  propertyStaging: "Property Staging",
  commercial: "Commercial",
  hospitality: "Hospitality",
  retail: "Retail",
  healthcare: "Healthcare",
  institutional: "Institutional",
  government: "Government",
  setAndCreativeDesign: "Set And Creative Design",
  communitySpaces: "Community Spaces",
  summary: "Summary",
  estimation: "Estimation",
};

export const PRODUCT_OPTION_SLUGS = {
  productMaterial: "product_material",
  productBrand: "product_brand",
  productOrigin: "product_origin",
  productSeries: "product_series",
  productModel: "product_model",
  productColor: "product_color",
  productEffect: "product_effect",
  productSurface: "product_surface",
  productApplicationArea1: "product_application_area1",
  productApplicationArea2: "product_application_area2",
  productShadeVariation: "product_shade_variation",
  productEdge: "product_edge",
  productSlipResistance: "product_slip_resistance",
  productStainResistance: "product_stain_resistance",
  productChemicalResistance: "product_chemical_resistance",
  productUnit: "product_unit",
  productLeadTime: "product_lead_time",
};

export const USER_LAST_LOGIN = {
  lastThreeDays: "lastThreeDays",
  lastWeek: "lastWeek",
  lastMonth: "lastMonth",
} as const;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const SUBMIT_DATE_FORMAT = "yyyy-MM-dd";
export const DISPLAY_DATE_FORMAT = "yyyy.MM.dd";

export const CREATED_DATE_SUPPLIER = {
  last7Days: "last7Days",
  last30Days: "last30Days",
  customRange: "customRange",
} as const;

export const FOLDER_SECTION_TYPE = {
  pinboard: "pinboard",
  schedule: "schedule",
} as const;

export const AI_SEARCH_FILTER_TYPE = ["pattern", "color"] as const;
