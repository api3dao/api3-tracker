import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
import { Footer, Header, Meta } from "../components/";
import { Prisma } from "@prisma/client";
import { fetchWebconfig } from "../services/webconfig";
import { RewardsList, RewardsSummary } from "../components/Rewards";
import { IBlockNumber, IEpoch, ISupply } from "../services/types";
import { Epochs, Supply, Blocks } from "../services/api";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const results = await Promise.all([
    Epochs.fetchLatest(10000, false),
    Supply.fetch(),
    Blocks.fetchLast(),
  ]);
  const latest: Array<IEpoch> = results[0];
  const supply: ISupply | null = results[1];
  const lastBlock: IBlockNumber = results[2];
  let totalMinted = new Prisma.Decimal(0);
  for (const epoch of latest) {
    totalMinted = totalMinted.add(epoch.mintedShares);
  }
  return {
    props: {
      webconfig: fetchWebconfig(),
      totalMinted: serializable(totalMinted),
      supply: serializable(supply),
      latest: serializable(latest),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const RewardsPage: NextPage = (props: any) => {
  const { latest, supply, lastBlock, webconfig } = props;
  const isEmpty: boolean = latest.length === 0;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Meta webconfig={webconfig} page="rewards" />
      <Header active="/rewards" />

      <main>
        <h1 className="uppercase">API3 DAO Rewards</h1>
        {isEmpty ? (
          <div className="text-color-grey text-center">No epochs data yet. Please import database.</div>
        ) : <RewardsSummary
          totalMinted={props.totalMinted}
          latest={latest[0]}
          supply={supply}
        />}
        {(!isEmpty) ? <RewardsList list={latest} />: null}
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

export default RewardsPage;
