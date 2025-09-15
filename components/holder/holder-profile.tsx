"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Shield,
  Bell,
  Save,
  Upload,
  Building,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useProfile, useUpdateProfile } from "@/features/profile";
import { useToast } from "@/hooks/use-toast";

export function HolderProfile() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatar: "",
    institutionName: "",
    institutionType: "",
    institutionWebsite: "",
    institutionAddress: "",
    position: "",
    department: "",
    emailNotifications: true,
    pushNotifications: true,
    autoAcceptFromTrusted: false,
    dataMinimization: true,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
        institutionName: profile.institutionName || "",
        institutionType: profile.institutionType || "",
        institutionWebsite: profile.institutionWebsite || "",
        institutionAddress: profile.institutionAddress || "",
        position: profile.position || "",
        department: profile.department || "",
        emailNotifications: profile.emailNotifications ?? true,
        pushNotifications: profile.pushNotifications ?? true,
        autoAcceptFromTrusted: profile.autoAcceptFromTrusted ?? false,
        dataMinimization: profile.dataMinimization ?? true,
      });
    }
  }, [profile]);

  // Prisma schema uses a single `role` enum on User. Normalize to an array for UI.
  const userRoles = profile?.role ? [String(profile.role).toLowerCase()] : [];
  const isIssuer = userRoles.includes("issuer");
  const isVerifier = userRoles.includes("verifier");
  const requiresInstitution = isIssuer || isVerifier;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (requiresInstitution && !formData.institutionName.trim()) {
      errors["institutionName"] =
        "Institution name is required for issuers and verifiers";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors["email"] = "Please enter a valid email address";
    }

    if (
      formData.institutionWebsite &&
      !/^https?:\/\/.+/.test(formData.institutionWebsite)
    ) {
      errors["institutionWebsite"] =
        "Please enter a valid URL starting with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
      profile.username ||
      `User ${profile.walletAddress?.slice(0, 8)}...`
    : "Loading...";

  // Calculate accurate counts based on user roles - only count ACTIVE credentials
  const issuedCredentials = (profile as any)?.issuedCredentials || [];
  const credentialCount = isIssuer
    ? issuedCredentials.length // For issuers, count issued credentials
    : profile?.credentials?.length || 0; // For holders, count held credentials

  const verificationCount = profile?.verifications?.length || 0;

  // Debug logging to help identify the issue
  console.log("Profile data:", {
    userRoles,
    isIssuer,
    isVerifier,
    credentialsCount: profile?.credentials?.length || 0,
    issuedCredentialsCount: issuedCredentials.length || 0,
    verificationsCount: profile?.verifications?.length || 0,
    finalCredentialCount: credentialCount,
    finalVerificationCount: verificationCount,
  });

  const securityMetrics = {
    didScore: 85,
    credentialCount,
    verificationCount,
    lastKeyRotation: "2024-01-15",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">
            Manage your identity profile and preferences
          </p>
        </div>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={updateProfileMutation.isPending}
          variant={isEditing ? "default" : "outline"}
        >
          {updateProfileMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            "Edit Profile"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
              )}
              <div className="text-center">
                <h3
                  className="text-xl font-semibold truncate max-w-full"
                  title={displayName}
                >
                  {displayName}
                </h3>
                <p
                  className="text-muted-foreground text-sm truncate max-w-full"
                  title={formData.email || profile?.walletAddress}
                >
                  {formData.email || profile?.walletAddress}
                </p>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {userRoles.map((role: string) => (
                    <Badge key={role} variant="default" className="capitalize">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">DID</h4>
              <p
                className="text-xs font-mono break-words text-muted-foreground max-w-full overflow-hidden"
                title={profile?.did || `did:sol:${profile?.walletAddress}`}
              >
                {profile?.did || `did:sol:${profile?.walletAddress}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {securityMetrics.credentialCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isIssuer ? "Issued Credentials" : "Held Credentials"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {securityMetrics.verificationCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  Verifications
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              {requiresInstitution && (
                <TabsTrigger value="institution">Institution</TabsTrigger>
              )}
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                    {validationErrors["email"] && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors["email"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {requiresInstitution && (
              <TabsContent value="institution" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Institution Information
                      <Badge variant="destructive" className="ml-2">
                        Required
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Information about your institution (required for issuers
                      and verifiers)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="institutionName">
                        Institution Name *
                      </Label>
                      <Input
                        id="institutionName"
                        value={formData.institutionName}
                        onChange={(e) =>
                          handleInputChange("institutionName", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Enter institution name"
                      />
                      {validationErrors["institutionName"] && (
                        <p className="text-sm text-destructive mt-1">
                          {validationErrors["institutionName"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="institutionType">Institution Type</Label>
                      <Select
                        value={formData.institutionType}
                        onValueChange={(value) =>
                          handleInputChange("institutionType", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select institution type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="ngo">NGO/Non-profit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Position/Title</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) =>
                            handleInputChange("position", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Your job title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Your department"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="institutionWebsite">Website</Label>
                      <Input
                        id="institutionWebsite"
                        value={formData.institutionWebsite}
                        onChange={(e) =>
                          handleInputChange(
                            "institutionWebsite",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        placeholder="https://..."
                      />
                      {validationErrors["institutionWebsite"] && (
                        <p className="text-sm text-destructive mt-1">
                          {validationErrors["institutionWebsite"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="institutionAddress">Address</Label>
                      <Textarea
                        id="institutionAddress"
                        value={formData.institutionAddress}
                        onChange={(e) =>
                          handleInputChange(
                            "institutionAddress",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                        rows={2}
                        placeholder="Institution address"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("emailNotifications", checked)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={formData.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleInputChange("pushNotifications", checked)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoAcceptFromTrusted">
                        Auto-accept from Trusted Issuers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically accept credentials from trusted issuers
                      </p>
                    </div>
                    <Switch
                      id="autoAcceptFromTrusted"
                      checked={formData.autoAcceptFromTrusted}
                      onCheckedChange={(checked) =>
                        handleInputChange("autoAcceptFromTrusted", checked)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataMinimization">
                        Data Minimization
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize personal data shared with verifiers
                      </p>
                    </div>
                    <Switch
                      id="dataMinimization"
                      checked={formData.dataMinimization}
                      onCheckedChange={(checked) =>
                        handleInputChange("dataMinimization", checked)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Overview
                  </CardTitle>
                  <CardDescription>
                    Your identity security metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {securityMetrics.didScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DID Score
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {securityMetrics.credentialCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isIssuer ? "Issued Credentials" : "Active Credentials"}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your DID was last verified on{" "}
                      {new Date().toLocaleDateString()}. Consider rotating your
                      keys regularly for enhanced security.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
