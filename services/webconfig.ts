import fs from "node:fs";

import { load } from "js-yaml";

import { type IWebConfig } from "./types";

export const fetchWebconfig = (): IWebConfig =>
  load(fs.readFileSync("webconfig.yaml", "utf8")) as IWebConfig;
