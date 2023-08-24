use anchor_lang::prelude::*;

mod errors;
mod state;

pub use errors::*;
pub use state::*;

declare_id!("BwNtagU972dNodjj8nqvnvr5dKue8Yh867YWr7B3zTY9");

#[program]
pub mod sc_execution_engine {
    use super::*;

    #[access_control(validate_transaction(&ctx))]
    pub fn execute_transaction(
        ctx: Context<ExecuteTransaction>,
        instructions: Vec<TxInstruction>,
    ) -> Result<()> {
        // TODO: validate instructions and provided remainging accounts
        run_transaction(instructions, ctx.remaining_accounts)?;
        // TODO: may need to update some program states
        Ok(())
    }
}

// DSL func to run a transaction
fn run_transaction(ixs: Vec<TxInstruction>, accounts: &[AccountInfo]) -> Result<()> {
    for ix in ixs.iter() {
        solana_program::program::invoke(&(ix).into(), accounts)?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    pub payer: Signer<'info>,
}

// access control for transaction execution
fn validate_transaction(_ctx: &Context<ExecuteTransaction>) -> Result<()> {
    // TOOD: nothing to validate yet
    Ok(())
}
