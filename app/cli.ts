#!/usr/bin/env ts-node
import { program } from "commander";
import { PublicKey } from "@solana/web3.js";
import { setNetwork } from "./lib";
import {
  claimTokens,
  create,
  depositFund,
  setRecipient,
  transferSOL,
} from "./actions";

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

programCommand("create")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(
    `
    Create vesting pool as sender
  ${clusterHelp}`
  )
  .requiredOption("-t, --token <string>", "The token mint address")
  .requiredOption("-a, --amount <number>", "Transfer token amount")
  .requiredOption(
    "-l, --locking_period <number>",
    "Transfer locking time in seconds"
  )
  // TODO: need to specify keypairs for multi sign
  // min_sign should be 1 for singlar Transfer
  .requiredOption("-s, --min_sign <number>", "Minimal signatures for multi sig")
  .action(async (directory, cmd) => {
    const { env, token, amount, lockingPeriod, minSign } = cmd.opts();

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.log("Error input amount");
      return;
    }
    if (isNaN(parseInt(lockingPeriod)) || parseInt(lockingPeriod) <= 0) {
      console.log("Error input amount");
      return;
    }
    if (isNaN(parseInt(minSign)) || parseInt(minSign) <= 0) {
      console.log("Error input amount");
      return;
    }
    console.log("Solana config: ", env);
    await setNetwork(env);

    // TODO: need to change minSign & remainSigners for multi sign Transfer
    await create(
      new PublicKey(token),
      parseInt(amount),
      parseInt(lockingPeriod),
      1,
      []
    );
  });

programCommand("deposit")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(
    `
    Deposit vesting token to pool as sender
  ${clusterHelp}`
  )
  .requiredOption("-b, --base <string>", "The base key of vesting pool")
  // TODO: need to specify keypairs for multi sign
  .action(async (directory, cmd) => {
    const { env, base } = cmd.opts();

    console.log("Solana config: ", env);
    await setNetwork(env);

    // TODO: need to change remainSigners for multi sign Transfer
    await depositFund(new PublicKey(base), []);
  });

programCommand("nominate")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(
    `
    Set recipient of vesting as sender
  ${clusterHelp}`
  )
  .requiredOption("-b, --base <string>", "The base key of vesting pool")
  .requiredOption("-r, --receiver <string>", "The recipient address")
  .action(async (directory, cmd) => {
    const { env, base, receiver } = cmd.opts();

    console.log("Solana config: ", env);
    await setNetwork(env);

    // TODO: need to change remainSigners for multi sign Transfer
    await setRecipient(new PublicKey(base), new PublicKey(receiver), []);
  });

programCommand("claim")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .description(
    `
    Claim vesting tokens as receiver
  ${clusterHelp}`
  )
  .requiredOption("-b, --base <string>", "The base key of vesting pool")
  .action(async (directory, cmd) => {
    const { env, base } = cmd.opts();

    console.log("Solana config: ", env);
    await setNetwork(env);

    await claimTokens(new PublicKey(base));
  });

function programCommand(name: string) {
  return program.command(name).option(
    "-e, --env <string>",
    "Solana cluster env name",
    "devnet" //mainnet-beta, testnet, devnet
  );
}

program.parse(process.argv);
