import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { ITreasury } from "../services/api3";
import { toHex } from "../services/format";
import { Meta } from "../components/Meta";
import { Treasury } from "../components/Treasury";
import { ITreasuryType, Treasuries } from "../services/treasuries";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const names = await Treasuries.fetchList();
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
      return {
        title: ttype.charAt(0).toUpperCase() + ttype.slice(1).toLowerCase(),
        address: toHex(tokens[0].address),
        valueAPI3,
        valueUSDC,
      };
    })
  );
  return {
    props: {
      webconfig,
      list: serializable(list),
    }, // will be passed to the page component as props
  };
}

const TreasuryPage: NextPage = (props: any) => {
  const { list, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="treasury" />
      <Header active="/treasury" />

      <main>
        <div className="inner">
          <h1>API3 DAO TREASURIES</h1>
          <p className="centered darken">
            API3 DAO currently operates {list.length || 0} treasuries. Balances
            below are updated each hour.
          </p>
        </div>
        <div className="max-w-screen-lg lg:flex justify-center my-0 mx-auto">
          {list.map((x: any) => (
            <div key={x.title} className="flex-1 mx-auto">
              <Treasury {...x} />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TreasuryPage;
