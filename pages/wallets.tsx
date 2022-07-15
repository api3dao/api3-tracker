import type { NextPage } from "next";
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

const WalletsPage: NextPage = (props: any) => {
  const { webconfig } = props;
  // TODO: split into components

  return (
    <div>
      <Meta webconfig={webconfig} page='wallets' />
      <Header active="/wallets" />

      <main>
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
