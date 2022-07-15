import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Meta } from "../components/Meta";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig
    }, // will be passed to the page component as props
  }
}


const RewardsPage: NextPage = (props: any) => {
  const { webconfig } = props;
  // TODO: split into components

  return (
    <div className={styles.container}>
      <Meta webconfig={webconfig} page='rewards' /> 
      <Header active="/rewards" />

      <main className={styles.main}>
        <h1>API3 DAO Rewards</h1>
      </main>

      <Footer />
    </div>
  );
};

export default RewardsPage
