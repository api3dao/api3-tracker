import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { Events } from "./services/sync";

yargs(hideBin(process.argv))
  .env("API3TRACKER")
  .option("endpoint", {
    default: "http://localhost:8545/",
    alias: "e",
    type: "string",
    description: "Ethereum JSON+RPC endpoint",
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
        await Events.reset();
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
  .parse();
