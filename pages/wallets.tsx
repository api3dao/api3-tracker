import type { NextPage } from "next";
import { Footer, Header, Meta } from "../components/";
import { fetchWebconfig } from "../services/webconfig";
import { Wallets, Blocks } from "../services/api";
import { IWallet, IBlockNumber } from "../services/types";
import { WalletsList } from "../components/WalletsList";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const results = await Promise.all([Wallets.fetchList(), Blocks.fetchLast()]);
  const list : Array<IWallet> = results[0];
  const lastBlock: IBlockNumber = results[1];

  return {
    props: {
      webconfig: fetchWebconfig(),
      list: serializable(list),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const WalletsPage: NextPage = (props: any) => {
  const { list, lastBlock, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="wallets" />
      <Header active="/wallets" />
      <main>
        <h1>API3 DAO MEMBERS</h1>
        <WalletsList list={list} />
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default WalletsPage;
