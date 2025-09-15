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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  Save,
  Upload,
  AlertTriangle,
  Building,
  GraduationCap,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useProfile, useUpdateProfile } from "@/features/profile";
import { useToast } from "@/hooks/use-toast";
import { useLiveRegion } from "@/lib/accessibility";

interface SettingsData {
  profile: {
    firstName: string;
    lastName: string;
    bio: string;
    avatar: string;
    email: string;
  };
  institution: {
    name: string;
    type: string;
    website: string;
    address: string;
    position: string;
    department: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    verificationResults: boolean;
    credentialUpdates: boolean;
    proofRequests: boolean;
    securityAlerts: boolean;
  };
  privacy: {
    dataMinimization: boolean;
    autoAcceptFromTrusted: boolean;
    profileVisibility: "public" | "private" | "contacts";
    activityVisibility: "public" | "private" | "contacts";
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    loginAlerts: boolean;
    deviceTracking: boolean;
  };
  issuer: {
    defaultCredentialExpiry: number;
    autoRevokeOnViolation: boolean;
    requireHolderConsent: boolean;
    batchIssuance: boolean;
  };
  verifier: {
    autoAcceptTrustedIssuers: boolean;
    allowExpiredCredentials: boolean;
    maxVerificationTime: number;
    requireProofDetails: boolean;
  };
  holder: {
    autoShareCredentials: boolean;
    credentialBackup: boolean;
    proofRequestNotifications: boolean;
    defaultSharingDuration: number;
  };
}

