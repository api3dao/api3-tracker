import Document, { Html, Main, Head, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <Main />
        <NextScript />
      </Html>
    );
  }
}

export default MyDocument;
