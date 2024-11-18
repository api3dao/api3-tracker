import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
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
  const total =
    pending.length + executed.length + invalid.length + rejected.length;
  const lastBlock: IBlockNumber = results[4];

  const values = new Map<string, string>();
  values.set("EXECUTED_PROPOSALS", "" + executed.length);
  values.set("PENDING_PROPOSALS", "" + pending.length);
  values.set("INVALID_PROPOSALS", "" + invalid.length);
  values.set("REJECTED_PROPOSALS", "" + rejected.length);
  values.set("PROPOSALS", "" + total);

  return {
    props: {
      webconfig: fetchWebconfig(),
      pending: serializable(pending),
      executed: serializable(executed),
      invalid: serializable(invalid),
      rejected: serializable(rejected),
      lastBlock: serializable(lastBlock),
      values: serializable(values),
    }, // will be passed to the page component as props
  };
}

const VotingsPage: NextPage = (props: any) => {
  const { pending, executed, invalid, rejected, lastBlock, webconfig, values } =
    props;
  const isEmpty =
    pending.length + executed.length + rejected.length + invalid.length === 0;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Meta webconfig={webconfig} values={values} page="votings" />
      <Header active="/votings" />

      <main>
        <h1 className="uppercase">API3 DAO Proposals</h1>
        {isEmpty ? (
          <div className="text-color-grey text-center">No proposals yet</div>
        ) : (
          <div className="pb-10">
            {pending.length > 0 ? (
              <section className="max-w-screen-lg mx-auto">
                <div className="text-center text-xl">
                  {pending.length} Pending Proposal{(pending.length != 1) ? 's' : ''}
                </div>
                <VotingsList showGas={gas} list={Votings.fromList(pending)} />
              </section>
            ) : null}
            {executed.length > 0 ? (
              <section className="max-w-screen-lg mx-auto">
                <div className="text-center text-xl">
                  {executed.length} Executed Proposal{(executed.length != 1) ? 's' : ''}

                </div>
                <VotingsList showGas={gas} list={Votings.fromList(executed)} />
              </section>
            ) : null}
            {invalid.length > 0 ? (
              <section className="max-w-screen-lg mx-auto">
                <div className="text-center text-xl">
                  {invalid.length} Invalid Proposal{(invalid.length != 1) ? 's' : ''}

                </div>
                <VotingsList showGas={gas} list={Votings.fromList(invalid)} />
              </section>
            ) : null}
            {rejected.length > 0 ? (
              <section className="max-w-screen-lg mx-auto">
                <div className="text-center text-xl">
                  {rejected.length} Rejected Proposal{(rejected.length != 1) ? 's' : ''}

                </div>
                <VotingsList showGas={gas} list={Votings.fromList(rejected)} />
              </section>
            ) : null}
          </div>
        )}
        <div className="pb-20">&nbsp;</div>
      </main>
      <Footer
        showGas={gas}
        changeGas={setGas}
        github={webconfig.github}
        terms={webconfig.terms}
        blockNumber={lastBlock.blockNumber}
      />
    </div>
  );
};

export default VotingsPage;
