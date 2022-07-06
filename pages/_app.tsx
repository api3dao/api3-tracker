import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

function Layout({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0"
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="API3" />
        <meta
          property="og:image"
          content="https://enormous.cloud/dao/icons/api3/API3x64-white-iso-c8b5fe8c70937dbb.png"
        />
        <meta property="og:image:width" content="64" />
        <meta property="og:image:height" content="64" />

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
