import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../../services/gas";
import { Footer, Header, Meta } from "../../components/";
import { VotingSummary } from "../../components/VotingSummary";
import { VotingEventsList } from "../../components/VotingEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { Wallets, Votings, VotingEvents, Blocks } from "../../services/api";
import { IBlockNumber, IVoting, IVotingEvent } from "../../services/types";
import { serializable } from "../../services/format";

const uniqueArray = (arr: Array<any>): Array<any> => {
  const a = new Array();
  for (let i = 0, l = arr.length; i < l; i++) {
    if (a.indexOf(arr[i]) === -1 && arr[i] !== "") a.push(arr[i]);
  }
  return a;
};

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
  const addresses = uniqueArray(events.map((x: any) => x.address));
  const members = await Wallets.fetchByAddresses(addresses);
  const values = new Map<string, string>();

  return {
    props: {
      webconfig: fetchWebconfig(),
      values: serializable(values),
      id,
      voting: serializable(voting),
      events: serializable(events),
      members: serializable(members),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const VotingDetailsPage: NextPage = (props: any) => {
  const { voting, events, lastBlock, webconfig, values, members } = props;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);

  return (
    <div>
      <Meta webconfig={webconfig} values={values} page="voting" />
      <Header active="./votings" />

      {voting ? (
        <main>
          <h1 className="text-center uppercase">API3 DAO Proposal</h1>
          <VotingSummary {...Votings.from(voting)} />
          <div className="max-w-screen-lg mx-auto">
            <VotingEventsList
              members={members}
              showGas={gas}
              list={VotingEvents.fromList(events)}
              totalStake={voting.totalStaked}
            />
          </div>
          <div className="pb-20">&nbsp;</div>
        </main>
      ) : (
        <div>
          <h1>404 - Proposal Not Found</h1>
          <meta httpEquiv="refresh" content="2; url=/votings" />
          <div className="text-center text-sm darken">
            Redirecting to the list of proposals...
          </div>
        </div>
      )}

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

export default VotingDetailsPage;
