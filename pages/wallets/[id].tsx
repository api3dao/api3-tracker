import type { NextPage } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { WalletSummary } from "../../components/WalletSummary";
import { WalletEventsList } from "../../components/WalletEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Meta } from "../../components/Meta";
import { Wallets, WalletEvents } from "../../services/wallets";
import { serializable } from "../../services/format";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const address = Buffer.from(id.replace(/0x/, ''), 'hex');
  const wallet = await Wallets.fetch(address);
  const events = await WalletEvents.fetchList(address);
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig,
      id,
      wallet: serializable(wallet),
      events: serializable(events),
    }, // will be passed to the page component as props
  };
}

const WalletDetailsPage: NextPage = (props: any) => {
  const { wallet, events, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="wallet" />
      <Header active="./wallets" />

      <main>
        <h1>API3 DAO WALLET</h1>
        <WalletSummary {...Wallets.from(wallet)} />
        <WalletEventsList list={WalletEvents.fromList(events)} />
      </main>

      <Footer />
    </div>
  );
};

export default WalletDetailsPage;
