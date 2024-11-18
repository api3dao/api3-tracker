import React from "react";
import Head from "next/head";
import { IWebConfig, IWebPage } from "../services/types";

export interface IMetaProps {
  webconfig: IWebConfig;
  page?: string;
  values?: Map<string, string>;
}

const withValues = (txt: string, values: Map<string, string>|undefined) => {
  if (!values) return txt;
  let out = txt;
  for (const [_, [k, v]] of values.entries()) {
    out = out.replaceAll('['+ k + ']', v);
  }
  return out;
};

export const Meta = (props: IMetaProps) => {
  const { opengraph } = props.webconfig;
  const pages = props.webconfig.pages as any;
  const pg = pages[props.page || ""] || ({} as any);

  const title = withValues(pg.title || opengraph.title, props.values);
  const description = withValues(
    pg.description || opengraph.description,
    props.values
  );
  const ogTitle = withValues(
    pg.ogTitle || opengraph.ogTitle || title,
    props.values
  );
  const ogDescription = withValues(
    pg.ogDescription || opengraph.ogDescription || description,
    props.values
  );

  const siteName = pg.siteName || opengraph.siteName;
  const ogImage = pg.image || opengraph.image;
  const ogImageWidth = pg.imageWidth || opengraph.imageWidth;
  const ogImageHeight = pg.imageHeight || opengraph.imageHeight;
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {ogTitle ? (
        <meta property="og:title" content={ogTitle} key="title" />
      ) : null}
      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImageWidth ? (
        <meta property="og:image:width" content={ogImageWidth + ""} />
      ) : null}
      {ogImageHeight ? (
        <meta property="og:image:height" content={ogImageHeight + ""} />
      ) : null}

      {ogDescription ? (
        <meta
          property="og:description"
          content={ogDescription}
          key="description"
        />
      ) : null}
    </Head>
  );
};
