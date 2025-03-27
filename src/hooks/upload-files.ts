import { useFormatter, useTranslations } from "next-intl";
import { enqueueSnackbar } from "notistack";
import { useCallback } from "react";

export interface UploadFileOptions {
  maxFile?: number;
  maxSize?: number; // in MB
  type: "any" | "image" | "excel";
}

export const IMAGE_FORMATS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "apng",
  "svg",
];

export const EXCEL_FORMATS = ["xlsx", "xls"];

export const useGetUploadFiles = (): ((
  cb: (files: FileList) => void,
  options: UploadFileOptions,
) => void) => {
  const validateFiles = useValidateFiles();

  return useCallback(
    (cb, options) => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = options.maxFile !== 1;
      input.accept =
        options.type === "image"
          ? IMAGE_FORMATS?.map((i) => `.${i}`).join(",")
          : options.type === "excel"
            ? EXCEL_FORMATS?.map((i) => `.${i}`).join(",")
            : "";
      input.click();

      input.addEventListener("change", async (e) => {
        const files = (e.target as HTMLInputElement | null)?.files;
        if (files && validateFiles(files, options)) {
          cb(files);
        }
      });
    },
    [validateFiles],
  );
};

export const useValidateFiles = (): ((
  files: FileList,
  options: UploadFileOptions,
) => boolean) => {
  const t = useTranslations("filesUpload");
  const format = useFormatter();

  return useCallback(
    (files, { maxFile, maxSize, type }) => {
      if (maxFile !== undefined && files.length > maxFile) {
        enqueueSnackbar(
          t("maxFileMessage", {
            number: maxFile,
            type: t(
              type === "image"
                ? maxFile === 1
                  ? "image"
                  : "images"
                : maxFile === 1
                  ? "file"
                  : "files",
            ),
          }),
          { variant: "error" },
        );
        return false;
      }

      for (const file of files) {
        const checkFormatImage =
          type === "image" &&
          IMAGE_FORMATS.every(
            (format) => !file.name.toLowerCase().endsWith(`.${format}`),
          );

        const checkFormatExcel =
          type === "excel" &&
          EXCEL_FORMATS.every(
            (format) => !file.name.toLowerCase().endsWith(`.${format}`),
          );
        if (checkFormatImage || checkFormatExcel) {
          enqueueSnackbar(
            t("invalidFormatsMessage", {
              type: t(
                type === "image"
                  ? "image"
                  : type === "excel"
                    ? "excel"
                    : "file",
              ),
              formats: format.list(
                (type === "image" ? IMAGE_FORMATS : EXCEL_FORMATS)?.map(
                  (format) => format.toUpperCase(),
                ),
                { type: "disjunction" },
              ),
            }),
            { variant: "error" },
          );
          return false;
        }
        if (maxSize !== undefined && file.size > maxSize * 1024 * 1024) {
          enqueueSnackbar(
            t("maxSizeMessage", {
              size: maxSize,
              type: t(
                type === "image"
                  ? "images"
                  : type === "excel"
                    ? "excels"
                    : "files",
              ),
            }),
            { variant: "error" },
          );
          return false;
        }
      }

      return true;
    },
    [t, format],
  );
};
