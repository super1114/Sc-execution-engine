use anchor_lang::prelude::*;

// Program errors
#[error_code]
pub enum ErrorCode {
    #[msg("Provided account is not signer")]
    InvalidSigner,
}
