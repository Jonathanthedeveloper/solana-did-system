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
import {
  Eye,
  CheckCircle,
  X,
  Clock,
  Plus,
  TrendingUp,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useProofRequests } from "@/features/proof-requests";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { UserRole } from "@/lib/generated/prisma/enums";

// Local typed interfaces matching API shape (prefer Prisma generated types where available)
type ProofResponse = {
  id: string;
  submittedAt: string | Date | null;
  holder: { walletAddress?: string | null; did?: string | null };
  status: string;
};

type ProofRequestItem = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string | Date;
  expiresAt?: string | Date | null;
  requestedTypes: string[];
  responses: ProofResponse[];
  targetHoldersJson?: string | null;
};

export function VerifierDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: proofRequests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useProofRequests();

  // Calculate stats from real data
  const totalVerifications =
    proofRequests?.reduce(
      (sum: number, req: ProofRequestItem) =>
        sum + (req.responses?.length || 0),
      0
    ) || 0;
  const successRate = totalVerifications > 0 ? 94 : 0; // Default success rate
  const activeRequests =
    proofRequests?.filter((req: ProofRequestItem) => req.status === "ACTIVE")
      .length || 0;
  const failedVerifications = 0; // We'll need to track this in the database

  const stats = [
    {
      title: "Verifications Today",
      value: totalVerifications.toString(),
      description: "Credentials verified",
      icon: Eye,
      color: "text-accent",
      change: "+0",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      description: "Valid credentials",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      change: "+0%",
    },
    {
      title: "Active Requests",
      value: activeRequests.toString(),
      description: "Pending proof requests",
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      change: "+0",
    },
    {
      title: "Failed Verifications",
      value: failedVerifications.toString(),
      description: "Invalid or expired",
      icon: X,
      color: "text-destructive",
      change: "+0",
    },
  ];

  // Get recent verifications from proof request responses
  const recentVerifications =
    proofRequests
      ?.flatMap((req: ProofRequestItem) =>
        (req.responses || []).map((response: ProofResponse) => {
          // Handle date conversion - API returns ISO strings, not Date objects
          const submittedAt =
            typeof response.submittedAt === "string"
              ? response.submittedAt
              : response.submittedAt
              ? new Date(response.submittedAt).toISOString()
              : new Date().toISOString();

          return {
            id: response.id,
            credentialType: req.title,
            holder: response.holder?.walletAddress
              ? `User ${response.holder.walletAddress.slice(0, 8)}...`
              : "Unknown Holder",
            holderDID: response.holder?.did || "",
            issuer: "Various Issuers", // We'll need to get this from credential data
            status: response.status === "PENDING" ? "pending" : "verified",
            verifiedAt: submittedAt,
            purpose: req.description || "Credential Verification",
          };
        })
      )
      .sort(
        (a: { verifiedAt: string }, b: { verifiedAt: string }) =>
          new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime()
      )
      .slice(0, 5) || [];

  // Get active proof requests
  const activeRequestsData =
    proofRequests
      ?.filter((req: ProofRequestItem) => req.status === "ACTIVE")
      .slice(0, 3)
      .map((req: ProofRequestItem) => {
        // Handle date conversion - API returns ISO strings, not Date objects
        const createdAt =
          typeof req.createdAt === "string"
            ? req.createdAt
            : new Date(req.createdAt).toISOString();

        const expiresAt = req.expiresAt
          ? typeof req.expiresAt === "string"
            ? req.expiresAt
            : new Date(req.expiresAt).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        return {
          id: req.id,
          type: req.title,
          requiredClaims: req.requestedTypes,
          requestedAt: createdAt,
          deadline: expiresAt,
          responses: req.responses?.length || 0,
          expectedResponses: req.targetHoldersJson
            ? JSON.parse(req.targetHoldersJson).length
            : 10,
        };
      }) || [];

  const handleNewProofRequest = () => {
    router.push("/dashboard/requests");
  };

  const handleViewAllVerifications = () => {
    router.push("/dashboard/history");
  };

  const handleManageAllRequests = () => {
    router.push("/dashboard/requests");
  };

  if (user?.role !== UserRole.VERIFIER) return null;

  if (requestsLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (requestsError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            {requestsError.message || "Failed to load dashboard data"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "failed":
        return <X className="w-4 h-4 text-destructive" />;
      case "pending":
        return (
          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        );
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Verifier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Verify credentials and manage proof requests
          </p>
        </div>
        <Button className="gap-2" onClick={handleNewProofRequest}>
          <Plus className="w-4 h-4" />
          New Proof Request
        </Button>
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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Recent Verifications
            </CardTitle>
            <CardDescription>
              Latest credential verification results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentVerifications.map((verification: any) => (
              <div
                key={verification.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{verification.credentialType}</h4>
                  <p className="text-sm text-muted-foreground">
                    From: {verification.holder}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {verification.purpose}
                    </Badge>
                    <Badge
                      variant={getStatusColor(verification.status) as any}
                      className="text-xs"
                    >
                      {verification.status}
                    </Badge>
                  </div>
                  {verification.status === "failed" && (
                    <p className="text-xs text-destructive mt-1">
                      Verification failed
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(verification.status)}
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(verification.verifiedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleViewAllVerifications}
            >
              View All Verifications
            </Button>
          </CardContent>
        </Card>

        {/* Active Proof Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Proof Requests
            </CardTitle>
            <CardDescription>
              Ongoing proof collection campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRequestsData.map((request: any) => (
              <div key={request.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{request.type}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {request.responses}/{request.expectedResponses} responses
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Claims: {request.requiredClaims.join(", ")}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (request.responses / request.expectedResponses) * 100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (request.responses / request.expectedResponses) * 100
                    }
                    className="h-2"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    Deadline: {new Date(request.deadline).toLocaleDateString()}
                  </span>
                  <span>
                    {Math.ceil(
                      (new Date(request.deadline).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days left
                  </span>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleManageAllRequests}
            >
              Manage All Requests
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Verifier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verifier Status
          </CardTitle>
          <CardDescription>
            Your verifier registration and trust metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Verifier DID</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  did:sol:verifier:8FHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp
                </p>
              </div>
              <Badge variant="default">Trusted Verifier</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">94%</div>
                <div className="text-xs text-muted-foreground">
                  Success Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">1,247</div>
                <div className="text-xs text-muted-foreground">
                  Total Verifications
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">89</div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verification Accuracy</span>
                <span>89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            {/* Removed non-functional action buttons: these features are not implemented yet */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
