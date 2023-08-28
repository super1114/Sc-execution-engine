use anchor_lang::prelude::*;

use crate::{state::*, ExecuteTransaction};

// DSL func to run a transaction
pub fn run_transaction(ixs: Vec<TxInstruction>, accounts: &[AccountInfo]) -> Result<()> {
    for ix in ixs.iter() {
        solana_program::program::invoke(&(ix).into(), accounts)?;
    }

    Ok(())
}

// access control for transaction execution
pub fn validate_transaction(_ctx: &Context<ExecuteTransaction>) -> Result<()> {
    // TOOD: nothing to validate yet
    Ok(())
}
