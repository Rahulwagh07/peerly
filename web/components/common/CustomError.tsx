import React from 'react';
import { AccountBalance } from '../account/account-data-access';
import { PublicKey } from '@solana/web3.js';  

function CustomError({ error, address }: { error: string; address: PublicKey }) {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md max-w-md w-full">
       <div className='flex gap-2 items-center justify-center'>
       <span className='text-xl text-gray-400 font-semibold'>Balance:</span> 
       <AccountBalance address={address} />
       </div>
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {error}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomError;
