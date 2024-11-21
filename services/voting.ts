import { Prisma } from "@prisma/client";

import { withDecimals } from "./format";
import { type IWebConfig } from "./types";

interface IVotingScriptDetails {
  scriptType: string; // "transfer" | "invalid" | "unknown";
  signature: string;
  token: string;
  amount: Prisma.Decimal;
  address: Buffer;
}
/**
 * In order to decode an encoded proposal script one needs to have the signatures of the functions, which we need to
 * store in form of metadata. We also use metadata to store other proposal information like title and details.
 *
 * @see newVote in Api3Voting.sol for more details
 */

export interface ProposalMetadata {
  version: string;
  title: string;
  targetSignature: string;
  description: string;
}

export type ProposalType = "primary" | "secondary";

/**
 * The current version of metadata scheme.
 *
 * We version metadata schemes to allow simpler updates to the scheme in the future (e.g. if we decide to support
 * multiple EVM proposal calls).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const METADATA_SCHEME_VERSION = "1";
/**
 * The metadata scheme simply takes multiple values and inserts a non printable character used to separate words between
 * each of the values. The delimeter can't be written by user, however nothing prevents people from creating proposals
 * directly (not using DAO dashboard) and they can use whatever metadata scheme they want.
 *
 * More information:
 * https://stackoverflow.com/questions/492090/least-used-delimiter-character-in-normal-text-ascii-128/41555511#41555511
 */
export const METADATA_DELIMETER = String.fromCharCode(31);

export const VotingReader = {
  isPrimary: (config: IWebConfig, address: string): boolean => {
    const primary = config.contracts?.find(
      (p: any) => p.name.toLowerCase() === "primaryvoting",
    );
    if (!primary) {
      throw "api3 primary voting contract is not configured";
    }
    const secondary = config.contracts?.find(
      (p: any) => p.name.toLowerCase() === "secondaryvoting",
    );
    if (!secondary) {
      throw "api3 secondary voting contract is not configured";
    }
    const isPrimary = address.toLowerCase() === primary.address.toLowerCase();
    const isSecondary =
      address.toLowerCase() === secondary.address.toLowerCase();
    if (!isPrimary && !isSecondary) {
      throw (
        "expected primary or secondary voting contract, got " +
        address +
        " instead"
      );
    }
    return isPrimary;
  },

  parseScript: (data: string): IVotingScriptDetails => {
    const buf = Buffer.from(data.replace("0x", ""), "hex");
    const bufSignature = buf.subarray(160, 160 + 4);
    const signature = bufSignature.toString("hex").toLowerCase();
    let scriptType = "unknown";
    if (signature === "a9059cbb") {
      scriptType = "transfer";
    } else if (signature === "9d61d234") {
      scriptType = "invalid";
    }
    const bufToken = buf.subarray(32 + 12, 32 + 12 + 20);
    const tokenAddress = bufToken.toString("hex").toLowerCase();
    let tokenName = "";
    const decimals = 6;
    if (tokenAddress === "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
      tokenName = "USDC";
    }
    const offset = 32 + 32 + 32 + 32 + 32 + 4 + 12;
    const bufTo = buf.subarray(offset, offset + 20);

    const offsetAmt = offset + 20 + 16;
    const bufAmt = buf.subarray(offsetAmt, offsetAmt + 16);
    const sanitisedBufAmt = "0x" + bufAmt.toString("hex");
    const amt = BigInt(
      sanitisedBufAmt.length < 3 ? "0x0" : sanitisedBufAmt,
    ).toString(10);

    return {
      scriptType,
      signature,
      token: tokenName,
      amount: new Prisma.Decimal(withDecimals(amt, decimals)),
      address: bufTo,
    };
  },
  /**
   * Receives an encoded metadata and returns the decoded metadata fields.
   *
   * @param metadata encoded metadata which is to be decoded
   */
  parseMetadata: (metadata: string): ProposalMetadata | null => {
    const tokens = metadata.split(METADATA_DELIMETER);
    // Metadata encoding is just a convention and people might create proposals directly via the contract, so we need to
    // validate if the metadata has correct format.
    if (tokens.length !== 4) return null;
    return {
      version: tokens[0]!,
      targetSignature: tokens[1]!,
      title: tokens[2]!,
      description: tokens[3]!,
    };
  },
};
