"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";
import {
  useIssuedCredentials,
  useRevokeCredential,
} from "@/features/credentials";
import { Credential } from "@/lib/generated/prisma/browser";
import { useToast } from "@/hooks/use-toast";
import { CredentialStatus } from "@/lib/generated/prisma/enums";

type IssuedCredential = Credential & {
  // Legacy/derived fields used by UI
  recipient?: string;
  recipientDID?: string;
  issuedDate?: string;
  expiryDate?: string;
  verificationCount?: number;
  lastVerified?: string | null;
  credentialHash?: string;
  template?: string;
  holder?: { firstName?: string; lastName?: string } | null;
};

export function IssuedCredentials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCredential, setSelectedCredential] =
    useState<IssuedCredential | null>(null);

  const { data: credentials = [], isLoading, error } = useIssuedCredentials();
  const revokeCredentialMutation = useRevokeCredential();
  const { toast } = useToast();

  const normalizeStatus = (s?: any) => String(s ?? "").toLowerCase();

  const getIssuedDate = (c: IssuedCredential) => c.issuedAt?.toString() ?? "";

  const getRecipient = (c: IssuedCredential) => {
    if (c.holder)
      return `${c.holder.firstName ?? ""} ${c.holder.lastName ?? ""}`.trim();
    return null;
  };

  const getRecipientDID = (c: IssuedCredential) => c.subjectDid ?? "";

  const filteredCredentials = credentials.filter((credential: any) => {
    const matchesSearch =
      credential.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getRecipient(credential) || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (getRecipientDID(credential) || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      normalizeStatus(credential.status) === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status?: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "active":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "expired":
        return (
          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "revoked":
        return <Ban className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "revoked":
        return "destructive";
      default:
        return "outline";
    }
  };

  const activeCredentials = filteredCredentials.filter(
    (c: any) => normalizeStatus(c.status) === "active"
  );
  const expiredCredentials = filteredCredentials.filter(
    (c: any) => normalizeStatus(c.status) === "expired"
  );
  const revokedCredentials = filteredCredentials.filter(
    (c: any) => normalizeStatus(c.status) === "revoked"
  );

  const handleRevokeCredential = async (credentialId: string) => {
    try {
      await revokeCredentialMutation.mutateAsync(credentialId);
      toast({
        title: "Credential Revoked",
        description: "The credential has been successfully revoked.",
      });
      setSelectedCredential(null); // Close dialog
    } catch (error: any) {
      toast({
        title: "Revocation Failed",
        description: error.message || "Failed to revoke credential.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Issued Credentials
          </h1>
          <p className="text-muted-foreground">
            Track and manage all issued credentials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{activeCredentials.length} Active</Badge>
          <Badge variant="secondary">{expiredCredentials.length} Expired</Badge>
          <Badge variant="destructive">
            {revokedCredentials.length} Revoked
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading issued credentials...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Failed to load credentials
            </h3>
            <p className="text-muted-foreground">
              There was an error loading your issued credentials. Please try
              again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({filteredCredentials.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeCredentials.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({expiredCredentials.length})
              </TabsTrigger>
              <TabsTrigger value="revoked">
                Revoked ({revokedCredentials.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredCredentials.map((credential: any) => (
                <Card
                  key={credential.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {credential.type}
                          {getStatusIcon(credential.status)}
                        </CardTitle>
                        <CardDescription>
                          Issued to{" "}
                          {getRecipient(credential) ?? credential.recipient} •{" "}
                          {new Date(
                            getIssuedDate(credential) ?? ""
                          ).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCredential(credential)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedCredential?.type}
                              </DialogTitle>
                              <DialogDescription>
                                Credential issued to{" "}
                                {selectedCredential?.recipient}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCredential && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Credential Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Type:
                                        </span>
                                        <span>{selectedCredential.type}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Status:
                                        </span>
                                        <Badge
                                          variant={
                                            getStatusColor(
                                              selectedCredential.status
                                            ) as any
                                          }
                                        >
                                          {selectedCredential.status}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Template:
                                        </span>
                                        <span>
                                          {selectedCredential.template}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Issued:
                                        </span>
                                        <span>
                                          {new Date(
                                            selectedCredential.issuedDate ??
                                              selectedCredential.issuedAt ??
                                              ""
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Expires:
                                        </span>
                                        <span>
                                          {new Date(
                                            selectedCredential.expiryDate ??
                                              selectedCredential.expiresAt ??
                                              ""
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Recipient & Usage
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Recipient:
                                        </span>
                                        <p className="font-medium">
                                          {selectedCredential.recipient}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          DID:
                                        </span>
                                        <p className="font-mono text-xs break-all">
                                          {selectedCredential.recipientDID}
                                        </p>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Verifications:
                                        </span>
                                        <span>
                                          {selectedCredential.verificationCount}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Last Verified:
                                        </span>
                                        <span>
                                          {selectedCredential.lastVerified
                                            ? new Date(
                                                selectedCredential.lastVerified
                                              ).toLocaleDateString()
                                            : "Never"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Blockchain Information
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Credential Hash:
                                      </span>
                                      <p className="font-mono text-xs">
                                        {selectedCredential.credentialHash}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {selectedCredential.status ===
                                  CredentialStatus.ACTIVE && (
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleRevokeCredential(
                                          selectedCredential.id
                                        )
                                      }
                                    >
                                      Revoke Credential
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {normalizeStatus(credential.status) === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            onClick={() =>
                              handleRevokeCredential(credential.id)
                            }
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{credential.template}</Badge>
                        <span className="text-muted-foreground">
                          {credential.verificationCount} verifications
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires:{" "}
                        {new Date(
                          credential.expiresAt ?? ""
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeCredentials.map((credential: IssuedCredential) => (
                <Card
                  key={credential.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {credential.type}
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </CardTitle>
                        <CardDescription>
                          Issued to{" "}
                          {credential.recipient ??
                            (credential.holder
                              ? `${credential.holder.firstName ?? ""} ${
                                  credential.holder.lastName ?? ""
                                }`.trim()
                              : "")}{" "}
                          •{" "}
                          {new Date(
                            credential.issuedAt ?? ""
                          ).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent"
                        onClick={() => handleRevokeCredential(credential.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{credential.template}</Badge>
                        <span className="text-muted-foreground">
                          {credential.verificationCount} verifications
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires:{" "}
                        {new Date(
                          credential.expiresAt ?? ""
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {expiredCredentials.map((credential: IssuedCredential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {credential.type}
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </CardTitle>
                    <CardDescription>
                      Issued to{" "}
                      {credential.recipient ??
                        (credential.holder
                          ? `${credential.holder.firstName ?? ""} ${
                              credential.holder.lastName ?? ""
                            }`.trim()
                          : "")}{" "}
                      • Expired on{" "}
                      {new Date(
                        credential.expiresAt ?? ""
                      ).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Expired</Badge>
                      <span className="text-sm text-muted-foreground">
                        {credential.verificationCount} total verifications
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="revoked" className="space-y-4">
              {revokedCredentials.map((credential: IssuedCredential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {credential.type}
                      <Ban className="w-4 h-4 text-destructive" />
                    </CardTitle>
                    <CardDescription>
                      Issued to{" "}
                      {credential.recipient ??
                        (credential.holder
                          ? `${credential.holder.firstName ?? ""} ${
                              credential.holder.lastName ?? ""
                            }`.trim()
                          : "")}{" "}
                      • Revoked on{" "}
                      {new Date(
                        credential.revokedAt ?? ""
                      ).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">Revoked</Badge>
                      <span className="text-sm text-muted-foreground">
                        {credential.verificationCount} total verifications
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {filteredCredentials.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No credentials found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start issuing credentials to see them here"}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
