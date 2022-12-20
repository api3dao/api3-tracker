import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { Events } from "./services/sync";
import { Treasuries } from "./services/treasuries";
import { Supply } from "./services/supply";
import { Shares } from "./services/shares";
import { ENS } from "./services/ens";

yargs(hideBin(process.argv))
  .env("API3TRACKER")
  .option("endpoint", {
    default: "http://localhost:8545/",
    alias: "e",
    type: "string",
    description: "Ethereum JSON+RPC endpoint",
  })
  .command({
    command: "ens [sub]",
    describe: "Operations with ENS cache",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "import", "download"],
        type: "string",
        describe: `logs subcommand - reset or download new`,
      });
    },
    handler: async ({ endpoint, sub }) => {
      if (sub == "reset") {
        await ENS.resetAll();
        console.log("ENS cache was deleted");
      } else if (sub == "import") {
        const total = await ENS.importLocal("./.cache");
        console.log(`saved ${total} new ENS records`);
      } else if (sub == "download") {
        const total = await ENS.download(endpoint);
        console.log(`saved ${total} new ENS records`);
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .command({
    command: "logs [sub]",
    describe: "Operations with API3 DAO contract logs",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "download"],
        type: "string",
        describe: `logs subcommand - reset or download new`,
      });
    },
    handler: async ({ endpoint, sub }) => {
      if (sub == "reset") {
        await Events.resetAll();
        console.log("events were deleted");
      } else if (sub == "download") {
        const total = await Events.download(endpoint);
        console.log(`downloaded ${total} new events`);
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .command({
    command: "shares [sub]",
    describe: "Operations with API3 DAO shares cache",
    builder: (yargs) => {
      return yargs
        .option(`sub`, {
          choises: ["reset", "download"],
          type: "string",
          describe: `shares subcommand - reset or download new`,
        })
        .option("member", {
          type: "string",
          default: "",
          description: "Hex address of the member to check its shares",
        })
    },
    handler: async ({ endpoint, sub, block, member }) => {
      if (sub == "reset") {
        await Shares.resetAll();
        console.log("shares cache records were deleted");
      } else if (sub == "download") {
        const total = await Shares.download(endpoint, member);
        console.log(`downloaded ${total} new records`);
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .command({
    command: "state [sub]",
    describe: "Operations with API3 dao state (members and votings)",
    builder: (yargs) => {
      return yargs
        .option(`sub`, {
          choises: ["reset", "update", "next"],
          type: "string",
          describe: `supply subcommand - reset or update current state based on new blocks`,
        })
        .option("verbose-epochs", {
          type: "boolean",
          description: "Run with verbose epochs logging",
        })
        .option("use-archive", {
          type: "boolean",
          default: false,
          description: "Run with using features of Ethereum archive node",
        })
        .option("stop-block", {
          type: "number",
          default: 0,
          description:
            "Calculate state until the certain block number and stop without writing it",
        })
        .option("verbose-member", {
          type: "string",
          description:
            "Run with verbose member logging (hex address to be provided)",
        })
        .option("verbose-votings", {
          type: "boolean",
          description: "Run with verbose votings logging",
        })
        .option("verbose-blocks", {
          alias: "v",
          type: "boolean",
          default: true,
          description: "Run with verbose block logging",
        });
    },
    handler: async ({
      endpoint,
      sub,
      verboseBlocks,
      verboseEpochs,
      verboseVotings,
      verboseMember,
      stopBlock,
      useArchive,
    }) => {
      if (sub == "reset") {
        await Events.resetState();
        console.log("Events state was reset");
      } else if (sub == "next") {
        const verbose = {
          blocks: verboseBlocks || false,
          epochs: verboseEpochs || false,
          votings: verboseVotings || false,
          member: verboseMember || "",
        };
        const termination = {
          epoch: true,
          block: 0,
        };
        const blocks = await Events.processState(
          endpoint,
          verbose,
          termination,
          useArchive,
        );
        console.log(`${blocks} blocks were processed`);
      } else if (sub == "update") {
        const verbose = {
          blocks: verboseBlocks || false,
          epochs: verboseEpochs || false,
          votings: verboseVotings || false,
          member: verboseMember || "",
        };
        const termination = {
          epoch: false,
          block: stopBlock,
        };
        const blocks = await Events.processState(
          endpoint,
          verbose,
          termination,
          useArchive,
        );
        console.log(`${blocks} blocks were processed`);
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .command({
    command: "supply [sub]",
    describe: "Operations with API3 token supply",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "download"],
        type: "string",
        describe: `supply subcommand - reset or download current state`,
      });
    },
    handler: async ({ endpoint, sub }) => {
      if (sub == "reset") {
        await Supply.resetAll();
        console.log("Supply history was reset");
      } else if (sub == "download") {
        await Supply.download(endpoint);
        console.log("Supply history was updated");
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .command({
    command: "treasuries [sub]",
    describe: "Operations with API3 DAO treasuries",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "download"],
        type: "string",
        describe: `treasuries subcommand - reset or download current state`,
      });
    },
    handler: async ({ endpoint, sub }) => {
      if (sub == "reset") {
        await Treasuries.resetAll();
        console.log("Treasuries state was reset");
      } else if (sub == "download") {
        const total = await Treasuries.download(endpoint);
        console.log(`downloaded state of ${total} balances`);
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .parse();
