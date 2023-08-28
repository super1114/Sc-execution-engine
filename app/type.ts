import { PublicKey } from "@solana/web3.js";

export enum VestStatus {
  Created,
  Deposited,
  Nominated,
  Claimed,
}

export type VestState = {
  base: PublicKey;
  sender: PublicKey;
  recipient: PublicKey;
  mint: PublicKey;
  lockedPeriod: bigint;
  amount: bigint;
  depositTime: bigint;
  minSign: number;
  status: VestStatus;
  signers: PublicKey[];
};
