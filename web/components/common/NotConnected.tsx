import React from 'react'
import { WalletButton } from '../solana/solana-provider'
import { LuWallet } from "react-icons/lu";


function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="flex flex-col items-center space-y-4">
        <LuWallet className="h-12 w-12 text-gray-500 dark:text-sky-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Connect Your Wallet</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          To explore the full features of this site, you need to connect your web3 wallet.
        </p>
         <WalletButton/>
      </div>
    </div>
  </div>
  )
}


export default NotConnected