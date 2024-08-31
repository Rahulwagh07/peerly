'use client';

import React, { useEffect } from 'react';
import { useState, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getLendingProgram, getLendingProgramId } from '@peerly/anchor';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider} from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { 
    Card, CardContent, CardDescription,
    CardHeader, CardTitle, Label, Input, Button, 
    Popover, PopoverContent, PopoverTrigger 
  }
 from '@peerly/ui-components';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@peerly/ui-components';
import * as anchor from '@project-serum/anchor'
import NotConnected from "../common/NotConnected"
import Link from 'next/link'
import { IoClose } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { AccountType } from '@/lib/types';
import { handleCustomError } from '@/lib/utils';
import { Terms } from '../common/Terms';

export default function RequestLoanFeature() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const [amount, setAmount] = useState('');
  const [mortgageCID, setMortgageCID] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [accountType, setAccountType] = useState<AccountType>('None');
  const router = useRouter();
  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const programId = useMemo(() => getLendingProgramId(cluster.network as Cluster), [cluster]);
  const program = useMemo(() => getLendingProgram(provider), [provider]);

  const requestLoan = async ({ amount, mortgageCID, dueDate }: { amount: number; mortgageCID: string; dueDate: number }) => {
    try {
      const lamportsAmount = Math.floor(amount * anchor.web3.LAMPORTS_PER_SOL);
      const amountBN = new anchor.BN(lamportsAmount);
  
      const [userAccountPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("rahul"), provider.wallet.publicKey.toBuffer()],
        programId
      );

      const transaction = await program.methods
        .requestLoan(amountBN, mortgageCID, new anchor.BN(dueDate))
        .accounts({
          borrower: provider.wallet.publicKey,
          userAccount: userAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        }as any)
        .rpc();  

      transactionToast(transaction);
      toast.success("Loan request submitted successfully!");
      getProgramAccount.refetch();
      router.push(`/account/${publicKey}`);
      setLoading(false);
      return;
    } catch (error: any) {
      setLoading(false);
      console.error("Failed to submit loan request:", error);
      handleCustomError({error, customError:"Failed to submit loan request. Make sure you have some SOL."});
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!programId || !publicKey) {
      toast.error("Program ID or public key is missing.");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date.");
      return;
    }

    const dueDate: number = selectedDate.getTime();
    const currentDate = new Date().getTime();

    if (dueDate <= currentDate) {
      toast.error("Please select a future date.");
      return;
    }

    try {
      setLoading(true);
      const dueDate: number = selectedDate ? selectedDate.getTime() : 0;
      if(accountType === "Lender"){
        toast.success("Lender can not borrow loan");
        setLoading(false);
        return;
      }
      await requestLoan({
        amount: parseFloat(amount),
        mortgageCID,
        dueDate,
      });
    } catch (error) {
      setLoading(false);
      console.error("Failed to submit loan request:", error);
      toast.error("Failed to submit loan request.");
    }
  };

  const getAccountType = async() => {
    try{
      if(!publicKey){
        return;
      }
      const [userAccountPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('rahul'), publicKey.toBuffer()],
        programId
      );
  
      const accountDetails = await program.account.userAccount.fetch(userAccountPDA);
  
      if (!accountDetails || !accountDetails.accountType) {
        return;
      }
  
      const accountType = accountDetails.accountType.borrower ? 'Borrower' : 
                        accountDetails.accountType.lender ? 'Lender' : 'None';
      setAccountType(accountType);
    } catch(e){
        console.log("Error getting account type:", e);
    }
   };

  useEffect(() => {
     getAccountType();
  }, [publicKey]);

  return publicKey ? (
    <div className='flex relative overflow-hidden items-center  justify-center py-16  -mt-24 sm:-mt-24 lg:py-6'>
       <div
        aria-hidden="true"
        className=" absolute  sm:flex -top-[600px] start-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
        <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
      </div>
      <Card className='p-4 relative mt-20 lg:px-16'>
        <Link href="/" className='hidden' >
         <IoClose className='absolute text-2xl top-5 right-5 text-red-500'/>
         </Link>
      <CardHeader>
        <CardTitle>Request a Loan!</CardTitle>
        <CardDescription>
          Submit your loan application and connect directly with Lenders on <br/>our secure, blockchain-powered platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="accountAddress">Account Address</Label>
              <Input id="accountAddress" value={publicKey?.toBase58() || ""} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Loan Amount</Label>
              <Input
                id="amount"
                placeholder="Enter Loan Amount (in SOL)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="mortgageCID">Add Mortgage</Label>
              <Input
                id="mortgageCID"
                placeholder="Enter Mortgage CID"
                value={mortgageCID}
                onChange={(e) => setMortgageCID(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5 w-full">
              <Label htmlFor="dueDate">Pick a Due Date</Label>
              <DatePicker onDateChange={setSelectedDate} />
            </div>
            <div className="flex flex-col space-y-1.5 w-full">
              <Label>Loan Terms</Label>
              <Terms isChecked={isChecked}
                setIsChecked={setIsChecked}
                text1="I agree that"
                text2="interest rate will be applied."
              />
            </div>
            <Button type="submit" disabled={!isChecked}>{loading ? "Submitting.." : "Request Loan"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  ) : (
     <NotConnected/>
  );
}


function DatePicker({ onDateChange }: { onDateChange: (date: Date | undefined) => void }) {
  const [date, setDate] = useState<Date>();

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onDateChange(selectedDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-full justify-start py-5 text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a due date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
}

 