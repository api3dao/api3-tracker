import type { NextPage } from "next";
import styles from "../../styles/Home.module.css";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { fetchWebconfig } from "../../services/webconfig";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig
    }, // will be passed to the page component as props
  }
}

const WalletDetailsPage: NextPage = (props: any) => {
  // TODO: split into components

  return (
    <div>
      <Header active="./wallets" />

      <main className={styles.main}>
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
