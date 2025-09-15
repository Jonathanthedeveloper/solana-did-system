"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  User,
  Shield,
  Send,
  Eye,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useCredentialTemplates } from "@/features/templates";
import { useIssueCredential } from "@/features/credentials";
import { useToast } from "@/hooks/use-toast";
import { useValidatedForm } from "@/hooks/use-validated-form";
import { issueCredentialSchema } from "@/lib/validation/schemas";

export function IssueCredential() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const searchParams = useSearchParams();
  const { data: templates } = useCredentialTemplates();
  const issueCredentialMutation = useIssueCredential();
  const { toast } = useToast();

  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      setSelectedTemplate(templateParam);
    }
  }, [searchParams]);

  const form = useValidatedForm({
    schema: issueCredentialSchema,
    onSubmit: async (data) => {
      if (!selectedTemplate) {
        toast({
          title: "Missing Template",
          description: "Please select a credential template.",
          variant: "destructive",
        });
        return;
      }

      issueCredentialMutation.mutate({
        subjectDid: data.subjectDid,
        type: data.type,
        claims: data.claims,
      });
    },
    onError: (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to issue credential. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedTemplateData = templates?.find(
    (t: any) => t.id === selectedTemplate
  );

  // Keep the credential `type` in the form state in sync with the selected template
  useEffect(() => {
    if (!form) return;
    if (selectedTemplateData?.name) {
      form.setValue("type", selectedTemplateData.name);
    } else if (selectedTemplate) {
      form.setValue("type", "Custom Credential");
    }
  }, [selectedTemplateData, selectedTemplate, form]);

  const handleIssueCredential = () => {
    form.submitForm();
  };

  const generatePreview = () => {
    const formData = form.watch();
    return {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: [
        "VerifiableCredential",
        formData.type?.replace(/\s+/g, "") || "",
      ],
      issuer: "did:sol:issuer:3FHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp",
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: formData.subjectDid,
        ...formData.claims,
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod:
          "did:sol:issuer:3FHneW46xGXgs5mUiveU4sbTyGBzmstUspZxkoPG9aNp#key-1",
        proofPurpose: "assertionMethod",
      },
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Issue Credential
          </h1>
          <p className="text-muted-foreground">
            Create and issue verifiable credentials to holders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button
            onClick={handleIssueCredential}
            disabled={
              !selectedTemplate ||
              !form.watch("subjectDid") ||
              issueCredentialMutation.isPending
            }
          >
            {issueCredentialMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {issueCredentialMutation.isPending
              ? "Issuing..."
              : "Issue Credential"}
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Credential Preview
            </CardTitle>
            <CardDescription>
              Preview of the credential that will be issued
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(generatePreview(), null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select Template
              </CardTitle>
              <CardDescription>Choose a credential template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(templates || []).map((template: any) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Credential Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Recipient Information
                </CardTitle>
                <CardDescription>
                  Specify the credential recipient
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipient-did">Recipient DID *</Label>
                  <Input
                    id="recipient-did"
                    placeholder="did:sol:..."
                    {...form.register("subjectDid")}
                  />
                  {form.formState.errors.subjectDid && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.subjectDid.message}
                    </p>
                  )}
                </div>
                {/* Hidden type field - gets value from selected template */}
                <input
                  type="hidden"
                  {...form.register("type")}
                  value={selectedTemplateData?.name || "Custom Credential"}
                />
              </CardContent>
            </Card>

            {/* Credential Data */}
            {selectedTemplateData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Credential Data
                  </CardTitle>
                  <CardDescription>
                    Fill in the credential information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(
                    selectedTemplateData.schema.properties || {}
                  ).map(([key, field]: [string, any]) => (
                    <div key={key}>
                      <Label htmlFor={key}>
                        {field.title || key}{" "}
                        {selectedTemplateData.schema.required?.includes(key) &&
                          "*"}
                      </Label>
                      {field.type === "string" && (
                        <Input
                          id={key}
                          {...form.register(`claims.${key}`)}
                        />
                      )}
                      {field.type === "number" && (
                        <Input
                          id={key}
                          type="number"
                          {...form.register(`claims.${key}`, { valueAsNumber: true })}
                        />
                      )}
                      {field.type === "boolean" && (
                        <Select
                          {...form.register(`claims.${key}`, { 
                            setValueAs: (value) => value === "true" 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {field.enum && (
                        <Select
                          {...form.register(`claims.${key}`)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.enum.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Issue Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Issuance Settings</CardTitle>
                <CardDescription>
                  Configure credential issuance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Expiry date field removed - API doesn't support it yet */}
              </CardContent>
            </Card>

            {!selectedTemplate && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Please select a credential template to begin filling out the
                  credential information.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
