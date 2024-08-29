import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function useWalletConnection() {
  const { connected } = useWallet();
  const [walletConnected, setWalletConnected] = useState(connected);

  useEffect(() => {
    setWalletConnected(connected);
  }, [connected]);

  return { walletConnected};
}
