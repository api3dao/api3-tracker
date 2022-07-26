import React from "react";
import Head from "next/head";
import { IWebConfig, IWebPage } from "../services/webconfig";

export interface IMetaProps {
  webconfig: IWebConfig;
  page?: string;
  values?: Map<string, string>;
}

export const Meta = (props: IMetaProps) => {
  const { opengraph } = props.webconfig;
  const pages = props.webconfig.pages as any;
  const pg = pages[props.page || ""] || ({} as any);
  const title = pg.title || opengraph.title;
  const description = pg.description || opengraph.description;
  const ogTitle = pg.ogTitle || opengraph.ogTitle || title;
  const ogDescription =
    pg.ogDescription || opengraph.ogDescription || description;
  const siteName = pg.siteName || opengraph.siteName;
  const ogImage = pg.image || opengraph.image;
  const ogImageWidth = pg.imageWidth || opengraph.imageWidth;
  const ogImageHeight = pg.imageHeight || opengraph.imageHeight;
  // TODO: map props.values to have templates
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
