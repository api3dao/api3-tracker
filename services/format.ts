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
  if (x.toString().indexOf("e-") > -1)  return "0";
  const val = x.toString().replace(/([a-zA-Z]|,)/g, "");
  if (!isNaN(parseInt(val, 10))) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return val;
};

export const toBool = (x: any): boolean => {
  if (typeof x === "number") {
    return x == 1;
  }
  if (typeof x === "string") {
    return x == "1" || x == "true";
  }
  return false;
};

export const noDecimals = (x: string): string => {
  return x.replace(/\..+$/g, "");
};

export const zerosLeft = (x: string, len: number): string => {
  let out = x;
  while (out.length < len) out = '0' + out;
  return out;
};

export const zerosRight = (x: string, len: number): string => {
  let out = x;
  while (out.length < len) out += '0';
  return out;
};

export const justDecimals = (x: string, l: number): string => {
  const w = x.replace(/^.+\./g, "");
  return (w.length > l) ? w.substring(0, l) : zerosRight(w, l);
};

export const toPct4= (x: any): string => {
  if (typeof x === "undefined" || toCurrency(x) === "") return "";
  if (typeof x === "object" || typeof x === "string") {
       if (x.toString().indexOf("e-") !== -1) return "0.0000%";
       return noDecimals(x.toString()) + "." + justDecimals(x.toString(), 4) + "%";
  }
  if (typeof x === "number" && x < 1) return x.toString() + "%";
  if (x == 0.0) return x.toString() + "?";
  return `${toCurrency(x).replace(/0*$/g, "").replace(/\.$/, "")}%`;
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
  if (typeof strIso === "undefined" || strIso === null) {
    return "";
  }
  if (
    typeof strIso === "object" &&
    typeof (strIso as any).toISOString === "function"
  ) {
    return niceDate((strIso as Date).toISOString());
  }
  if (typeof strIso === "string") {
    const parts: Array<string> = strIso.replace(/T.+$/, "").split("-");
    let out = "";
    if (parts[0] != "" + new Date().getUTCFullYear()) {
      out = parts[0] + ", ";
    }
    const _month = months[parseInt(parts[1])];
    const _day = parts[2];
    return out + _month + " " + _day;
  }

  const date = new Date(strIso); // from unix number
  const _day = date.getUTCDate();
  const _month = months[date.getUTCMonth()];
  let out = "";
  if (new Date().getUTCFullYear() != date.getUTCFullYear()) {
    out += date.getUTCFullYear() + ", ";
  }
  return out + _month + " " + pad2(_day);
};

export const niceDateTime = (strIso: string): string => {
  if (typeof strIso === "undefined" || strIso === null) {
    return "";
  }
  if (
    typeof strIso === "object" &&
    typeof (strIso as any).toISOString === "function"
  ) {
    return niceDate((strIso as Date).toISOString());
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

export const withDecimals = (input: string, decimals: number): string => {
  if (input.length > decimals) {
    return (
      input.substring(0, input.length - decimals) +
      "." +
      input.substring(input.length - decimals, input.length)
    );
  }
  let pad = "";
  while (pad.length + input.length < decimals) pad += "0";
  return "0." + pad + input;
};

// Parses single HEX string into array of big integers
export const toBigIntArray = (hex: string): Array<BigInt> => {
   const out = new Array<BigInt>();
   // split hex string into chunks of 32 bytes
   const chunks = hex.match(/.{1,64}/g) || [];
   chunks.forEach((chunk: string) => {
      out.push(BigInt("0x" + chunk));
   });
   return out;
}
