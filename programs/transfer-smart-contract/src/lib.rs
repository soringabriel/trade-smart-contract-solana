use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[account]
pub struct Wallet {
    pub usd: f64,
    pub eur: f64
}

#[program]
pub mod transfer_smart_contract {
    use super::*;

    static EXCHANGE_USD_FOR_EUR:f64 = 0.9;
    static EXCHANGE_EUR_FOR_USD:f64 = 1.1;

    static COMISSION_USD:f64 = 0.1;
    static COMISSION_EUR:f64 = 0.05;

    pub fn create_wallet(ctx: Context<CreateWallet>) -> Result<()> {
        let wallet: &mut Account<Wallet> = &mut ctx.accounts.wallet;

        wallet.usd = 0.0f64;
        wallet.eur = 0.0f64;

        Ok(())
    }

    pub fn buy_usd(ctx: Context<Trade>, quantity: f64) -> Result<()> {
        let wallet: &mut Account<Wallet> = &mut ctx.accounts.wallet;
        wallet.usd += quantity;
        Ok(())
    }

    pub fn buy_eur(ctx: Context<Trade>, quantity: f64) -> Result<()> {
        let wallet: &mut Account<Wallet> = &mut ctx.accounts.wallet;
        wallet.eur += quantity;
        Ok(())
    }

    pub fn trade_eur_for_usd(ctx: Context<Trade>, quantity: f64) -> Result<()> {
        let wallet: &mut Account<Wallet> = &mut ctx.accounts.wallet;
        wallet.eur -= quantity;
        wallet.usd += quantity * EXCHANGE_EUR_FOR_USD;
        Ok(())
    }

    pub fn trade_usd_for_eur(ctx: Context<Trade>, quantity: f64) -> Result<()> {
        let wallet: &mut Account<Wallet> = &mut ctx.accounts.wallet;
        wallet.usd -= quantity;
        wallet.eur += quantity * EXCHANGE_USD_FOR_EUR;
        Ok(())
    }

    pub fn transfer_usd(ctx: Context<Transfer>, quantity: f64) -> Result<()> {
        let program: &mut Account<Wallet> = &mut ctx.program_id;
        let from: &mut Account<Wallet> = &mut ctx.accounts.from;
        let to: &mut Account<Wallet> = &mut ctx.accounts.to;

        let comission = COMISSION_USD * quantity;
        let final_quantity = quantity + comission;

        if from.usd < final_quantity {
            return err!(Errors::InsufficientUsd);
        }

        from.usd -= final_quantity;
        to.usd += quantity;
        program.usd += comission;

        Ok(())
    }

    pub fn transfer_eur(ctx: Context<Transfer>, quantity: f64) -> Result<()> {
        let program: &mut Account<Wallet> = &mut ctx.program_id;
        let from: &mut Account<Wallet> = &mut ctx.accounts.from;
        let to: &mut Account<Wallet> = &mut ctx.accounts.to;

        let comission = COMISSION_EUR * quantity;
        let final_quantity = quantity + comission;

        if from.usd < final_quantity {
            return err!(Errors::InsufficientEur);
        }

        from.eur -= final_quantity;
        to.eur += quantity;
        program.eur += comission;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateWallet<'info> {
    #[account(init, payer = user, space = 9000 )]
    pub wallet: Account<'info, Wallet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(mut)]
    pub wallet: Account<'info, Wallet>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Account<'info, Wallet>,
    #[account(mut)]
    pub to: Account<'info, Wallet>,
}

#[error_code]
pub enum Errors {
    #[msg("You don't have sufficient USD to transfer + pay the comission")]
    InsufficientUsd,

    #[msg("You don't have sufficient EUR to transfer + pay the comission")]
    InsufficientEur,
}