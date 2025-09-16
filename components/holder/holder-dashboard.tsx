"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Key, CreditCard, CheckCircle, Eye, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCredentials } from "@/features/credentials";
import { useAvailableProofRequests } from "@/features/proof-requests";
import { useProfile } from "@/features/profile";
import { PageSkeleton } from "@/components/loading-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { Credential, ProofRequest } from "@/lib/types";
import { UserRole } from "@/lib/generated/prisma/enums";
import Link from "next/link";

export function HolderDashboard() {
  return (
    <ErrorBoundary>
      <HolderDashboardContent />
    </ErrorBoundary>
  );
}

function HolderDashboardContent() {
  const router = useRouter();
  const {
    data: credentials,
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useCredentials();
  const {
    data: proofRequests,
    isLoading: proofRequestsLoading,
    error: proofRequestsError,
  } = useAvailableProofRequests();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  // Show loading state if any data is still loading
  if (credentialsLoading || proofRequestsLoading || profileLoading) {
    return <PageSkeleton />;
  }

  if (profile?.role !== UserRole.HOLDER) return null;

  // Handle errors
  if (credentialsError || proofRequestsError || profileError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              Error loading dashboard data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Active DID",
      value: profile?.did ? "1" : "0",
      description: "Decentralized identifiers",
      icon: Key,
      color: "text-primary",
    },
    {
      title: "Stored Credentials",
      value: credentials?.length?.toString() || "0",
      description: "Verifiable credentials",
      icon: CreditCard,
      color: "text-secondary",
    },
    {
      title: "Proof Requests",
      value: proofRequests?.length?.toString() || "0",
      description: "Available requests",
      icon: CheckCircle,
      color: "text-accent",
    },
    {
      title: "Verified Claims",
      value:
        credentials
          ?.filter((c: any) => c.status === "active")
          ?.length?.toString() || "0",
      description: "Successfully verified",
      icon: Shield,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your decentralized identity and credentials
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Credentials
            </CardTitle>
            <CardDescription>
              Your latest verifiable credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {credentials && credentials.length > 0 ? (
              credentials.slice(0, 3).map((credential: Credential) => (
                <div
                  key={credential.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{credential.type}</h4>
                    <p className="text-sm text-muted-foreground">
                      Issued:{" "}
                      {new Date(credential.issuedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {credential.status}
                      </Badge>
                      {credential.expiresAt && (
                        <Badge
                          variant={
                            new Date(credential.expiresAt) > new Date()
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {new Date(credential.expiresAt) > new Date()
                            ? "Active"
                            : "Expired"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No credentials found</p>
                <p className="text-sm">
                  Credentials you receive will appear here
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full bg-transparent mt-auto"
              asChild
            >
              <Link href="/dashboard/credentials"> View All Credentials</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Proof Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Proof Requests
            </CardTitle>
            <CardDescription>Pending verification requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proofRequests && proofRequests.length > 0 ? (
              proofRequests.slice(0, 3).map((request: ProofRequest) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{request.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Requested by {request.verifierId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Due:{" "}
                        {request.expiresAt
                          ? new Date(request.expiresAt).toLocaleDateString()
                          : "No deadline"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/dashboard/proofs")}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No proof requests found</p>
                <p className="text-sm">
                  Available proof requests will appear here
                </p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/dashboard/proofs")}
            >
              View All Requests
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DID Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            DID Status
          </CardTitle>
          <CardDescription>
            Your decentralized identifier information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Primary DID</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {profile?.did || "No DID created yet"}
                </p>
              </div>
              <Badge variant={profile?.did ? "default" : "secondary"}>
                {profile?.did ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Security Score</span>
                <span>{profile?.did ? "85%" : "0%"}</span>
              </div>
              <Progress value={profile?.did ? 85 : 0} className="h-2" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Rotate Keys
              </Button>
              <Button variant="outline" size="sm">
                Update DID Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
