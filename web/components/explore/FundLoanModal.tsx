"use client"
import React, { useState, useEffect } from 'react';
import {
  Button, Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, Label,
} from '@peerly/ui-components';

import { useAnchorProvider } from '../solana/solana-provider';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import toast from 'react-hot-toast';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface Loan {
  borrower: string;
  lender: string;
  amount: number;
  mortgageCid: string;
  dueDate: string;
  status: 'Requested' | 'Funded' | 'Closed' | 'Defaulted';
  requestDate: string;
  fundDate: string | null;
  repayDate: string | null;
}

interface FundLoanModalProps {
  loan: Loan;
  onClose: () => void;
}

const FundLoanModal: React.FC<FundLoanModalProps> = ({ loan, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useAnchorProvider();
  const { publicKey, connected } = useWallet();
  const [program, setProgram] = useState<anchor.Program | null>(null);

  useEffect(() => {
    if (provider) {
      try {
        const prog = getLendingProgram(provider);
        setProgram(prog);
      } catch (error) {
        console.error("Error initializing program:", error);
        toast.error("Failed to initialize the program. Please check your connection.");
      }
    }
  }, []);

  const fundLoan = async () => {
    setIsLoading(true);

    try {
      if (!connected || !publicKey) {
        throw new Error('Wallet not connected.');
      }

      if (!provider) {
        throw new Error('Provider not available.');
      }

      if (!program) {
        throw new Error('Program not initialized.');
      }

      const lendingProgramId = getLendingProgramId(provider.cluster);
      const [lendingPoolPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('lending_pool')],
        lendingProgramId
      );

      const [loanPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('loan'), new PublicKey(loan.borrower).toBuffer()],
        lendingProgramId
      );

      // Fetch the lender's token account
      const lenderTokenAccount = await provider.connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      if (lenderTokenAccount.value.length === 0) {
        throw new Error('Lender token account not found');
      }
      const lenderTokenAccountPubkey = lenderTokenAccount.value[0].pubkey;

      // Fetch the borrower's token account
      const borrowerTokenAccount = await provider.connection.getTokenAccountsByOwner(new PublicKey(loan.borrower), { programId: TOKEN_PROGRAM_ID });
      if (borrowerTokenAccount.value.length === 0) {
        throw new Error('Borrower token account not found');
      }
      const borrowerTokenAccountPubkey = borrowerTokenAccount.value[0].pubkey;

      const tx = await program.methods.fundLoan()
        .accounts({
          lender: publicKey,
          loan: loanPDA,
          lendingPool: lendingPoolPDA,
          lenderTokenAccount: lenderTokenAccountPubkey,
          borrowerTokenAccount: borrowerTokenAccountPubkey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction();

      const signature = await provider.sendAndConfirm(tx);
      console.log("Transaction signature:", signature);

      toast.success('Loan funded successfully');
      onClose();
    } catch (error: any) {
      console.error('Error funding loan:', error);
      toast.error(`Failed to fund loan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loan Details</DialogTitle>
          <DialogDescription>
            Check the details before giving the loan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-1">
            <Label>Borrower Account</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loan.borrower}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Amount</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loan.amount} <b className="text-red-500 ml-1">SOL</b>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Due Date</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loan.dueDate}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Mortgage</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loan.mortgageCid}
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end p-4">
            <Button onClick={onClose} variant="outline">Close</Button>
            <Button onClick={fundLoan} className="ml-2" disabled={isLoading}>
              {isLoading ? "Funding..." : "Give Loan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundLoanModal;
