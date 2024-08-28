'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet} from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider} from '../solana/solana-provider';
import * as anchor from '@project-serum/anchor';
import { lamportsToSol, formatStatus, formatDateFromBN} from '../../lib/utils'
import FundLoanModal from './FundLoanModal'

import {
  Table, TableBody, TableCell,TableHead,
  TableHeader,TableRow, Card, CardContent, CardDescription,
  CardHeader, CardTitle,Button, 
} from '@peerly/ui-components';

import NotConnected from '../common/NotConnected';
import { Loan } from '@/lib/types';

export const  ShowAllLoansDetails = () => {
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const programId = useMemo(() => getLendingProgramId(cluster.network as Cluster), [cluster]);
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };


  const fetchAllLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lendingPoolPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('lending_pool')],
        programId
      );

      const fetchedLoans = await program.methods
        .getAllLoans()
        .accounts({
          lendingPool: lendingPoolPDA,
        })
        .view();

      const loans: Loan[] = fetchedLoans.map((loan: any) => ({
        address: loan.address.toBase58(),
        borrower: loan.borrower.toBase58(),
        lender: loan.lender.toBase58(),
        amount: lamportsToSol(loan.amount),
        mortgageCid: loan.mortgageCid,
        dueDate: formatDateFromBN(new anchor.BN(loan.dueDate)),
        status: formatStatus(loan.status),
        requestDate: formatDateFromBN(new anchor.BN(loan.requestDate)),
        fundDate: loan.fundDate ? formatDateFromBN(loan.fundDate) : null,
        repayDate: loan.repayDate ? formatDateFromBN(loan.repayDate) : null,
      }));
  
      setLoans(loans);
       
    } catch (error:any) {
      console.error('Failed to fetch loans:', error);
      setError(`Failed to fetch loans: ${error.message}`);
      toast.error(`Failed to fetch loans: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (program && publicKey) {
      fetchAllLoans();
    }
  }, []);

  
  return publicKey ? (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Explore Loans</CardTitle>
          <CardDescription>View all available loan requests on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading loans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
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
                        <Button onClick={() => handleViewDetails(loan)}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {selectedLoan && (
              <FundLoanModal
                loan={selectedLoan}
                onClose={handleCloseModal}
              />
            )} 
            </>
          )}
        </CardContent>
      </Card>
    </div>
  ) : (
     <NotConnected/>
  );
}

 