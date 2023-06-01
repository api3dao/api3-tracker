import prisma from "./db";
import axios from "axios";
import { pad2 } from "./format";

interface ICurrencies {
  eur: number;
  usd: number;
  rub: number;
  cny: number;
  cad: number;
  jpy: number;
  gbp: number;
}

const fetch = async (dt: Date, host: string, api_key: string) => {
  const revDt = pad2(dt.getDate()) + "-" + pad2(1 + dt.getMonth())+ "-" + dt.getUTCFullYear();
  const market = "ethereum";
  let url = `https://${host}/api/v3/coins/${market}/history?date=${revDt}`;
  if (api_key) url += `&apikey=${api_key}`;

  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error("Bad response from API. Status code: " + response.status);
  }
  if (!response || !response.data || !response.data.market_data) {
    throw new Error("Bad response from API. Failed to parse response.");
  }
  const currencies = response.data.market_data.current_price;
  return currencies;
}

const getCache = async (isoDt: string): Promise<ICurrencies | null> => {
  const date = new Date(isoDt.substring(0, 10));
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  const found = await prisma.priceEthereum.findUnique({
    where: {
      ts: date,
    },
  }) as ICurrencies | null;
  return found;
};

const setCache = async (ts: Date, currencies: ICurrencies) => {
  const date = new Date(ts);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  await prisma.priceEthereum.create({
    data: {
      ts: date,
      eur: currencies.eur,
      usd: currencies.usd,
      rub: currencies.rub,
      cny: currencies.cny,
      cad: currencies.cad,
      jpy: currencies.jpy,
      gbp: currencies.gbp,
    },
  });
};

export type IPriceReader = (dt: Date) => Promise<number>;

export const EthereumPrice = (host: string, api_key: string): IPriceReader => {
  return async (dt: Date): Promise<number> => {
    const isoDt = dt.toISOString().substring(0, 10);
    const fromCache = await getCache(isoDt);
    if (fromCache !== null) {
      return fromCache.usd;
    }
    const currencies = await fetch(dt, host, api_key); // throws if failed
    await setCache(dt, currencies);
    return currencies.usd;
  };
};
