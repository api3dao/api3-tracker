import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Wallets } from "../services/wallets";
import { Meta } from "../components/Meta";
import { WalletsList } from "../components/WalletsList";
import { Blocks } from "../services/blocks";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const list = await Wallets.fetchList();
  const lastBlock = await Blocks.fetchLast();

  return {
    props: {
      webconfig,
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
