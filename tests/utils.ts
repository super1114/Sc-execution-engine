import {
  Connection,
  Finality,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import promiseRetry from "promise-retry";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function airdropLamports(
  connection: Connection,
  ...to: PublicKey[]
) {
  for (const publicKey of to) {
    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
  }
}

export async function awaitTransactionConfirmation(
  signature: string,
  connection: Connection,
  {
    commitment = "confirmed",
    maxSupportedTransactionVersion = 0,
  }: { commitment?: Finality; maxSupportedTransactionVersion?: number } = {}
): Promise<void> {
  await connection.confirmTransaction(signature, commitment);
  const txRes = await promiseRetry(
    async (retry) => {
      const result = await connection.getTransaction(signature, {
        commitment,
        maxSupportedTransactionVersion,
      });
      if (!result) {
        retry(new Error("Error fetching transaction"));
        return;
      }
      return result;
    },
    {
      retries: 5,
      minTimeout: 500,
    }
  );
  if (!txRes) {
    throw new Error("Transaction could not be confirmed");
  }
  return txRes;
}
