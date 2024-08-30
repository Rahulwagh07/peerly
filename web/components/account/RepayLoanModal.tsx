import React, { useState, useMemo } from 'react';
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
import { getLendingProgram } from '@peerly/anchor';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { formatDateFromBN, lamportsToSol } from '@/lib/utils';
import { Loan } from '@/lib/types';
import * as anchor from "@coral-xyz/anchor";

interface RepayLoanModalProps {
  loan: Loan;
  loanIndex: number;
  onClose: () => void;
  refreshLoans: () => void;
}

const RepayLoanModal: React.FC<RepayLoanModalProps> = ({ loan, loanIndex, onClose, refreshLoans }) => {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useAnchorProvider();
  const { publicKey, connected } = useWallet();
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const repayLoan = async () => {
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
        [Buffer.from('rahul'), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods.repayLoan(loanIndex)
        .accounts({
          borrower: publicKey,
          lender: new PublicKey(loan.lender),
          borrowerAccount: borrowerAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .transaction();

      const signature = await provider.sendAndConfirm(tx);
      console.log("Transaction signature:", signature);

      toast.success('Loan repaid successfully');
      refreshLoans();
      onClose();
    } catch (error: any) {
      console.error('Error repaying loan:', error);
      toast.error(`Failed to repay loan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repay Loan</DialogTitle>
          <DialogDescription>
            Check the details before repaying the loan.
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
            <Label>Lender Account</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loan.lender.toString()}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Amount</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {lamportsToSol(loan.amount)} <b className="text-red-500 ml-1">SOL</b>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Due Date</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {formatDateFromBN(loan.dueDate)}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Loan Index</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {loanIndex}
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-end p-4">
            <Button onClick={onClose} variant="outline">Close</Button>
            <Button onClick={repayLoan} className="ml-2" disabled={isLoading}>
              {isLoading ? "Processing..." : "Repay Loan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepayLoanModal;