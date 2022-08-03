import fs from "fs";
import { load } from "js-yaml";
import { IWebConfig } from "./types";

export const fetchWebconfig = (): IWebConfig =>
  load(fs.readFileSync("webconfig.yaml", "utf8")) as IWebConfig;
