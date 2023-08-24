/**
 * Need to build transaction instruction from the params of cli commands
 */

import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { executeTransaction, provider } from "./lib";

/// Transfer Native SOL from provider wallet to destination
export const transferSOL = async (toPubkey: PublicKey, amount: number) => {
  // Build SOL transfer instruction
  const ixs = [
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    }),
  ];

  // Call engine func to exec transaction
  await executeTransaction(ixs)
    .then((txId) => console.log("Executed TxId=", txId))
    .catch((e) =>
      console.error("Failed execution:" + e.message || JSON.stringify(e))
    );
};
