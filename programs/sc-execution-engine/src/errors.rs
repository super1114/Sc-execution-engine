use anchor_lang::prelude::*;

// Program errors
#[error_code]
pub enum ErrorCodes {
    #[msg("Provided sender address not matched")]
    InvalidSender,
    #[msg("Provided amount is zero")]
    ZeroVestAmount,
    #[msg("Locking period should be positive value")]
    InvalidLockingPeriod,
    #[msg("Multi signed signatures count insufficient")]
    InsufficientSigners,
    #[msg("Provided mint address not matched")]
    InvalidMint,
    #[msg("Provided recipient address not matched")]
    InvalidReceiver,
    #[msg("Not able to claim for locking period")]
    InvalidClaimTime,
    #[msg("Vest pool status not matched")]
    InvalidVestingStatus,
    #[msg("Provided base key not matched")]
    InvalidBaseKey,
}
