"use client";

import { useState, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FileText,
  Plus,
  Send,
  Eye,
  Clock,
  CheckCircle,
  Users,
  UserCheck,
  Globe,
} from "lucide-react";
import {
  useProofRequests,
  useCreateProofRequest,
  useUpdateProofResponse,
  useHolders,
} from "@/features/proof-requests";
import { useCredentialTemplates } from "@/features/templates";
import { SelectPills } from "../ui/select-pills";
import { id } from "date-fns/locale";

export function ProofRequestsManager() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    requestedTypes: [] as string[],
    expiresAt: "",
    targetingMode: "broadcast", // "broadcast" or "targeted"
    selectedHolders: [] as string[],
  });
  const { data: proofRequests } = useProofRequests();
  const { data: holders, isLoading: holdersLoading } = useHolders();
  const createProofRequestMutation = useCreateProofRequest();
  const updateResponseMutation = useUpdateProofResponse();
  const [holderFilter, setHolderFilter] = useState("");

  const holdersData = useMemo(
    () =>
      holders?.map((holder) => {
        return {
          id: holder.id,
          name:
            `${holder.firstName || ""} ${holder.lastName || ""}`.trim() ||
            holder.walletAddress,
        };
      }) || [],
    [holders]
  );

  // Derive available claim types from credential templates (template names)
  const { data: templates } = useCredentialTemplates();
  const availableClaims = useMemo<string[]>(() => {
    if (!templates || templates.length === 0) {
      // Fallback list if templates are not loaded yet
      return [];
    }

    const names = templates
      .map((t: any) => t.name)
      .filter(Boolean)
      .map((n: string) => n.trim());

    // unique
    return Array.from(new Set(names));
  }, [templates]);

  const activeRequests = (proofRequests || []).filter(
    (r: any) => r.status === "ACTIVE"
  );
  const completedRequests = (proofRequests || []).filter(
    (r: any) => r.status === "COMPLETED"
  );
  const draftRequests = (proofRequests || []).filter(
    (r: any) => r.status === "EXPIRED"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleClaimToggle = (claim: string, checked: boolean) => {
    if (checked) {
      setNewRequest((prev) => ({
        ...prev,
        requestedTypes: [...prev.requestedTypes, claim],
      }));
    } else {
      setNewRequest((prev) => ({
        ...prev,
        requestedTypes: prev.requestedTypes.filter((c: string) => c !== claim),
      }));
    }
  };

  const handleHolderToggle = (holderId: string, checked: boolean) => {
    if (checked) {
      setNewRequest((prev) => ({
        ...prev,
        selectedHolders: [...prev.selectedHolders, holderId],
      }));
    } else {
      setNewRequest((prev) => ({
        ...prev,
        selectedHolders: prev.selectedHolders.filter((id) => id !== holderId),
      }));
    }
  };

  const handleTargetingModeChange = (mode: string) => {
    setNewRequest((prev) => ({
      ...prev,
      targetingMode: mode,
      selectedHolders: mode === "broadcast" ? [] : prev.selectedHolders,
    }));
  };

  const handleUpdateResponseStatus = (responseId: string, status: string) => {
    updateResponseMutation.mutate(
      { id: responseId, status },
      {
        onSuccess: () => {
          // Refresh the proof requests data
          // The mutation will invalidate queries automatically
        },
      }
    );
  };

  const handleCreateRequest = () => {
    const targetHolders =
      newRequest.targetingMode === "targeted"
        ? newRequest.selectedHolders
        : undefined;

    // Intersect requested types with available claims derived from templates
    const requested = newRequest.requestedTypes.filter((t) =>
      availableClaims.includes(t)
    );

    createProofRequestMutation.mutate({
      title: newRequest.title,
      description: newRequest.description,
      requestedTypes: requested,
      ...(newRequest.expiresAt ? { expiresAt: newRequest.expiresAt } : {}),
      ...(targetHolders && targetHolders.length > 0 ? { targetHolders } : {}),
    });
    setNewRequest({
      title: "",
      description: "",
      requestedTypes: [],
      expiresAt: "",
      targetingMode: "broadcast",
      selectedHolders: [],
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proof Requests</h1>
          <p className="text-muted-foreground">
            Create and manage credential proof requests
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Proof Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Proof Request</DialogTitle>
              <DialogDescription>
                Set up a new credential verification request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Request Title</Label>
                  <Input
                    id="title"
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, title: e.target.value })
                    }
                    placeholder="e.g., University Degree Verification"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this proof request is for..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={newRequest.expiresAt}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, expiresAt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Required Claims</Label>
                {availableClaims.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableClaims.map((claim) => (
                      <div key={claim} className="flex items-center space-x-2">
                        <Checkbox
                          id={claim}
                          checked={newRequest.requestedTypes.includes(claim)}
                          onCheckedChange={(checked) =>
                            handleClaimToggle(claim, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={claim}
                          className="text-sm cursor-pointer"
                        >
                          {claim}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2">
                    No credential templates found. Create a credential template
                    to enable available claim types for proof requests.
                  </div>
                )}
              </div>
              <div>
                <Label>Targeting</Label>
                <RadioGroup
                  value={newRequest.targetingMode}
                  onValueChange={handleTargetingModeChange}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="broadcast" id="broadcast" />
                    <label
                      htmlFor="broadcast"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">Broadcast to all holders</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="targeted" id="targeted" />
                    <label
                      htmlFor="targeted"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm">Target specific holders</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>
              {newRequest.targetingMode === "targeted" && (
                <div>
                  <Label>Select Holders</Label>
                  <div className="mt-2">
                    {/* Selected holders as pills */}
                    <SelectPills
                      data={holdersData}
                      value={newRequest.selectedHolders}
                      onValueChange={(value) =>
                        setNewRequest((prev) => ({
                          ...prev,
                          selectedHolders: value,
                        }))
                      }
                      placeholder="Search holders..."
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateRequest}
                  disabled={
                    !newRequest.title ||
                    newRequest.requestedTypes.length === 0 ||
                    (newRequest.targetingMode === "targeted" &&
                      newRequest.selectedHolders.length === 0)
                  }
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently collecting
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Responses
            </CardTitle>
            <Users className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(proofRequests || []).reduce(
                (sum: number, req: any) => sum + (req.responses?.length || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Proofs received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Finished campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftRequests.length}</div>
            <p className="text-xs text-muted-foreground">Pending publication</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRequests.map((request: any) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {request.title}
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{request.description}</CardDescription>
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
                          <DialogTitle>{selectedRequest?.title}</DialogTitle>
                          <DialogDescription>
                            {selectedRequest?.description}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">
                                  Request Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Status:
                                    </span>
                                    <Badge
                                      variant={
                                        getStatusColor(
                                          selectedRequest.status
                                        ) as any
                                      }
                                    >
                                      {selectedRequest.status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Responses:
                                    </span>
                                    <span>
                                      {selectedRequest.responses?.length || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Created:
                                    </span>
                                    <span>
                                      {new Date(
                                        selectedRequest.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Expires:
                                    </span>
                                    <span>
                                      {selectedRequest.expiresAt
                                        ? new Date(
                                            selectedRequest.expiresAt
                                          ).toLocaleDateString()
                                        : "No expiration"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">
                                  Requested Types
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {selectedRequest.requestedTypes?.map(
                                    (type: string) => (
                                      <Badge key={type} variant="outline">
                                        {type}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Responses</h4>
                              <div className="space-y-2">
                                {selectedRequest.responses?.map(
                                  (response: any) => (
                                    <div
                                      key={response.id}
                                      className="flex items-center justify-between p-3 border rounded"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {response.holder.did ||
                                            response.holder.walletAddress}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {new Date(
                                            response.submittedAt
                                          ).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {
                                            JSON.parse(
                                              response.presentedCredentialsJson ||
                                                "[]"
                                            ).length
                                          }{" "}
                                          credentials presented
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant={
                                            response.status === "ACCEPTED"
                                              ? "default"
                                              : response.status === "REJECTED"
                                              ? "destructive"
                                              : "secondary"
                                          }
                                        >
                                          {response.status}
                                        </Badge>
                                        {response.status === "PENDING" && (
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleUpdateResponseStatus(
                                                  response.id,
                                                  "ACCEPTED"
                                                )
                                              }
                                            >
                                              Accept
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleUpdateResponseStatus(
                                                  response.id,
                                                  "REJECTED"
                                                )
                                              }
                                            >
                                              Reject
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                ) || (
                                  <div className="text-sm text-muted-foreground">
                                    No responses yet
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Types: {request.requestedTypes?.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">
                        {request.responses?.length || 0}
                      </span>
                      <span className="text-muted-foreground"> responses</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires:{" "}
                      {request.expiresAt
                        ? new Date(request.expiresAt).toLocaleDateString()
                        : "No expiration"}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (request.responses / request.expectedResponses) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedRequests.map((request: any) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {request.title}
                      <Badge variant="secondary">Completed</Badge>
                    </CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Results
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{request.responses}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      responses collected
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed: {new Date(request.deadline).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {draftRequests.map((request: any) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {request.title}
                      <Badge variant="outline">Draft</Badge>
                    </CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-1" />
                      Publish
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">{request.targetAudience}</Badge>
                  <span className="text-muted-foreground">
                    Claims: {request.requiredClaims.join(", ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
