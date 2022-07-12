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

      <Header active="/rewards" />

      <main className={styles.main}>
        <h1>API3 DAO Rewards</h1>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
