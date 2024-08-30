"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLendingProgram } from '@peerly/anchor';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import * as anchor from '@project-serum/anchor';
import { lamportsToSol, formatStatus, formatDateFromBN } from '../../lib/utils';
import FundLoanModal from './FundLoanModal';

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Card, CardContent, CardDescription,
  CardHeader, CardTitle, Button,
} from '@peerly/ui-components';

import NotConnected from '../common/NotConnected';
import { Loan } from '@/lib/types';
import Loader from '../common/Loader';
import CustomError from '../common/CustomError';

export const ShowAllLoansDetails = () => {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number | null>(null);

  const handleViewDetails = (loan: Loan, index: number) => {
    setSelectedLoan(loan);
    setSelectedLoanIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
    setSelectedLoanIndex(null);
  };

  const fetchAllLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await program.account.userAccount.all();
      
      let allLoans: Loan[] = [];

      accounts.forEach((account) => {
        const userAccount = account.account;
        const loans = userAccount.loans.map((loan: any, loanIndex: number) => ({
          address: account.publicKey.toBase58(),
          borrower: loan.borrower.toBase58(),
          lender: loan.lender.toBase58(),
          amount: lamportsToSol(loan.amount),
          mortgageCid: loan.mortgageCid,
          dueDate: formatDateFromBN(new anchor.BN(loan.dueDate)),
          status: formatStatus(loan.status),
          requestDate: formatDateFromBN(new anchor.BN(loan.requestDate)),
          fundDate: loan.fundDate ? formatDateFromBN(loan.fundDate) : null,
          repayDate: loan.repayDate ? formatDateFromBN(loan.repayDate) : null,
          index: loanIndex,
        }));
        //@ts-ignore
        allLoans = allLoans.concat(loans);
      });

      setLoans(allLoans);
    } catch (error: any) {
      console.error('Failed to fetch loans:', error);
      setError(`You Don't have inup balance, Airdrop some devent SOL in your account.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (program && publicKey) {
      fetchAllLoans();
    }
  }, [publicKey]);

  if (!publicKey) {
    return <NotConnected />;
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <CustomError error={error} address={publicKey} />;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Explore Loans</CardTitle>
          <CardDescription>View all available loan requests on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount (SOL)</TableHead>
                <TableHead>Mortgage CID</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell>{loan.borrower.toString()}</TableCell>
                  <TableCell>{loan.amount}</TableCell>
                  <TableCell>{loan.mortgageCid}</TableCell>
                  <TableCell>{loan.dueDate}</TableCell>
                  <TableCell>{loan.status}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewDetails(loan, index)}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedLoan && selectedLoanIndex !== null && (
            <FundLoanModal
              loan={selectedLoan}
              loanIndex={selectedLoan.index}
              onClose={handleCloseModal}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};