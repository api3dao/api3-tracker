import "../styles/globals.css";
import "nprogress/nprogress.css";
import "../styles/nprogress-overrides.css";
import NProgress from "nprogress";
import { useEffect } from "react";
import Router from "next/router";
import type { AppProps } from "next/app";
import Head from "next/head";

function Layout({ Component, pageProps }: AppProps) {
  useEffect(() => {
    NProgress.configure({
      trickleSpeed: 300,
      showSpinner: false,
      barSelector: '[data-nprogress="bar"]',
      template:
        '<div class="bar" data-nprogress="bar" aria-hidden="true"><div class="peg"></div></div>',
    });

    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleComplete);
    Router.events.on("routeChangeError", handleComplete);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleComplete);
      Router.events.off("routeChangeError", handleComplete);
    };
  }, []);

  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0"
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/API3x16-white-iso.png" />
        <link rel="icon" href="/API3x32-white-iso.png" />
        <link rel="icon" href="/API3x64-white-iso.png" />
        <link rel="icon" href="/API3x128-white-iso.png" />
        <link rel="icon" href="/API3x256-white-iso.png" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default Layout;
