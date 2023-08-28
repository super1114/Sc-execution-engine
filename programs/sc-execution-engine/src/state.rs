use anchor_lang::prelude::*;
use anchor_lang::solana_program;

#[derive(Clone, Copy, Default, Debug, PartialEq, AnchorDeserialize, AnchorSerialize)]
pub enum VestStatus {
    #[default]
    Created,
    Deposited,
    Nominated,
    Claimed,
}

#[account]
#[derive(Default, Debug, PartialEq)]
pub struct VestPool {
    // Base used to derive.
    pub base: Pubkey,
    // Source wallet address.
    pub sender: Pubkey,
    // Destination wallet address.
    pub recipient: Pubkey,
    // Transfer token mint
    pub mint: Pubkey,
    // Transfer amount.
    pub amount: u64,
    // Time for locking tokens.
    pub locked_period: i64,
    // Fund deposited time
    pub deposit_time: i64,
    // Minimum number of signers for muti-sig.
    pub min_sign: u8,
    pub status: VestStatus,
    // Muti-sign addresses.
    pub signers: Vec<Pubkey>,
}

impl VestPool {
    pub fn get_len(max_signers: u8) -> usize {
        8 // Anchor discriminator
            + 154
            + 4 // 4 = the Vec discriminator
            + std::mem::size_of::<Pubkey>() * (max_signers as usize)
    }

    pub fn find_signer(&self, signer: Pubkey) -> bool {
        match self.signers.iter().position(|a| *a == signer) {
            Some(_) => {
                return true;
            }
            None => {
                return false;
            }
        }
    }
}

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
