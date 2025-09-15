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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Upload,
  QrCode,
  CheckCircle,
  X,
  AlertTriangle,
  Shield,
  FileText,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useVerifyCredential } from "@/features/credentials";
import { useToast } from "@/hooks/use-toast";

export function VerifyCredentials() {
  const [verificationMethod, setVerificationMethod] = useState<
    "upload" | "qr" | "did"
  >("upload");
  const [credentialData, setCredentialData] = useState("");
  const [credentialType, setCredentialType] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyCredentialMutation = useVerifyCredential();
  const { toast } = useToast();

  const handleVerifyCredential = async () => {
    if (!credentialData.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide credential data to verify.",
        variant: "destructive",
      });
      return;
    }

    try {
      let verificationData;

      if (verificationMethod === "upload") {
        // Parse JSON for upload method
        try {
          const parsedData = JSON.parse(credentialData);
          verificationData = { credentialJson: parsedData };
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "Please provide valid JSON credential data.",
            variant: "destructive",
          });
          return;
        }
      } else if (verificationMethod === "did") {
        verificationData = {
          holderDid: credentialData,
          ...(credentialType ? { credentialType } : {}),
        };
      } else {
        // QR method - for now, treat as JSON
        try {
          const parsedData = JSON.parse(credentialData);
          verificationData = { credentialJson: parsedData };
        } catch (error) {
          toast({
            title: "Invalid QR Data",
            description: "Please provide valid credential data from QR scan.",
            variant: "destructive",
          });
          return;
        }
      }

      const result = await verifyCredentialMutation.mutateAsync(
        verificationData
      );
      setVerificationResult(result);

      if (result.status === "verified") {
        toast({
          title: "Verification Successful",
          description: `Credential verified with ${result.trustScore}% trust score.`,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Credential verification failed.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify credential.",
        variant: "destructive",
      });
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      case "failed":
        return <X className="w-5 h-5 text-destructive" />;
      case "warning":
        return (
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        );
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setCredentialData("");
    setCredentialType("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Verify Credentials
          </h1>
          <p className="text-muted-foreground">
            Validate verifiable credentials and check their authenticity
          </p>
        </div>
        {verificationResult && (
          <Button variant="outline" onClick={resetVerification}>
            New Verification
          </Button>
        )}
      </div>

      {!verificationResult ? (
        /* Verification Input */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Method</CardTitle>
              <CardDescription>
                Choose how to provide the credential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  verificationMethod === "upload"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setVerificationMethod("upload")}
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">Upload JSON</h4>
                    <p className="text-sm text-muted-foreground">
                      Paste or upload credential JSON
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  verificationMethod === "qr"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setVerificationMethod("qr")}
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">QR Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Scan credential QR code
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  verificationMethod === "did"
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setVerificationMethod("did")}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">DID Lookup</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify by holder DID
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credential Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Credential Input
                </CardTitle>
                <CardDescription>
                  Provide the credential to verify
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationMethod === "upload" && (
                  <div>
                    <Label htmlFor="credential-json">Credential JSON</Label>
                    <Textarea
                      id="credential-json"
                      placeholder="Paste the verifiable credential JSON here..."
                      value={credentialData}
                      onChange={(e) => setCredentialData(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                {verificationMethod === "qr" && (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      QR Code Scanner
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Position the QR code within the camera view
                    </p>
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => setVerificationMethod("upload")}
                      >
                        Switch to Manual Input
                      </Button>
                      <div>
                        <Label htmlFor="qr-data">
                          Or paste QR data manually
                        </Label>
                        <Textarea
                          id="qr-data"
                          placeholder="Paste the credential data from QR scan..."
                          value={credentialData}
                          onChange={(e) => setCredentialData(e.target.value)}
                          rows={6}
                          className="font-mono text-sm mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {verificationMethod === "did" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="holder-did">Holder DID</Label>
                      <Input
                        id="holder-did"
                        placeholder="did:sol:..."
                        value={credentialData}
                        onChange={(e) => setCredentialData(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="credential-type">
                        Credential Type (Optional)
                      </Label>
                      <Input
                        id="credential-type"
                        placeholder="e.g., University Degree"
                        value={credentialType}
                        onChange={(e) => setCredentialType(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleVerifyCredential}
                  disabled={
                    !credentialData || verifyCredentialMutation.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {verifyCredentialMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Verify Credential
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Verification Results */
        <div className="space-y-6">
          {/* Result Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getVerificationIcon(verificationResult.status)}
                Verification Result
              </CardTitle>
              <CardDescription>
                Verified on{" "}
                {new Date(verificationResult.verifiedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge
                  variant={
                    verificationResult.status === "verified"
                      ? "default"
                      : "destructive"
                  }
                  className="text-sm px-3 py-1"
                >
                  {verificationResult.status === "verified"
                    ? "VALID CREDENTIAL"
                    : "INVALID CREDENTIAL"}
                </Badge>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {verificationResult.trustScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trust Score
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(verificationResult.verification).map(
                  ([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="flex justify-center mb-1">
                        {value ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credential Details */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Credential Details</TabsTrigger>
              <TabsTrigger value="verification">
                Verification Checks
              </TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Credential Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">
                        {verificationResult.credential.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Holder:</span>
                      <span className="font-medium">
                        {verificationResult.credential.holder}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">
                        {verificationResult.credential.issuer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued:</span>
                      <span>
                        {new Date(
                          verificationResult.credential.issuedAt ??
                            verificationResult.credential.issuedDate ??
                            ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>
                        {new Date(
                          verificationResult.credential.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subject Claims</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(
                      verificationResult.credential.credentialSubject
                    ).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>DID Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Holder DID:</span>
                    <p className="font-mono text-sm break-all">
                      {verificationResult.credential.holderDID}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 p-0 h-auto"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View DID Document
                    </Button>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuer DID:</span>
                    <p className="font-mono text-sm break-all">
                      {verificationResult.credential.issuerDID}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 p-0 h-auto"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View DID Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(verificationResult.verification).map(
                  ([key, value]) => (
                    <Card key={key}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {value ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <X className="w-5 h-5 text-destructive" />
                          )}
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={value ? "default" : "destructive"}>
                          {value ? "PASSED" : "FAILED"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {key === "signatureValid" &&
                            "Cryptographic signature verification"}
                          {key === "issuerTrusted" &&
                            "Issuer is in trusted registry"}
                          {key === "notExpired" &&
                            "Credential is within validity period"}
                          {key === "notRevoked" &&
                            "Credential has not been revoked"}
                          {key === "chainAnchorValid" &&
                            "Blockchain anchor verification"}
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="raw" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Credential Data</CardTitle>
                  <CardDescription>
                    Complete credential JSON structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(verificationResult.credential, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
              <CardDescription>
                What would you like to do with this verification result?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline">Save Report</Button>
              <Button variant="outline">Export JSON</Button>
              <Button variant="outline">Share Result</Button>
              <Button>Accept Credential</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Section */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Verification checks the credential's cryptographic signature, issuer
          trust status, expiration date, revocation status, and blockchain
          anchor. A trust score above 80% indicates a highly reliable
          credential.
        </AlertDescription>
      </Alert>
    </div>
  );
}
