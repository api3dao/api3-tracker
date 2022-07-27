import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { fetchWebconfig } from "../services/webconfig";
import { Meta } from "../components/Meta";
import { ITreasuryType, Treasuries } from "../services/treasuries";
import superjson from "superjson";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const names = await Treasuries.fetchList();
  const list = await Promise.all(
    names.map(async (ttype: ITreasuryType) => {
      return await Treasuries.fetch(ttype);
    })
  );
  return {
    props: {
      webconfig,
      list: JSON.parse(superjson.stringify(list)).json,
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
          <h1>API3 DAO TREASURY</h1>
          <p className="centered darken">
            API3 DAO currently operates 3 treasuries. Balances below are updated
            each hour.
          </p>
          <pre>{JSON.stringify(list, null, 2)}</pre>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TreasuryPage;
