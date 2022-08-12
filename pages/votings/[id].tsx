import type { NextPage } from "next";
import { Footer, Header, Meta } from "../../components/";
import { VotingSummary } from "../../components/VotingSummary";
import { VotingEventsList } from "../../components/VotingEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Votings, VotingEvents, Blocks } from "../../services/api";
import { IBlockNumber, IVoting, IVotingEvent } from "../../services/types";
import { serializable } from "../../services/format";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const results = await Promise.all([
    Votings.fetch(id),
    VotingEvents.fetchList(id),
    Blocks.fetchLast(),
  ]);
  const voting: IVoting | null = results[0];
  const events: Array<IVotingEvent> = results[1];
  const lastBlock: IBlockNumber = results[2];
  return {
    props: {
      webconfig: fetchWebconfig(),
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
