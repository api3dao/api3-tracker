import { Prisma } from "@prisma/client";

export const shorten = (x: string, num: number): string => {
  return x.substring(0, num + 2) + ".." + x.substring(x.length - num, x.length);
};

export const toCurrency = (x: any): string => {
  if (typeof x === "undefined") return "";
  const val = x.toString().replace(/([a-zA-Z]|,)/g, "");
  if (!isNaN(parseInt(val, 10))) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return val;
};

export const toPct = (x: any): string => {
  if (typeof x === "undefined" || toCurrency(x) === "") return "";
  if (typeof x === "object") return x.toString() + '%;
  return `${toCurrency(x).replace(/0*$/g, "").replace(/\.$/, "")}%`;
};

export const months = [
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

export const niceDate = (strIso: string) => {
  if (typeof strIso === "undefined" || strIso === null) {
    return "";
  }
  const date =
    typeof strIso === "number"
      ? new Date(strIso)
      : new Date(
          strIso.replace(/\-/g, "/").replace("T", " ").replace(/\..+$/, "")
        );

  const _day = date.getUTCDate();
  const _month = months[date.getUTCMonth()];
  let out = "";
  if (new Date().getUTCFullYear() != date.getUTCFullYear()) {
    out += date.getUTCFullYear() + ", ";
  }
  return out + _month + " " + pad2(_day);
};

