import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { Events } from "./services/sync";
import { Treasuries } from "./services/treasuries";
import { Supply } from "./services/supply";
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
    command: "state [sub]",
    describe: "Operations with API3 dao state (members and votings)",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "update", "next"],
        type: "string",
        describe: `supply subcommand - reset or update current state based on new blocks`,
      });
    },
    handler: async ({ endpoint, sub }) => {
      if (sub == "reset") {
        await Events.resetState();
        console.log("Events state was reset");
      } else if (sub == "next") {
        const blocks = await Events.processState(endpoint, true);
        console.log(`${blocks} blocks were processed`);
      } else if (sub == "update") {
        const blocks = await Events.processState(endpoint, false);
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
