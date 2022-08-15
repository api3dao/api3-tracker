import superjson from "superjson";

// NextJS requires only serializable properties
// to be passed as server parameters
// This way dates, bigint and decimals need to be handled manually after that
export const serializable = (x: any): any =>
  JSON.parse(superjson.stringify(x)).json;

export const shorten = (x: string, num: number): string => {
  return x.substring(0, num + 2) + ".." + x.substring(x.length - num, x.length);
};

export const toCurrency = (x: any): string => {
  if (typeof x === "undefined") return "";
  if (x === null) return "";
  const val = x.toString().replace(/([a-zA-Z]|,)/g, "");
  if (!isNaN(parseInt(val, 10))) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return val;
};

export const noDecimals = (x: string): string => {
  return x.replace(/\..+$/g, "");
};

export const toPct = (x: any): string => {
  if (typeof x === "undefined" || toCurrency(x) === "") return "";
  if (typeof x === "object" || typeof x === "string") return x.toString() + "%";
  if (typeof x === "number" && x < 1) return x.toString() + "%";
  return `${toCurrency(x).replace(/0*$/g, "").replace(/\.$/, "")}%`;
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
  return "" + x;
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

export const niceDateTime = (strIso: string) => {
  if (typeof strIso === "undefined" || strIso === null) {
    return "";
  }
  const date =
    typeof strIso === "number"
      ? new Date(strIso)
      : new Date(
          strIso.replace(/\-/g, "/").replace("T", " ").replace(/\..+$/, "")
        );
  return (
    niceDate(strIso) +
    " " +
    pad2(date.getHours()) +
    ":" +
    pad2(date.getMinutes())
  );
};
