"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Table, TableRow, Button, TableBody, TableCell, 
  TableHeader, Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} 
  from '@peerly/ui-components';
import { useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { formatDateFromBN, lamportsToSol, formatStatus } from '@/lib/utils';
import RepayLoanModal from './RepayLoanModal';
import {AccountType, Loan } from '@/lib/types';

const AccountTransactions: React.FC = () => {
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>('None');

  const programId = useMemo(() => getLendingProgramId(cluster.network as Cluster), [cluster]);
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };
  
  const params = useParams();
  const address = useMemo(() => {
    if (!params.address) return;
    try {
      return new PublicKey(params.address as string);
    } catch (e) {
      console.log(`Invalid public key`, e);
    }
  }, [params]);

  useEffect(() => {
    if (!address) return;

    const loadAccountDetails = async () => {
      setError(null);
      setLoading(true);
      try {
        const [lendingPoolPDA] = await PublicKey.findProgramAddress(
          [Buffer.from('lending_pool')],
          programId
        );

        const accountDetails = await program.methods
          .getAccountDetails(address)
          .accounts({
            lendingPool: lendingPoolPDA,
          }).view();

        console.log("accountDetails", accountDetails);

        const accountType = accountDetails.accountType.borrower ? 'Borrower' : 'Lender';
        setAccountType(accountType);
        console.log("accountType", accountType);

        const processedLoans = accountDetails.loans.map((loan: any) => ({
          ...loan,
        }));

        setLoans(processedLoans);
        console.log("processedLoans", processedLoans);

      } catch (error) {
        console.error('Error fetching account details:', error);
        setError("Error in getting account details");
        toast.error("Error in getting account details");
      } finally {
        setLoading(false);
      }
    };

    loadAccountDetails();
  }, [address]);

  if (!address) {
    return <div>Error loading account</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='container mx-auto p-4 -mt-12'>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardTitle>Account Type: {accountType}</CardTitle>
          <CardDescription>See Your Loans details here...</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>MortgageCID</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell>{lamportsToSol(loan.amount)} SOL</TableCell>
                  <TableCell>{loan.mortgageCid}</TableCell>
                  <TableCell>{formatDateFromBN(loan.dueDate)}</TableCell>
                  <TableCell>{formatStatus(loan.status)}</TableCell>
                  <TableCell>
                        <Button onClick={() => handleViewDetails(loan)}>View Details</Button>
                      </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedLoan && (
              <RepayLoanModal
                loan={selectedLoan}
                onClose={handleCloseModal}
              />
            )} 
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTransactions;
