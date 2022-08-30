import type { NextPage } from "next";
import React from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { Footer, Header, Meta } from "../components/";
import { fetchWebconfig } from "../services/webconfig";
import { Wallets, Blocks } from "../services/api";
import { IWallet, IBlockNumber } from "../services/types";
import { WalletsSearch } from "../components/WalletsSearch";
import { WalletsList } from "../components/WalletsList";
import { serializable } from "../services/format";

// const fetcher = (...args) => fetch(...args).then((res) => res.json());
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export async function getServerSideProps(context: any) {
  const q = context.query.q || "";
  const results = await Promise.all([Wallets.fetchList(q), Blocks.fetchLast()]);
  const list: Array<IWallet> = results[0];
  const lastBlock: IBlockNumber = results[1];

  return {
    props: {
      q,
      webconfig: fetchWebconfig(),
      list: serializable(list),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const WalletsPage: NextPage = (props: any) => {
  const [isLoading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<Array<IWallet> | null>(null);
  const { list, lastBlock, webconfig } = props;
  const router = useRouter();

  const q = router.query.q || "";
  const wallets = (data == null ? list : data) || [];
  const onChange = (value: string) => {
    router.push("?q=" + value, undefined, { shallow: true });
    setLoading(true);
    fetcher("/api/json/wallets?q=" + value)
      .then(setData)
      .then(() => setLoading(false));
  };

  return (
    <div>
      <Meta webconfig={webconfig} page="wallets" />
      <Header active="/wallets" />
      <main>
        <h1>API3 DAO MEMBERS</h1>
        <WalletsSearch value={q} onChange={onChange} />
        {isLoading ? (
          <div className="text-center">...</div>
        ) : (
          <WalletsList list={wallets} />
        )}
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default WalletsPage;
