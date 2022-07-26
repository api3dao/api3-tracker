import type { NextPage } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BorderedPanel } from "../components/BorderedPanel";
import { fetchWebconfig } from "../services/webconfig";
import { ISupply, IEpoch } from "../services/api3";
import { Epochs } from "../services/epochs";
import { Supply } from "../services/supply";
import { Meta } from "../components/Meta";
import superjson from "superjson";

export async function getServerSideProps() {
  const webconfig = fetchWebconfig();
  const latest: Array<IEpoch> = await Epochs.fetchLatest(3);
  const current: IEpoch = latest[0];
  const supply = await Supply.fetch();
  return {
    props: {
      webconfig,
      latest: JSON.parse(superjson.stringify(latest)).json,
      supply: JSON.parse(superjson.stringify(supply)).json,
      current: JSON.parse(superjson.stringify(current)).json,
    }, // will be passed to the page component as props
  };
}

const HomePage: NextPage = (props: any) => {
  const { latest, current, webconfig } = props;
  return (
    <div>
      <Meta webconfig={webconfig} />
      <Header active="/" />
      <main>
        <div className="inner">
          <div className="centered">
            <h1 className="uppercase">API3 DAO Tracker</h1>
            <p className="m20">
              API3 DAO currently involves{" "}
              <a href="./wallets">{current.members} members</a>{" "}
            </p>
            <div className="spacer"></div>
            <h2 className="my-2 font-bold text-2xl uppercase">API3 Staking Rewards</h2>
            <div className="dash-row">
              <div className="dash-col dash-col-3">
                <BorderedPanel title="Current Epoch">
                  <div>
                    <div className="cell-title">
                      <span className="darken">Epoch #</span>2,741
                    </div>
                    <h2 className="stats-row">
                      APR: <strong className="big-title">12.75%</strong>
                    </h2>
                    <div className="stats-row m20">
                      <span className="darken cell-title">Epoch Rewards: </span>
                      <strong className="accent">0.2445%</strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">Staked now: </span>
                      <strong title="55,264,909.509553249422635937">
                        55,264,909
                      </strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">
                        Including rewards:{" "}
                      </span>
                      <strong title="13,477,575.482658194494016780">
                        13,477,575
                      </strong>
                    </div>
                    <div className="padded">
                      <div className="stats-row cell-title">
                        <strong> ~135,134</strong>
                        <span className="darken">
                          {" "}
                          API3 tokens to be minted{" "}
                        </span>
                      </div>
                      <div className="stats-row darken cell-title">
                        2022-07-14 00:02:28
                      </div>
                    </div>
                  </div>
                </BorderedPanel>
              </div>
              <div className="dash-col dash-col-3">
                <BorderedPanel title="Previous Epoch">
                  <div>
                    <div className="cell-title">
                      <span className="darken">Epoch #</span>2,741
                    </div>
                    <h2 className="stats-row">
                      APR: <strong className="big-title">12.75%</strong>
                    </h2>
                    <div className="stats-row m20">
                      <span className="darken cell-title">Epoch Rewards: </span>
                      <strong className="accent">0.2445%</strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">Staked now: </span>
                      <strong title="55,264,909.509553249422635937">
                        55,264,909
                      </strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">
                        Including rewards:{" "}
                      </span>
                      <strong title="13,477,575.482658194494016780">
                        13,477,575
                      </strong>
                    </div>
                    <div className="padded">
                      <div className="stats-row cell-title">
                        <strong> ~135,134</strong>
                        <span className="darken">
                          {" "}
                          API3 tokens to be minted{" "}
                        </span>
                      </div>
                      <div className="stats-row darken cell-title">
                        2022-07-14 00:02:28
                      </div>
                    </div>
                  </div>
                </BorderedPanel>
              </div>
              <div className="dash-col dash-col-3">
                <BorderedPanel title="Previous Epoch">
                  <div>
                    <div className="cell-title">
                      <span className="darken">Epoch #</span>2,741
                    </div>
                    <h2 className="stats-row">
                      APR: <strong className="big-title">12.75%</strong>
                    </h2>
                    <div className="stats-row m20">
                      <span className="darken cell-title">Epoch Rewards: </span>
                      <strong className="accent">0.2445%</strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">Staked now: </span>
                      <strong title="55,264,909.509553249422635937">
                        55,264,909
                      </strong>
                    </div>
                    <div className="stats-row">
                      <span className="darken cell-title">
                        Including rewards:{" "}
                      </span>
                      <strong title="13,477,575.482658194494016780">
                        13,477,575
                      </strong>
                    </div>
                    <div className="padded">
                      <div className="stats-row cell-title">
                        <strong> ~135,134</strong>
                        <span className="darken">
                          {" "}
                          API3 tokens to be minted{" "}
                        </span>
                      </div>
                      <div className="stats-row darken cell-title">
                        2022-07-14 00:02:28
                      </div>
                    </div>
                  </div>
                </BorderedPanel>
              </div>
            </div>
            <div>
              <h2 className="uppercase text-bold">API3 Token Supply</h2>
              <div className="dash-row" id="api3-locked-tokens">
                <div className="dash-col dash-col-4 cell-t">
                  <h3 className="cell-title">Locked by governance</h3>
                  <strong title="21,960,129.239837495631009492">
                    21,960,129 tokens
                  </strong>
                </div>
                <div className="dash-col dash-col-4 cell-t">
                  <h3 className="cell-title">Locked vestings</h3>
                  <strong title="20,816,613.337658377303772200">
                    20,816,613 tokens
                  </strong>
                </div>
                <div className="dash-col dash-col-4 cell-t">
                  <h3 className="cell-title">Locked rewards</h3>
                  <strong title="13,354,235.930377330633241959">
                    13,354,235 tokens
                  </strong>
                </div>
                <div className="dash-col dash-col-4 cell-t">
                  <h3 className="cell-title">Time Locked</h3>
                  <strong title="34,170,849.268035707937014159">
                    34,170,849 tokens
                  </strong>
                </div>
              </div>
              <div className="dash-row">
                <div className="dash-col dash-col-2">
                  <div className="">
                    <div className="bordered-wrapper">
                      <div className="bordered-panel">
                        <div className="bordered-box">
                          <div className="bordered-left"></div>
                          <div className="bordered-inner">
                            <div className="bordered-title big-title">
                              API3 Smart Contracts
                            </div>
                            <div className="bordered-content">
                              <div>
                                <ul>
                                  <li>
                                    <label className="cell-title">
                                      API3 pool contract address:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0x6dd655f10d4b9e242ae186d9050b68f725c76d76"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0x6dd655f10d4b9e242ae186d9050b68f725c76d76
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      API3 token contract address:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0x0b38210ea11411557c13457d4da7dc6ea731b88a"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0x0b38210ea11411557c13457d4da7dc6ea731b88a
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Time-lock manager contract:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0xfaef86994a37f1c8b2a5c73648f07dd4eff02baa"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0xfaef86994a37f1c8b2a5c73648f07dd4eff02baa
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Primary voting contract:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0xdb6c812e439ce5c740570578681ea7aadba5170b"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0xdb6c812e439ce5c740570578681ea7aadba5170b
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Primary treasury agent:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0xd9f80bdb37e6bad114d747e60ce6d2aaf26704ae
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Secondary voting contract:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0x1c8058e72e4902b3431ef057e8d9a58a73f26372"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0x1c8058e72e4902b3431ef057e8d9a58a73f26372
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Secondary treasury agent:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0x556ecbb0311d350491ba0ec7e019c354d7723ce0"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0x556ecbb0311d350491ba0ec7e019c354d7723ce0
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      V1 Treasury address:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0xe7af7c5982e073ac6525a34821fe1b3e8e432099"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0xe7af7c5982e073ac6525a34821fe1b3e8e432099
                                      </a>
                                    </div>
                                  </li>
                                  <li>
                                    <label className="cell-title">
                                      Convenience contract:{" "}
                                    </label>
                                    <div className="eth-address">
                                      <a
                                        href="https://etherscan.io/address/0x95087266018b9637aff3d76d4e0cad7e52c19636"
                                        className="icon"
                                        title="View on Etherscan"
                                        rel="nofollow noopener noreferrer"
                                        target="_blank"
                                      >
                                        0x95087266018b9637aff3d76d4e0cad7e52c19636
                                      </a>
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="bordered-right"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dash-col dash-col-2">
                  <div>
                    <div className="">
                      <div className="bordered-wrapper">
                        <div className="bordered-panel">
                          <div className="bordered-box">
                            <div className="bordered-left"></div>
                            <div className="bordered-inner">
                              <div className="bordered-title big-title">
                                API3 Circulating Supply
                              </div>
                              <div className="bordered-content">
                                <div id="api3-circulating-supply">
                                  <strong
                                    className="big-title"
                                    title="57,223,237.982507809145334806"
                                  >
                                    57,223,237
                                    <span className="desktop-only">
                                      {" "}
                                      tokens
                                    </span>
                                  </strong>
                                  <h3 className="cell-title">Total Locked</h3>
                                  <strong title="56,130,978.507873203568023651">
                                    56,130,978
                                    <span className="desktop-only">
                                      {" "}
                                      tokens
                                    </span>
                                  </strong>
                                </div>
                              </div>
                            </div>
                            <div className="bordered-right"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dash-row" id="staking">
                      <div className="dash-col dash-col-2 cell-t">
                        <h3 className="cell-title">Total Staked</h3>
                        <strong title="54,768,607.225532958302616415">
                          54,768,607 tokens
                        </strong>
                      </div>
                      <div className="dash-col dash-col-2 cell-t">
                        <h3 className="cell-title">Staking Target</h3>
                        <strong title="56,677,108.2451905063">
                          56,677,108 tokens
                        </strong>
                      </div>
                    </div>
                    <div className="dash-row">
                      <p
                        className="note centered"
                        title="apr=0.11750000000000001 target=56677108 total=54768607"
                      >
                        <span className="accent">
                          DAO staking target is not reached, so APR will be
                          increased by 1% for the next epoch until it reaches
                          75%
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
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
