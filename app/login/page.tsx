"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useAuthenticateWallet } from "@/features/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Wallet, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function LoginPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { connected, publicKey, signMessage } = useWallet();
  const { user, status } = useAuth();
  const authenticate = useAuthenticateWallet();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Handle authentication when wallet connects
  useEffect(() => {
    const handleAuthentication = async () => {
      if (!connected || !publicKey || isAuthenticating) {
        return;
      }

      setIsAuthenticating(true);

      try {
        const walletAddress = publicKey.toBase58();

        // Check if user has a stored signature
        let signature = localStorage.getItem("signature");

        if (!signature) {
          // Prompt user to sign a message for authentication
          const message = `Sign this message to authenticate with Solana DID System at ${new Date().toISOString()}`;
          const encodedMessage = new TextEncoder().encode(message);

          const signedMessage = await signMessage!(encodedMessage);
          signature = Buffer.from(signedMessage).toString("hex");
        }

        // Attempt authentication
        authenticate.mutate(
          {
            walletAddress,
            signature,
          },
          {
            onSuccess: (_, variables) => {
              localStorage.setItem("walletAddress", variables.walletAddress);
              localStorage.setItem("signature", variables.signature);
              toast({
                title: "Login Successful",
                description: "Welcome back to the Solana DID System!",
              });
              router.push("/dashboard");
            },
            onError: (error: any) => {
              localStorage.removeItem("walletAddress");
              localStorage.removeItem("signature");
              toast({
                title: "Login Failed",
                description:
                  error.message ||
                  "Authentication failed. Please try registering if you're a new user.",
                variant: "destructive",
              });
              setIsAuthenticating(false);
            },
          }
        );
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Failed to sign message. Please try again.",
          variant: "destructive",
        });
        setIsAuthenticating(false);
      }
    };

    handleAuthentication();
  }, [
    connected,
    publicKey,
    signMessage,
    authenticate,
    router,
    toast,
    isAuthenticating,
  ]);

  // Show loading while redirecting authenticated users
  if (user || status === "authenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground mx-auto mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Connect your wallet to access your Solana DID account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!connected ? (
              <div className="text-center space-y-4">
                <WalletMultiButton className="w-full" />
                <p className="text-xs text-muted-foreground">
                  Connect your Solana wallet to continue
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                {isAuthenticating || authenticate.isPending ? (
                  <div className="space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Authenticating your account...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connected wallet: {publicKey?.toString().slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      If authentication fails, you may need to register as a new
                      user.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                New to Solana DID?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
