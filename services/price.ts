import axios from "axios";

export const EthereumPrice = {
  at: async (dt: Date): Promise<number> => {
    const isoDt = dt.toISOString().substring(0, 10);
    const response = await axios.get(
      `https://enormous.cloud/prices/api/ethereum/at/${isoDt}`
    );
    return (response as any).data.markets.ethereum.usd;
  },
};
