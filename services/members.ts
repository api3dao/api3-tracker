import prisma from "./db";
import { Prisma } from "@prisma/client";
import { IWallet } from "./types";
import { Wallets } from "./api";

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
    // console.log("WORDLIST: HAS", typeof wordlist, wordlist);
    if (!wordlist) return false;

    const parts = wordlist.split(",");
    for (const p in parts) {
      if (p == word) return true;
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
    for (const p in wordlist.split(",")) {
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
    for (const [_addr, m] of Batch.inserts) {
      const tags = m.tags || "";
      out.push({ ...m, tags, address: Address.asBuffer(m.address) });
    }
    return out;
  },

  getUpdates: (): Map<string, Prisma.MemberUpdateInput> => {
    const out = new Map<string, Prisma.MemberUpdateInput>();
    for (const [addr, m] of Batch.inserts) {
      const tags = m.tags || "";
      out.set(addr, { ...m, tags, address: Address.asBuffer(m.address) });
    }
    return out;
  },

  inserts: new Map<string, IWallet>(),
  updates: new Map<string, IWallet>(),

  reset: () => {
    Batch.inserts = new Map<string, IWallet>();
    Batch.updates = new Map<string, IWallet>();
  },

  // this function can update only badge
  ensureExists: async (
    addr: string,
    blockDt: Date,
    badge: Badge | null
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
          Batch.updates.set(addr, existing);
        }
        return existing;
      }
    }
    // return null;
  },
  addBadge: (existing: IWallet, badge: Badge, blockDt: Date) => {
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
        Batch.inserts.set(addr, existing);
      }
      if (Batch.updates.has(addr)) {
        Batch.updates.set(addr, existing);
      }
    }
    return existing;
  },
  addSupporter: (member: IWallet, blockDt: Date) => {
    if (
      !Wordlist.has(member.badges, "withdrawn") &&
      !Wordlist.has(member.badges, "vested")
    ) {
      Batch.addBadge(member, "supporter", blockDt);
    }
  },
  removeBadge: (existing: IWallet, badge: Badge, blockDt: Date) => {
    const addr: string = existing.address;
    if (badge && Wordlist.has(existing.badges, badge)) {
      // 2. we are updating existing member, and this is not a first operation for this block
      existing.badges = Wordlist.remove(existing.badges, badge);
      existing.tags = Wordlist.remove(existing.tags || "", badge);
      existing.updatedAt = blockDt.toISOString();

      if (Batch.inserts.has(addr)) {
        Batch.inserts.set(addr, existing);
      }
      if (Batch.updates.has(addr)) {
        Batch.updates.set(addr, existing);
      }
    }
    return existing;
  },

  processEvent: (
    member: IWallet,
    blockDt: Date,
    signature: string,
    args: any
  ) => {
    switch (signature) {
      case "Deposited(address,uint256,uint256)":
        Batch.addSupporter(member, blockDt);
        Batch.addBadge(member, "deposited", blockDt);
        break;
      case "Staked(address,uint256,uint256,uint256,uint256,uint256,uint256)":
        Batch.removeBadge(member, "deposited", blockDt);
        break;
      // case "Unstaked(address,uint256,uint256,uint256,uint256)":
      case "ScheduledUnstake(address,uint256,uint256,uint256,uint256)":
        Batch.addBadge(member, "unstaking", blockDt);
        break;
      case "Delegated(address,address,uint256,uint256)":
        if (member.address == args[0]) {
          Batch.addBadge(member, "delegates", blockDt);
        }
        break;
      case "VestedTimeLock(address,uint256,uint256)":
      case "DepositedByTimelockManager(address,uint256,uint256)":
      case "DepositedVesting(address,uint256,uint256,uint256,uint256,uint256)":
        Batch.addBadge(member, "vested", blockDt);
        Batch.removeBadge(member, "supporter", blockDt);
        break;
      case "Withdrawn(address,uint256)":
      case "Withdrawn(address,uint256,uint256)":
      case "WithdrawnToPool(address,address,address)":
        Batch.addBadge(member, "withdrawn", blockDt);
        Batch.removeBadge(member, "supporter", blockDt);
        Batch.removeBadge(member, "unstaking", blockDt);
        break;
    }
  },
};
