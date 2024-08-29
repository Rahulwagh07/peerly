'use client';

import { useConnection } from '@solana/wallet-adapter-react';
import {  useQuery} from '@tanstack/react-query';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div>
      <h6
        className="text-xl font-semibold cursor-pointer"
        onClick={() => query.refetch()}
      >
        {query.data ? <BalanceSol balance={query.data} /> : '0'}  <span className='text-red-400'>SOL</span>
      </h6>
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
