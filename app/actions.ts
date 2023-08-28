/**
 * Need to build transaction instruction from the params of cli commands
 */

import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

import {
  claim,
  createPool,
  deposit,
  executeTransaction,
  nominateReceiver,
  provider,
} from "./lib";

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

export const create = async (
  mint: PublicKey,
  amount: number,
  lockingPeriod: number,
  minSign: number,
  remainSigners: PublicKey[]
) => {
  const baseKey: Keypair = Keypair.generate();
  const tx = await createPool(
    baseKey,
    mint,
    BigInt(amount),
    lockingPeriod,
    minSign,
    remainSigners
  );
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (
    await provider.connection.getLatestBlockhash()
  ).blockhash;

  await provider
    .sendAndConfirm(tx, [baseKey], {
      commitment: "finalized",
    })
    .then((txId) => console.log("Created TxId=", txId))
    .catch((e) =>
      console.error("Failed creation:" + e.message || JSON.stringify(e))
    );
};

export const depositFund = async (
  baseKey: PublicKey,
  remainSigners: Keypair[]
) => {
  const tx = await deposit(
    baseKey,
    remainSigners.map((keypair) => keypair.publicKey)
  );
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (
    await provider.connection.getLatestBlockhash()
  ).blockhash;

  await provider
    .sendAndConfirm(tx, remainSigners, {
      commitment: "finalized",
    })
    .then((txId) => console.log("Deposited TxId=", txId))
    .catch((e) =>
      console.error("Failed deposition:" + e.message || JSON.stringify(e))
    );
};

export const setRecipient = async (
  baseKey: PublicKey,
  receiver: PublicKey,
  remainSigners: Keypair[]
) => {
  const tx = await nominateReceiver(
    baseKey,
    receiver,
    remainSigners.map((keypair) => keypair.publicKey)
  );
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (
    await provider.connection.getLatestBlockhash()
  ).blockhash;

  await provider
    .sendAndConfirm(tx, remainSigners, {
      commitment: "finalized",
    })
    .then((txId) => console.log("Receiver configured TxId=", txId))
    .catch((e) =>
      console.error("Failed configuration:" + e.message || JSON.stringify(e))
    );
};

export const claimTokens = async (baseKey: PublicKey) => {
  const tx = await claim(baseKey);
  tx.feePayer = provider.publicKey;
  tx.recentBlockhash = (
    await provider.connection.getLatestBlockhash()
  ).blockhash;

  await provider
    .sendAndConfirm(tx, [], {
      commitment: "finalized",
    })
    .then((txId) => console.log("Claimed TxId=", txId))
    .catch((e) =>
      console.error("Failed claim:" + e.message || JSON.stringify(e))
    );
};
