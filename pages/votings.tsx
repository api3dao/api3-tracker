import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { VotingsList } from "../components/VotingsList";
import { fetchWebconfig } from "../services/webconfig";
import { Votings } from "../services/votings";
import { Meta } from "../components/Meta";
import superjson from "superjson";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const pending = await Votings.fetchList("pending");

  return {
    props: {
      webconfig,
      pending: JSON.parse(superjson.stringify(pending)).json,
    }, // will be passed to the page component as props
  };
}

const VotingsPage: NextPage = (props: any) => {
  const { pending, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="votings" />
      <Header active="/votings" />

      <main>
        <h1 className="uppercase">API3 DAO Votings</h1>
        <section className="max-width-screen-lg mx-auto">
          <div className="text-center">{pending.length} Pending Proposals</div>
          <VotingsList list={Votings.fromList(pending)} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VotingsPage;
