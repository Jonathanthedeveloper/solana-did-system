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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Ban,
  Search,
  Eye,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";
import { useRevokedCredentials } from "@/features/credentials";

interface RevokedCredential {
  id: string;
  type: string;
  recipient?: string;
  recipientDID?: string;
  issuedDate?: string;
  issuedAt?: string;
  revokedDate?: string | null;
  reason: string;
  revokedBy: string;
  credentialHash: string;
  verificationCount: number;
  lastVerified: string | null;
}

export function RevokedCredentials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCredential, setSelectedCredential] =
    useState<RevokedCredential | null>(null);

  const {
    data: revokedCredentials = [],
    isLoading,
    error,
  } = useRevokedCredentials();

  const filteredCredentials = revokedCredentials.filter(
    (credential: any) =>
      credential.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (credential.recipient || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      credential.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const revocationReasons = [
    "Employment terminated",
    "Certificate found to be fraudulent",
    "Incorrect information provided",
    "Security breach",
    "Holder request",
    "Policy violation",
    "Other",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Revoked Credentials
          </h1>
          <p className="text-muted-foreground">
            View and manage revoked credentials
          </p>
        </div>
        <Badge variant="destructive" className="gap-1">
          <Ban className="w-3 h-3" />
          {filteredCredentials.length} Revoked
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading revoked credentials...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Failed to load credentials
            </h3>
            <p className="text-muted-foreground">
              There was an error loading your revoked credentials. Please try
              again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search revoked credentials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Revocation Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revoked
                </CardTitle>
                <Ban className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredCredentials.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Credentials revoked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    filteredCredentials.filter((c: any) => {
                      const revokedDate = new Date(c.revokedDate);
                      const now = new Date();
                      return (
                        revokedDate.getMonth() === now.getMonth() &&
                        revokedDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Revoked this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Reason
                </CardTitle>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">Employment terminated</div>
                <p className="text-xs text-muted-foreground">
                  Most common reason
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revoked Credentials List */}
          <div className="space-y-4">
            {filteredCredentials.map((credential: any) => (
              <Card
                key={credential.id}
                className="border-destructive/20 dark:border-destructive/40"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {credential.type}
                        <Ban className="w-4 h-4 text-destructive" />
                      </CardTitle>
                      <CardDescription>
                        Issued to {credential.recipient} • Revoked on{" "}
                        {new Date(
                          credential.revokedDate ?? ""
                        ).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCredential(credential)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {selectedCredential?.type}
                            <Ban className="w-5 h-5 text-destructive" />
                          </DialogTitle>
                          <DialogDescription>
                            Revoked credential details
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
                                      Recipient:
                                    </span>
                                    <span>{selectedCredential.recipient}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Issued:
                                    </span>
                                    <span>
                                      {new Date(
                                        selectedCredential.issuedAt ??
                                          selectedCredential.issuedDate ??
                                          ""
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Revoked:
                                    </span>
                                    <span>
                                      {selectedCredential.revokedDate
                                        ? new Date(
                                            selectedCredential.revokedDate
                                          ).toLocaleDateString()
                                        : "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">
                                  Revocation Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Reason:
                                    </span>
                                    <span>{selectedCredential.reason}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Revoked by:
                                    </span>
                                    <span>{selectedCredential.revokedBy}</span>
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
                                      Last verified:
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
                                  <p className="font-mono text-xs break-all">
                                    {selectedCredential.credentialHash}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Recipient DID:
                                  </span>
                                  <p className="font-mono text-xs break-all">
                                    {selectedCredential.recipientDID}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">Revoked</Badge>
                      <span className="text-sm text-muted-foreground">
                        {credential.verificationCount} total verifications
                      </span>
                    </div>
                    <div className="p-3 bg-destructive/10 dark:bg-destructive/5 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-destructive">
                          Reason:{" "}
                        </span>
                        <span className="text-destructive/80">
                          {credential.reason}
                        </span>
                      </div>
                      <div className="text-xs text-destructive/70 mt-1">
                        Revoked by {credential.revokedBy} on{" "}
                        {new Date(
                          credential.revokedDate ?? ""
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCredentials.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Ban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No revoked credentials found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No credentials have been revoked yet"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Revocation Reasons Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Revocation Reasons</CardTitle>
              <CardDescription>Summary of revocation reasons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {revocationReasons.map((reason) => {
                  const count = revokedCredentials.filter(
                    (c: any) => c.reason === reason
                  ).length;
                  if (count === 0) return null;
                  return (
                    <div
                      key={reason}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{reason}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
