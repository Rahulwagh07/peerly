"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLendingProgram } from '@peerly/anchor';
import { useAnchorProvider } from '../solana/solana-provider';
import * as anchor from '@project-serum/anchor';
import { lamportsToSol, formatStatus, formatDateFromBN, formatAddress } from '../../lib/utils';
import FundLoanModal from './FundLoanModal';
import { MdContentCopy } from "react-icons/md";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow, Card, CardContent, CardDescription,
  CardHeader, CardTitle, Button,
} from '@peerly/ui-components';

import NotConnected from '../common/NotConnected';
import { Loan } from '@/lib/types';
import Loader from '../common/Loader';
import CustomError from '../common/CustomError';
import toast from 'react-hot-toast';

export const ShowAllLoansDetails = () => {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [filteredLoans, setFilterdLoans] = useState<Loan[]>([]);
  

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
          interestAccrued: loan.interestAccrued ? lamportsToSol(loan.interestAccrued).toFixed(9) : null,
        }));
        //@ts-ignore
        allLoans = allLoans.concat(loans);
      });

      setLoans(allLoans);
      setFilterdLoans(allLoans);
    } catch (error: any) {
      console.error('Failed to fetch loans:', error);
      setError(`Oops! We couldn't load the details. Give it another try, Refresh the page.`);
    } finally {
      setLoading(false);
    }
  };

    

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to Clipboard")
  };

  useEffect(() => {
    if (program && publicKey) {
      fetchAllLoans();
    }
  }, [publicKey]);


  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    switch (tab) {
      case 'All':
        setFilterdLoans(loans);
        break;
      case 'Funded':
         setFilterdLoans(loans.filter(loan => loan.status === 'Funded'));
        break;
      case 'Closed':
         setFilterdLoans(loans.filter(loan => loan.status === 'Closed'));
        break;
      case 'Defaulted':
         setFilterdLoans(loans.filter(loan => loan.status === 'Defaulted'));
        break;
      case 'Requested':
         setFilterdLoans(loans.filter(loan => loan.status === 'Requested'));
        break;
      default:
        setFilterdLoans(loans);
    }
     
  };

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
    <div className=" mx-2 sm:mx-auto  w-11/12 relative overflow-hidden py-16  -mt-24 sm:-mt-24 lg:py-12">
      <div
        aria-hidden="true"
        className=" absolute  hidden sm:flex -top-[600px] start-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
        <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
      </div>
      <div>
        <CardHeader className='flex items-center justify-center  mt-2 sm:mt-12'>
          <CardTitle>Explore Loans</CardTitle>
          <CardDescription>View all available loan requests on the platform</CardDescription>
        </CardHeader>
       
        <div className='flex items-center  justify-center pb-3'>
        <Card className='hidden sm:flex gap-8 py-1 px-8 items-center justify-center
             text-gray-500 dark:text-gray-400 mx-auto rounded-full
              bg-gradient-to-tr to-transparent  border-2 w-fit'>
              {['All', 'Funded',  'Requested', 'Closed', 'Defaulted'].map(tab => (
                <button 
                  key={tab}
                  className={` ${activeTab === tab ?
                     'text-sky-500 font-[600] py-1.5 px-3 rounded-md bg-gray-700'
                      : 'p-2 rounded-md px-2  font-[600]  hover:bg-slate-800 rounded-t-lg'
                    }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </Card>
        </div>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Amount <span className='text-[0.6rem] sm:text-xs text-red-400'> (SOL)</span></TableHead>
                <TableHead className={`${activeTab === "Closed" ? "" : "hidden"}`}>
                    Interest Paid <span className='text-[0.6rem] sm:text-xs text-red-400'> (SOL) </span>
                  </TableHead>
                <TableHead className={`${activeTab === "Closed" || activeTab === "Funded" ? "" : "hidden"}`}>
                  Lender(Funded By)
                </TableHead>
                <TableHead>Mortgage CID</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className={`${activeTab === "Funded" ? "" : "hidden"}`}>Funded Date</TableHead>
                <TableHead>Repay Deadline</TableHead>
                <TableHead className={`${activeTab === "Closed" ? "" : "hidden"}`}>
                  Repaid Date
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan, index) => (
                  <TableRow key={index}>
                    <TableCell 
                      onClick={() => handleCopy(loan.borrower.toString())}
                      className='flex items-baseline mt-2 cursor-pointer'>{formatAddress(loan.borrower.toString())} 
                      <MdContentCopy className='ml-2 text-blue-500'/>
                    </TableCell>
                    <TableCell>{loan.amount}</TableCell>
                    <TableCell className={`${activeTab === "Closed" ? "" : "hidden"}`}>{loan.interestAccrued}</TableCell>
                    <TableCell 
                      onClick={() => handleCopy(loan.borrower.toString())}
                      className={`flex items-center cursor-pointer ${activeTab === "Closed" || activeTab === "Funded" ? "" : "hidden"}`}>
                      {formatAddress(loan.lender.toString())}
                    </TableCell>
                    <TableCell 
                      onClick={() => handleCopy(loan.borrower.toString())}
                      className='cursor-pointer'
                      >{formatAddress(loan.borrower.toString())} 
                    </TableCell>
                    <TableCell>{loan.requestDate}</TableCell>
                    <TableCell className={`${activeTab === "Funded" ? "" : "hidden"}`}>
                      {loan.fundDate}</TableCell>
                    <TableCell>{loan.dueDate}</TableCell>
                    <TableCell className={`${activeTab === "Closed" ? "" : "hidden"}`}>
                      {loan.repayDate}
                    </TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleViewDetails(loan, index)}
                        >View Details</Button>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className='text-lg  p-4'>
                      No Loans in the <span className='font-semibold text-xl text-sky-400'>{activeTab}</span> list now.</div>
                  </TableCell>
                </TableRow>
              )}
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
      </div>
    </div>
  );
};