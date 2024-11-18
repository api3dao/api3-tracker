import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
import { Footer, Header, Meta } from "../components/";
import { fetchWebconfig } from "../services/webconfig";
import { IBlockNumber, ITreasury } from "../services/types";
import { Treasury } from "../components/Treasury";
import { ITreasuryType, Treasuries, Blocks } from "../services/api";
import { toHex, serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const results = await Promise.all([
    Treasuries.fetchList(),
    Blocks.fetchLast(),
  ]);
  const names = results[0];
  const lastBlock: IBlockNumber = results[1];
  const list = await Promise.all(
    names.map(async (ttype: ITreasuryType): Promise<ITreasury> => {
      const tokens = await Treasuries.fetch(ttype);
      const valueAPI3 =
        tokens
          .filter((x: any) => x.token === "API3")
          .map((x: any) => x.value)[0] || 0;
      const valueUSDC =
        tokens
          .filter((x: any) => x.token === "USDC")
          .map((x: any) => x.value)[0] || 0;
      const valueETH =
        tokens
          .filter((x: any) => x.token === "ETH")
          .map((x: any) => x.value)[0] || 0;
      return {
        title: ttype.charAt(0).toUpperCase() + ttype.slice(1).toLowerCase(),
        address: toHex(tokens[0].address),
        valueAPI3,
        valueUSDC,
        valueETH,
      };
    })
  );
  const values = new Map<string, string>();
  return {
    props: {
      webconfig,
      values: serializable(values),
      list: serializable(list),
      lastBlock: serializable(lastBlock),
    }, // will be passed to the page component as props
  };
}

const TreasuryPage: NextPage = (props: any) => {
  const { list, lastBlock, webconfig, values } = props;
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);

  return (
    <div>
      <Meta webconfig={webconfig} values={values} page="treasury" />
      <Header active="/treasury" />

      <main>
        <div className="lg:min-h-screen">
          <h1>API3 DAO TREASURIES</h1>
          <p className="centered darken">
            API3 DAO currently operates {list.length || 0} treasuries.
          </p>
          {list.length > 0 ? (
            <p className="centered darken">
              Balances below are updated each hour.
            </p>
          ) : null}
          <div className="max-w-screen-lg lg:flex justify-center my-0 mx-auto">
            {list.map((x: any) => (
              <div key={x.title} className="flex-1 mx-auto">
                <Treasury {...x} />
              </div>
            ))}
          </div>
          <div className="pb-20">&nbsp;</div>
        </div>
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

export default TreasuryPage;
