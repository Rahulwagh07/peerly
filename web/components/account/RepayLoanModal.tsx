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
import { addTwoBigNumber, calculateInterest, formatAddress, formatDateFromBN, formatStatus, handleCustomError, lamportsToSol } from '@/lib/utils';
import { AccountType, Loan } from '@/lib/types';
import * as anchor from "@coral-xyz/anchor";
 

interface RepayLoanModalProps {
  loan: Loan;
  loanIndex: number;
  onClose: () => void;
  refreshLoans: () => void;
  accountType: AccountType;
}

const RepayLoanModal: React.FC<RepayLoanModalProps> = ({ loan, loanIndex, onClose, refreshLoans , accountType}) => {
  const [isLoading, setIsLoading] = useState(false);
  const provider = useAnchorProvider();
  const { publicKey, connected } = useWallet();
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const interestInLamports = calculateInterest(new anchor.BN(loan.fundDate), new anchor.BN(loan.amount), 0.30);
  const interestAmount = lamportsToSol(interestInLamports).toFixed(9);
  const totalAmount = lamportsToSol(addTwoBigNumber(interestInLamports, new anchor.BN(loan.amount)));

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

      await provider.sendAndConfirm(tx);
      toast.success('Loan repaid successfully');
      refreshLoans();
      onClose();
    } catch (error: any) {
      console.error('Error repaying loan:', error);
      handleCustomError({error, customError:"Failed to Repay loan"});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{accountType === "Lender" ? "Loan Details" : "Repay Loan"}</DialogTitle>
          <DialogDescription>
            {accountType === "Lender" ? `Loan funded by you on ${formatDateFromBN(new anchor.BN(loan.fundDate))}` : "Check the details before repaying the loan."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-1">
            <Label>Borrower Account</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <span className="hidden sm:block">{loan.borrower.toString()}</span>
              <span className="block sm:hidden">{formatAddress(loan.borrower.toString())}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Lender Account</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <span className="hidden sm:block">{loan.borrower.toString()}</span>
              <span className="block sm:hidden">{formatAddress(loan.borrower.toString())}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Loan Amount</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {lamportsToSol(loan.amount)} <b className="text-red-500 ml-1">SOL</b>
            </div>
          </div>
          <div className={`flex flex-col  gap-4 ${formatStatus(loan.status) === "Funded" ? "" : "hidden"}`}>
          <div className="flex flex-col items-start gap-1">
            <Label>Interest</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {interestAmount}<b className="text-red-500 ml-1">SOL</b>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Total Amount</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {totalAmount}<b className="text-red-500 ml-1">SOL</b>
            </div>
          </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>Due Date</Label>
            <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {formatDateFromBN(loan.dueDate)}
            </div>
          </div>
        </div>
        <DialogFooter className='p-0'>
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">Close</Button>
            <Button onClick={repayLoan} 
              className={`ml-2 ${accountType === 'Lender' || formatStatus(loan.status) !== 'Funded' ? 'hidden' : ''}`}
               disabled={isLoading}>
              {isLoading ? "Processing..." : "Repay Loan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepayLoanModal;