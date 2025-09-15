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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  Clock,
  X,
  Eye,
  Send,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useAvailableProofRequests,
  useProofResponses,
  useRespondToProofRequest,
  useDeclineProofRequest,
} from "@/features/proof-requests";
import { useCredentials } from "@/features/credentials";
import { useToast } from "@/hooks/use-toast";

export function ProofRequests() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: availableRequests, isLoading: requestsLoading } =
    useAvailableProofRequests();
  const { data: proofResponses, isLoading: responsesLoading } =
    useProofResponses();
  const { data: credentials } = useCredentials();
  const respondMutation = useRespondToProofRequest();
  const declineMutation = useDeclineProofRequest();

  const pendingRequests = availableRequests || [];
  const respondedRequests = proofResponses || [];
  const availableCredentials = credentials || [];

  const handleCredentialSelection = (
    credentialId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedCredentials([...selectedCredentials, credentialId]);
    } else {
      setSelectedCredentials(
        selectedCredentials.filter((id) => id !== credentialId)
      );
    }
  };

  const handleRespondToRequest = () => {
    if (!selectedRequest) return;

    respondMutation.mutate(
      {
        proofRequestId: selectedRequest.id,
        presentedCredentials: selectedCredentials,
      },
      {
        onSuccess: () => {
          toast({
            title: "Response Submitted",
            description: "Your proof response has been submitted successfully.",
          });
          setSelectedCredentials([]);
          setSelectedRequest(null);
        },
        onError: (error: any) => {
          toast({
            title: "Submission Failed",
            description: error.message || "Failed to submit proof response.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeclineRequest = (request?: any) => {
    const requestToDecline = request || selectedRequest;
    if (!requestToDecline) return;

    declineMutation.mutate(
      { proofRequestId: requestToDecline.id },
      {
        onSuccess: () => {
          toast({
            title: "Request Declined",
            description: "You have declined this proof request.",
          });
          setSelectedCredentials([]);
          setSelectedRequest(null);
        },
        onError: (error: any) => {
          toast({
            title: "Decline Failed",
            description: error.message || "Failed to decline proof request.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proof Requests</h1>
          <p className="text-muted-foreground">
            Manage verification requests from third parties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{pendingRequests.length} Pending</Badge>
          <Badge variant="outline">{respondedRequests.length} Responded</Badge>
        </div>
      </div>

      {/* Notification for new requests */}
      {pendingRequests.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>New Proof Requests Available</AlertTitle>
          <AlertDescription>
            You have {pendingRequests.length} pending proof request
            {pendingRequests.length !== 1 ? "s" : ""} from verifiers. Please
            review and respond to them.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            History ({respondedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {requestsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request: any) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {request.title}
                            <Badge variant="default">Pending</Badge>
                          </CardTitle>
                          <CardDescription>
                            Requested by{" "}
                            {request.verifier.institutionName ||
                              `${request.verifier.firstName || ""} ${
                                request.verifier.lastName || ""
                              }`.trim() ||
                              request.verifier.walletAddress?.slice(0, 8) +
                                "..."}{" "}
                            • Due:{" "}
                            {request.expiresAt
                              ? new Date(request.expiresAt).toLocaleDateString()
                              : "No deadline"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {selectedRequest?.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Request from{" "}
                                  {selectedRequest?.verifier.institutionName ||
                                    `${
                                      selectedRequest?.verifier.firstName || ""
                                    } ${
                                      selectedRequest?.verifier.lastName || ""
                                    }`.trim() ||
                                    selectedRequest?.verifier.walletAddress?.slice(
                                      0,
                                      8
                                    ) + "..."}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Request Details
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {selectedRequest.description}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Requester DID:
                                        </span>
                                        <p className="font-mono text-xs break-all">
                                          {selectedRequest.verifier.did ||
                                            `did:solana:${selectedRequest.verifier.walletAddress}`}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Deadline:
                                        </span>
                                        <p>
                                          {selectedRequest.expiresAt
                                            ? new Date(
                                                selectedRequest.expiresAt
                                              ).toLocaleDateString()
                                            : "No deadline"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Required Credential Types
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedRequest.requestedTypes.map(
                                        (type: string) => (
                                          <Badge key={type} variant="outline">
                                            {type}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Select Credentials to Share
                                    </h4>
                                    <div className="space-y-2">
                                      {availableCredentials
                                        .filter((cred) =>
                                          selectedRequest.requestedTypes.includes(
                                            cred.type
                                          )
                                        )
                                        .map((credential) => (
                                          <div
                                            key={credential.id}
                                            className="flex items-center space-x-2 p-3 border rounded-lg"
                                          >
                                            <Checkbox
                                              id={credential.id}
                                              checked={selectedCredentials.includes(
                                                credential.id
                                              )}
                                              onCheckedChange={(checked) =>
                                                handleCredentialSelection(
                                                  credential.id,
                                                  checked as boolean
                                                )
                                              }
                                            />
                                            <label
                                              htmlFor={credential.id}
                                              className="flex-1 cursor-pointer"
                                            >
                                              <div className="font-medium">
                                                {credential.type}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                ID: {credential.id.slice(0, 8)}
                                                ...
                                              </div>
                                            </label>
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() => handleRespondToRequest()}
                                      disabled={
                                        selectedCredentials.length === 0 ||
                                        respondMutation.isPending
                                      }
                                      className="gap-2"
                                    >
                                      {respondMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                      Send Proof
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="gap-2 bg-transparent"
                                      onClick={handleDeclineRequest}
                                      disabled={declineMutation.isPending}
                                    >
                                      {declineMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <X className="w-4 h-4" />
                                      )}
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            onClick={() => handleDeclineRequest(request)}
                            disabled={declineMutation.isPending}
                          >
                            {declineMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {request.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Types: {request.requestedTypes.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {request.expiresAt &&
                            new Date(request.expiresAt) < new Date() && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </Badge>
                            )}
                          <span className="text-muted-foreground">
                            {request.expiresAt
                              ? Math.ceil(
                                  (new Date(request.expiresAt).getTime() -
                                    new Date().getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : "∞"}{" "}
                            days left
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No pending requests
                    </h3>
                    <p className="text-muted-foreground">
                      You're all caught up! New proof requests will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {responsesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : respondedRequests.length > 0 ? (
            respondedRequests.map((response: any) => (
              <Card key={response.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {response.proofRequest.title}
                        <Badge variant="default">Responded</Badge>
                      </CardTitle>
                      <CardDescription>
                        {response.proofRequest.verifier.institutionName ||
                          `${response.proofRequest.verifier.firstName || ""} ${
                            response.proofRequest.verifier.lastName || ""
                          }`.trim() ||
                          response.proofRequest.verifier.walletAddress?.slice(
                            0,
                            8
                          ) + "..."}{" "}
                        • Responded on{" "}
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {response.proofRequest.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <Badge
                      variant={
                        response.status === "ACCEPTED" ? "default" : "secondary"
                      }
                    >
                      {response.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No response history
                </h3>
                <p className="text-muted-foreground">
                  Your proof responses will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
