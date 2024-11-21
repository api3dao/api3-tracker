import { isUndefined, isNumber, isString } from "lodash";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

import { Footer, Header, Meta } from "../components/";
import { WalletsList } from "../components/WalletsList";
import { WalletsSearch } from "../components/WalletsSearch";
import { CacheTotals, Wallets, Blocks } from "../services/api";
import { Debounced } from "../services/debounced";
import { serializable } from "../services/format";
import { VoteGas } from "../services/gas";
import { type IWallet, type IBlockNumber } from "../services/types";
import { fetchWebconfig } from "../services/webconfig";

// const fetcher = (...args) => fetch(...args).then((res) => res.json());
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export async function getServerSideProps(context: any) {
  const q = context.query.q || "";
  const cursor = {
    take: Number.parseInt(context.query.take, 10) || 100,
    skip: Number.parseInt(context.query.skip, 10) || 0,
  };
  const results = await Promise.all([
    Wallets.fetchList(q, cursor),
    Blocks.fetchLast(),
    CacheTotals.fetch(),
    Wallets.totalActive(),
  ]);
  const {list} = results[0];
  const total = results[3];
  const lastBlock: IBlockNumber = results[1];
  const totalShares: any = results[2];
  const values = new Map<string, string>();
  values.set("MEMBERS", "" + total);
  return {
    props: {
      q,
      cursor,
      webconfig: fetchWebconfig(),
      values: serializable(values),
      list: serializable(list),
      total,
      lastBlock: serializable(lastBlock),
      totalShares: serializable(totalShares),
    }, // will be passed to the page component as props
  };
}

interface WalletsPageState {
  q: string;
  list: Array<IWallet>;
  total: number;
  hasMore: boolean;
  take: number;
}

const stringQuery = (input: any, defaultValue: string): string => {
  if (isUndefined(input)) return defaultValue;
  if (isNumber(input)) return defaultValue + "";
  if (isString(input)) return input;
  return input[0];
};

const WalletsPage: NextPage = (props: any) => {
  const { lastBlock, totalShares, webconfig, values } = props;
  const router = useRouter();
  const q = stringQuery(router.query.q, "");

  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  const [isLoading, setLoading] = React.useState(false);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const [state, setState] = React.useState<WalletsPageState>({
    q,
    list: props.list || [],
    take: props.cursor.take,
    total: props.total || 0,
    hasMore: props.total > props.list.length,
  });
  const setData = (q: string) => (response: any) => {
    setState({
      q,
      list: response.list,
      take: state.take,
      total: response.page.total,
      hasMore: response.page.total > response.list.length,
    });
  };
  const appendData = (response: any) => {
    const list = [...state.list];
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
    Debounced.start(
      "q",
      () => {
        router.push("?q=" + value, undefined, { shallow: true });
        setState({ ...state, q: value || "" });
        fetcher("/api/json/wallets?q=" + value + "&take=" + state.take)
          .then(setData(value))
          .then(() => setLoading(false))
          .catch((_: any) => setLoading(false));
      },
      300
    );
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
      <Meta webconfig={webconfig} values={values} page="wallets" />
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
