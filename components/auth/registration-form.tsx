"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, User, Shield, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/generated/prisma/enums";

export function RegistrationForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const { connected, publicKey, signMessage } = useWallet();
  const { user, status } = useAuth();
  const authenticate = useAuthenticateWallet();
  const { toast } = useToast();
  const router = useRouter();

  // If user is already authenticated, redirect to dashboard
  if (user && status === "authenticated") {
    router.replace("/dashboard");
    return null;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleRegister = async () => {
    if (!selectedRole || !connected || !publicKey) {
      toast({
        title: "Incomplete Information",
        description: "Please connect your wallet and select a role.",
        variant: "destructive",
      });
      return;
    }

    try {
      const walletAddress = publicKey.toBase58();

      let signature = localStorage.getItem("signature");

      if (!signature) {
        // Prompt user to sign a message
        const message = `Register for Solana DID System as ${selectedRole} at ${new Date().toISOString()}`;
        const encodedMessage = new TextEncoder().encode(message);

        const signedMessage = await signMessage!(encodedMessage);
        signature = Buffer.from(signedMessage).toString("hex");
      }

      // Use the existing authentication mutation with role
      authenticate.mutate(
        {
          walletAddress,
          signature,
          role: selectedRole, // Include the selected role in the request
        },
        {
          onSuccess: () => {
            localStorage.setItem("walletAddress", walletAddress);
            localStorage.setItem("signature", signature!);
            toast({
              title: "Registration Successful",
              description: `Welcome to the Solana DID System as a ${selectedRole}!`,
            });
            router.push("/dashboard");
          },
          onError: (error: any) => {
            toast({
              title: "Registration Failed",
              description: error.message || "Failed to complete registration.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to sign message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const roleOptions = [
    {
      value: UserRole.HOLDER,
      label: "Credential Holder",
      description: "Store and manage your digital credentials",
      icon: User,
      color: "bg-blue-500",
    },
    {
      value: UserRole.ISSUER,
      label: "Credential Issuer",
      description: "Issue verifiable credentials to holders",
      icon: Shield,
      color: "bg-green-500",
    },
    {
      value: UserRole.VERIFIER,
      label: "Credential Verifier",
      description: "Verify and validate submitted credentials",
      icon: Eye,
      color: "bg-purple-500",
    },
  ];

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
          <CardDescription>
            First, connect your Solana wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletMultiButton className="w-full" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            We recommend using Phantom wallet for the best experience
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Choose Your Role
        </CardTitle>
        <CardDescription>
          Select the role that best describes how you'll use the DID system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleRoleSelect(option.value)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${option.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  {selectedRole === option.value && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <Button
            onClick={handleRegister}
            disabled={!selectedRole || authenticate.isPending}
            className="w-full"
          >
            {authenticate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Connected wallet: {publicKey?.toString().slice(0, 8)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
