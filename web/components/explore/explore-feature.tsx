'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getLendingProgram } from '@peerly/anchor';
import { useAnchorProvider } from '../solana/solana-provider';
import * as anchor from '@project-serum/anchor';
import {
  lamportsToSol,
  formatStatus,
  formatDateFromBN,
  formatAddress,
} from '../../lib/utils';
import FundLoanModal from './FundLoanModal';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  CardContent,
  Button,
  cn,
  Card,
} from '@peerly/ui-components';
import { Home } from 'lucide-react';

import { Loan } from '@/lib/types';
import Loader from '../common/Loader';
import CustomError from '../common/CustomError';
import toast from 'react-hot-toast';
import { GoIssueClosed } from 'react-icons/go';
import { LuPlusSquare } from 'react-icons/lu';
import { IoCheckboxOutline } from 'react-icons/io5';
import { BiXCircle } from 'react-icons/bi';

const tabs = [
  { name: 'All', icon: Home },
  { name: 'Funded', icon: GoIssueClosed },
  { name: 'Requested', icon: LuPlusSquare },
  { name: 'Closed', icon: IoCheckboxOutline },
  { name: 'Defaulted', icon: BiXCircle },
];

export default function ShowAllLoansDetails() {
  const { publicKey } = useWallet();
  const provider = useAnchorProvider();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [filteredLoans, setFilterdLoans] = useState<Loan[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLoanIndex, setSelectedLoanIndex] = useState<number | null>(
    null,
  );

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
          interestAccrued: loan.interestAccrued
            ? lamportsToSol(loan.interestAccrued).toFixed(9)
            : null,
        }));
        //@ts-ignore
        allLoans = allLoans.concat(loans);
      });

      setLoans(allLoans);
      setFilterdLoans(allLoans);
    } catch (error: any) {
      console.error('Failed to fetch loans:', error);
      setError(
        `Oops! We couldn't load the details. Give it another try, Refresh the page.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to Clipboard');
  };

  useEffect(() => {
    if (program) {
      fetchAllLoans();
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    switch (tab) {
      case 'All':
        setFilterdLoans(loans);
        break;
      case 'Funded':
        setFilterdLoans(loans.filter((loan) => loan.status === 'Funded'));
        break;
      case 'Closed':
        setFilterdLoans(loans.filter((loan) => loan.status === 'Closed'));
        break;
      case 'Defaulted':
        setFilterdLoans(loans.filter((loan) => loan.status === 'Defaulted'));
        break;
      case 'Requested':
        setFilterdLoans(loans.filter((loan) => loan.status === 'Requested'));
        break;
      default:
        setFilterdLoans(loans);
    }
  };

  if (loading) return <Loader />;
  if (error) return <CustomError error={error} address={publicKey} />;

  return (
    <div className="mx-2 sm:mx-auto w-11/12 relative overflow-hidden py-16 -mt-24 sm:-mt-24 lg:py-12">
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={cn(
          'hidden md:flex space-y-2 ml-4 lg:ml-12 flex-col fixed left-0 lg:top-24 top-20   bottom-0 bg-background border-r border-input p-4 overflow-y-auto transition-all duration-300 ease-in-out',
          'md:8 xl:w-48',
          isExpanded && 'md:w-48',
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={cn(
              'flex items-center w-full text-left py-2 px-4 rounded-md transition-all duration-300 z-100',
              'dark:hover:bg-slate-800 hover:text-accent-foreground',
              activeTab === tab.name &&
                'border border-input bg-background shadow-sm  ',
              !isExpanded && 'md:justify-center xl:justify-start',
            )}
            onClick={() => handleTabChange(tab.name)}
          >
            <tab.icon
              className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.name && 'text-blue-500 scale-110'}`}
            />
            <span
              className={cn(
                'ml-2 transition-all duration-300',
                !isExpanded &&
                  'md:hidden md:opacity-0 xl:inline-block xl:opacity-100',
                isExpanded && 'md:inline-block md:opacity-100',
              )}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </div>

      <div
        className={cn(
          'transition-all duration-300 ease-in-out z-3',
          '  md:ml-2 lg:ml-4 xl:ml-36',
          isExpanded && '',
          'p-4 pr-0 mt-4 lg:mt-12 ',
        )}
      >
        <div className="relative pb-0 md:pb-0">
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="h-16 bg-gradient-to-t from-background via-background to-transparent" />
            <nav className="flex justify-around items-center h-16 bg-background border-t border-input">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  className={`flex flex-col items-center justify-center w-full h-full }`}
                  onClick={() => handleTabChange(tab.name)}
                >
                  <tab.icon
                    className={`w-5 h-5 ${activeTab === tab.name && 'text-blue-500 font-[500] scale-110'}`}
                  />
                  <span className="text-xs mt-1">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        <CardContent className="px-0 md:ml-10 xl:ml-auto lg:px-4  max-h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar">
          <Table className="mb-16 md:mb-0">
            <TableHeader
              className={`${isExpanded ? '' : 'sticky top-0'}' xl:sticky xl:top-0 bg-gray-100 dark:bg-slate-800 z-2'`}
            >
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>
                  Amount{' '}
                  <span className="text-[0.6rem] sm:text-xs text-red-400">
                    {' '}
                    (SOL)
                  </span>
                </TableHead>
                <TableHead
                  className={`${activeTab === 'Closed' ? '' : 'hidden'}`}
                >
                  Interest Paid{' '}
                  <span className="text-[0.6rem] sm:text-xs text-red-400">
                    {' '}
                    (SOL){' '}
                  </span>
                </TableHead>
                <TableHead
                  className={`${activeTab === 'Closed' || activeTab === 'Funded' ? '' : 'hidden'}`}
                >
                  Lender(Funded By)
                </TableHead>
                <TableHead>Mortgage CID</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead
                  className={`${activeTab === 'Funded' ? '' : 'hidden'}`}
                >
                  Funded Date
                </TableHead>
                <TableHead>Repay Deadline</TableHead>
                <TableHead
                  className={`${activeTab === 'Closed' ? '' : 'hidden'}`}
                >
                  Repaid Date
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="z-1">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan, index) => (
                  <TableRow key={index}>
                    <TableCell
                      onClick={() => handleCopy(loan.borrower.toString())}
                      className="flex items-baseline mt-2 cursor-pointer"
                    >
                      {formatAddress(loan.borrower.toString())}
                    </TableCell>
                    <TableCell>{loan.amount}</TableCell>
                    <TableCell
                      className={`${activeTab === 'Closed' ? '' : 'hidden'}`}
                    >
                      {loan.interestAccrued}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(loan.borrower.toString())}
                      className={`flex items-center cursor-pointer ${activeTab === 'Closed' || activeTab === 'Funded' ? '' : 'hidden'}`}
                    >
                      {formatAddress(loan.lender.toString())}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(loan.mortgageCid.toString())}
                      className="cursor-pointer"
                    >
                      {formatAddress(loan.mortgageCid.toString())}
                    </TableCell>
                    <TableCell>{loan.requestDate}</TableCell>
                    <TableCell
                      className={`${activeTab === 'Funded' ? '' : 'hidden'}`}
                    >
                      {loan.fundDate}
                    </TableCell>
                    <TableCell>{loan.dueDate}</TableCell>
                    <TableCell
                      className={`${activeTab === 'Closed' ? '' : 'hidden'}`}
                    >
                      {loan.repayDate}
                    </TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>
                      <Button
                        size={'sm'}
                        onClick={() => handleViewDetails(loan, index)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Card className="flex items-center justify-center mt-12">
                      <div className="text-lg p-4">
                        No Loans in the{' '}
                        <span className="font-semibold text-xl text-sky-400">
                          {activeTab}
                        </span>{' '}
                        list now.
                      </div>
                    </Card>
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
}
