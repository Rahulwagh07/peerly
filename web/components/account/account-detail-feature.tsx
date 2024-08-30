"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Table, TableRow, Button, TableBody, TableCell, 
  TableHeader, Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@peerly/ui-components';
import { redirect, useParams } from "next/navigation";
import { Cluster, PublicKey } from '@solana/web3.js';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { formatDateFromBN, lamportsToSol, formatStatus } from '@/lib/utils';
import RepayLoanModal from './RepayLoanModal';
import { AccountType, Loan } from '@/lib/types';
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
  const programId = useMemo(() => getLendingProgramId(cluster.network as Cluster), [cluster]);
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number | null>(null);
  
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

  const loadAccountDetails = async () => {
    if (!address) return;
    setError(null);
    setLoading(true);

    try {
        const [userAccountPDA] = await PublicKey.findProgramAddress(
            [Buffer.from('rahul'), address.toBuffer()],
            programId
        );

        const accountDetails = await program.account.userAccount.fetch(userAccountPDA);

        if (!accountDetails || !accountDetails.accountType) {
            throw new Error('Account details are missing');
        }

        const accountType = accountDetails.accountType.borrower ? 'Borrower' : 
                            accountDetails.accountType.lender ? 'Lender' : 'None';
        setAccountType(accountType);
        console.log("accountType", accountType);

        let processedLoans: Loan[] = [];

        if (accountType === 'Borrower') {
            processedLoans = accountDetails.loans.map((loan: any) => ({
                ...loan,
            }));
        } else if (accountType === 'Lender') {
            const allUserAccounts = await program.account.userAccount.all();
            
            // Filter loans where the lender matches the current address 
            //& the account type is borrower
            processedLoans = allUserAccounts
            .filter((userAccount) => userAccount.account.accountType.borrower)  
            .flatMap((userAccount) => 
                userAccount.account.loans.filter((loan: any) => 
                    loan.lender.toBase58() === address.toBase58()
                )
            );
        }

        setLoans(processedLoans);
        console.log("processedLoans", processedLoans);

    } catch (error: any) {
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


  useEffect(() => {
    loadAccountDetails();
  }, [address, walletConnected]);

  const handleViewDetails = (loan: Loan, index: number) => {
    setSelectedLoan(loan);
    setSelectedLoanIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
    setSelectedLoanIndex(null);
  };

  if (!address || !walletConnected) {
    return redirect(`/account`);
  }

  if (loading) {
    return <Loader/>;
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
                    <Button onClick={() => handleViewDetails(loan, index)}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selectedLoan && selectedLoanIndex !== null && (
            <RepayLoanModal
              loan={selectedLoan}
              loanIndex={selectedLoanIndex}
              onClose={handleCloseModal}
              refreshLoans={loadAccountDetails}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDetailFeature;