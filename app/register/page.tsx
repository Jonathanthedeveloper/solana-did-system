"use client";

import { RegistrationForm } from "@/components/auth/registration-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, FileText, Eye } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center">
            <RegistrationForm />
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Solana DID
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Decentralized Identity Management System built on Solana
                blockchain
              </p>
              <Badge variant="secondary" className="mt-4">
                Powered by Solana
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  For Identity Holders
                </CardTitle>
                <CardDescription>
                  Manage your decentralized identity and credentials securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Create and manage DIDs</li>
                  <li>• Store verifiable credentials</li>
                  <li>• Present proofs when needed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  For Credential Issuers
                </CardTitle>
                <CardDescription>
                  Issue and manage verifiable credentials for others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Issue credentials to holders</li>
                  <li>• Track all issuances</li>
                  <li>• Revoke credentials when needed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  For Credential Verifiers
                </CardTitle>
                <CardDescription>
                  Verify and validate identity credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Verify credential authenticity</li>
                  <li>• Check credential validity</li>
                  <li>• Make informed decisions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
