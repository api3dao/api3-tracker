import type { NextPage } from "next";
import Head from "next/head";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import styles from "../styles/Home.module.css";
import { fetchWebconfig } from "../services/webconfig";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig
    }, // will be passed to the page component as props
  }
}

const WalletsPage: NextPage = () => {
  // TODO: split into components

  return (
    <div className={styles.container}>
      <Header active="/wallets" />

      <main className={styles.main}>
        <div className="inner">
          <h1>API3 DAO MEMBERS</h1>
          <p className="centered darken"></p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletsPage;
