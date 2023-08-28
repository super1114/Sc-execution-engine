import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { createAccount, createMint, mintTo } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { expect } from "chai";

import {
  VestStatus,
  claim,
  createPool,
  deposit,
  nominateReceiver,
  setNetwork,
  vestState,
} from "../app";
import { airdropLamports, awaitTransactionConfirmation, sleep } from "./utils";

describe("sc-execution-engine", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = (provider.wallet as unknown as NodeWallet).payer;

  let mint: PublicKey;
  let senderTokenAccount: PublicKey;

  before(async () => {
    setNetwork(undefined, "http://localhost:8899");

    mint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      9
    );

    senderTokenAccount = await createAccount(
      provider.connection,
      payer,
      mint,
      payer.publicKey
    );

    await mintTo(
      provider.connection,
      payer,
      mint,
      senderTokenAccount,
      payer.publicKey,
      50000
    );
  });

  let baseKey: Keypair = Keypair.generate();
  let signerA: Keypair = Keypair.generate();
  let signerB: Keypair = Keypair.generate();
  let signerC: Keypair = Keypair.generate();
  let signers: PublicKey[] = [
    signerA.publicKey,
    signerB.publicKey,
    signerC.publicKey,
  ];
  before(async () => {
    await airdropLamports(provider.connection, signerC.publicKey);
  });
  it("Create vest pool", async () => {
    const tx = await createPool(baseKey, mint, BigInt(500), 30, 3, signers);
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    const txId = await provider.connection.sendTransaction(tx, [
      payer,
      baseKey,
    ]);
    await awaitTransactionConfirmation(txId, provider.connection, {
      commitment: "finalized",
    });

    const poolData = await vestState(baseKey.publicKey);
    expect(
      poolData.base.equals(baseKey.publicKey),
      "Pool base key not matched"
    );
    expect(
      poolData.sender.equals(payer.publicKey),
      "Pool sender address not matched"
    );
    expect(
      poolData.recipient.equals(PublicKey.default),
      "Pool recipient address specified"
    );
    expect(poolData.mint.equals(mint), "Pool mint address not matched");
    expect(poolData.lockedPeriod == BigInt(30), "Locked period is not 30");
    expect(poolData.amount == BigInt(500), "Amount is not 500");
    expect(poolData.depositTime == BigInt(0), "Deposit time is specified");
    expect(poolData.minSign == 3, "Min sign number is not 3");
    expect(poolData.status == VestStatus.Created, "Pool status not matched");
    expect(poolData.signers.length == 4, "Pool signers length not matched");
    expect(
      poolData.signers[0].equals(payer.publicKey),
      "First pool signer is not payer"
    );
    expect(
      poolData.signers[1].equals(signerA.publicKey),
      "Pool signer A not matched"
    );
  });
  it("Deposit tokens with multi sigs", async () => {
    const tx = await deposit(baseKey.publicKey, signers.slice(0, 2));
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    const txId = await provider.connection.sendTransaction(tx, [
      payer,
      signerA,
      signerB,
    ]);
    await awaitTransactionConfirmation(txId, provider.connection, {
      commitment: "finalized",
    });

    const poolData = await vestState(baseKey.publicKey);
    expect(
      poolData.base.equals(baseKey.publicKey),
      "Pool base key not matched"
    );
    expect(poolData.depositTime != BigInt(0), "Deposit time is not specified");
    expect(poolData.status == VestStatus.Deposited, "Pool status not matched");
  });
  it("Try nominate with insufficient sigers", async () => {
    const tx = await nominateReceiver(
      baseKey.publicKey,
      signerC.publicKey,
      signers.slice(0, 1)
    );
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    try {
      await provider.connection.sendTransaction(tx, [payer, signerA]);
    } catch (e) {
      expect(e.message).to.include(`0x1773`);
    }
  });
  it("Nominate receiver with multi sigs", async () => {
    const tx = await nominateReceiver(
      baseKey.publicKey,
      signerC.publicKey,
      signers.slice(0, 2)
    );
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    const txId = await provider.connection.sendTransaction(tx, [
      payer,
      signerA,
      signerB,
    ]);
    await awaitTransactionConfirmation(txId, provider.connection, {
      commitment: "finalized",
    });

    const poolData = await vestState(baseKey.publicKey);
    expect(
      poolData.base.equals(baseKey.publicKey),
      "Pool base key not matched"
    );
    expect(
      poolData.recipient.equals(signerC.publicKey),
      "Recipient address not specified"
    );
    expect(poolData.status == VestStatus.Nominated, "Pool status not matched");
  });
  it("Try claim before locking time end", async () => {
    const tx = await claim(baseKey.publicKey, signerC);
    tx.feePayer = signerC.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    try {
      await provider.connection.sendTransaction(tx, [signerC]);
    } catch (e) {
      expect(e.message).to.include(`0x1776`);
    }
  });
  it("Claim funds as recipient", async () => {
    // await for locking period since deposit time
    await sleep(10000);
    const tx = await claim(baseKey.publicKey, signerC);
    tx.feePayer = signerC.publicKey;
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;
    const txId = await provider.connection.sendTransaction(tx, [signerC]);
    await awaitTransactionConfirmation(txId, provider.connection, {
      commitment: "finalized",
    });

    const poolData = await vestState(baseKey.publicKey);
    expect(
      poolData.base.equals(baseKey.publicKey),
      "Pool base key not matched"
    );
    expect(poolData.status == VestStatus.Claimed, "Pool status not matched");
  });
});
