import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { VotingsList } from "../components/VotingsList";
import { fetchWebconfig } from "../services/webconfig";
import { Votings } from "../services/votings";
import { Meta } from "../components/Meta";
import { serializable } from "../services/format";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const pending = await Votings.fetchList("pending");
  const executed = await Votings.fetchList("executed");
  const invalid = await Votings.fetchList("invalid");
  const rejected = await Votings.fetchList("rejecte");
  return {
    props: {
      webconfig,
      pending: serializable(pending),
      executed: serializable(executed),
      invalid: serializable(invalid),
      rejected: serializable(rejected),
    }, // will be passed to the page component as props
  };
}

const VotingsPage: NextPage = (props: any) => {
  const { pending, executed, invalid, rejected, webconfig } = props;

  return (
    <div>
      <Meta webconfig={webconfig} page="votings" />
      <Header active="/votings" />

      <main>
        <h1 className="uppercase">API3 DAO Votings</h1>
        {pending.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {pending.length} Pending Proposals
            </div>
            <VotingsList list={Votings.fromList(pending)} />
          </section>
        ) : null}
        {executed.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {executed.length} Executed Proposals
            </div>
            <VotingsList list={Votings.fromList(executed)} />
          </section>
        ) : null}
        {invalid.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {invalid.length} Invalid Proposals
            </div>
            <VotingsList list={Votings.fromList(invalid)} />
          </section>
        ) : null}
        {rejected.length > 0 ? (
          <section className="max-w-screen-lg mx-auto">
            <div className="text-center text-xl">
              {rejected.length} Rejected Proposals
            </div>
            <VotingsList list={Votings.fromList(rejected)} />
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default VotingsPage;
