import React from 'react'
import { WalletButton } from '../solana/solana-provider'
import {Card, CardHeader, CardTitle,
  CardDescription, CardContent
} from "@peerly/ui-components"

function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>You are not connected!</CardTitle>
          <CardDescription>Connect your wallet to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <WalletButton />
        </CardContent>
      </Card>
    </div>
  )
}

export default NotConnected