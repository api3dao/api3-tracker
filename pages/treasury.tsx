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

const TreasuryPage: NextPage = (props: any) => {
  // TODO: split into components
  const { webconfig } = props;

  return (
    <div className={styles.container}>
      <Meta webconfig={webconfig} page='treasury' />
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

export default TreasuryPage;