export function UnifiedSettings() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { announce, liveRef } = useLiveRegion();

  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      firstName: "",
      lastName: "",
      bio: "",
      avatar: "",
      email: "",
    },
    institution: {
      name: "",
      type: "",
      website: "",
      address: "",
      position: "",
      department: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      verificationResults: true,
      credentialUpdates: true,
      proofRequests: true,
      securityAlerts: true,
    },
    privacy: {
      dataMinimization: true,
      autoAcceptFromTrusted: false,
      profileVisibility: "private",
      activityVisibility: "private",
    },
    security: {
      sessionTimeout: 60,
      requireTwoFactor: false,
      loginAlerts: true,
      deviceTracking: true,
    },
    issuer: {
      defaultCredentialExpiry: 365,
      autoRevokeOnViolation: false,
      requireHolderConsent: true,
      batchIssuance: false,
    },
    verifier: {
      autoAcceptTrustedIssuers: false,
      allowExpiredCredentials: false,
      maxVerificationTime: 30,
      requireProofDetails: true,
    },
    holder: {
      autoShareCredentials: false,
      credentialBackup: true,
      proofRequestNotifications: true,
      defaultSharingDuration: 30,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load profile data into settings
  useEffect(() => {
    if (profile) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          bio: profile.bio || "",
          avatar: profile.avatar || "",
          email: profile.email || "",
        },
        institution: {
          name: profile.institutionName || "",
          type: profile.institutionType || "",
          website: profile.institutionWebsite || "",
          address: profile.institutionAddress || "",
          position: profile.position || "",
          department: profile.department || "",
        },
        notifications: {
          ...prev.notifications,
          emailNotifications: profile.emailNotifications ?? true,
          pushNotifications: profile.pushNotifications ?? true,
        },
        privacy: {
          ...prev.privacy,
          autoAcceptFromTrusted: profile.autoAcceptFromTrusted ?? false,
          dataMinimization: profile.dataMinimization ?? true,
        },
      }));
    }
  }, [profile]);

  const updateSetting = (
    section: keyof SettingsData,
    field: string,
    value: any
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // If user is issuer or verifier, institution name is required
      const userRoles = getUserRoles();
      if (
        (userRoles.includes("issuer") || userRoles.includes("verifier")) &&
        !settings.institution.name
      ) {
        setValidationError(
          "Institution name is required for issuer and verifier roles."
        );
        toast({
          title: "Invalid settings",
          description:
            "Institution name is required for issuer and verifier roles.",
          variant: "destructive",
        });
        setSaving(false);
        // Focus the institution input if available
        const el = document.getElementById(
          "institutionName"
        ) as HTMLInputElement | null;
        if (el) el.focus();
        return;
      }
      // Prepare profile update data
      const profileUpdate = {
        firstName: settings.profile.firstName,
        lastName: settings.profile.lastName,
        bio: settings.profile.bio,
        avatar: settings.profile.avatar,
        email: settings.profile.email,
        institutionName: settings.institution.name,
        institutionType: settings.institution.type,
        institutionWebsite: settings.institution.website,
        institutionAddress: settings.institution.address,
        position: settings.institution.position,
        department: settings.institution.department,
        emailNotifications: settings.notifications.emailNotifications,
        pushNotifications: settings.notifications.pushNotifications,
        autoAcceptFromTrusted: settings.privacy.autoAcceptFromTrusted,
        dataMinimization: settings.privacy.dataMinimization,
      };

      await updateProfile.mutateAsync(profileUpdate);

      // Here you would also save other settings to appropriate endpoints
      // For now, we'll just show a success message
      const successMessage = "Your settings have been updated successfully.";
      toast({
        title: "Settings saved",
        description: successMessage,
      });
      announce(successMessage);

      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error saving settings",
        description:
          "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getUserRoles = () => {
    // Prisma stores a single role enum on User (HOLDER | ISSUER | VERIFIER)
    // Normalize to lowercase strings for compatibility with existing UI checks
    if (!user || !user.role) return [];
    return [String(user.role).toLowerCase()];
  };

  const hasRole = (role: string) => {
    return getUserRoles().includes(role);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-8">
          <Settings className="w-8 h-8 animate-spin mr-2" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and system settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="gap-2"
            aria-describedby={hasChanges ? "unsaved-changes" : undefined}
            aria-label="Save all settings changes"
            aria-busy={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Settings className="w-4 h-4" />
            Role Settings
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={settings.profile.avatar} />
                  <AvatarFallback>
                    {settings.profile.firstName?.[0]}
                    {settings.profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) =>
                      updateSetting("profile", "firstName", e.target.value)
                    }
                    placeholder="Enter your first name"
                    aria-describedby="firstName-help"
                    required
                  />
                  <div id="firstName-help" className="sr-only">
                    Enter your legal first name as it appears on official
                    documents
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) =>
                      updateSetting("profile", "lastName", e.target.value)
                    }
                    placeholder="Enter your last name"
                    aria-describedby="lastName-help"
                    required
                  />
                  <div id="lastName-help" className="sr-only">
                    Enter your legal last name as it appears on official
                    documents
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) =>
                    updateSetting("profile", "email", e.target.value)
                  }
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) =>
                    updateSetting("profile", "bio", e.target.value)
                  }
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Institution Settings */}
          {(hasRole("issuer") || hasRole("verifier")) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Institution Information
                </CardTitle>
                <CardDescription>
                  Information about your organization or institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      id="institutionName"
                      value={settings.institution.name}
                      onChange={(e) =>
                        updateSetting("institution", "name", e.target.value)
                      }
                      placeholder="Enter institution name"
                    />
                    {validationError && (
                      <p className="text-xs text-destructive mt-1">
                        {validationError}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="institutionType">Institution Type</Label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={settings.institution.type}
                      onChange={(e) =>
                        updateSetting("institution", "type", e.target.value)
                      }
                    >
                      <option value="">Select type</option>
                      <option value="university">University</option>
                      <option value="company">Company</option>
                      <option value="government">Government</option>
                      <option value="ngo">NGO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.institution.website}
                    onChange={(e) =>
                      updateSetting("institution", "website", e.target.value)
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.institution.address}
                    onChange={(e) =>
                      updateSetting("institution", "address", e.target.value)
                    }
                    placeholder="Enter institution address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={settings.institution.position}
                      onChange={(e) =>
                        updateSetting("institution", "position", e.target.value)
                      }
                      placeholder="Your position/title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={settings.institution.department}
                      onChange={(e) =>
                        updateSetting(
                          "institution",
                          "department",
                          e.target.value
                        )
                      }
                      placeholder="Your department"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting(
                      "notifications",
                      "emailNotifications",
                      checked
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("notifications", "pushNotifications", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Activity Notifications</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verification Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when verifications are completed
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.verificationResults}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "notifications",
                        "verificationResults",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Credential Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about credential status changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.credentialUpdates}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "notifications",
                        "credentialUpdates",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Proof Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      New proof requests and responses
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.proofRequests}
                    onCheckedChange={(checked) =>
                      updateSetting("notifications", "proofRequests", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important security notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) =>
                      updateSetting("notifications", "securityAlerts", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your data privacy and sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Data Minimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Only share necessary data for verifications
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataMinimization}
                  onCheckedChange={(checked) =>
                    updateSetting("privacy", "dataMinimization", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">
                    Auto-accept from Trusted Issuers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically accept credentials from trusted sources
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.autoAcceptFromTrusted}
                  onCheckedChange={(checked) =>
                    updateSetting("privacy", "autoAcceptFromTrusted", checked)
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Who can see your profile information
                  </p>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={settings.privacy.profileVisibility}
                    onChange={(e) =>
                      updateSetting(
                        "privacy",
                        "profileVisibility",
                        e.target.value
                      )
                    }
                  >
                    <option value="public">Public</option>
                    <option value="contacts">Contacts Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base">Activity Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Who can see your activity history
                  </p>
                  <select
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={settings.privacy.activityVisibility}
                    onChange={(e) =>
                      updateSetting(
                        "privacy",
                        "activityVisibility",
                        e.target.value
                      )
                    }
                  >
                    <option value="public">Public</option>
                    <option value="contacts">Contacts Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "requireTwoFactor", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "loginAlerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Device Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track and manage your active sessions
                  </p>
                </div>
                <Switch
                  checked={settings.security.deviceTracking}
                  onCheckedChange={(checked) =>
                    updateSetting("security", "deviceTracking", checked)
                  }
                />
              </div>

              <Separator />

              <div>
                <Label className="text-base">Session Timeout (minutes)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Automatically log out after period of inactivity
                </p>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    updateSetting(
                      "security",
                      "sessionTimeout",
                      parseInt(e.target.value)
                    )
                  }
                  min="5"
                  max="480"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role-Specific Settings */}
        <TabsContent value="roles" className="space-y-6">
          {/* Issuer Settings */}
          {hasRole("issuer") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Issuer Settings
                </CardTitle>
                <CardDescription>
                  Configure your credential issuance preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Default Credential Expiry (days)</Label>
                  <Input
                    type="number"
                    value={settings.issuer.defaultCredentialExpiry}
                    onChange={(e) =>
                      updateSetting(
                        "issuer",
                        "defaultCredentialExpiry",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    max="3650"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-revoke on Policy Violation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically revoke credentials when policies are
                      violated
                    </p>
                  </div>
                  <Switch
                    checked={settings.issuer.autoRevokeOnViolation}
                    onCheckedChange={(checked) =>
                      updateSetting("issuer", "autoRevokeOnViolation", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Holder Consent</Label>
                    <p className="text-sm text-muted-foreground">
                      Require explicit consent before issuing credentials
                    </p>
                  </div>
                  <Switch
                    checked={settings.issuer.requireHolderConsent}
                    onCheckedChange={(checked) =>
                      updateSetting("issuer", "requireHolderConsent", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Batch Issuance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable batch credential issuance for multiple holders
                    </p>
                  </div>
                  <Switch
                    checked={settings.issuer.batchIssuance}
                    onCheckedChange={(checked) =>
                      updateSetting("issuer", "batchIssuance", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verifier Settings */}
          {hasRole("verifier") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Verifier Settings
                </CardTitle>
                <CardDescription>
                  Configure your verification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-accept from Trusted Issuers</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically accept credentials from trusted issuers
                    </p>
                  </div>
                  <Switch
                    checked={settings.verifier.autoAcceptTrustedIssuers}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "verifier",
                        "autoAcceptTrustedIssuers",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Expired Credentials</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept credentials that have expired
                    </p>
                  </div>
                  <Switch
                    checked={settings.verifier.allowExpiredCredentials}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "verifier",
                        "allowExpiredCredentials",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Proof Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Require detailed proof information in responses
                    </p>
                  </div>
                  <Switch
                    checked={settings.verifier.requireProofDetails}
                    onCheckedChange={(checked) =>
                      updateSetting("verifier", "requireProofDetails", checked)
                    }
                  />
                </div>

                <div>
                  <Label>Max Verification Time (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.verifier.maxVerificationTime}
                    onChange={(e) =>
                      updateSetting(
                        "verifier",
                        "maxVerificationTime",
                        parseInt(e.target.value)
                      )
                    }
                    min="5"
                    max="300"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Holder Settings */}
          {hasRole("holder") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Holder Settings
                </CardTitle>
                <CardDescription>
                  Configure your credential management preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-share Credentials</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically share credentials when requested
                    </p>
                  </div>
                  <Switch
                    checked={settings.holder.autoShareCredentials}
                    onCheckedChange={(checked) =>
                      updateSetting("holder", "autoShareCredentials", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Credential Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your credentials
                    </p>
                  </div>
                  <Switch
                    checked={settings.holder.credentialBackup}
                    onCheckedChange={(checked) =>
                      updateSetting("holder", "credentialBackup", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Proof Request Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when proof requests are received
                    </p>
                  </div>
                  <Switch
                    checked={settings.holder.proofRequestNotifications}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "holder",
                        "proofRequestNotifications",
                        checked
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Default Sharing Duration (days)</Label>
                  <Input
                    type="number"
                    value={settings.holder.defaultSharingDuration}
                    onChange={(e) =>
                      updateSetting(
                        "holder",
                        "defaultSharingDuration",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    max="365"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
