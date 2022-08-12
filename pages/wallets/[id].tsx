import type { NextPage } from "next";
import { Footer, Header, Meta } from "../../components/";
import { WalletSummary } from "../../components/WalletSummary";
import { WalletEventsList } from "../../components/WalletEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Wallets, WalletEvents, Blocks } from "../../services/api";
import { IWallet, IWalletEvent, IBlockNumber } from "../../services/types";
import { serializable } from "../../services/format";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const address = Buffer.from(id.replace(/0x/, ""), "hex");
  const results = await Promise.all([
    Wallets.fetch(address),
    WalletEvents.fetchList(address),
    Blocks.fetchLast(),
  ]);
  const wallet: IWallet | null = results[0];
  const events: Array<IWalletEvent> = results[1];
  const lastBlock: IBlockNumber = results[2];
  return {
    props: {
      webconfig: fetchWebconfig(),
      id,
      wallet: serializable(wallet),
      events: serializable(events),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const WalletDetailsPage: NextPage = (props: any) => {
  const { lastBlock, wallet, events, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="wallet" />
      <Header active="./wallets" />

      <main>
        <h1>API3 DAO WALLET</h1>
        <WalletSummary {...Wallets.from(wallet)} />
        <WalletEventsList list={WalletEvents.fromList(events)} />
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default WalletDetailsPage;
