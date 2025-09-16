"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { issueCredentialSchema } from "@/lib/validation/schemas";
import { DynamicField } from "../ui/dynamic-field";
import { toast } from "sonner";

export function IssueCredential() {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const searchParams = useSearchParams();
  const { data: templates = [] } = useCredentialTemplates();
  const issueCredentialMutation = useIssueCredential();

  const form = useForm({
    resolver: zodResolver(issueCredentialSchema),
    defaultValues: {
      subjectDid: "",
      type: "",
      claims: {},
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState,
    control,
  } = form;

  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) setSelectedTemplate(templateParam);
  }, [searchParams]);

  const selectedTemplateData = templates.find(
    (t: any) => t.id === selectedTemplate
  );

  useEffect(() => {
    const type =
      selectedTemplateData?.name || (selectedTemplate && "Custom Credential");
    if (type) setValue("type", type);
    if (!getValues().claims) setValue("claims", {} as any);
  }, [selectedTemplate, selectedTemplateData]);

  const onSubmit = (data: any) => {
    if (!selectedTemplate) {
      toast.info("Missing Template", {
        description: "Please select a credential template.",
      });
      return;
    }

    issueCredentialMutation.mutate(
      {
        subjectDid: data.subjectDid.trim(),
        type: data.type,
        claims: data.claims,
      },
      {
        onSuccess: () => {
          toast.success("Credential Issued", {
            description: "The credential has been successfully issued.",
          });
          form.reset();
          setSelectedTemplate("");
        },
        onError: (error: any) => {
          toast.error("Issuance Failed", {
            description:
              error?.message || "An error occurred during credential issuance.",
          });
        },
      }
    );
  };

  const handleIssueCredential = () => {
    const values = getValues();
    if (!values.type) {
      setValue("type", selectedTemplateData?.name || "Custom Credential");
    }
    if (!values.claims) {
      setValue("claims", {} as any);
    }
    if (values.subjectDid) {
      setValue("subjectDid", values.subjectDid.trim());
    }
    handleSubmit(onSubmit)();
  };

  const preview = useMemo(() => {
    const values = getValues();
    const issuerDid =
      selectedTemplateData?.issuer ?? "did:solana:exampleIssuer";

    return {
      id: `vc-${Date.now()}`,
      title: values.type || selectedTemplateData?.name || "Credential",
      issuer: issuerDid,
      type: values.type || selectedTemplateData?.name || "Credential",
      status: "DRAFT",
      issuedDate: new Date().toISOString(),
      credentialSubject: {
        id: values.subjectDid,
        ...values.claims,
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: `${issuerDid}#key-1`,
      },
    };
  }, [watch(["subjectDid", "claims", "type"]), selectedTemplateData]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issue Credential</h1>
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
              !watch("subjectDid") ||
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
        // Preview Mode
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Credential Preview
            </CardTitle>
            <CardDescription>
              Preview of the credential to be issued
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        // Edit Mode
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
              {templates.map((template: any) => (
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
            {/* Recipient */}
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
                    {...register("subjectDid")}
                  />
                  {formState.errors.subjectDid && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.errors.subjectDid.message as string}
                    </p>
                  )}
                </div>
                <input type="hidden" {...register("type")} />
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
                    <DynamicField
                      key={key}
                      name={`claims.${key}`}
                      fieldDef={field}
                      required={selectedTemplateData.schema.required?.includes(
                        key
                      )}
                      control={control}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {!selectedTemplate && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Please select a credential template to begin filling out the
                  form.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
