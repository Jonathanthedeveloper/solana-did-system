"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Key, Eye, ArrowRight, Users, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Show loading while determining auth status
  if (status === "authenticating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto mb-6">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Blockchain Identity Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A secure, decentralized identity management system built on Solana
            blockchain. Manage digital credentials, issue verifiable
            certificates, and verify identities with confidence.
          </p>
          <Badge variant="secondary" className="mb-8">
            Powered by Solana Blockchain
          </Badge>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>For Identity Holders</CardTitle>
              <CardDescription>
                Store and manage your digital credentials securely. Share
                verified information with organizations you trust.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Secure credential storage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Privacy-preserving sharing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Blockchain-verified authenticity
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>For Credential Issuers</CardTitle>
              <CardDescription>
                Issue verifiable credentials and certificates. Manage templates
                and track credential lifecycle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Create credential templates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Issue verifiable credentials
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Revoke credentials when needed
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 mx-auto mb-4">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>For Credential Verifiers</CardTitle>
              <CardDescription>
                Verify submitted credentials and proof requests. Ensure
                authenticity and validity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Verify credential authenticity
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Process proof requests
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Audit and compliance
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Solana wallet to get started
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Choose Your Role</h3>
              <p className="text-sm text-muted-foreground">
                Select whether you're a holder, issuer, or verifier
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Create/Manage</h3>
              <p className="text-sm text-muted-foreground">
                Issue credentials, store them, or verify submissions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                All credentials are secured by Solana blockchain
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join the decentralized identity revolution on Solana
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Login to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
