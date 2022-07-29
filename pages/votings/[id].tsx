import type { NextPage } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { fetchWebconfig } from "../../services/webconfig";
import { Votings } from "../../services/votings";
import { serializable } from "../../services/format";
import { Meta } from "../../components/Meta";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const webconfig = fetchWebconfig();
  const voting = await Votings.fetch(id);
  return {
    props: {
      webconfig,
      id,
      voting: serializable(voting),
    }, // will be passed to the page component as props
  };
}

const VotingDetailsPage: NextPage = (props: any) => {
  // TODO: split into components
  const { voting, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="voting" />
      <Header active="./votings" />

      <main>
        <div className="inner">
          <h1 className="text-center uppercase">API3 DAO Voting</h1>
        </div>
        <pre>{JSON.stringify(voting, null, 2)}</pre>
      </main>

      <Footer />
    </div>
  );
};

export default VotingDetailsPage;
