import type { NextPage } from "next";
import { Footer, Header, Meta } from "../../components/";
import { WalletSummary } from "../../components/WalletSummary";
import { WalletEventsList } from "../../components/WalletEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Wallets, WalletEvents } from "../../services/wallets";
import { Blocks } from "../../services/blocks";
import { serializable } from "../../services/format";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const address = Buffer.from(id.replace(/0x/, ""), "hex");
  const wallet = await Wallets.fetch(address);
  const events = await WalletEvents.fetchList(address);
  const lastBlock = await Blocks.fetchLast();
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig,
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
