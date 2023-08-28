import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Cluster,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import { IDL, ScExecutionEngine } from "../target/types/sc_execution_engine";
import JsonIDL from "../target/idl/sc_execution_engine.json";
import { VestState } from "./type";

export const VEST_STATE_SEED = "VestPool";

export let provider = anchor.getProvider();
let SCExecEngine = anchor.workspace
  .ScExecutionEngine as Program<ScExecutionEngine>;

export const setNetwork = (network: Cluster = "devnet", rpc?: string) => {
  provider = new anchor.AnchorProvider(
    new Connection(rpc ?? clusterApiUrl(network)),
    anchor.Wallet.local(),
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);
  SCExecEngine = new Program<ScExecutionEngine>(
    IDL,
    new PublicKey(JsonIDL.metadata.address),
    provider,
    SCExecEngine.coder
  );
};

export const executeTransaction = async (
  ins: TransactionInstruction[]
): Promise<string> => {
  return await SCExecEngine.methods
    .executeTransaction(ins)
    .accounts({ payer: provider.publicKey })
    .remainingAccounts(
      ins.flatMap((ix) => [
        {
          pubkey: ix.programId,
          isSigner: false,
          isWritable: false,
        },
        ...ix.keys,
      ])
    )
    .rpc();
};

export const createPool = async (
  baseKey: Keypair,
  mint: PublicKey,
  amount: bigint,
  lockingPeriod: number,
  minSign: number,
  remainSigners: PublicKey[]
) => {
  const vestPoolKey = await getVestPoolKey(baseKey.publicKey);

  return SCExecEngine.methods
    .createPool(
      remainSigners.length + 1,
      new anchor.BN(BigInt(amount).toString()),
      new anchor.BN(BigInt(lockingPeriod).toString()),
      minSign
    )
    .accounts({
      sender: provider.publicKey,
      base: baseKey.publicKey,
      vestPool: vestPoolKey,
      mint,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .remainingAccounts(
      remainSigners.map((key) => ({
        isSigner: false,
        isWritable: false,
        pubkey: key,
      }))
    )
    .signers([baseKey])
    .transaction();
};

export const deposit = async (
  baseKey: PublicKey,
  remainSigners: PublicKey[]
) => {
  const vestPoolKey = await getVestPoolKey(baseKey);
  const vestPoolData = await vestState(baseKey);
  if (!vestPoolData) throw "Vest Pool not created";

  const mint = vestPoolData.mint;
  const userTokenAccount = await findAssociatedTokenAddress(
    provider.publicKey,
    mint
  );
  const vaultTokenAccount = await findAssociatedTokenAddress(vestPoolKey, mint);

  return SCExecEngine.methods
    .deposit()
    .accounts({
      sender: provider.publicKey,
      vestPool: vestPoolKey,
      mint,
      userTokenAccount,
      vaultTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .remainingAccounts(
      remainSigners.map((key) => ({
        isSigner: true,
        isWritable: false,
        pubkey: key,
      }))
    )
    .transaction();
};

export const nominateReceiver = async (
  baseKey: PublicKey,
  receiver: PublicKey,
  remainSigners: PublicKey[]
) => {
  const vestPoolKey = await getVestPoolKey(baseKey);

  return SCExecEngine.methods
    .nominateReceiver(receiver)
    .accounts({
      sender: provider.publicKey,
      vestPool: vestPoolKey,
    })
    .remainingAccounts(
      remainSigners.map((key) => ({
        isSigner: true,
        isWritable: false,
        pubkey: key,
      }))
    )
    .transaction();
};

export const claim = async (baseKey: PublicKey, payer?: Keypair) => {
  const vestPoolKey = await getVestPoolKey(baseKey);
  const vestPoolData = await vestState(baseKey);
  if (!vestPoolData) throw "Vest Pool not created";

  const mint = vestPoolData.mint;
  const userTokenAccount = await findAssociatedTokenAddress(
    payer ? payer.publicKey : provider.publicKey,
    mint
  );
  const vaultTokenAccount = await findAssociatedTokenAddress(vestPoolKey, mint);

  return SCExecEngine.methods
    .claim()
    .accounts({
      receiver: payer ? payer.publicKey : provider.publicKey,
      base: baseKey,
      vestPool: vestPoolKey,
      mint,
      userTokenAccount,
      vaultTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([payer])
    .transaction();
};

export const getVestPoolKey = async (baseKey: PublicKey) => {
  const programId = SCExecEngine.programId;
  const [pubkey] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode(VEST_STATE_SEED), baseKey.toBuffer()],
    programId
  );

  return pubkey;
};

export const vestState = async (baseKey: PublicKey) => {
  const vestPoolKey = await getVestPoolKey(baseKey);
  try {
    const poolInfo = await provider.connection.getAccountInfo(vestPoolKey);
    const vestPool = SCExecEngine.coder.accounts.decode(
      "VestPool",
      poolInfo?.data
    ) as VestState;
    return vestPool;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return await getAssociatedTokenAddress(
    tokenMintAddress, // mint
    walletAddress, // token account authority
    true
  );
}
