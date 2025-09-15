"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "./providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Wallet } from "lucide-react";

export const AuthComponent = React.memo(function AuthComponent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { connected, publicKey, disconnect } = useWallet();
  const { user, status } = useAuth();

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  // If user is authenticated, show disconnect option
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Connected: {publicKey?.toString().slice(0, 8)}...
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWalletDisconnect}
          disabled={status === "authenticating"}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // If wallet is connected but no user yet, show loading
  if (connected && !user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show connect wallet option
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your Solana wallet to access the DID system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WalletMultiButton />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          New users will be automatically registered with holder access
        </p>
      </CardContent>
    </Card>
  );
});
