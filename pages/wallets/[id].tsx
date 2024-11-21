import type { NextPage } from "next";
import { useState } from "react";

import { Footer, Header, Meta } from "../../components/";
import { WalletDelegation } from "../../components/WalletDelegation";
import { WalletEventsList } from "../../components/WalletEvents";
import { WalletSummary } from "../../components/WalletSummary";
import {
  CacheTotals,
  Delegations,
  Votings,
  Wallets,
  WalletEvents,
  Blocks,
} from "../../services/api";
import { serializable } from "../../services/format";
import { VoteGas } from "../../services/gas";
import {
  type IDelegation,
  type IWallet,
  type IVoting,
  type IWalletEvent,
  type IBlockNumber,
} from "../../services/types";
import { fetchWebconfig } from "../../services/webconfig";

export async function getServerSideProps(context: any) {
  const {id} = context.params;
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
  const values = new Map<string, string>();
  let memberName = '';
  let memberPower = '';
  if (wallet) {
    memberName = '0x' + wallet.address.toString();
    if (wallet.ensName) memberName = wallet.ensName + ' (' + memberName + ')';
    memberPower = wallet.userVotingPower.toString() + ' shares';
  }
  values.set('MEMBER_NAME', memberName);
  values.set('MEMBER_POWER', memberPower);
  return {
    props: {
      delegationsFrom: serializable(delegationsFrom),
      delegationsTo: serializable(delegationsTo),
      events: serializable(events),
      id,
      lastBlock: serializable(lastBlock),
      totalShares: serializable(totalShares),
      values: serializable(values),
      votings: serializable(votings),
      wallet: serializable(wallet),
      webconfig: fetchWebconfig(),
    }, // will be passed to the page component as props
  };
}

const WalletDetailsPage: NextPage = (props: any) => {
  const { lastBlock, wallet, events, totalShares, votings, webconfig, values } = props;
  const { delegationsFrom, delegationsTo } = props;
  const total = totalShares;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Meta webconfig={webconfig} values={values} page="wallet" />
      <Header active="./wallets" />
      {wallet ? (
        <main>
          <h1>API3 DAO WALLET</h1>
          <WalletSummary wallet={Wallets.from(wallet)} total={total} />
          <WalletDelegation
            userIsDelegated={wallet.userIsDelegated}
            from={delegationsFrom}
            to={delegationsTo}
          />
          <WalletEventsList
            showGas={gas}
            wallet={wallet}
            webconfig={webconfig}
            votings={votings}
            list={WalletEvents.fromList(events)}
          />
          <div className="pb-20">&nbsp;</div>
        </main>
      ) : (
        <div>
          <h1>404 - Wallet Not Found</h1>
          <meta httpEquiv="refresh" content="2; url=/wallets" />
          <div className="text-center text-sm darken">
            Redirecting to the list of wallets...
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

export default WalletDetailsPage;
