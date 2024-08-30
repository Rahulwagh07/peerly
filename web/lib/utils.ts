import * as anchor from '@project-serum/anchor';
import toast from 'react-hot-toast';

export const lamportsToSol = (lamports: anchor.BN): number => {
  return lamports.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
};


export const formatStatus = (status: any): string => {
  if (status.requested) return 'Requested';
  if (status.funded) return 'Funded';
  if (status.closed) return 'Closed';
  if (status.defaulted) return 'Defaulted';
  return 'Unknown';
};


export const formatDateFromBN = (dueDateBN: anchor.BN | null): string => {

  let timestamp = dueDateBN.toNumber();
  //if timestamp is in ms
  if (timestamp > 1e12) {
    timestamp = Math.floor(timestamp / 1000);
  }
  const dueDate = new Date(timestamp * 1000);

  if (isNaN(dueDate.getTime())) {
    console.error('Invalid dueDate value:', dueDateBN.toString());
    return 'Invalid Date';
  }
  const day = dueDate.getUTCDate().toString().padStart(2, '0');
  const month = (dueDate.getUTCMonth() + 1).toString().padStart(2, '0');  
  const year = dueDate.getUTCFullYear();

  return `${day}/${month}/${year}`;
};

export const formatAddress = (address: string) => {
  const upperAfterLastTwo = address.slice(0, 2) + address.slice(2)
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(39)}`
}

export const handleCustomError = ({ error, customError }: { error: any; customError: string }) => {
  if (error.message.includes("Invalid loan amount")) {
    toast.error("The loan amount must be greater than zero.");
  } else if (error.message.includes("Invalid due date")) {
    toast.error("The due date must be in the future.");
  } else if (error.message.includes("Maximum number of loans reached")) {
    toast.error("You have reached the maximum number of loans.");
  } else if (error.message.includes("Lender cannot borrow")) {
    toast.error("Lenders are not allowed to borrow.");
  } else if (error.message.includes("Borrower cannot lend")) {
    toast.error("Borrowers are not allowed to fund loan.");
  } else if (error.message.includes("Loan is not in a fundable state")) {
    toast.error("This loan is not in a fundable state.");
  } else if (error.message.includes("Loan is not in a repayable state")) {
    toast.error("This loan is not in a repayable state.");
  } else if (error.message.includes("Unauthorized borrower")) {
    toast.error("You are not authorized to borrow.");
  } else if (error.message.includes("Invalid loan index")) {
    toast.error("The specified loan index is invalid.");
  } else {
    toast.error(customError);
  }
};
