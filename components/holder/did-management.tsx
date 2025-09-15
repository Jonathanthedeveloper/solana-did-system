"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Copy, AlertTriangle, CheckCircle } from "lucide-react";
import { useMyDID } from "@/features/did";
import { useWallet } from "@solana/wallet-adapter-react";

export function DIDManagement() {
  const { publicKey } = useWallet();
  const {
    data: didDocument,
    isLoading,
    error,
  } = useMyDID(publicKey?.toBase58());

  if (isLoading) return <div>Loading DID...</div>;
  if (error) return <div>Error loading DID: {error.message}</div>;
  if (!didDocument) return <div>No DID found</div>;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DID Management</h1>
          <p className="text-muted-foreground">
            View your decentralized identifier and associated keys
          </p>
        </div>
      </div>

      {/* DID Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            DID Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">DID</label>
              <p className="font-mono text-sm break-all mt-1">
                {didDocument.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Controller</label>
              <p className="font-mono text-sm break-all mt-1">
                {didDocument.controller}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </Badge>
            <Badge variant="outline">Solana Network</Badge>
            <Badge variant="outline">
              Created: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="document">DID Document</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Key Management */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Cryptographic Keys</CardTitle>
                <CardDescription>
                  Your DID verification keys (managed automatically)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {didDocument.verificationMethod?.map((key: any) => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{key.id.split("#")[1]}</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(key.publicKeyBase58)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{key.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Controller:</span>
                      <span className="font-mono text-xs">
                        {key.controller}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Public Key:</span>
                      <p className="font-mono text-xs break-all mt-1">
                        {key.publicKeyBase58}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Keys are automatically managed by your Solana wallet. For
              security, never share your private keys.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Service Endpoints */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Service Endpoints</CardTitle>
                <CardDescription>
                  Your DID service endpoints (managed automatically)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {didDocument.service?.map((service: any) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{service.id.split("#")[1]}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{service.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Endpoint:</span>
                      <p className="font-mono text-xs break-all mt-1">
                        {service.serviceEndpoint}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document" className="space-y-6">
          {/* DID Document */}
          <Card>
            <CardHeader>
              <CardTitle>DID Document</CardTitle>
              <CardDescription>
                Complete DID document in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={JSON.stringify(didDocument, null, 2)}
                  readOnly
                  className="font-mono text-xs min-h-[400px]"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(didDocument, null, 2))
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
