import * as anchor from '@project-serum/anchor';

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


 


 