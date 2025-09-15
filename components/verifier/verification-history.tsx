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
  X,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react";

export function VerificationHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  const verifications = [
    {
      id: "1",
      credentialType: "University Degree",
      holder: "Alice Johnson",
      holderDID: "did:sol:5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuer: "Stanford University",
      status: "verified",
      verifiedAt: "2024-03-10T14:30:00Z",
      purpose: "Job Application",
      trustScore: 95,
      verificationTime: "1.2s",
    },
    {
      id: "2",
      credentialType: "Age Verification",
      holder: "Bob Smith",
      holderDID: "did:sol:7GHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuer: "KYC Provider",
      status: "verified",
      verifiedAt: "2024-03-10T13:15:00Z",
      purpose: "DeFi Access",
      trustScore: 88,
      verificationTime: "0.8s",
    },
    {
      id: "3",
      credentialType: "Professional Certificate",
      holder: "Carol Davis",
      holderDID: "did:sol:9JHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuer: "Tech Corp",
      status: "failed",
      verifiedAt: "2024-03-10T12:45:00Z",
      purpose: "Service Access",
      trustScore: 0,
      verificationTime: "0.5s",
      failureReason: "Credential expired",
    },
    {
      id: "4",
      credentialType: "Employment Verification",
      holder: "David Wilson",
      holderDID: "did:sol:1KHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuer: "Previous Company",
      status: "failed",
      verifiedAt: "2024-03-09T16:20:00Z",
      purpose: "Background Check",
      trustScore: 0,
      verificationTime: "1.1s",
      failureReason: "Credential revoked",
    },
    {
      id: "5",
      credentialType: "Identity Proof",
      holder: "Emma Brown",
      holderDID: "did:sol:2LHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuer: "Government Agency",
      status: "verified",
      verifiedAt: "2024-03-09T11:30:00Z",
      purpose: "Account Verification",
      trustScore: 98,
      verificationTime: "2.1s",
    },
  ];

  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      verification.credentialType
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      verification.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || verification.status === filterStatus;

    const now = new Date();
    const verificationDate = new Date(verification.verifiedAt);
    let matchesPeriod = true;

    if (filterPeriod === "today") {
      matchesPeriod = verificationDate.toDateString() === now.toDateString();
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesPeriod = verificationDate >= weekAgo;
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = verificationDate >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "failed":
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const stats = {
    total: verifications.length,
    verified: verifications.filter((v) => v.status === "verified").length,
    failed: verifications.filter((v) => v.status === "failed").length,
    averageTrustScore: Math.round(
      verifications
        .filter((v) => v.status === "verified")
        .reduce((sum, v) => sum + v.trustScore, 0) /
        verifications.filter((v) => v.status === "verified").length
    ),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Verification History
          </h1>
          <p className="text-muted-foreground">
            Review all credential verification activities
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Verifications
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.verified / stats.total) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <X className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.failed / stats.total) * 100)}% failure rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Trust Score
            </CardTitle>
            <Calendar className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTrustScore}%</div>
            <p className="text-xs text-muted-foreground">
              For verified credentials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search verifications..."
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
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verification List */}
      <div className="space-y-4">
        {filteredVerifications.map((verification) => (
          <Card
            key={verification.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {verification.credentialType}
                    {getStatusIcon(verification.status)}
                  </CardTitle>
                  <CardDescription>
                    {verification.holder} •{" "}
                    {new Date(verification.verifiedAt).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {selectedVerification?.credentialType}
                          {selectedVerification &&
                            getStatusIcon(selectedVerification.status)}
                        </DialogTitle>
                        <DialogDescription>
                          Verification details and results
                        </DialogDescription>
                      </DialogHeader>
                      {selectedVerification && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">
                                Verification Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Status:
                                  </span>
                                  <Badge
                                    variant={
                                      getStatusColor(
                                        selectedVerification.status
                                      ) as any
                                    }
                                  >
                                    {selectedVerification.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Trust Score:
                                  </span>
                                  <span className="font-medium">
                                    {selectedVerification.trustScore}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Verification Time:
                                  </span>
                                  <span>
                                    {selectedVerification.verificationTime}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Purpose:
                                  </span>
                                  <span>{selectedVerification.purpose}</span>
                                </div>
                                {selectedVerification.failureReason && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Failure Reason:
                                    </span>
                                    <span className="text-destructive">
                                      {selectedVerification.failureReason}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Credential Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Type:
                                  </span>
                                  <span>
                                    {selectedVerification.credentialType}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Holder:
                                  </span>
                                  <span>{selectedVerification.holder}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Issuer:
                                  </span>
                                  <span>{selectedVerification.issuer}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Verified:
                                  </span>
                                  <span>
                                    {new Date(
                                      selectedVerification.verifiedAt
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Holder DID</h4>
                            <p className="font-mono text-xs break-all text-muted-foreground">
                              {selectedVerification.holderDID}
                            </p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">{verification.purpose}</Badge>
                  <span className="text-muted-foreground">
                    Issuer: {verification.issuer}
                  </span>
                  {verification.status === "verified" && (
                    <span className="text-muted-foreground">
                      Trust: {verification.trustScore}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{verification.verificationTime}</span>
                  {verification.failureReason && (
                    <Badge variant="destructive" className="text-xs">
                      {verification.failureReason}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVerifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No verifications found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== "all" || filterPeriod !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start verifying credentials to see history here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
