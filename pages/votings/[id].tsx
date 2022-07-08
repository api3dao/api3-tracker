import type { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { Footer } from "../../components/Footer";

const title =
  "";
const description =
  "";
const ogTitle =
  "";
const ogDescription =
  "";


// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const data = { "test": 1 };

  // Pass data to the page via props
  return { props: { data } }
}


const VotingDetails: NextPage = (props: any) => {
  const { data } = props;

  // TODO: read meta and og from config
  // TODO: split into components

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
      </Head>


      <main className={styles.main}>
        <div className="inner">
          <h1>API3 DAO WALLET</h1>
          <pre>{ JSON.stringify(data, null, 2) }</pre>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VotingDetails;
