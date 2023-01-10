import type { NextPage } from "next";
import { useState } from "react"
import { VoteGas } from "../../services/gas";
import { Footer, Header, Meta } from "../../components/";
import { WalletSummary } from "../../components/WalletSummary";
import { WalletDelegation } from "../../components/WalletDelegation";
import { WalletEventsList } from "../../components/WalletEvents";
import { fetchWebconfig } from "../../services/webconfig";
import { CacheTotals, Delegations, Votings, Wallets, WalletEvents, Blocks } from "../../services/api";
import {
  IDelegation,
  IWallet,
  IVoting,
  IWalletEvent,
  IBlockNumber,
} from "../../services/types";
import { serializable } from "../../services/format";

export async function getServerSideProps(context: any) {
  const id = context.params.id;
  const address = Buffer.from(id.replace(/0x/, ""), "hex");
  const results = await Promise.all([
    Wallets.fetch(address),
    WalletEvents.fetchList(address),
    Blocks.fetchLast(),
    Votings.fetchAll(),
    CacheTotals.fetch(),
    Delegations.fetchFrom(address),
    Delegations.fetchTo(address),
  ]);
  const wallet: IWallet | null = results[0];
  const events: Array<IWalletEvent> = results[1];
  const lastBlock: IBlockNumber = results[2];
  const votings: Array<IVoting> = results[3];
  const totalShares: any = results[4];
  const delegationsFrom: Array<IDelegation> = results[5];
  const delegationsTo: Array<IDelegation> = results[6];
  return {
    props: {
      webconfig: fetchWebconfig(),
      id,
      wallet: serializable(wallet),
      events: serializable(events),
      votings: serializable(votings),
      lastBlock: serializable(lastBlock),
      totalShares: serializable(totalShares),
      delegationsFrom: serializable(delegationsFrom),
      delegationsTo: serializable(delegationsTo),
    }, // will be passed to the page component as props
  };
}

const WalletDetailsPage: NextPage = (props: any) => {
  const { lastBlock, wallet, events, totalShares, votings, webconfig } = props;
  const { delegationsFrom, delegationsTo } = props;
  const total = totalShares;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Meta webconfig={webconfig} page="wallet" />
      <Header active="./wallets" />

      <main>
        <h1>API3 DAO WALLET</h1>
        <WalletSummary wallet={Wallets.from(wallet)} total={total} />
        <WalletDelegation userIsDelegated={wallet.userIsDelegated} from={delegationsFrom} to={delegationsTo} />
        <WalletEventsList
          showGas={gas}
          wallet={wallet}
          webconfig={webconfig}
          votings={votings}
          list={WalletEvents.fromList(events)}
        />
      </main>

      <Footer
        showGas={gas}
        changeGas={setGas}
        github={webconfig.github}
        blockNumber={lastBlock.blockNumber}
      />
    </div>
  );
};

export default WalletDetailsPage;
