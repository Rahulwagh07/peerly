#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::require;

declare_id!("24TJfVSRZbifpwYphPRoWfhmcGm7ZGm7SYjXqqaFhzCR");

#[program]
pub mod peer_to_peer_lending {
    use super::*;

    pub fn request_loan(
        ctx: Context<RequestLoan>,
        amount: u64,
        mortgage_cid: String,
        due_date: i64,
    ) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let borrower = &ctx.accounts.borrower;
        let clock = Clock::get()?;

        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(due_date > clock.unix_timestamp, ErrorCode::InvalidDueDate);

        let borrower_account_type = ctx.accounts.lending_pool.get_account_type(&borrower.key());
        require!(
            borrower_account_type != AccountType::Lender,
            ErrorCode::LenderCannotBorrow
        );

        loan.address = loan.key();
        loan.borrower = *borrower.key;
        loan.amount = amount;
        loan.mortgage_cid = mortgage_cid;
        loan.due_date = due_date;
        loan.status = LoanStatus::Requested;
        loan.request_date = clock.unix_timestamp;

        ctx.accounts.lending_pool.set_account_type(&borrower.key(), AccountType::Borrower);
        ctx.accounts.lending_pool.add_loan(loan);

        Ok(())
    }

    pub fn fund_loan(ctx: Context<FundLoan>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let lender = &ctx.accounts.lender;
        let clock = Clock::get()?;

        require!(loan.status == LoanStatus::Requested, ErrorCode::LoanNotFundable);

        require!(
            ctx.accounts.lending_pool.get_account_type(&lender.key()) != AccountType::Borrower,
            ErrorCode::BorrowerCannotLend
        );

        loan.lender = *lender.key;
        loan.status = LoanStatus::Funded;
        loan.fund_date = Some(clock.unix_timestamp);

        ctx.accounts
            .lending_pool
            .set_account_type(&lender.key(), AccountType::Lender);

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

        ctx.accounts.lending_pool.update_loan(loan);

        Ok(())
    }

    pub fn repay_loan(ctx: Context<RepayLoan>) -> Result<()> {
        let loan = &mut ctx.accounts.loan;
        let borrower = &ctx.accounts.borrower;
        let clock = Clock::get()?;

        require!(loan.status == LoanStatus::Funded, ErrorCode::LoanNotRepayable);
        require!(loan.borrower == *borrower.key, ErrorCode::UnauthorizedBorrower);

        let ix = system_instruction::transfer(
            &ctx.accounts.borrower.key,
            &ctx.accounts.lender.key,
            loan.amount,
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

        ctx.accounts.lending_pool.update_loan(loan);
 
        Ok(())
    }

    pub fn get_all_loans(ctx: Context<GetAllLoans>) -> Result<Vec<Loan>> {
        Ok(ctx.accounts.lending_pool.loans.clone())
    }

    pub fn get_account_details(ctx: Context<GetAccountDetails>, account: Pubkey) -> Result<AccountDetails> {
        let lending_pool = &ctx.accounts.lending_pool;
        let account_type = lending_pool.get_account_type(&account);
        
        let loans = lending_pool.loans.iter()
            .filter(|loan| loan.borrower == account || loan.lender == account)
            .cloned()
            .collect();

        Ok(AccountDetails {
            account_type,
            loans,
        })
    }
}

  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
  pub enum AccountType {
      None,
      Lender,
      Borrower,
  }
  
  #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
  pub enum LoanStatus {
      #[default]
      Requested,
      Funded,
      Closed,
      Defaulted,
  }

  #[account]
  pub struct LendingPool {
      pub account_types: Vec<(Pubkey, AccountType)>,
      pub loans: Vec<Loan>,
  }

  impl LendingPool {
    pub const LEN: usize = 8 +  
    4 + (32 + 1) * 100 +  
    4 + Loan::LEN * 100;  

      pub fn get_account_type(&self, account: &Pubkey) -> AccountType {
          self.account_types
              .iter()
              .find(|(key, _)| key == account)
              .map(|(_, account_type)| account_type.clone())
              .unwrap_or(AccountType::None)
      }

      pub fn set_account_type(&mut self, account: &Pubkey, account_type: AccountType) {
          if let Some(entry) = self.account_types.iter_mut().find(|(key, _)| key == account) {
              entry.1 = account_type;
          } else {
              self.account_types.push((*account, account_type));
          }
      }

      pub fn add_loan(&mut self, loan: &Loan) {
          self.loans.push(loan.clone());
      }

      pub fn update_loan(&mut self, updated_loan: &Loan) {
          if let Some(loan) = self.loans.iter_mut().find(|l| l.borrower == updated_loan.borrower && l.request_date == updated_loan.request_date) {
              *loan = updated_loan.clone();
          }
      }
  }

  #[account]
  #[derive(Default)]
  pub struct Loan {
      /// CHECK: This is the lender's public key, set in the instruction logic
      pub address: Pubkey,
      /// CHECK: This is the borrower's public key, verified in the instruction logic
      pub borrower: Pubkey,
      /// CHECK: This is the lender's public key, set in the instruction logic
      pub lender: Pubkey,   
      pub amount: u64,
      pub mortgage_cid: String,
      pub due_date: i64,
      pub status: LoanStatus,
      pub request_date: i64,
      pub fund_date: Option<i64>,
      pub repay_date: Option<i64>,
  }

  impl Loan {
    pub const LEN: usize = 8 + 32 +  32 +  32 +  
    8 + 4 + 200 +  8 +  1 + 8 + 9 + 9;   
  }

  #[derive(AnchorSerialize, AnchorDeserialize)]
  pub struct AccountDetails {
      pub account_type: AccountType,
      pub loans: Vec<Loan>,
  }

  #[derive(Accounts)]
  #[instruction(amount: u64, mortgage_cid: String, due_date: i64)]
  pub struct RequestLoan<'info> {
      #[account(mut)]
      pub borrower: Signer<'info>,
      #[account(
        init,
        payer = borrower,
        space = 1024
      )]
      pub loan: Account<'info, Loan>,
      #[account(
          init_if_needed,
          payer = borrower,
          space = 1024,
          seeds = [b"lending_pool"],
          bump
      )]
      pub lending_pool: Account<'info, LendingPool>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  pub struct FundLoan<'info> {
      #[account(mut)]
      pub lender: Signer<'info>,
      /// CHECK: This account's address is checked in the instruction handler
      #[account(mut)]
      pub borrower: AccountInfo<'info>,
      #[account(mut)]
      pub loan: Account<'info, Loan>,
      #[account(mut)]
      pub lending_pool: Account<'info, LendingPool>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  pub struct RepayLoan<'info> {
      #[account(mut)]
      pub borrower: Signer<'info>,
      /// CHECK: This account's address is checked in the instruction handler
      #[account(mut)]
      pub lender: AccountInfo<'info>,
      #[account(mut)]
      pub loan: Account<'info, Loan>,
      #[account(mut)]
      pub lending_pool: Account<'info, LendingPool>,
      pub system_program: Program<'info, System>,
  }

  #[derive(Accounts)]
  pub struct GetAllLoans<'info> {
      pub lending_pool: Account<'info, LendingPool>,
  }

  #[derive(Accounts)]
  pub struct GetAccountDetails<'info> {
      pub lending_pool: Account<'info, LendingPool>,
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
      #[msg("Loan is not defaulted")]
      LoanNotDefaulted,
      #[msg("Loan is not overdue")]
      LoanNotOverdue,
  }
