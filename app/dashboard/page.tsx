"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { HolderDashboard } from "@/components/holder/holder-dashboard";
import { IssuerDashboard } from "@/components/issuer/issuer-dashboard";
import { VerifierDashboard } from "@/components/verifier/verifier-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/lib/generated/prisma/enums";

export default function DashboardPage() {
  const { user, status } = useAuth();

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Please Connect Your Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need to connect your wallet to access the dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "authenticating" || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Authenticating your wallet...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {user.role === UserRole.HOLDER && <HolderDashboard />}
      {user.role === UserRole.ISSUER && <IssuerDashboard />}
      {user.role === UserRole.VERIFIER && <VerifierDashboard />}
    </div>
  );
}
