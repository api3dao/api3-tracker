import React from "react";

export const Summary = () => (
  <div>
    <p>
      <span className="darken">API3 DAO currently has </span>
      <strong>5,236</strong>
      <span className="darken"> participants, staking </span>
      <strong title="42,594,020.717990122989144724">42,594,020</strong>
      <span className="darken"> shares. </span>
    </p>
    <p>
      <span className="darken"> There were </span>
      <strong title="13,477,575.482658194494016780">13,477,575</strong>
      <span className="darken">
        {" "}
        API3 tokens minted and locked as staking rewards{" "}
      </span>
    </p>
    <p>
      <span className="darken"> Stakes of </span>
      <strong>43</strong>
      <span className="darken">
        {" "}
        DAO members are known to be vested, owning{" "}
      </span>
      <strong title="35,489,370.266445757051183149">35,489,370</strong>
      <span className="darken"> shares (</span>
      <strong>83.32%</strong>
      <span className="darken"> of current voting power)</span>
    </p>
    <p>
      <strong>54</strong>
      <span className="darken">
        {" "}
        DAO members are delegating their voting power of{" "}
      </span>
      <strong title="4,378,936.867312743603530186">4,378,936</strong>
      <span className="darken"> shares (</span>
      <strong>10.28%</strong>
      <span className="darken">) to others.</span>
    </p>
    <p>
      <strong>1,338</strong>
      <span className="darken">
        {" "}
        DAO members withdrew most of their stakes and left.{" "}
      </span>
    </p>
  </div>
);
