import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
import React from "react";
import { useRouter } from "next/router";
import InfiniteScroll from "react-infinite-scroller";
import { Footer, Header, Meta } from "../components/";
import { fetchWebconfig } from "../services/webconfig";
import { CacheTotals, Wallets, Blocks } from "../services/api";
import { IWallet, IBlockNumber } from "../services/types";
import { WalletsSearch } from "../components/WalletsSearch";
import { WalletsList } from "../components/WalletsList";
import { serializable } from "../services/format";
import { Debounced } from "../services/debounced";

// const fetcher = (...args) => fetch(...args).then((res) => res.json());
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export async function getServerSideProps(context: any) {
  const q = context.query.q || "";
  const cursor = {
    take: parseInt(context.query.take) || 100,
    skip: parseInt(context.query.skip) || 0,
  };
  const results = await Promise.all([
    Wallets.fetchList(q, cursor),
    Blocks.fetchLast(),
    CacheTotals.fetch(),
  ]);
  const list: Array<IWallet> = results[0].list;
  const total = results[0].page.total;
  const lastBlock: IBlockNumber = results[1];
  const totalShares: any = results[2];

  return {
    props: {
      q,
      cursor,
      webconfig: fetchWebconfig(),
      list: serializable(list),
      total,
      lastBlock: serializable(lastBlock),
      totalShares: serializable(totalShares),
    }, // will be passed to the page component as props
  };
}

interface WalletsPageState {
  q: String,
  list: Array<IWallet>;
  total: number;
  hasMore: boolean;
  take: number;
}

const stringQuery = (input: any, defaultValue: string): string => {
  if (typeof input === 'undefined') return defaultValue;
  if (typeof input === 'number') return defaultValue + "";
  if (typeof input === 'string') return input;
  return input[0];
};

const WalletsPage: NextPage = (props: any) => {
  const { lastBlock, totalShares, webconfig } = props;
  const router = useRouter();
  const q = stringQuery(router.query.q, "");

  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  const [isLoading, setLoading] = React.useState(false);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const [state, setState] = React.useState<WalletsPageState>({
    q,
    list: props.list || new Array(),
    take: props.cursor.take,
    total: props.total || 0,
    hasMore: props.total > props.list.length,
  });
  const setData = (q: string) => ((response: any) => {
    setState({
      q,
      list: response.list,
      take: state.take,
      total: response.page.total,
      hasMore: response.page.total > response.list.length,
    });
  });
  const appendData = (response: any) => {
    const list = state.list.slice();
    for (const item of response.list) {
      list.push(item);
    }
    setState({
      q: state.q,
      take: state.take,
      list,
      total: response.page.total,
      hasMore: response.page.total > list.length,
    });
  };

  const wallets = state.list;
  const onChange = (value: string) => {
    setLoading(true);
    Debounced.start("q", () => {
      router.push("?q=" + value, undefined, { shallow: true });
      setState({ ...state, q: value || "" });
      fetcher("/api/json/wallets?q=" + value + "&take=" + state.take)
        .then(setData(value))
        .then(() => setLoading(false))
        .catch((_: any) => setLoading(false));
    }, 300);
  };

  const onLoadMore = () => {
    if (isLoadingMore) return;
    if (!state.hasMore) return;
    setLoadingMore(true);
    fetcher(
      "/api/json/wallets?q=" +
        (state.q || "") +
        "&take=" +
        state.take +
        "&skip=" +
        state.list.length
    )
      .then(appendData)
      .then(() => setLoadingMore(false))
      .catch((_: any) => setLoadingMore(false));
  };

  return (
    <div>
      <Meta webconfig={webconfig} page="wallets" />
      <Header active="/wallets" />
      <main>
        <h1>API3 DAO MEMBERS</h1>
        <WalletsSearch value={q} onChange={onChange} />
        {isLoading ? (
          <div className="text-center">...</div>
        ) : (
          <InfiniteScroll
            pageStart={0}
            loadMore={onLoadMore}
            hasMore={state.hasMore}
            loader={<div key={0}></div>}
          >
            <WalletsList total={totalShares} list={wallets} />
          </InfiniteScroll>
        )}
        {isLoadingMore ? (
          <div className="darken text-center">loading more...</div>
        ) : null}
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

export default WalletsPage;
