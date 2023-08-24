import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ScExecutionEngine } from "../target/types/sc_execution_engine";

describe("sc-execution-engine", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .ScExecutionEngine as Program<ScExecutionEngine>;

  it("Is initialized!", async () => {
    // Add your test here.
  });
});
