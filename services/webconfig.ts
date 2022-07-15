import fs from "fs";
import { load } from "js-yaml";

export interface IWebPage {
  slug: string
  siteName?: string
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
}

export interface IWebConfig {
  github?: string
  ethscan?: string
  opengraph: IWebPage
  pages: Map<string, IWebPage>
}

export const fetchWebconfig = (): IWebConfig => (
  load(fs.readFileSync("webconfig.yaml", "utf8")) as IWebConfig
);
