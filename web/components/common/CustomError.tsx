import React from 'react';
import { AccountBalance } from '../account/account-data-access';
import { PublicKey } from '@solana/web3.js';
import { Card } from '@peerly/ui-components';
import Link from 'next/link';

function CustomError({
  error,
  address,
}: {
  error: string;
  address: PublicKey | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <Card className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md max-w-md w-full">
        {address && (
          <div className="flex gap-2 items-center justify-center">
            <span className="text-2xl dark:text-gray-300 font-semibold">
              Balance:
            </span>
            <AccountBalance address={address} />
          </div>
        )}
        <div className="flex flex-col mt-4 text-lg dark:text-gray-300  space-y-4 ">
          <p> {error}</p>
          <p className="mt-4">
            To get started,{' '}
            <a
              href="https://faucet.solana.com/"
              target="_blank"
              className="text-blue-500"
            >
              Airdrop
            </a>{' '}
            some Devnet SOL to your wallet.
          </p>
          <p>
            You can then either
            <Link href={'/explore'} className="text-blue-500">
              {' '}
              fund{' '}
            </Link>
            a loan request as a lender or
            <Link href={'/request'} className="text-blue-500">
              {' '}
              Submit{' '}
            </Link>
            your own loan request to borrow.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default CustomError;
