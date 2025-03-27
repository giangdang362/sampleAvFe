import { IMAGE_FORMATS } from "@/hooks/upload-files";

export const isImage = (fileName: string): boolean =>
  IMAGE_FORMATS.some((format) => fileName.toLowerCase().endsWith(format));
