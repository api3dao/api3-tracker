import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Meta } from "../components/Meta";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  return {
    props: {
      webconfig,
    }, // will be passed to the page component as props
  };
}

const VotingsPage: NextPage = (props: any) => {
  const { webconfig } = props;
  // TODO: split into components

  return (
    <div>
      <Meta webconfig={webconfig} page="votings" />
      <Header active="/votings" />

      <main>
        <div className="inner">
          <h1 className="uppercase">API3 DAO Votings</h1>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VotingsPage;
