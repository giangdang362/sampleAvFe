import { LogLevel } from "@/lib/logger";
import { getSiteURL } from "@/utils/url";

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
}

export const config: Config = {
  site: {
    name: "AVCI",
    description: "",
    themeColor: "#090a0b",
    url: getSiteURL(),
  },
  logLevel:
    (process.env.NEXT_PUBLIC_LOG_LEVEL as keyof typeof LogLevel) ??
    LogLevel.ALL,
};
