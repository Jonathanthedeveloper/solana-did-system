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
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useIssuedCredentials } from "@/features/credentials";
import { useCredentialTemplates } from "@/features/templates";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { UserRole } from "@/lib/generated/prisma/enums";

export function IssuerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: issuedCredentials,
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useIssuedCredentials();

  const {
    data: templates,
    isLoading: templatesLoading,
    error: templatesError,
  } = useCredentialTemplates();

  // Calculate stats from real data
  const totalIssued = issuedCredentials?.length || 0;
  const normalizeStatus = (s: any) => String(s ?? "").toLowerCase();

  const getHolderDID = (cred: any) =>
    cred.subjectDid ?? cred.recipientDID ?? null;

  const getHolderName = (cred: any) => {
    if (cred.holder) {
      const first = cred.holder.firstName ?? "";
      const last = cred.holder.lastName ?? "";
      const name = `${first} ${last}`.trim();
      if (name) return name;
    }
    return cred.recipient ?? null;
  };

  const activeRecipients = new Set(
    (issuedCredentials?.map((cred: any) => getHolderDID(cred)) as string[]) ||
      []
  ).size;

  const verifiedToday =
    issuedCredentials?.filter((cred: any) => {
      const today = new Date().toDateString();
      const lastVerified = cred.lastVerified ?? cred.verifiedAt ?? null;
      return lastVerified && new Date(lastVerified).toDateString() === today;
    }).length || 0;

  const revokedCount =
    issuedCredentials?.filter(
      (cred: any) => normalizeStatus(cred.status) === "revoked"
    ).length || 0;

  const stats = [
    {
      title: "Total Issued",
      value: totalIssued.toString(),
      description: "Credentials issued",
      icon: FileText,
      color: "text-secondary",
      change: "+0", // We'll calculate this later if we have historical data
    },
    {
      title: "Active Recipients",
      value: activeRecipients.toString(),
      description: "Unique holders",
      icon: Users,
      color: "text-primary",
      change: "+0",
    },
    {
      title: "Verified Today",
      value: verifiedToday.toString(),
      description: "Verification requests",
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      change: "+0",
    },
    {
      title: "Revoked",
      value: revokedCount.toString(),
      description: "Revoked credentials",
      icon: AlertTriangle,
      color: "text-destructive",
      change: "+0",
    },
  ];

  // Get recent issuances from real data
  const recentIssuances =
    issuedCredentials?.slice(0, 5).map((cred: any) => ({
      id: cred.id,
      recipient: getHolderName(cred),
      recipientDID: getHolderDID(cred),
      credentialType: cred.type,
      template: cred.template,
      status: normalizeStatus(cred.status),
      issuedDate: cred.issuedAt ?? cred.issuedDate,
    })) || [];

  const handleIssueNewCredential = () => {
    router.push("/dashboard/issue");
  };

  const handleViewAllIssuances = () => {
    router.push("/dashboard/issued");
  };

  const handleManageTemplates = () => {
    router.push("/dashboard/templates");
  };

  if (user?.role !== UserRole.ISSUER) return null;

  if (credentialsLoading || templatesLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (credentialsError || templatesError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            {credentialsError?.message ||
              templatesError?.message ||
              "Failed to load dashboard data"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Issuer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and issue verifiable credentials
          </p>
        </div>
        <Button className="gap-2" onClick={handleIssueNewCredential}>
          <Plus className="w-4 h-4" />
          Issue New Credential
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
        {/* Recent Issuances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Issuances
            </CardTitle>
            <CardDescription>
              Latest credentials issued to holders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIssuances.map((issuance) => (
              <div
                key={issuance.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{issuance.credentialType}</h4>
                  <p className="text-sm text-muted-foreground">
                    To: {issuance.recipient}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {issuance.template}
                    </Badge>
                    <Badge
                      variant={
                        issuance.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {issuance.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {issuance.issuedDate
                    ? new Date(issuance.issuedDate).toLocaleDateString()
                    : ""}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleViewAllIssuances}
            >
              View All Issuances
            </Button>
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Popular Templates
            </CardTitle>
            <CardDescription>Most used credential templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template: any) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {template.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {template.usage} uses
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Last used:{" "}
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/issue?template=${template.id}`)
                  }
                >
                  Use Template
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleManageTemplates}
            >
              Manage Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Issuer Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Issuer Status
          </CardTitle>
          <CardDescription>
            Your issuer registration and trust status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Issuer DID</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  did:sol:issuer:3FHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp
                </p>
              </div>
              <Badge variant="default">Verified Issuer</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trust Score</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Registry Status:</span>
                <p className="font-medium">Trusted Issuer</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registered Since:</span>
                <p className="font-medium">January 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
