import axios from "axios";

export const EthereumPrice = {
  cached: new Map<string, number>(),
  at: async (dt: Date): Promise<number> => {
    const isoDt = dt.toISOString().substring(0, 10);
    const fromCache = EthereumPrice.cached.get(isoDt);
    if (fromCache) {
      return fromCache;
    }
    const response = await axios.get(
      `https://enormous.cloud/prices/api/ethereum/at/${isoDt}`
    );
    const out: number = (response as any).data.markets.ethereum.usd;
    EthereumPrice.cached.set(isoDt, out);
    return out;
  },
};
