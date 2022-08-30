import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command({
    command: "logs [sub]",
    describe: "Operations with API3 DAO contract logs",
    builder: (yargs) => {
      return yargs.option(`sub`, {
        choises: ["reset", "download"],
        type: `string`,
        describe: `logs subcommand - reset or download new`,
      });
    },
    handler: ({ sub }) => {
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
