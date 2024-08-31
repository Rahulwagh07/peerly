// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import PeerToPeerLendingIDL from '../target/idl/peer_to_peer_lending.json';
import type {PeerToPeerLending } from '../target/types/peer_to_peer_lending'

// Re-export the generated IDL and type
export { PeerToPeerLending, PeerToPeerLendingIDL };

// The programId is imported from the program IDL.
export const PeerToPeerLending_PROGRAM_ID = new PublicKey(PeerToPeerLendingIDL.address);

// This is a helper function to get the Auction Anchor program.
export function getLendingProgram(provider: AnchorProvider) {
  return new Program(PeerToPeerLendingIDL as PeerToPeerLending, provider);
}
 
// This is a helper function to get the program ID for the Auction program depending on the cluster.
export function getLendingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Auction program on devnet and testnet.
      return new PublicKey('BqopUsa7CqQHnRWRenvHxLH4ne8xLpPTrtHtSZxo4JJj');
    case 'mainnet-beta':
    default:
      return PeerToPeerLending_PROGRAM_ID;
  }
}
