import fs from "fs";
import { load } from "js-yaml";

export interface IContract {
  name: string
  title: string
  address: string
}

export interface IWebPage {
  slug: string
  siteName?: string
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
}

export interface IWebConfig {
  github?: string
  ethscan?: string
  opengraph: IWebPage
  pages: Map<string, IWebPage>
  contracts?: Array<IContract>
}

export const fetchWebconfig = (): IWebConfig => (
  load(fs.readFileSync("webconfig.yaml", "utf8")) as IWebConfig
);
