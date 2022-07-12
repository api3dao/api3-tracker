import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const title =
  "API3 DAO Tracker - on-chain analytics: members, staking rewards, API3 token circulating supply";
const description =
  "API3 DAO tracker watches API3 on-chain DAO events, displays history of each participant and staking rewards. No wallet connection is needed";
const ogTitle =
  "API3 DAO Tracker - on-chain analytics: members, staking rewards, API3 token circulating supply";
const ogDescription =
  "API3 DAO tracker watches API3 on-chain DAO events, displays history of each participant and staking rewards. No wallet connection is needed";

const Home: NextPage = () => {
  // TODO: read meta and og from config
  // TODO: split into components

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
      </Head>
      <Header active="/treasury" />

      <main className={styles.main}>
        <div className="inner">
          <h1>API3 DAO TREASURY</h1>
          <p className="centered darken">
            API3 DAO currently operates 3 treasuries. Balances below are updated
            each hour.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
