"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Table, TableRow, Button, TableBody, TableCell, 
  TableHeader, Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} 
  from '@peerly/ui-components';
import { redirect, useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { formatDateFromBN, lamportsToSol, formatStatus } from '@/lib/utils';
import RepayLoanModal from './RepayLoanModal';
import {AccountType, Loan } from '@/lib/types';
import { AccountBalance, useGetBalance } from './account-data-access';
import Loader from '../common/Loader';
import useWalletConnection from '@/hooks/useWalletConnection';
import CustomError from '../common/CustomError';

const AccountDetailFeature: React.FC = () => {
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>('None');
 
  const { walletConnected } = useWalletConnection();
  console.log("walletConnected",walletConnected);
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

  if(address){
    var query = useGetBalance({address});
  }
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

      } catch (error:any) {
        console.error('Error fetching account details:', error);
        if(query.data){
          setError(`No account Transaction.`);
        } else{
          setError(`You Don't have inup balance, Airdrop some devent SOL in your account.`);
        }
       
      } finally {
        setLoading(false);
      }
    };

    loadAccountDetails();
  }, [address, walletConnected]);

  if (!address || !walletConnected) {
    return redirect(`/account`);
  }

  if (loading) {
    return  <Loader/>;
  }

  if (error) {
    return <CustomError error={error} address={address}/>;
  }

  return (
    <div className='container mx-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardTitle>Account Type: {accountType}</CardTitle>
          <AccountBalance address={address}/>
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

export default AccountDetailFeature;
