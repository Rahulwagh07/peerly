'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import {  useQuery} from '@tanstack/react-query';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div>
      <span
        className="cursor-pointer text-sm py-1.5 px-3 border-[0.5px] rounded-lg"
      >
        {query.data ? <BalanceSol balance={query.data} /> : '0'}  <span className='text-red-400'>SOL</span>
      </span>
    </div>
  );
}
 
function BalanceSol({ balance }: { balance: number }) {
  return (
    <span> {Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
  );
}
 
export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  });
}
