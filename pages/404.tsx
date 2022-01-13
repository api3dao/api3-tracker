import type { NextPage } from "next";
import { useState } from "react";
import { VoteGas } from "../services/gas";
import { Footer, Header } from "../components/";

const FourOhFour: NextPage = () => {
  const [gas, setGas] = useState<boolean>(VoteGas.appearance);
  return (
    <div>
      <Header active="/" />
      <h1>404 - Page Not Found</h1>
      <Footer
        showGas={gas}
        changeGas={setGas}
        github={''}
        blockNumber={0}
      />
    </div>
  );
}

export default FourOhFour;
