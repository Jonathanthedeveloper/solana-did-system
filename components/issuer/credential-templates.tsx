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
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  HelpCircle,
  Loader2,
} from "lucide-react";
import TemplateHelpPanel from "@/components/issuer/template-help";
import {
  useCredentialTemplates,
  useCreateCredentialTemplate,
  useUpdateCredentialTemplate,
  useDeleteCredentialTemplate,
  useDuplicateCredentialTemplate,
} from "@/features/templates";
import { useToast } from "@/hooks/use-toast";

export function CredentialTemplates() {
  const [showGuide, setShowGuide] = useState(false);
  const [showEditGuide, setShowEditGuide] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { data: templates, isLoading, error } = useCredentialTemplates();
  const createTemplate = useCreateCredentialTemplate();
  const updateTemplate = useUpdateCredentialTemplate();
  const deleteTemplate = useDeleteCredentialTemplate();
  const duplicateTemplate = useDuplicateCredentialTemplate();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "education",
    description: "",
    schema: {} as any,
  });

  if (isLoading) return <div>Loading templates...</div>;
  if (error) return <div>Error loading templates</div>;

  const filteredTemplates = (templates || []).filter((template: any) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description &&
        template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" ||
      template.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Credential Templates
          </h1>
          <p className="text-muted-foreground">
            Manage reusable credential templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsHelpOpen(true)}
            className="gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              setShowGuide(false);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Credential Template</DialogTitle>
              <DialogDescription>
                Create a reusable credential template for issuance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Input
                  placeholder="Name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Select
                  value={newTemplate.category}
                  onValueChange={(val) =>
                    setNewTemplate({ ...newTemplate, category: val })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="identity">Identity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Short description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      JSON schema (properties + required)
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGuide(!showGuide)}
                    >
                      {showGuide ? "Hide guide" : "Show guide"}
                    </Button>
                  </div>
                  {showGuide && (
                    <div className="p-3 bg-secondary/5 border rounded text-sm max-h-48 overflow-auto">
                      <div className="font-medium mb-1">
                        How to author a template schema
                      </div>
                      <ol className="list-decimal list-inside space-y-1 mb-2">
                        <li>
                          Define a top-level "properties" object with field
                          names.
                        </li>
                        <li>
                          For each field, include a "type" (string, number,
                          boolean) and optional "title" for display.
                        </li>
                        <li>
                          Use the "required" array to mark required fields by
                          name.
                        </li>
                        <li>
                          Keep the schema simple — only include the fields you
                          will collect when issuing.
                        </li>
                      </ol>
                      <div className="font-medium">Example</div>
                      <pre className="text-xs p-2 mt-1 bg-gray-800 text-white rounded overflow-auto max-h-40">{`{
  "properties": {
    "name": { "type": "string", "title": "Full name" },
    "degree": { "type": "string", "title": "Degree" },
    "graduationYear": { "type": "number", "title": "Graduation year" }
  },
  "required": ["name", "degree"]
}`}</pre>
                    </div>
                  )}

                  <textarea
                    className="w-full h-40 p-2 border rounded"
                    placeholder='Example: { "properties": { "name": { "type": "string", "title": "Full name" } }, "required": ["name"] }'
                    value={JSON.stringify(newTemplate.schema)}
                    onChange={(e) => {
                      try {
                        setNewTemplate({
                          ...newTemplate,
                          schema: JSON.parse(e.target.value),
                        });
                      } catch (err) {
                        setNewTemplate({
                          ...newTemplate,
                          schema: e.target.value as any,
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={createTemplate.isPending}
                  onClick={async () => {
                    try {
                      const created = await createTemplate.mutateAsync({
                        name: newTemplate.name,
                        category: newTemplate.category,
                        description: newTemplate.description,
                        schema: newTemplate.schema,
                      });
                      toast({
                        title: "Template created",
                        description: `${created.name} created`,
                      });
                      setIsCreateOpen(false);
                      setNewTemplate({
                        name: "",
                        category: "education",
                        description: "",
                        schema: {} as any,
                      });
                    } catch (err) {
                      console.error(err);
                      try {
                        const parsed = JSON.parse((err as any).message);
                        toast({
                          title: "Validation error",
                          description: parsed[0]?.message || "Invalid template",
                        });
                      } catch (_) {
                        toast({
                          title: "Error",
                          description: "Failed to create template",
                        });
                      }
                    }
                  }}
                >
                  {createTemplate.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredTemplates || []).map((template: any) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant={getStatusColor(template.status) as any}>
                  {template.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {template.usage ?? 0} uses
                </span>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {template.created
                      ? new Date(template.created).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last used:</span>
                  <span>
                    {template.lastUsed
                      ? new Date(template.lastUsed).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fields:</span>
                  <span>
                    {Array.isArray(template.fields)
                      ? template.fields.length
                      : template.schema?.properties
                      ? Object.keys(template.schema.properties).length
                      : 0}
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
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                      <DialogDescription>
                        {selectedTemplate?.description}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Template Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Category:
                                </span>
                                <span>{selectedTemplate.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Created:
                                </span>
                                <span>
                                  {selectedTemplate.createdAt
                                    ? new Date(
                                        selectedTemplate.createdAt
                                      ).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Updated:
                                </span>
                                <span>
                                  {selectedTemplate.updatedAt
                                    ? new Date(
                                        selectedTemplate.updatedAt
                                      ).toLocaleDateString()
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">
                              Template Schema
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(
                                selectedTemplate.schema?.properties || {}
                              ).map(
                                (
                                  [key, value]: [string, any],
                                  index: number
                                ) => (
                                  <div
                                    key={index}
                                    className="text-sm p-2 border rounded"
                                  >
                                    <div className="font-medium">
                                      {(value as any).title || key}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {(value as any).type}{" "}
                                      {selectedTemplate.schema?.required?.includes(
                                        key
                                      ) && "(required)"}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditGuide(false);
                    setEditTemplate(template);
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={duplicateTemplate.isPending}
                  onClick={() => {
                    duplicateTemplate.mutate(template.id, {
                      onSettled(data) {
                        toast({
                          title: "Template copied",
                          description: `${data.name} created`,
                        });
                      },
                      onError(error) {
                        console.error(error);
                        toast({
                          title: "Error",
                          description: "Failed to copy template",
                        });
                      },
                    });
                  }}
                >
                  {duplicateTemplate.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setEditTemplate(template);
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Edit an existing credential template.
            </DialogDescription>
          </DialogHeader>
          {editTemplate && (
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Name"
                value={editTemplate.name}
                onChange={(e) =>
                  setEditTemplate({ ...editTemplate, name: e.target.value })
                }
              />
              <Select
                value={editTemplate.category}
                onValueChange={(val) =>
                  setEditTemplate({ ...editTemplate, category: val })
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Short description"
                value={editTemplate.description}
                onChange={(e) =>
                  setEditTemplate({
                    ...editTemplate,
                    description: e.target.value,
                  })
                }
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    JSON schema (properties + required)
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditGuide(!showEditGuide)}
                  >
                    {showEditGuide ? "Hide guide" : "Show guide"}
                  </Button>
                </div>
                {showEditGuide && (
                  <div className="p-3 bg-secondary/5 border rounded text-sm max-h-48 overflow-auto">
                    <div className="font-medium mb-1">
                      How to author a template schema
                    </div>
                    <ol className="list-decimal list-inside space-y-1 mb-2">
                      <li>
                        Define a top-level "properties" object with field names.
                      </li>
                      <li>
                        For each field, include a "type" (string, number,
                        boolean) and optional "title" for display.
                      </li>
                      <li>
                        Use the "required" array to mark required fields by
                        name.
                      </li>
                      <li>
                        Keep the schema simple — only include the fields you
                        will collect when issuing.
                      </li>
                    </ol>
                    <div className="font-medium">Example</div>
                    <pre className="text-xs p-2 mt-1 bg-gray-800 text-white rounded overflow-auto max-h-40">{`{
  "properties": {
    "name": { "type": "string", "title": "Full name" },
    "degree": { "type": "string", "title": "Degree" },
    "graduationYear": { "type": "number", "title": "Graduation year" }
  },
  "required": ["name", "degree"]
}`}</pre>
                  </div>
                )}

                <textarea
                  className="w-full h-40 p-2 border rounded"
                  value={JSON.stringify(editTemplate.schema)}
                  onChange={(e) => {
                    try {
                      setEditTemplate({
                        ...editTemplate,
                        schema: JSON.parse(e.target.value),
                      });
                    } catch (err) {
                      setEditTemplate({
                        ...editTemplate,
                        schema: e.target.value as any,
                      });
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const updated = await updateTemplate.mutateAsync({
                        id: editTemplate.id,
                        name: editTemplate.name,
                        category: editTemplate.category,
                        description: editTemplate.description,
                        schema: editTemplate.schema,
                      });
                      toast({
                        title: "Template updated",
                        description: `${updated.name} saved`,
                      });
                      setIsEditOpen(false);
                      setEditTemplate(null);
                    } catch (err) {
                      console.error(err);
                      try {
                        const parsed = JSON.parse((err as any).message);
                        toast({
                          title: "Validation error",
                          description: parsed[0]?.message || "Invalid template",
                        });
                      } catch (_) {
                        toast({
                          title: "Error",
                          description: "Failed to update template",
                        });
                      }
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteTemplate.isPending}
              onClick={async () => {
                try {
                  if (!editTemplate) return;
                  await deleteTemplate.mutateAsync(editTemplate.id);
                  toast({
                    title: "Deleted",
                    description: `${editTemplate.name} deleted`,
                  });
                  setIsDeleteOpen(false);
                  setEditTemplate(null);
                } catch (err) {
                  console.error(err);
                  toast({
                    title: "Error",
                    description: "Failed to delete template",
                  });
                }
              }}
            >
              {deleteTemplate.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first credential template to get started"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Help panel */}
      {isHelpOpen && (
        <div className="fixed right-4 top-20 z-50">
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="mb-2 w-full"
              onClick={() => setIsHelpOpen(false)}
            >
              Close
            </Button>
            <TemplateHelpPanel />
          </div>
        </div>
      )}
    </div>
  );
}
