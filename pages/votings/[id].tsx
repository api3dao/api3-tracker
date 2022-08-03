import type { NextPage } from "next";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { VotingSummary } from "../../components/VotingSummary";
import { VotingEventsList } from "../../components/VotingEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Votings, VotingEvents } from "../../services/votings";
import { Blocks } from "../../services/blocks";
import { serializable } from "../../services/format";
import { Meta } from "../../components/Meta";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const webconfig = fetchWebconfig();
  const voting = await Votings.fetch(id);
  const events = await VotingEvents.fetchList(id);
  const lastBlock = await Blocks.fetchLast();
  return {
    props: {
      webconfig,
      id,
      voting: serializable(voting),
      events: serializable(events),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const VotingDetailsPage: NextPage = (props: any) => {
  const { voting, events, lastBlock, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="voting" />
      <Header active="./votings" />

      <main>
        <h1 className="text-center uppercase">API3 DAO Voting</h1>
        <VotingSummary {...Votings.from(voting)} />
        <div className="max-w-screen-lg mx-auto">
          <VotingEventsList list={VotingEvents.fromList(events)} />
        </div>
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default VotingDetailsPage;
