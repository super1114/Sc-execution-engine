#!/usr/bin/env ts-node
import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import { setNetwork } from "./lib";
import { transferSOL } from "./actions";

program.version("0.0.1");

const clusterHelp = `
  Common Option - Cluster can be configured by env string: \
  mainnet-beta, testnet, devnet (default)\n`;

programCommand("sol_transfer")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(
    `
    Transfer SOL to a target address
  ${clusterHelp}`
  )
  .requiredOption("-t, --target <string>", "The target wallet address")
  .requiredOption("-a, --amount <number>", "Transfer amount in SOL")
  .action(async (directory, cmd) => {
    const { env, target, amount } = cmd.opts();

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.log("Error input amount");
      return;
    }

    console.log("Solana config: ", env);
    await setNetwork(env);

    await transferSOL(new PublicKey(target), parseFloat(amount));
  });

function programCommand(name: string) {
  return program.command(name).option(
    "-e, --env <string>",
    "Solana cluster env name",
    "devnet" //mainnet-beta, testnet, devnet
  );
}

program.parse(process.argv);
