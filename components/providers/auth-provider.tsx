"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAuthenticateWallet } from "@/features/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProfile } from "@/features/profile";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/generated/prisma/browser";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  status: "unauthenticated" | "authenticating" | "authenticated";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const authenticate = useAuthenticateWallet();
  const profile = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    const authenticateWallet = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        localStorage.removeItem("walletAddress");
        queryClient.resetQueries();
        return;
      }

      const walletAddress = wallet.publicKey.toBase58();

      // If user is already authenticated, skip
      if (profile.data) {
        return;
      }

      // If we're on the registration or login page, don't auto-authenticate
      if (pathname === "/register" || pathname === "/login") {
        return;
      }

      let signature = localStorage.getItem("signature");

      if (!signature) {
        // For existing users, try to authenticate
        const message = `Sign this message to authenticate with Solana DID System at ${new Date().toISOString()}`;
        const encodedMessage = new TextEncoder().encode(message);

        try {
          const signedMessage = await wallet.signMessage!(encodedMessage);
          signature = Buffer.from(signedMessage).toString("hex");
        } catch (error) {
          // If signing fails, redirect to registration
          router.push("/register");
          return;
        }
      }

      authenticate.mutate(
        {
          walletAddress,
          signature,
          // Don't include role for existing user authentication
        },
        {
          onSuccess: (_, variables) => {
            localStorage.setItem("walletAddress", variables.walletAddress);
            localStorage.setItem("signature", variables.signature);
            router.push("/dashboard");
          },
          onError: () => {
            localStorage.removeItem("walletAddress");
            // If authentication fails (user doesn't exist), redirect to registration
            router.push("/register");
          },
        }
      );
    };

    authenticateWallet();
  }, [wallet.connected, wallet.publicKey, profile.data, pathname]);

  // Clear all queries when user becomes unauthenticated
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      localStorage.removeItem("walletAddress");
      queryClient.clear();
      queryClient.resetQueries();
      router.replace("/");
      console.log("Cleared queries due to unauthenticated state");
    }
  }, [wallet.connected, wallet.publicKey, queryClient]);

  const status = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) {
      return "unauthenticated";
    }

    if (profile.isPending) {
      return "authenticating";
    }

    if (profile.data) {
      return "authenticated";
    }

    return "unauthenticated";
  }, [wallet.connected, wallet.publicKey, profile.isPending]);

  return (
    <AuthContext.Provider
      value={{
        user: profile.data ?? null,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During build time or SSR, return a safe default
    return {
      user: null,
      status: "unauthenticated" as const,
    };
  }
  return context;
}
