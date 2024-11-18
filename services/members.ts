import prisma from "./db";
import { Prisma } from "@prisma/client";
import { IDelegation, IWallet } from "./types";
import { Delegations, Wallets } from "./api";
import { BigNumber, ethers } from "ethers";
import { toBool, noDecimals, withDecimals } from "./../services/format";

export type Badge =
  | "grant"
  | "supporter"
  | "withdrawn"
  | "delegate"
  | "delegator"
  | "deposited"
  | "unstaking"
  | "voter"
  | "proposer"
  | "vested";

export const Wordlist = {
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
  inserts: new Map<string, IWallet>(),
  updates: new Map<string, IWallet>(),

  insertsDelegations: new Map<string, IDelegation>(),
  updatesDelegations: new Map<string, IDelegation>(),

  reset: () => {
    Batch.inserts.clear();
    Batch.updates.clear();
    Batch.insertsDelegations.clear();
    Batch.updatesDelegations.clear();
  },

  hasMember: (address: string): boolean => {
    const vm = address.replace("0x", "").toLowerCase();
    for (const [addr, _m] of Batch.inserts) {
      if (addr.replace("0x", "").toLowerCase() == vm) return true;
    }
    for (const [addr, _m] of Batch.updates) {
      if (addr.replace("0x", "").toLowerCase() == vm) return true;
    }
    return false;
  },

  getInserts: (verbose: boolean): Array<Prisma.MemberCreateInput> => {
    const out = new Array<Prisma.MemberCreateInput>();
    for (const [addr, m] of Batch.inserts) {
      const tags = m.tags || "";
      const addrBuf =
        typeof addr == "string"
          ? Address.asBuffer(addr)
          : Buffer.from(addr, "hex");
      if (verbose) console.log("BATCH.INSERT", addr, m);
      out.push({ ...m, tags, address: addrBuf });
    }
    return out;
  },

  getUpdates: (verbose: boolean): Map<string, Prisma.MemberUpdateInput> => {
    const out = new Map<string, Prisma.MemberUpdateInput>();
    for (const [addr, m] of Batch.updates) {
      const tags = m.tags || "";
      const addrBuf =
        typeof addr == "string"
          ? Address.asBuffer(addr)
          : Buffer.from(addr, "hex");
      if (verbose) console.log("BATCH.UPDATE", addr, m);
      out.set(addrBuf.toString("hex").toLowerCase(), {
        ...m,
        tags,
        address: addrBuf,
      });
    }
    return out;
  },

  getDelegationInserts: (
    verbose: boolean
  ): Array<Prisma.MemberDelegationCreateInput> => {
    const out = new Array<Prisma.MemberDelegationCreateInput>();
    for (const [addr, m] of Batch.insertsDelegations) {
      const from =
        typeof m.from == "string"
          ? Address.asBuffer(m.from)
          : Buffer.from(m.from, "hex");
      const to =
        typeof m.to == "string"
          ? Address.asBuffer(m.to)
          : Buffer.from(m.to, "hex");
      if (verbose) console.log("BATCH.DELEGATION.INSERT", addr, m);
      out.push({
        from,
        to,
        userShares: m.userShares,
        updatedAt: m.updatedAt,
      });
    }
    return out;
  },

  getDelegationUpdates: (
    verbose: boolean
  ): Map<string, Prisma.MemberDelegationUpdateInput> => {
    const out = new Map<string, Prisma.MemberDelegationUpdateInput>();
    for (const [_, m] of Batch.updatesDelegations) {
      const from =
        typeof m.from == "string"
          ? Address.asBuffer(m.from)
          : Buffer.from(m.from, "hex");
      const to =
        typeof m.to == "string"
          ? Address.asBuffer(m.to)
          : Buffer.from(m.to, "hex");
      const key = from.toString("hex").toLowerCase();
      if (verbose) console.log("BATCH.DELEGATION.UPDATE", key, m);
      out.set(key, { to, updatedAt: m.updatedAt, userShares: m.userShares });
    }
    return out;
  },

  // this function can update only badge
  ensureExists: async (
    addr: string,
    blockDt: Date,
    badge: Badge | null,
    verbose: boolean
  ): Promise<IWallet | null> => {
    if (addr == "" || addr == "0x") return null;
    const address: Buffer = Address.asBuffer(addr);
    const batchIndex = address.toString("hex").replace("0x", "").toLowerCase();
    if (Batch.inserts.has(batchIndex)) {
      const existing = Batch.inserts.get(batchIndex);
      if (existing) {
        if (badge && !Wordlist.has(existing.badges, badge)) {
          // 1. we are adding a new record, but this is not a first operation for this block
          existing.badges = Wordlist.add(existing.badges, badge);
          if (existing.tags) {
            existing.tags = Wordlist.add(existing.tags, badge);
          } else {
            existing.tags = badge;
          }
        }
        existing.updatedAt = blockDt.toISOString();
        if (verbose) console.log("ENSURE INSERT ", blockDt, addr, typeof addr);
        Batch.inserts.set(batchIndex, existing);
      }
      return existing || null;
    } else if (Batch.updates.has(batchIndex)) {
      const existing = Batch.updates.get(batchIndex);
      if (existing) {
        if (badge && !Wordlist.has(existing.badges, badge)) {
          // 2. we are updating existing member, and this is not a first operation for this block
          existing.badges = Wordlist.add(existing.badges, badge);
          if (existing.tags) {
            existing.tags = Wordlist.add(existing.tags, badge);
          } else {
            existing.tags = badge;
          }
        }
        existing.updatedAt = blockDt.toISOString();
        if (verbose) console.log("ENSURE UPDATE ", blockDt, addr);
        Batch.updates.set(batchIndex, existing);
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
          userUnstake: new Prisma.Decimal(0.0),
          userVotingPower: new Prisma.Decimal(0.0),
          userReward: new Prisma.Decimal(0.0),
          userLockedReward: new Prisma.Decimal(0.0),
          userDeposited: new Prisma.Decimal(0.0),
          userWithdrew: new Prisma.Decimal(0.0),
          userDelegates: new Prisma.Decimal(0.0),
          userIsDelegated: new Prisma.Decimal(0.0),
          createdAt: blockDt.toISOString(),
          updatedAt: blockDt.toISOString(),
          badges: badges.join(","),
          tags: tags.join(","),
        };
        if (verbose) {
          console.log("EXISTING MEMBER IS INSERTING?", addr, member.badges);
        }
        Batch.inserts.set(batchIndex, member);
        return member;
      } else {
        const existing: IWallet = Wallets.from(members[0]);
        // only badge can be new in our case
        // nothing else is changing currently
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
          Batch.updates.set(batchIndex, existing);
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
    const addrIndex: string = existing.address.replace("0x", "").toLowerCase();
    if (badge && !Wordlist.has(existing.badges, badge)) {
      // 2. we are updating existing member, and this is not a first operation for this block
      existing.badges = Wordlist.add(existing.badges, badge);
      if (existing.tags) {
        existing.tags = Wordlist.add(existing.tags, badge);
      } else {
        existing.tags = badge;
      }
      existing.updatedAt = blockDt.toISOString();

      if (Batch.inserts.has(addrIndex)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE INSERTED",
            addrIndex,
            badge,
            "added, now",
            existing.badges
          );
        }
        Batch.inserts.set(addrIndex, existing);
      } else {
        // if (Batch.updates.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE UPDATED",
            addrIndex,
            badge,
            "added, now",
            existing.badges
          );
        }
        Batch.updates.set(addrIndex, existing);
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
    const addrIndex: string = existing.address.replace("0x", "").toLowerCase();
    if (badge && Wordlist.has(existing.badges, badge)) {
      // 2. we are updating existing member, and this is not a first operation for this block
      existing.badges = Wordlist.remove(existing.badges, badge);
      existing.tags = Wordlist.remove(existing.tags || "", badge);
      existing.updatedAt = blockDt.toISOString();

      if (Batch.inserts.has(addrIndex)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE INSERTED",
            addrIndex,
            badge,
            "removed, now",
            existing.badges
          );
        }
        Batch.inserts.set(addrIndex, existing);
      } else {
        // if (Batch.updates.has(addr)) {
        if (verbose) {
          console.log(
            "MEMBER BADGE UPDATED",
            addrIndex,
            badge,
            "removed, now",
            existing.badges
          );
        }
        Batch.updates.set(addrIndex, existing);
      }
    }
    return existing;
  },

  readMember: async (addr: Buffer): Promise<IWallet | undefined> => {
    const addrIndex = addr.toString("hex").toLowerCase();
    if (Batch.inserts.has(addrIndex)) {
      return Batch.inserts.get(addrIndex);
    }
    if (Batch.updates.has(addrIndex)) {
      return Batch.updates.get(addrIndex);
    }
    const members = await prisma.member.findMany({ where: { address: addr } });
    if (members.length == 0) return undefined;
    return Wallets.from(members[0]);
  },

  readMemberDelegates: async (
    addr: Buffer
  ): Promise<IDelegation | undefined> => {
    const addrIndex = addr.toString("hex").toLowerCase();
    if (Batch.insertsDelegations.has(addrIndex)) {
      return Batch.insertsDelegations.get(addrIndex);
    }
    if (Batch.updatesDelegations.has(addrIndex)) {
      return Batch.updatesDelegations.get(addrIndex);
    }
    const delegation = await prisma.memberDelegation.findMany({
      where: { from: addr },
    });
    if (delegation.length == 0) return undefined;
    return Delegations.from(delegation[0]);
  },

  readMemberDelegatedTotal: async (
    addr: Buffer,
    verbose: boolean
  ): Promise<Prisma.Decimal> => {
    const addrIndex = addr.toString("hex").toLowerCase();
    const delegationMap = new Map<string, Prisma.Decimal>();
    // go through delegations in the database
    const delegations = await prisma.memberDelegation.findMany({
      where: { to: addr },
    });
    for (const d of delegations) {
      const fromIndex = d.from.toString("hex").toLowerCase();
      delegationMap.set(fromIndex, d.userShares);
    }
    // overwrite number of shares with in-memory buffers
    for (const [fromIndex, ins] of Batch.insertsDelegations) {
      const to = Address.asBuffer(ins.to);
      if (to.toString("hex").toLowerCase() == addrIndex)
        delegationMap.set(fromIndex, ins.userShares);
    }
    for (const [fromIndex, upd] of Batch.updatesDelegations) {
      const to = Address.asBuffer(upd.to);
      if (to.toString("hex").toLowerCase() == addrIndex)
        delegationMap.set(fromIndex, upd.userShares);
    }
    // at this point we have in-memory delegation map of this member
    let total = new Prisma.Decimal(0.0);
    for (const [_, shares] of delegationMap) {
      total = total.add(shares);
    }
    // if (delegationMap.size) { console.log("delegationMap", addrIndex, total, delegationMap); }
    return total;
  },

  ensureUpdated: (existing: IWallet): IWallet => {
    const addrIndex: string = existing.address.replace("0x", "").toLowerCase();
    if (Batch.inserts.has(addrIndex)) {
      Batch.inserts.set(addrIndex, existing);
    } else {
      Batch.updates.set(addrIndex, existing);
    }
    return existing;
  },

  updateTotals: async (addr: Buffer, verbose: boolean) => {
    const addrIndex = addr.toString("hex").toLowerCase();
    const member = await Batch.readMember(addr);
    const delegation = await Batch.readMemberDelegates(addr);
    const delegated = await Batch.readMemberDelegatedTotal(addr, verbose);
    if (member) {
      // find if there is a delegation BY the member
      // console.log( "updateTotals delegation", addrIndex, JSON.stringify(delegation));
      member.userDelegates = new Prisma.Decimal(
        delegation ? delegation.userShares : 0
      );
      if (delegation) {
        const badge = "delegator";
        member.badges = Wordlist.add(member.badges, badge);
        if (member.tags) {
          member.tags = Wordlist.add(member.tags, badge);
        } else {
          member.tags = badge;
        }
      }
      // find what are the delegations TO the member
      member.userIsDelegated = delegated;
      const badge = "delegate";
      if (delegated > new Prisma.Decimal(0.0)) {
        member.badges = Wordlist.add(member.badges, badge);
        member.tags = Wordlist.add(member.tags || "", badge);
      } else {
        member.badges = Wordlist.remove(member.badges, badge);
        member.tags = Wordlist.remove(member.tags || "", badge);
      }
      member.userVotingPower = new Prisma.Decimal(member.userShare).add(
        member.userIsDelegated
      );
      if (member.userDelegates > new Prisma.Decimal(0.0))
        member.userVotingPower = new Prisma.Decimal(0.0);
      // console.log("updateTotals member", addrIndex, JSON.stringify(member));
      Batch.ensureUpdated(member);
    }
  },

  updateMembersTotals: async (addresses: Array<Buffer>, verbose: boolean) => {
    const updated = new Map<string, number>();
    for (const addr of addresses) {
      const index = addr.toString("hex");
      if (!updated.has(index)) {
        await Batch.updateTotals(addr, verbose);
        updated.set(index, 1);
      }
    }
  },

  updateDelegation: async (
    from: Buffer,
    to: Buffer,
    blockDt: Date,
    shares: Prisma.Decimal,
    verbose: boolean
  ) => {
    const delegation: IDelegation = {
      from: "0x" + from.toString("hex").toLowerCase(),
      to: "0x" + to.toString("hex").toLowerCase(),
      updatedAt: blockDt.toISOString(),
      userShares: shares,
    };
    const index = delegation.from.replace("0x", "").toLowerCase();
    if (Batch.insertsDelegations.has(index)) {
      const existing = Object.assign({}, Batch.insertsDelegations.get(index));
      Batch.insertsDelegations.set(index, delegation);
      await Batch.updateMembersTotals(
        [from, to, Address.asBuffer(existing.to)],
        verbose
      );
    } else if (Batch.updatesDelegations.has(index)) {
      const existing = Object.assign({}, Batch.updatesDelegations.get(index));
      Batch.updatesDelegations.set(index, delegation);
      await Batch.updateMembersTotals(
        [from, to, Address.asBuffer(existing.to)],
        verbose
      );
    } else {
      const existing = await prisma.memberDelegation.findMany({
        where: { from },
      });
      if (existing.length === 0) {
        Batch.insertsDelegations.set(index, delegation);
        await Batch.updateMembersTotals([from, to], verbose);
      } else {
        Batch.updatesDelegations.set(index, delegation);
        await Batch.updateMembersTotals([from, to, existing[0].to], verbose);
      }
    }
  },

  processEvent: async (
    member: IWallet,
    blockDt: Date,
    signature: string,
    args: any,
    verbose: boolean
  ) => {
    const verboseDelegation = false;
    const verboseTotals = false;
    switch (signature) {
      case "Deposited(address,uint256,uint256)": {
        const m0 = Batch.addSupporter(member, blockDt, verbose);
        const m1 = Batch.addBadge(m0, "deposited", blockDt, verbose);
        const tokens = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[1]).toString(), 18)
        );
        m1.userDeposited = m1.userDeposited.add(tokens);
        return Batch.ensureUpdated(m1);
      }
      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)": {
        const userShares = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[4]).toString(), 18)
        );
        const m0 = Batch.removeBadge(member, "deposited", blockDt, verbose);
        m0.userShare = userShares;
        const m1 = Batch.removeBadge(member, "deposited", blockDt, verbose);
        Batch.ensureUpdated(m1);
        await Batch.updateTotals(Address.asBuffer(m1.address), verboseTotals);

        const totalShares = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[4]).toString(), 18)
        ); // TODO: totalShares can be compared with totalshares over all the members
        return m1;
      }
      case "Unstaked(address,uint256,uint256,uint256,uint256)": {
        const userTokens = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[1]).toString(), 18)
        );
        member.userStake = userTokens;
        Batch.ensureUpdated(member);
        await Batch.updateTotals(
          Address.asBuffer(member.address),
          verboseTotals
        );
        return member;
      }
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)": {
        const m1 = Batch.addBadge(member, "unstaking", blockDt, verbose);
        const amount = noDecimals(
          withDecimals(ethers.BigNumber.from(args[1]).toString(), 18)
        );
        const userShares = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[4]).toString(), 18)
        );
        m1.userShare = userShares;
        m1.userStake = m1.userStake.sub(amount);

        Batch.ensureUpdated(m1);
        await Batch.updateTotals(Address.asBuffer(m1.address), verboseTotals);
        return m1;
      }
      case "Delegated(address,address,uint256,uint256)":
        const userShares = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[2]).toString(), 18)
        );
        const m1 = Address.asBuffer(args[0]);
        const m2 = Address.asBuffer(args[1]);
        await Batch.updateDelegation(
          m1,
          m2,
          blockDt,
          userShares,
          verboseDelegation
        );
        return member;
      case "UpdatedDelegation(address,address,bool,uint256,uint256)": {
        const delta: boolean = toBool(args[2]);
        let userShares = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[3]).toString(), 18)
        );
        const m1 = Address.asBuffer(args[0]);
        const d = await Batch.readMemberDelegates(m1);
        if (d) {
          if (delta) {
            userShares = userShares.add(d.userShares);
          } else {
            userShares = userShares.sub(d.userShares);
          }
        }

        const m2 = Address.asBuffer(args[1]);
        await Batch.updateDelegation(
          m1,
          m2,
          blockDt,
          userShares,
          verboseDelegation
        );
        return member;
      }
      case "Undelegated(address,address,uint256,uint256)": {
        const m1 = Address.asBuffer(args[0]);
        const m2 = Address.asBuffer(args[1]);
        await Batch.updateDelegation(
          m1,
          m2,
          blockDt,
          new Prisma.Decimal(0),
          verboseDelegation
        );
        return member;
      }
      case "VestedTimeLock(address,uint256,uint256)": {
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        return Batch.addBadge(m0, "vested", blockDt, verbose);
      }
      case "DepositedByTimelockManager(address,uint256,uint256)": {
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        return Batch.addBadge(m0, "vested", blockDt, verbose);
      }
      case "DepositedVesting(address,uint256,uint256,uint256,uint256,uint256)": {
        const tokens = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[1]).toString(), 18)
        );
        const m0 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        const m1 = Batch.addBadge(m0, "vested", blockDt, verbose);
        m1.userDeposited = m1.userDeposited.add(tokens);
        return Batch.ensureUpdated(m1);
      }
      // case "Withdrawn(address,uint256)": // this is some unrelated withdrawal by timelock manager
      // case "WithdrawnToPool(address,address,address)":  // unrelated
      case "Withdrawn(address,uint256,uint256)": {
        const m1 = Batch.removeBadge(member, "supporter", blockDt, verbose);
        const m2 = Batch.removeBadge(m1, "unstaking", blockDt, verbose);
        const m3 = Batch.addBadge(m2, "withdrawn", blockDt, verbose);
        const tokens = new Prisma.Decimal(
          withDecimals(ethers.BigNumber.from(args[1]).toString(), 18)
        );
        m3.userWithdrew = m3.userWithdrew.add(tokens);
        Batch.ensureUpdated(m3);

        await Batch.updateTotals(
          Address.asBuffer(member.address),
          verboseTotals
        );
        return m3;
      }
    }
  },
};
