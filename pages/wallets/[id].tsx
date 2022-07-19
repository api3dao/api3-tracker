import type { NextPage } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { fetchWebconfig } from "../../services/webconfig";
import { Meta } from "../../components/Meta";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig,
    }, // will be passed to the page component as props
  };
}

const WalletDetailsPage: NextPage = (props: any) => {
  const { webconfig } = props;
  // TODO: split into components

  return (
    <div>
      <Meta webconfig={webconfig} page="wallet" />
      <Header active="./wallets" />

      <main>
        <div className="inner">
          <h1>API3 DAO WALLET</h1>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletDetailsPage;
