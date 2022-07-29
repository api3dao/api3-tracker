import type { NextPage } from "next";
import { Prisma } from "@prisma/client";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Meta } from "../components/Meta";
import { RewardsList, RewardsSummary } from "../components/Rewards";
import { IEpoch } from "../services/api3";
import { Epochs } from "../services/epochs";
import { Supply } from "../services/supply";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const latest: Array<IEpoch> = await Epochs.fetchLatest(3);
  let totalMinted = new Prisma.Decimal(0);
  for (const epoch of latest) {
    totalMinted = totalMinted.add(epoch.mintedShares);
  }
  const supply = await Supply.fetch();
  return {
    props: {
      webconfig,
      totalMinted: serializable(totalMinted),
      supply: serializable(supply),
      latest: serializable(latest),
    }, // will be passed to the page component as props
  };
}

const RewardsPage: NextPage = (props: any) => {
  const { latest, supply, webconfig } = props;
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

      <Footer />
    </div>
  );
};

export default RewardsPage;
