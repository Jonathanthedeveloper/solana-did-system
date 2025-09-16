"use client";

import { useEffect, useState } from "react";
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
import { Settings, Bell, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/features/profile";

export function VerifierSettings() {
  const [settings, setSettings] = useState({
    organization: {
      name: "Acme Verification Services",
      contactEmail: "verify@acme.com",
    },
    verification: {
      autoAcceptTrustedIssuers: true,
      allowExpiredCredentials: false,
      maxVerificationTime: 30,
    },
    notifications: {
      emailAlerts: true,
      verificationResults: true,
    },
    security: {
      requireTwoFactor: true,
      sessionTimeout: 60,
    },
  });

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // populate from server profile when available
  useEffect(() => {
    if (!profile) return;
    setSettings((s) => ({
      ...s,
      organization: {
        name: profile.institutionName ?? s.organization.name,
        contactEmail: profile.email ?? s.organization.contactEmail,
      },
      notifications: {
        emailAlerts: profile.emailNotifications ?? s.notifications.emailAlerts,
        verificationResults: s.notifications.verificationResults,
      },
      verification: {
        ...s.verification,
        autoAcceptTrustedIssuers:
          profile.autoAcceptFromTrusted ??
          s.verification.autoAcceptTrustedIssuers,
      },
    }));
  }, [profile]);

  const handleSaveSettings = () => {
    const payload = {
      institutionName: settings.organization.name,
      email: settings.organization.contactEmail,
      emailNotifications: settings.notifications.emailAlerts,
      autoAcceptFromTrusted: settings.verification.autoAcceptTrustedIssuers,
    };

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Settings saved");
      },
      onError: (err: any) => {
        console.error("Failed to save settings", err);
        toast.error("Failed to save settings");
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Verifier Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your verification preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Update your organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={settings.organization.name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organization: {
                        ...settings.organization,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="org-email">Contact Email</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={settings.organization.contactEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      organization: {
                        ...settings.organization,
                        contactEmail: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-alerts">Email alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailAlerts: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verification-results">
                    Verification results
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when verifications complete
                  </p>
                </div>
                <Switch
                  id="verification-results"
                  checked={settings.notifications.verificationResults}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        verificationResults: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
