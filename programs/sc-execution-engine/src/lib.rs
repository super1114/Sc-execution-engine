use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

mod errors;
mod state;
mod utils;

pub use errors::*;
pub use state::*;
pub use utils::*;

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

    // Create vesting pool and specify essential info
    pub fn create_pool(
        ctx: Context<CreatePool>,
        _max_signers: u8,
        amount: u64,
        locking_period: i64,
        min_sign: u8,
    ) -> Result<()> {
        let vest_pool = &mut ctx.accounts.vest_pool;

        require!(locking_period > 0, ErrorCodes::InvalidLockingPeriod);
        require!(amount > 0, ErrorCodes::ZeroVestAmount);

        // Save vest info
        vest_pool.base = ctx.accounts.base.key();
        vest_pool.sender = ctx.accounts.sender.key();
        vest_pool.mint = ctx.accounts.mint.key();
        vest_pool.amount = amount;
        vest_pool.locked_period = locking_period;
        vest_pool.min_sign = min_sign;
        vest_pool.status = VestStatus::Created;

        let mut signers = vec![ctx.accounts.sender.key()];
        // Specify multi signers by remaining_accounts of context
        signers.extend(ctx.remaining_accounts.iter().map(|account| *account.key));

        vest_pool.signers = signers;

        Ok(())
    }

    // Fund tokens to vestpool vault with multi-sign
    pub fn deposit(ctx: Context<DepositEscrow>) -> Result<()> {
        let vest_pool = &mut ctx.accounts.vest_pool;

        require!(
            vest_pool.sender.eq(&ctx.accounts.sender.key()),
            ErrorCodes::InvalidSender
        );
        require!(
            vest_pool.mint.eq(&ctx.accounts.mint.key()),
            ErrorCodes::InvalidMint
        );
        require!(
            vest_pool.status == VestStatus::Created,
            ErrorCodes::InvalidVestingStatus
        );

        let mut signers = vec![ctx.accounts.sender.key()];

        // Specify multi signers by remaining_accounts of context
        for account in ctx.remaining_accounts.iter() {
            if account.is_signer == true && vest_pool.find_signer(*account.key) {
                if !signers.contains(account.key) {
                    signers.push(*account.key);
                }
            }
        }

        // Validate min_sign numbers of signers signed
        require!(
            signers.len() >= vest_pool.min_sign as usize,
            ErrorCodes::InsufficientSigners
        );

        // Escrow funds
        let token_account_info = &mut &ctx.accounts.user_token_account;
        let vault_token_account_info = &mut &ctx.accounts.vault_token_account;
        let token_program = &mut &ctx.accounts.token_program;

        let cpi_accounts = Transfer {
            from: token_account_info.to_account_info().clone(),
            to: vault_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.sender.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            vest_pool.amount,
        )?;

        let now = Clock::get().unwrap().unix_timestamp;
        vest_pool.deposit_time = now;
        vest_pool.status = VestStatus::Deposited;

        Ok(())
    }

    // Create vesting pool and specify essential info
    pub fn nominate_receiver(ctx: Context<NominateReceiver>, receiver: Pubkey) -> Result<()> {
        let vest_pool = &mut ctx.accounts.vest_pool;

        require!(
            vest_pool.sender.eq(&ctx.accounts.sender.key()),
            ErrorCodes::InvalidSender
        );
        require!(
            vest_pool.status == VestStatus::Deposited,
            ErrorCodes::InvalidVestingStatus
        );

        let mut signers = vec![ctx.accounts.sender.key()];

        // Specify multi signers by remaining_accounts of context
        for account in ctx.remaining_accounts.iter() {
            if account.is_signer == true && vest_pool.find_signer(*account.key) {
                if !signers.contains(account.key) {
                    signers.push(*account.key);
                }
            }
        }

        // Validate min_sign numbers of signers signed
        require!(
            signers.len() >= vest_pool.min_sign as usize,
            ErrorCodes::InsufficientSigners
        );

        vest_pool.recipient = receiver;
        vest_pool.status = VestStatus::Nominated;

        Ok(())
    }

    // Fund tokens to vestpool vault with multi-sign
    pub fn claim(ctx: Context<ClaimEscrow>) -> Result<()> {
        let vest_pool = &mut ctx.accounts.vest_pool;

        require!(
            vest_pool.recipient.eq(&ctx.accounts.receiver.key()),
            ErrorCodes::InvalidReceiver
        );
        require!(
            vest_pool.base.eq(&ctx.accounts.base.key()),
            ErrorCodes::InvalidBaseKey
        );
        require!(
            vest_pool.mint.eq(&ctx.accounts.mint.key()),
            ErrorCodes::InvalidMint
        );
        require!(
            vest_pool.status == VestStatus::Nominated,
            ErrorCodes::InvalidVestingStatus
        );

        let now = Clock::get().unwrap().unix_timestamp;
        require!(
            now >= vest_pool.deposit_time + vest_pool.locked_period,
            ErrorCodes::InvalidClaimTime
        );

        // Claim funds
        let token_account_info = &mut &ctx.accounts.user_token_account;
        let vault_token_account_info = &mut &ctx.accounts.vault_token_account;
        let token_program = &mut &ctx.accounts.token_program;

        let base = ctx.accounts.base.key.to_bytes();
        let seeds = &[
            b"VestPool".as_ref(),
            base.as_ref(),
            &[*ctx.bumps.get("vest_pool").unwrap()],
        ];
        let signer = [&seeds[..]];

        let cpi_accounts = Transfer {
            from: vault_token_account_info.to_account_info().clone(),
            to: token_account_info.to_account_info().clone(),
            authority: vest_pool.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(),
                cpi_accounts,
                &signer,
            ),
            vest_pool.amount,
        )?;

        vest_pool.status = VestStatus::Claimed;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(max_owners: u8)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    pub base: Signer<'info>,

    #[account(
        init,
        seeds = [
            b"VestPool".as_ref(),
            base.key().to_bytes().as_ref()
        ],
        bump,
        payer = sender,
        space = VestPool::get_len(max_owners),
    )]
    pub vest_pool: Account<'info, VestPool>,

    pub mint: Box<Account<'info, Mint>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositEscrow<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut)]
    pub vest_pool: Account<'info, VestPool>,

    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = sender,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = vest_pool,
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,

    // system accounts
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct NominateReceiver<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut)]
    pub vest_pool: Account<'info, VestPool>,
}

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    #[account(mut)]
    pub receiver: Signer<'info>,

    /// CHECKED: this account is used only as seed
    pub base: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"VestPool".as_ref(),
            base.key().to_bytes().as_ref()
        ],
        bump,
    )]
    pub vest_pool: Account<'info, VestPool>,

    pub mint: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = receiver,
        associated_token::mint = mint,
        associated_token::authority = receiver,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = vest_pool,
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,

    // system accounts
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
