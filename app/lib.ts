import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Cluster,
  Connection,
  PublicKey,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";

import { IDL, ScExecutionEngine } from "../target/types/sc_execution_engine";
import JsonIDL from "../target/idl/sc_execution_engine.json";

export let provider = anchor.getProvider();
let SCExecEngine = anchor.workspace
  .ScExecutionEngine as Program<ScExecutionEngine>;

export const setNetwork = (network: Cluster = "devnet") => {
  provider = new anchor.AnchorProvider(
    new Connection(clusterApiUrl(network)),
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
