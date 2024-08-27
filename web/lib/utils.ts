import * as anchor from '@project-serum/anchor';

export const lamportsToSol = (lamports: anchor.BN): number => {
  return lamports.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
};

 
export const formatDate = (bnDate: anchor.BN): string => {
  return new Date(bnDate.toNumber() * 1000).toLocaleDateString();
};


export const formatStatus = (status: any): string => {
  if (status.requested) return 'Requested';
  if (status.funded) return 'Funded';
  if (status.closed) return 'Closed';
  if (status.defaulted) return 'Defaulted';
  return 'Unknown';
};

 