"use client"

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, Button, Label
} from '@peerly/ui-components';
 
import { useAnchorProvider } from '../solana/solana-provider';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { Loan } from '@/lib/types';
 

interface FundLoanModalProps {
  loan: Loan;
  loanIndex: number;
  onClose: () => void;
}

const FundLoanModal: React.FC<FundLoanModalProps> =  ({ loan, loanIndex, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useAnchorProvider();
  const { publicKey, connected } = useWallet();
  const { cluster } = useCluster();
  const program = getLendingProgram(provider);
  const programId = getLendingProgramId(cluster.network as Cluster);

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

      const [borrowerAccountPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('rahul'), new PublicKey(loan.borrower).toBuffer()],
        programId
      );

      const [lenderAccountPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('rahul'), publicKey.toBuffer()],
        programId
      );

      const tx = await program.methods.fundLoan(loanIndex)
        .accounts({
          lender: publicKey,
          borrower: new PublicKey(loan.borrower),
          borrowerAccount: borrowerAccountPDA,
          lenderAccount: lenderAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();

      console.log("Transaction signature:", tx);
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
              {loan.borrower.toString()}
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