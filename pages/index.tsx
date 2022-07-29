import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Epoch } from "../components/Overview";
import { TokenSupply } from "../components/TokenSupply";
import { TokenCirculating } from "../components/TokenCirculating";
import { TokenStaking } from "../components/TokenStaking";
import { StakingTrend } from "../components/StakingTrend";
import { ContractsList } from "../components/ContractsList";
import { fetchWebconfig } from "../services/webconfig";
import { ISupply, IEpoch } from "../services/api3";
import { Epochs } from "../services/epochs";
import { Supply } from "../services/supply";
import { Meta } from "../components/Meta";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const latest: Array<IEpoch> = await Epochs.fetchLatest(3);
  const current: IEpoch = latest[0];
  const supply: ISupply | null = await Supply.fetch();
  return {
    props: {
      webconfig,
      latest: serializable(latest),
      supply: serializable(supply),
      current: serializable(current),
    }, // will be passed to the page component as props
  };
}

const HomePage: NextPage = (props: any) => {
  const { latest, current, supply, webconfig } = props;
  return (
    <div>
      <Meta webconfig={webconfig} />
      <Header active="/" />
      <main>
        <div className="max-w-screen-lg text-centered mx-auto">
          <h1 className="uppercase">API3 DAO Tracker</h1>
          <p className="mb-8 text-center">
            API3 DAO currently involves{" "}
            <a href="./wallets">{current.members} members</a>{" "}
          </p>
          <h2 className="mt-4 mb-0 font-bold text-center text-2xl uppercase">
            API3 Staking Rewards
          </h2>
          <div className="lg:flex mx-auto">
            {latest.map((epoch: IEpoch) => (
              <div key={epoch.epoch} className="px-4 flex-1">
                <Epoch {...epoch} />
              </div>
            ))}
          </div>

          <div>
            <h2 className="mt-4 mb-0 font-bold text-center text-2xl uppercase">
              API3 Token Supply
            </h2>
            <TokenSupply {...supply} />
            <div className="lg:flex mx-auto">
              <div className="lg:flex-1">
                <ContractsList contracts={webconfig.contracts} />
              </div>
              <div className="lg:flex-1">
                <TokenCirculating {...supply} />
                <TokenStaking {...supply} />
                <StakingTrend
                  apr={current.apr}
                  stakingTarget={supply.stakingTarget}
                  totalStaked={supply.totalStaked}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
