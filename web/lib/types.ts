import { PublicKey } from "@solana/web3.js";
 
export interface Loan {
  address: PublicKey;
  borrower: PublicKey;
  lender: PublicKey;
  amount: number;
  mortgageCid: string;
  dueDate: number;
  status: 'Requested' | 'Funded' | 'Closed' | 'Defaulted';
  requestDate: number;
  fundDate: number | null;
  repayDate: number | null;
}

export type AccountType = 'None' | 'Lender' | 'Borrower';