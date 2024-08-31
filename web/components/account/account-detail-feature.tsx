"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Table, TableRow, Button, TableBody, TableCell, 
  TableHeader, Card, CardContent, CardDescription, 
  CardHeader, CardTitle, 
  TableHead
} from '@peerly/ui-components';
import { redirect, useParams } from "next/navigation";
import { Cluster, PublicKey } from '@solana/web3.js';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { formatDateFromBN, lamportsToSol, formatStatus, formatAddress } from '@/lib/utils';
import RepayLoanModal from './RepayLoanModal';
import { AccountType, Loan } from '@/lib/types';
import { AccountBalance } from './account-data-access';
import Loader from '../common/Loader';
import useWalletConnection from '@/hooks/useWalletConnection';
import CustomError from '../common/CustomError';
import toast from 'react-hot-toast';

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

    } catch (error: any) {
        console.error('Error fetching account details:', error);
        setError(`No account Transaction.`);
         
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    loadAccountDetails();
  }, [address, walletConnected]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to Clipboard")
  };
  
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
    <div className="mx-2 sm:mx-auto  w-11/12 relative overflow-hidden py-16  -mt-24 sm:-mt-24 lg:py-12">
       <div
        aria-hidden="true"
        className=" absolute  hidden sm:flex -top-[600px] start-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
        <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
      </div>
    <div>
      <CardHeader className="flex items-center justify-center  mt-2 sm:mt-12">
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>See all your loan details that you are part of.</CardDescription>
      </CardHeader>
  
      <div className="flex items-center justify-center mb-2">
        <Card className="hidden sm:flex gap-4 p-3 px-16 items-center justify-center
            rounded-full bg-gradient-to-tr to-transparent  border-2 w-fit">
          <CardDescription>
            Account Type: <span className="text-sky-500">{accountType}</span>
          </CardDescription>
          <CardDescription className="flex gap-2 items-center justify-center">
            <span>Bal:</span> 
            <AccountBalance address={address} />
          </CardDescription>
        </Card>
      </div>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={`${accountType === "Borrower" ? "hidden" : ""}`}>
                Borrower
              </TableHead>
              <TableHead className={`${accountType === "Lender" ? "hidden" : ""}`}>
                Lender (Funded By)
              </TableHead>
              <TableHead>Amount (SOL)</TableHead>
              <TableHead>{accountType === "Lender" ? "Interest Earned(SOL)" : "Interest Paid(SOL)"}</TableHead>
              <TableHead>Mortgage CID</TableHead>
              <TableHead>Request Date</TableHead>
              <TableHead>Repay Deadline</TableHead>
              <TableHead>Repaid Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className={`${accountType === "Lender" ? "hidden" : ""}`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loans.map((loan, index) => (
              <TableRow key={index}>
                <TableCell 
                  onClick={() => handleCopy(loan.borrower.toString())}
                  className={`cursor-pointer ${accountType === "Borrower" ? "hidden" : ""}`}>
                  {formatAddress(loan.borrower.toString())}
                </TableCell>
                <TableCell
                  onClick={formatStatus(loan.status) !== "Requested" ? () => handleCopy(loan.lender.toString()) : undefined}
                  className={`${
                    formatStatus(loan.status) !== "Requested" ? "cursor-pointer" : "cursor-default"
                  } ${accountType === "Lender" ? "hidden" : ""}`}
                  >
                  {formatStatus(loan.status) === "Requested" ? "---" : formatAddress(loan.lender.toString())}
                </TableCell>

                <TableCell>{lamportsToSol(loan.amount)} SOL</TableCell>
                <TableCell>
                  {formatStatus(loan.status) === "Closed" ? 
                  lamportsToSol(loan.interestAccrued).toFixed(9): "---"}
                </TableCell>
                <TableCell 
                  onClick={() => handleCopy(loan.mortgageCid.toString())}
                  className="flex items-center cursor-pointer">
                  {formatAddress(loan.mortgageCid.toString())}
                </TableCell>
                <TableCell>{loan.requestDate ? formatDateFromBN(loan.requestDate) : "---"}</TableCell>
                <TableCell>{loan.dueDate ? formatDateFromBN(loan.dueDate) : "---"}</TableCell>
                <TableCell>{loan.repayDate ? formatDateFromBN(loan.repayDate) : "---"}</TableCell>
                <TableCell>{formatStatus(loan.status)}</TableCell>
                <TableCell className={`${accountType === "Lender" ? "hidden" : ""}`}>
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
            accountType={accountType}
          />
        )}
      </CardContent>
    </div>
  </div>
  
  );
};

export default AccountDetailFeature;