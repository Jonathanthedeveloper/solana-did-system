"use client";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ReactNode, useMemo } from "react";

interface WalletProviderProps {
  children: ReactNode;
}

const wallets = [new PhantomWalletAdapter()];

export function WalletProvider({ children }: WalletProviderProps) {
  const connection = useMemo(() => new Connection(clusterApiUrl("devnet")), []);

  return (
    <ConnectionProvider endpoint={connection.rpcEndpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={true}>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
