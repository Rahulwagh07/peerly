#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;

declare_id!("BqopUsa7CqQHnRWRenvHxLH4ne8xLpPTrtHtSZxo4JJj");

#[program]
pub mod peer_to_peer_lending {
    use super::*;

    pub fn request_loan(
        ctx: Context<RequestLoan>,
        amount: u64,
        mortgage_cid: String,
        due_date: i64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let clock = Clock::get()?;

        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(due_date > clock.unix_timestamp, ErrorCode::InvalidDueDate);
        require!(user_account.loans.len() < 3, ErrorCode::MaxLoansReached);

        let loan = Loan {
            borrower: *ctx.accounts.borrower.key,
            lender: Pubkey::default(),
            amount,
            mortgage_cid,
            due_date,
            status: LoanStatus::Requested,
            request_date: clock.unix_timestamp,
            fund_date: None,
            repay_date: None,
            interest_accrued: None,
        };

        user_account.loans.push(loan);
        user_account.account_type = AccountType::Borrower;

        Ok(())
    }

    pub fn fund_loan(ctx: Context<FundLoan>, loan_index: u8) -> Result<()> {
        let borrower_account = &mut ctx.accounts.borrower_account;
        let lender_account = &mut ctx.accounts.lender_account;
        let clock = Clock::get()?;

        require!(loan_index < borrower_account.loans.len() as u8, ErrorCode::InvalidLoanIndex);
        let loan = &mut borrower_account.loans[loan_index as usize];

        require!(loan.status == LoanStatus::Requested, ErrorCode::LoanNotFundable);
        require!(lender_account.account_type != AccountType::Borrower, ErrorCode::BorrowerCannotLend);

        loan.lender = *ctx.accounts.lender.key;
        loan.status = LoanStatus::Funded;
        loan.fund_date = Some(clock.unix_timestamp);

        lender_account.account_type = AccountType::Lender;

        let ix = system_instruction::transfer(
            &ctx.accounts.lender.key,
            &ctx.accounts.borrower.key,
            loan.amount,
        );

        invoke(
            &ix,
            &[
                ctx.accounts.lender.to_account_info(),
                ctx.accounts.borrower.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn repay_loan(ctx: Context<RepayLoan>, loan_index: u8) -> Result<()> {
        let borrower_account = &mut ctx.accounts.borrower_account;
        let clock = Clock::get()?;

        require!(loan_index < borrower_account.loans.len() as u8, ErrorCode::InvalidLoanIndex);
        let loan = &mut borrower_account.loans[loan_index as usize];

        require!(loan.status == LoanStatus::Funded, ErrorCode::LoanNotRepayable);
        require!(loan.borrower == *ctx.accounts.borrower.key, ErrorCode::UnauthorizedBorrower);

        let time_elapsed = clock.unix_timestamp - loan.fund_date.unwrap();
        let time_in_years = time_elapsed as f64 / (365.0 * 24.0 * 60.0 * 60.0);  
        let interest_rate = 0.30;  
        let interest = (loan.amount as f64 * interest_rate * time_in_years) as u64;
        let total_repayment = loan.amount + interest;

        let ix = system_instruction::transfer(
            &ctx.accounts.borrower.key,
            &ctx.accounts.lender.key,
            total_repayment,
        );

        invoke(
            &ix,
            &[
                ctx.accounts.borrower.to_account_info(),
                ctx.accounts.lender.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        loan.status = LoanStatus::Closed;
        loan.repay_date = Some(clock.unix_timestamp);
        loan.interest_accrued = Some(interest);

        Ok(())
    }

    pub fn get_account_details(ctx: Context<GetAccountDetails>) -> Result<UserAccount> {
        Ok((*ctx.accounts.user_account).clone())
    }
}

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
  pub enum AccountType {
      None,
      Lender,
      Borrower,
  }

  impl Default for AccountType {
      fn default() -> Self {
          AccountType::None
      }
  }

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
  pub enum LoanStatus {
      Requested,
      Funded,
      Closed,
      Defaulted,
  }

  impl Default for LoanStatus {
      fn default() -> Self {
          LoanStatus::Requested
      }
  }

  #[account]
  #[derive(Default)]
  pub struct UserAccount {
      pub account_type: AccountType,
      pub loans: Vec<Loan>,
  }

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
  pub struct Loan {
      pub borrower: Pubkey,
      pub lender: Pubkey,
      pub amount: u64,
      pub mortgage_cid: String,
      pub due_date: i64,
      pub status: LoanStatus,
      pub request_date: i64,
      pub fund_date: Option<i64>,
      pub repay_date: Option<i64>,
      pub interest_accrued: Option<u64>,
  }

  #[derive(Accounts)]
  #[instruction(amount: u64, mortgage_cid: String, due_date: i64)]
  pub struct RequestLoan<'info> {
      #[account(mut)]
      pub borrower: Signer<'info>,
      #[account(
          init_if_needed,
          payer = borrower,
          space = 8 + 1 + 4 + (32 + 32 + 8 + 200 + 8 + 1 + 8 + 9 + 9 + 9) * 3,
          seeds = [b"rahul", borrower.key().as_ref()],
          bump
      )]
      pub user_account: Account<'info, UserAccount>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  #[instruction(loan_index: u8)]
  pub struct FundLoan<'info> {
      #[account(mut)]
      pub lender: Signer<'info>,
      /// CHECK: This account's address is checked in the instruction handler
      #[account(mut)]
      pub borrower: AccountInfo<'info>,
      #[account(
          mut,
          seeds = [b"rahul", borrower.key().as_ref()],
          bump
      )]
      pub borrower_account: Account<'info, UserAccount>,
      #[account(
          init_if_needed,
          payer = lender,
          space = 8 + 1 + 4 + (32 + 32 + 8 + 200 + 8 + 1 + 8 + 9 + 9 + 9) * 3,
          seeds = [b"rahul", lender.key().as_ref()],
          bump
      )]
      pub lender_account: Account<'info, UserAccount>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  #[instruction(loan_index: u8)]
  pub struct RepayLoan<'info> {
      #[account(mut)]
      pub borrower: Signer<'info>,
      /// CHECK: This account's address is checked in the instruction handler
      #[account(mut)]
      pub lender: AccountInfo<'info>,
      #[account(
          mut,
          seeds = [b"rahul", borrower.key().as_ref()],
          bump
      )]
      pub borrower_account: Account<'info, UserAccount>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  pub struct GetAccountDetails<'info> {
      pub user: Signer<'info>,
      #[account(
          seeds = [b"rahul", user.key().as_ref()],
          bump
      )]
      pub user_account: Account<'info, UserAccount>,
  }

  #[error_code]
  pub enum ErrorCode {
      #[msg("Invalid loan amount")]
      InvalidAmount,
      #[msg("Invalid due date")]
      InvalidDueDate,
      #[msg("Lender cannot borrow")]
      LenderCannotBorrow,
      #[msg("Borrower cannot lend")]
      BorrowerCannotLend,
      #[msg("Loan is not in a fundable state")]
      LoanNotFundable,
      #[msg("Loan is not in a repayable state")]
      LoanNotRepayable,
      #[msg("Unauthorized borrower")]
      UnauthorizedBorrower,
      #[msg("Maximum number of loans reached")]
      MaxLoansReached,
      #[msg("Invalid loan index")]
      InvalidLoanIndex,
  }
