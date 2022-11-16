import prisma from "./db";
import { Prisma } from "@prisma/client";
import { IWallet } from "./types";
import { Wallets } from "./api";
import { BigNumber, ethers } from "ethers";
import { noDecimals, withDecimals } from "./../services/format";

export type Badge =
  | "grant"
  | "supporter"
  | "withdrawn"
  | "delegates"
  | "deposited"
  | "unstaking"
  | "voter"
  | "vested";

const Wordlist = {
  has: (wordlist: string, word: string): boolean => {
    if (!wordlist) return false;
    const parts = wordlist.split(",");
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p == word) {
        return true;
      }
    }
    return false;
  },
  add: (wordlist: string, word: string): string => {
    // console.log("WORDLIST: ADD", JSON.stringify(wordlist), word);
    if (!wordlist) return word;
    if (Wordlist.has(wordlist, word)) {
      return wordlist;
    }
    const parts = wordlist.split(",");
    parts.push(word);
    return parts.join(",");
  },
  remove: (wordlist: string, word: string): string => {
    if (!Wordlist.has(wordlist, word)) {
      return wordlist;
    }
    // console.log("WORDLIST: REMOVE", JSON.stringify(wordlist), word);
    const parts = new Array<string>();
    for (const p of wordlist.split(",")) {
      if (p != word) {
        parts.push(p);
      }
    }
    return parts.join(",");
  },
};

export const Address = {
  asBuffer: (addr: string): Buffer => {
    return Buffer.from(addr.replace("0x", ""), "hex");
  },
};

