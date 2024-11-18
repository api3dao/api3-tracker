import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
import { Footer, Header, Meta } from "../components/";
import { Epoch } from "../components/Overview";
import { TokenSupply } from "../components/TokenSupply";
import { TokenCirculating } from "../components/TokenCirculating";
import { TokenStaking } from "../components/TokenStaking";
import { StakingTrend } from "../components/StakingTrend";
import { ContractsList } from "../components/ContractsList";
import { fetchWebconfig } from "../services/webconfig";
import { IBlockNumber, ISupply, IEpoch } from "../services/types";
import { Epochs, Supply, Votings, Wallets, Blocks } from "../services/api";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const results = await Promise.all([
    Epochs.fetchLatest(2, true),
    Supply.fetch(),
    Wallets.totalActive(),
    Votings.totalByStatus('executed'),
    Blocks.fetchLast(),
  ]);
  const latest: Array<IEpoch> = results[0];
  const supply: ISupply | null = results[1];
  const totalCurrentWallets: number = results[2];
  const totalExecutedVotings: number = results[3];
  const lastBlock: IBlockNumber = results[4];
  const current: IEpoch = latest[0];
  const values = new Map<string,string>(); // values
  return {
    props: {
      webconfig: fetchWebconfig(),
      values: serializable(values),
      totalCurrentWallets,
      totalExecutedVotings,
      latest: serializable(latest),
      supply: serializable(supply),
      current: serializable(current),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const HomePage: NextPage = (props: any) => {
  const {
    latest,
    lastBlock,
    current,
    supply,
    totalCurrentWallets,
    totalExecutedVotings,
    webconfig,
    values,
  } = props;
  const isEmpty: boolean = !current;
  const noSupply: boolean = !supply;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Meta webconfig={webconfig} values={values} />
      <Header active="/" />
      <main>
        <div className="max-w-screen-lg text-centered mx-auto">
          <h1 className="uppercase">API3 DAO Tracker</h1>
          {isEmpty ? (
            <div className="text-color-grey text-center">
              No epochs data yet. Please import database.
            </div>
          ) : (
            <div>
              <p className="mx-4 mb-8 text-center">
                API3 DAO has {" "}
                <a href="./wallets">{totalCurrentWallets} current members</a> and {" "}
                <a href="./votings">
                  {totalExecutedVotings} completed proposal{totalExecutedVotings != 1 ? "s" : ""}
                </a>
              </p>
              <h2 className="mt-4 mb-0 font-bold text-center text-2xl uppercase">
                API3 Staking Rewards
              </h2>
              <div className="lg:flex mx-auto">
                {latest.map((epoch: IEpoch, index: number) => (
                  <div key={index} className="px-4 flex-1">
                    <Epoch {...epoch} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {noSupply ? (
            <div className="text-color-grey text-center">
              No supply data yet. Please import database.
            </div>
          ) : (
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
                    apr={current ? current.apr : 25.75}
                    stakingTarget={supply.stakingTarget}
                    totalStaked={supply.totalStaked}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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

export default HomePage;
