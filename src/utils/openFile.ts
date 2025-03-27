import { baseApi } from "@/config/api";

export const openDownloadFile = (
  path: string,
  params: { [key: string]: string },
) => {
  const url = new URL(baseApi + "/" + path);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  );
  window.open(url.href, "_blank");
};
