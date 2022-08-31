import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

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
    handler: ({ endpoint, sub }) => {
      console.log("API3TRACKER_ENDPOINT", process.env.API3TRACKER_ENDPOINT);
      console.log("endpoint: ", endpoint);

      if (sub == "reset") {
        console.log("resetting");
      } else if (sub == "download") {
        console.log("downloading");
      } else {
        console.error("ERROR: Unknown sub-command");
        process.exit(1);
      }
    },
  })
  .parse();
