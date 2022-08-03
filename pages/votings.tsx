import type { NextPage } from "next";
import { Footer, Header, Meta } from "../components/";
import { VotingsList } from "../components/VotingsList";
import { fetchWebconfig } from "../services/webconfig";
import { Votings } from "../services/votings";
import { serializable } from "../services/format";
import { Blocks } from "../services/blocks";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const pending = await Votings.fetchList("pending");
  const executed = await Votings.fetchList("executed");
  const invalid = await Votings.fetchList("invalid");
  const rejected = await Votings.fetchList("rejecte");
  const lastBlock = await Blocks.fetchLast();
  return {
    props: {
      webconfig,
      pending: serializable(pending),
      executed: serializable(executed),
      invalid: serializable(invalid),
      rejected: serializable(rejected),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const VotingsPage: NextPage = (props: any) => {
  const { pending, executed, invalid, rejected, lastBlock, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="votings" />
      <Header active="/votings" />

      <main>
        <h1 className="uppercase">API3 DAO Votings</h1>
        {pending.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {pending.length} Pending Proposals
            </div>
            <VotingsList list={Votings.fromList(pending)} />
          </section>
        ) : null}
        {executed.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {executed.length} Executed Proposals
            </div>
            <VotingsList list={Votings.fromList(executed)} />
          </section>
        ) : null}
        {invalid.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {invalid.length} Invalid Proposals
            </div>
            <VotingsList list={Votings.fromList(invalid)} />
          </section>
        ) : null}
        {rejected.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {rejected.length} Rejected Proposals
            </div>
            <VotingsList list={Votings.fromList(rejected)} />
          </section>
        ) : null}
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default VotingsPage;
