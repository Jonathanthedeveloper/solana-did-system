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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  CreditCard,
  Search,
  Filter,
  Eye,
  Download,
  Share,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCredentials, useImportCredential } from "@/features/credentials";
import { useToast } from "@/hooks/use-toast";

export function CredentialStorage() {
  const { publicKey } = useWallet();
  const { data: credentials, isLoading, error } = useCredentials();
  const importMutation = useImportCredential();
  const { toast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCredential, setSelectedCredential] = useState<any>(null);

  if (isLoading) return <div>Loading credentials...</div>;
  if (error) return <div>Error loading credentials</div>;

  const filteredCredentials =
    credentials?.filter((cred: any) => {
      const issuerDisplay =
        cred.issuer?.did ?? cred.issuerDid ?? cred.issuer ?? "";
      const matchesSearch =
        cred.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issuerDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cred.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || cred.status === filterType;
      return matchesSearch && matchesFilter;
    }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        );
      case "pending":
        return (
          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
        );
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleShare = async (credential: any) => {
    const credentialData = {
      title: credential.title,
      type: credential.type,
      issuer:
        credential.issuer?.did ?? credential.issuerDid ?? credential.issuer,
      issuedDate: credential.issuedAt ?? credential.issuedDate,
      expiryDate: credential.expiryDate,
      credentialSubject: credential.credentialSubject,
    };

    const shareData = {
      title: `Verifiable Credential: ${credential.title}`,
      text: `Check out this verifiable credential: ${credential.title} issued by ${credential.issuer}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Credential shared successfully",
          description: "The credential has been shared.",
        });
      } else {
        // Fallback: copy credential data to clipboard
        await navigator.clipboard.writeText(
          JSON.stringify(credentialData, null, 2)
        );
        toast({
          title: "Credential copied to clipboard",
          description: "Credential data has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing credential:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(credentialData, null, 2)
        );
        toast({
          title: "Credential copied to clipboard",
          description:
            "Sharing failed, but credential data has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
        toast({
          title: "Sharing failed",
          description: "Unable to share or copy credential data.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = (credential: any) => {
    try {
      const credentialData = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", credential.type],
        issuer: credential.issuer,
        issuanceDate: credential.issuedAt ?? credential.issuedDate,
        expirationDate: credential.expiryDate,
        credentialSubject: {
          id:
            credential.credentialSubject.id ||
            `did:solana:${publicKey?.toBase58()}`,
          ...credential.credentialSubject,
        },
        proof: credential.proof,
      };

      const dataStr = JSON.stringify(credentialData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${credential.title.replace(
        /\s+/g,
        "_"
      )}_credential.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Credential downloaded",
        description: `Credential has been downloaded as ${exportFileDefaultName}`,
      });
    } catch (error) {
      console.error("Error downloading credential:", error);
      toast({
        title: "Download failed",
        description: "Unable to download the credential.",
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
            Credential Storage
          </h1>
          <p className="text-muted-foreground">
            Manage your verifiable credentials securely
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsImportOpen(true)}>
          <Plus className="w-4 h-4" />
          Import Credential
        </Button>
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Credential JSON</DialogTitle>
              <DialogDescription>
                Paste a verifiable credential JSON to import into your wallet
                storage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-48 p-2 border rounded bg-background text-foreground"
                placeholder="Paste credential JSON here"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportJson("");
                    setIsImportOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const parsed = JSON.parse(importJson);
                      await importMutation.mutateAsync(parsed);
                      setImportJson("");
                      setIsImportOpen(false);
                    } catch (err) {
                      // TODO: show toast
                      console.error("Invalid credential JSON", err);
                    }
                  }}
                >
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredentials.map((credential: any) => (
          <Card
            key={credential.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{credential.type}</CardTitle>
                    <CardDescription>
                      Issuer:{" "}
                      {credential.issuer?.did ??
                        credential.issuerDid ??
                        credential.issuer}
                    </CardDescription>
                  </div>
                </div>
                {getStatusIcon(credential.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{credential.type}</Badge>
                <Badge variant={getStatusColor(credential.status) as any}>
                  {credential.status}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span>
                    {new Date(
                      credential.issuedAt ?? credential.issuedDate ?? ""
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>
                    {new Date(credential.expiryDate ?? "").toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedCredential(credential)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle>{selectedCredential?.title}</DialogTitle>
                      <DialogDescription>
                        Issued by {selectedCredential?.issuer}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedCredential && (
                      <div className="flex-1 overflow-hidden">
                        <Tabs
                          defaultValue="details"
                          className="h-full flex flex-col"
                        >
                          <TabsList className="flex-shrink-0">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                          </TabsList>
                          <TabsContent
                            value="details"
                            className="flex-1 overflow-y-auto mt-4"
                          >
                            <div className="space-y-6 pr-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Credential Information
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">
                                        Type:
                                      </span>
                                      <span className="font-medium">
                                        {selectedCredential.type}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
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
                                    <div className="flex justify-between items-center">
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
                                    <div className="flex justify-between items-center">
                                      <span className="text-muted-foreground">
                                        Expires:
                                      </span>
                                      <span>
                                        {new Date(
                                          selectedCredential.expiryDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Subject Details
                                  </h4>
                                  <div className="space-y-3 text-sm max-h-48 overflow-y-auto">
                                    {Object.entries(
                                      selectedCredential.credentialSubject
                                    ).map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between items-start gap-4"
                                      >
                                        <span className="text-muted-foreground capitalize flex-shrink-0">
                                          {key}:
                                        </span>
                                        <span className="text-right break-words">
                                          {Array.isArray(value)
                                            ? value.join(", ")
                                            : String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-3">
                                  Proof Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Type:
                                    </span>
                                    <span>{selectedCredential.proof.type}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Created:
                                    </span>
                                    <span>
                                      {new Date(
                                        selectedCredential.proof.created
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block mb-2">
                                      Verification Method:
                                    </span>
                                    <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                                      {
                                        selectedCredential.proof
                                          .verificationMethod
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent
                            value="raw"
                            className="flex-1 overflow-hidden mt-4"
                          >
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto h-full">
                              {JSON.stringify(selectedCredential, null, 2)}
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(credential)}
                >
                  <Share className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(credential)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No credentials found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Import your first credential to get started"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Import Credential
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
