"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./wallet-provider";
import { getQueryClient } from "@/lib/get-query-client";
import { AuthProvider } from "./auth-provider";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WalletProvider>
      <WalletModalProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </WalletModalProvider>
    </WalletProvider>
  );
}
