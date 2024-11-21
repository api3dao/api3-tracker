import { isFunction, isNil, isNumber, isObject, isString } from "lodash";
import { stringify } from "superjson";

// NextJS requires only serializable properties
// to be passed as server parameters
// This way dates, bigint and decimals need to be handled manually after that
export const serializable = (x: any): any => JSON.parse(stringify(x)).json;

export const shorten = (x: string, num: number): string => {
  return (
    x.slice(0, Math.max(0, num + 2)) +
    ".." +
    x.substring(x.length - num, x.length)
  );
};

export const toCurrency = (x: any): string => {
  if (x === undefined) return "";
  if (x === null) return "";
  if (x.toString().includes("e-")) return "0";
  const val = x.toString().replaceAll(/([A-Za-z]|,)/g, "");
  if (!Number.isNaN(Number.parseInt(val, 10))) {
    return val.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return val;
};

export const toBool = (x: any): boolean => {
  if (isNumber(x)) {
    return x === 1;
  }
  if (isString(x)) {
    return x === "1" || x === "true";
  }
  return false;
};

export const noDecimals = (x: string): string => {
  return x.replaceAll(/\..+$/g, "");
};

export const zerosLeft = (x: string, len: number): string => {
  let out = x;
  while (out.length < len) out = "0" + out;
  return out;
};

export const zerosRight = (x: string, len: number): string => {
  let out = x;
  while (out.length < len) out += "0";
  return out;
};

export const justDecimals = (x: string, l: number): string => {
  const w = x.replaceAll(/^.+\./g, "");
  return w.length > l ? w.slice(0, Math.max(0, l)) : zerosRight(w, l);
};

export const toPct4 = (x: any): string => {
  if (x === undefined || toCurrency(x) === "") return "";
  if (isObject(x) || isString(x)) {
    if (x.toString().includes("e-")) return "0.0000%";
    return noDecimals(x.toString()) + "." + justDecimals(x.toString(), 4) + "%";
  }
  if (isNumber(x) && x < 1) return x.toString() + "%";
  if (x === 0) return x.toString() + "?";
  return `${toCurrency(x).replaceAll(/0*$/g, "").replace(/\.$/, "")}%`;
};

export const toPct = (x: any): string => {
  if (x === undefined || toCurrency(x) === "") return "";
  if (isObject(x) || isString(x)) return x.toString() + "%";
  if (isNumber(x) && x < 1) return x.toString() + "%";
  return `${toCurrency(x).replaceAll(/0*$/g, "").replace(/\.$/, "")}%`;
};

export const toHex = (x: any): string => {
  if (Buffer.isBuffer(x)) {
    return "0x" + x.toString("hex");
  }
  if (Array.isArray(x)) {
    return (
      "0x" +
      Array.from(x, (byte: any) => {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      }).join("")
    );
  }
  return "0x" + x.replace("0x", "");
};

export const months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const pad2 = (x: number) => {
  return x < 10 ? "0" + x : "" + x;
};

export const niceDate = (strIso: string): string => {
  if (isNil(strIso)) {
    return "";
  }
  if (isObject(strIso) && isFunction((strIso as any).toISOString)) {
    return niceDate((strIso as Date).toISOString());
  }
  if (isString(strIso)) {
    const parts: Array<string> = strIso.replace(/T.+$/, "").split("-");
    const _month = months[Number.parseInt(parts[1])];
    const _day = parts[2];
    // let out = "";
    // let diff = new Date().getTime() - new Date(strIso).getTime();
    // if (diff < 0 || diff > 1000 * 3600 * 24 * 365) {
    const out = parts[0] + ", ";
    // }
    return out + _month + " " + _day;
  }

  const date = new Date(strIso); // from unix number
  const _day = date.getUTCDate();
  const _month = months[date.getUTCMonth()];
  // let out = "";
  // let diff = new Date().getTime() - new Date(strIso).getTime();
  // if (diff < 0 || diff > 1000 * 3600 * 24 * 365) {
  const out = date.getUTCFullYear() + ", ";
  // }
  return out + _month + " " + pad2(_day);
};

export const niceDateTime = (strIso: string): string => {
  if (isNil(strIso)) {
    return "";
  }
  if (isObject(strIso) && isFunction((strIso as any).toISOString)) {
    return niceDate((strIso as Date).toISOString());
  }
  const date = isNumber(strIso)
    ? new Date(strIso)
    : new Date(
        strIso.replaceAll("-", "/").replace("T", " ").replace(/\..+$/, ""),
      );
  return (
    niceDate(strIso) +
    " " +
    pad2(date.getHours()) +
    ":" +
    pad2(date.getMinutes())
  );
};

export const withDecimals = (input: string, decimals: number): string => {
  if (input.length > decimals) {
    return (
      input.slice(0, Math.max(0, input.length - decimals)) +
      "." +
      input.substring(input.length - decimals, input.length)
    );
  }
  let pad = "";
  while (pad.length + input.length < decimals) pad += "0";
  return "0." + pad + input;
};

// Parses single HEX string into array of big integers
export const toBigIntArray = (hex: string): Array<bigint> => {
  const out = new Array<bigint>();
  // split hex string into chunks of 32 bytes
  const chunks = hex.match(/.{1,64}/g) || [];
  chunks.forEach((chunk: string) => {
    out.push(BigInt("0x" + chunk));
  });
  return out;
};