export const Batch = {
  getInserts: (): Array<Prisma.MemberCreateInput> => {
    const out = new Array<Prisma.MemberCreateInput>();
    for (const [addr, m] of Batch.inserts) {
      const tags = m.tags || "";
      const addrBuf =
        typeof addr == "string"
          ? Address.asBuffer(addr)
          : Buffer.from(addr, "hex");
      // console.log("READY.TO.INSERT", addr, typeof addr, m);
      out.push({ ...m, tags, address: addrBuf });
    }
    return out;
  },

  getUpdates: (): Map<string, Prisma.MemberUpdateInput> => {
    const out = new Map<string, Prisma.MemberUpdateInput>();
    for (const [addr, m] of Batch.updates) {
      const tags = m.tags || "";
      const addrBuf =
        typeof addr == "string"
          ? Address.asBuffer(addr)
          : Buffer.from(addr, "hex");
      // console.log("READY.TO.UPDATE", addr, typeof addr, m);
      out.set(addrBuf.toString("hex"), { ...m, tags, address: addrBuf });
    }
    return out;
  },

  inserts: new Map<string, IWallet>(),
  updates: new Map<string, IWallet>(),

  reset: () => {
    Batch.inserts.clear();
    Batch.updates.clear();
  },

  // this function can update only badge
  ensureExists: async (
    addr: string,
    blockDt: Date,
    badge: Badge | null,
    verbose: boolean
  ): Promise<IWallet | null> => {
    if (addr == "" || addr == "0x") return null;
    const address = Address.asBuffer(addr);

    if (Batch.inserts.has(addr)) {
      const existing = Batch.inserts.get(addr);
      if (existing && badge && !Wordlist.has(existing.badges, badge)) {
        // 1. we are adding a new record, but this is not a first operation for this block
        existing.badges = Wordlist.add(existing.badges, badge);
        if (existing.tags) {
          existing.tags = Wordlist.add(existing.tags, badge);
        } else {
          existing.tags = badge;
        }
        existing.updatedAt = blockDt.toISOString();
        if (verbose) console.log("ENSURE INSERT ", blockDt, addr, typeof addr);
        Batch.inserts.set(addr, existing);
      }
      return existing || null;
    } else if (Batch.updates.has(addr)) {
      const existing = Batch.updates.get(addr);
      if (existing && badge && !Wordlist.has(existing.badges, badge)) {
        // 2. we are updating existing member, and this is not a first operation for this block
        existing.badges = Wordlist.add(existing.badges, badge);
        if (existing.tags) {
          existing.tags = Wordlist.add(existing.tags, badge);
        } else {
          existing.tags = badge;
        }
        existing.updatedAt = blockDt.toISOString();
        if (verbose) console.log("ENSURE UPDATE ", blockDt, addr);
        Batch.updates.set(addr, existing);
      }
      return existing || null;
    } else {
      // 3 and 4 - this is a first operation of the member in this block
      // and we are defining the collection that should accumulate changes
      const members = await prisma.member.findMany({ where: { address } });
      if (members.length === 0) {
        // 3. this is a first request to a totally new member
        let ensName = "";
        const ensRecords = await prisma.cacheEns.findMany({
          where: { address },
        });
        const tags = new Array<string>();
        tags.push(addr);
        for (const ens of ensRecords) {
          ensName = ens.name;
          tags.push(ensName);
          for (const p of ensName.split(".")) {
            tags.push(p);
          }
        }
        const badges = new Array<string>();
        if (badge) {
          badges.push(badge);
        }
        const member: IWallet = {
          address: addr,
          ensName,
          ensUpdated: blockDt.toISOString(),
          userShare: new Prisma.Decimal(0.0),
          userStake: new Prisma.Decimal(0.0),
          userVotingPower: new Prisma.Decimal(0.0),
          userReward: new Prisma.Decimal(0.0),
          userLockedReward: new Prisma.Decimal(0.0),
          userDeposited: new Prisma.Decimal(0.0),
          userWithdrew: new Prisma.Decimal(0.0),
          createdAt: blockDt.toISOString(),
          updatedAt: blockDt.toISOString(),
          badges: badges.join(","),
          tags: tags.join(","),
        };
        if (verbose) {
          console.log("EXISTING MEMBER IS INSERTING?", addr, member.badges);
        }
        Batch.inserts.set(addr, member);
        return member;
      } else {
        const existing: IWallet = Wallets.from(members[0]);
        // only badge can be new in our case
        // nothing else is changing currenly
        if (badge) {
          if (!Wordlist.has(existing.badges, badge)) {
            existing.badges = Wordlist.add(existing.badges, badge);
            if (existing.tags) {
              existing.tags = Wordlist.add(existing.tags, badge);
            } else {
              existing.tags = badge;
            }
          }
          existing.updatedAt = blockDt.toISOString();
          if (verbose) {
            console.log("EXISTING MEMBER IS UPDATING", addr, existing.badges);
          }
          Batch.updates.set(addr, existing);
        }
        return existing;
      }
    }
    // return null;
  },
  addBadge: (
    existing: IWallet,
    badge: Badge,
    blockDt: Date,
    verbose: boolean
  ) => {
    const addr: string = existing.address;
    if (badge && !Wordlist.has(existing.badges, badge)) {
      // 2. we are updating existing member, and this is not a first operation for this block
      existing.badges = Wordlist.add(existing.badges, badge);
      if (existing.tags) {
        existing.tags = Wordlist.add(existing.tags, badge);
      } else {
        existing.tags = badge;
      }
      existing.updatedAt = blockDt.toISOString();

      if (Batch.inserts.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE INSERTED",
            addr,
            badge,
            "added, now",
            existing.badges
          );
        }
        Batch.inserts.set(addr, existing);
      } else { // if (Batch.updates.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE UPDATED",
            addr,
            badge,
            "added, now",
            existing.badges
          );
        }
        Batch.updates.set(addr, existing);
      }
    }
    return existing;
  },
  addSupporter: (member: IWallet, blockDt: Date, verbose: boolean) => {
    if (
      !Wordlist.has(member.badges, "withdrawn") &&
      !Wordlist.has(member.badges, "vested")
    ) {
      return Batch.addBadge(member, "supporter", blockDt, verbose);
    }
    return member;
  },
  removeBadge: (
    existing: IWallet,
    badge: Badge,
    blockDt: Date,
    verbose: boolean
  ) => {
    const addr: string = existing.address;
    if (badge && Wordlist.has(existing.badges, badge)) {
      // 2. we are updating existing member, and this is not a first operation for this block
      existing.badges = Wordlist.remove(existing.badges, badge);
      existing.tags = Wordlist.remove(existing.tags || "", badge);
      existing.updatedAt = blockDt.toISOString();

      if (Batch.inserts.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE INSERTED",
            addr,
            badge,
            "removed, now",
            existing.badges
          );
        }
        Batch.inserts.set(addr, existing);
      } else { // if (Batch.updates.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE UPDATED",
            addr,
            badge,
            "removed, now",
            existing.badges
          );
        }
        Batch.updates.set(addr, existing);
      }
    }
    return existing;
  },

  processEvent: (
    member: IWallet,
    blockDt: Date,
    signature: string,
    args: any,
    verbose: boolean
  ) => {
    switch (signature) {
      case "Deposited(address,uint256,uint256)": {
        const m0 = Batch.addSupporter(member, blockDt, verbose);
        const m1 = Batch.addBadge(m0, "deposited", blockDt, verbose);
        const tokens = withDecimals(BigNumber.from(args[1]).toString(), 18);
        m1.userDeposited = m1.userDeposited.add(new Prisma.Decimal(tokens));
        return m1;
      }
      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)": {
        const userShares = new Prisma.Decimal(withDecimals(ethers.BigNumber.from(args[4]).toString(), 18));
        // const totalShares = new Prisma.Decimal(withDecimals(ethers.BigNumber.from(args[5]).toString(), 18));
        const m0 = Batch.removeBadge(member, "deposited", blockDt, verbose);
        m0.userShare = m0.userShare.add(userShares);
        m0.userVotingPower = new Prisma.Decimal(0.0); // we will calculate it on fly
        return m0;
      }
      case "Unstaked(address,uint256,uint256,uint256,uint256)": {
        const userShares = new Prisma.Decimal(withDecimals(ethers.BigNumber.from(args[1]).toString(), 18));
        member.userShare = member.userShare.add(userShares);
        return member;
      }
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)":
        return Batch.addBadge(member, "unstaking", blockDt, verbose);
      case "Delegated(address,address,uint256,uint256)":
        if (member.address.toLowerCase() == args[0].toLowerCase()) {
          return Batch.addBadge(member, "delegates", blockDt, verbose);
        }
        return member;
      case "VestedTimeLock(address,uint256,uint256)": {
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        return Batch.addBadge(m0, "vested", blockDt, verbose);
      }
      case "DepositedByTimelockManager(address,uint256,uint256)": {
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        return Batch.addBadge(m0, "vested", blockDt, verbose);
      }
      case "DepositedVesting(address,uint256,uint256,uint256,uint256,uint256)": {
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        return Batch.addBadge(m0, "vested", blockDt, verbose);
      }
      case "Withdrawn(address,uint256)":
      case "Withdrawn(address,uint256,uint256)": {
      // case "WithdrawnToPool(address,address,address)":
        const m1 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        const m2 = Batch.removeBadge(m1, "unstaking", blockDt, verbose);
        const m3 = Batch.addBadge(m2, "withdrawn", blockDt, verbose);
        const tokens = withDecimals(BigNumber.from(args[1]).toString(), 18);
        m3.userWithdrew = m3.userWithdrew.add(new Prisma.Decimal(tokens));
        return m3;
      }
    }
  },
};
