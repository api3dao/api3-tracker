import type { NextPage } from "next";
import { Footer, Header, Meta } from "../components/";
import { Prisma } from "@prisma/client";
import { fetchWebconfig } from "../services/webconfig";
import { RewardsList, RewardsSummary } from "../components/Rewards";
import { IEpoch } from "../services/types";
import { Epochs } from "../services/epochs";
import { Supply } from "../services/supply";
import { Blocks } from "../services/blocks";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const latest: Array<IEpoch> = await Epochs.fetchLatest(3);
  const supply = await Supply.fetch();
  const lastBlock = await Blocks.fetchLast();
  let totalMinted = new Prisma.Decimal(0);
  for (const epoch of latest) {
    totalMinted = totalMinted.add(epoch.mintedShares);
  }
  return {
    props: {
      webconfig,
      totalMinted: serializable(totalMinted),
      supply: serializable(supply),
      latest: serializable(latest),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const RewardsPage: NextPage = (props: any) => {
  const { latest, supply, lastBlock, webconfig } = props;
  return (
    <div>
      <Meta webconfig={webconfig} page="rewards" />
      <Header active="/rewards" />

      <main>
        <h1 className="uppercase">API3 DAO Rewards</h1>
        <RewardsSummary
          totalMinted={props.totalMinted}
          latest={latest[0]}
          supply={supply}
        />
        <RewardsList list={latest} />
      </main>

      <Footer github={webconfig.github} blockNumber={lastBlock.blockNumber} />
    </div>
  );
};

export default RewardsPage;
