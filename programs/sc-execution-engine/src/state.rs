use anchor_lang::prelude::*;
use anchor_lang::solana_program;

// Instruction.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default, PartialEq)]
pub struct TxInstruction {
    pub program_id: Pubkey,
    pub keys: Vec<TxAccountMeta>,
    pub data: Vec<u8>,
}

impl From<&TxInstruction> for solana_program::instruction::Instruction {
    fn from(tx: &TxInstruction) -> solana_program::instruction::Instruction {
        solana_program::instruction::Instruction {
            program_id: tx.program_id,
            accounts: tx.keys.clone().into_iter().map(Into::into).collect(),
            data: tx.data.clone(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, PartialEq, Copy, Clone)]
pub struct TxAccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

impl From<TxAccountMeta> for solana_program::instruction::AccountMeta {
    fn from(
        TxAccountMeta {
            pubkey,
            is_signer,
            is_writable,
        }: TxAccountMeta,
    ) -> solana_program::instruction::AccountMeta {
        solana_program::instruction::AccountMeta {
            pubkey,
            is_signer,
            is_writable,
        }
    }
}
