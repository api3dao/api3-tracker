import type { NextPage } from "next";
import { Footer, Header, Meta } from "../components/";
import { VotingsList } from "../components/VotingsList";
import { fetchWebconfig } from "../services/webconfig";
import { Votings, Blocks } from "../services/api";
import { IBlockNumber, IVoting } from "../services/types";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const results = await Promise.all([
    Votings.fetchList("pending"),
    Votings.fetchList("executed"),
    Votings.fetchList("invalid"),
    Votings.fetchList("rejected"),
    Blocks.fetchLast(),
  ]);

  const pending: Array<IVoting> = results[0];
  const executed: Array<IVoting> = results[1];
  const invalid: Array<IVoting> = results[2];
  const rejected: Array<IVoting> = results[3];
  const lastBlock: IBlockNumber = results[4];
  return {
    props: {
      webconfig: fetchWebconfig(),
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
  const isEmpty =
    pending.length + executed.length + rejected.length + invalid.length === 0;
  return (
    <div>
      <Meta webconfig={webconfig} page="votings" />
      <Header active="/votings" />

      <main>
        <h1 className="uppercase">API3 DAO Votings</h1>
        {isEmpty ? (
          <div className="text-color-grey text-center">No votings yet</div>
        ) : (
          <div>
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
          </div>
        )}
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default VotingsPage;
