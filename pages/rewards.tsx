import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Meta } from "../components/Meta";
import { Epochs } from "../services/epochs";
import superjson from 'superjson';

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const latest = await Epochs.fetchLatest(3);
  return {
    props: {
      webconfig,
      latest: JSON.stringify(JSON.parse(superjson.stringify(latest)).json,null,2),
    }, // will be passed to the page component as props
  };
}

const RewardsPage: NextPage = (props: any) => {
  const { latest, webconfig } = props;
  return (
    <div>
      <Meta webconfig={webconfig} page="rewards" />
      <Header active="/rewards" />

      <main>
        <h1>API3 DAO Rewards</h1>
        <pre>{latest}</pre>
      </main>

      <Footer />
    </div>
  );
};

export default RewardsPage;
