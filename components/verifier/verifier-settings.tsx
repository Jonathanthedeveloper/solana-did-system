"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Bell, Save } from "lucide-react"

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
  })

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verifier Settings</h1>
          <p className="text-muted-foreground">Configure your verification preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Organization Information
              </CardTitle>
              <CardDescription>Update your organization details</CardDescription>
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
                      organization: { ...settings.organization, name: e.target.value },
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
                      organization: { ...settings.organization, contactEmail: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Verification Rules
              </CardTitle>
              <CardDescription>Configure how credentials are verified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-accept">Auto-accept from trusted issuers</Label>
                  <p className="text-sm text-muted-foreground">Automatically accept credentials from trusted issuers</p>
                </div>
                <Switch
                  id="auto-accept"
                  checked={settings.verification.autoAcceptTrustedIssuers}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      verification: { ...settings.verification, autoAcceptTrustedIssuers: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-expired">Allow expired credentials</Label>
                  <p className="text-sm text-muted-foreground">Accept credentials that have expired</p>
                </div>
                <Switch
                  id="allow-expired"
                  checked={settings.verification.allowExpiredCredentials}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      verification: { ...settings.verification, allowExpiredCredentials: checked },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max-verification-time">Max Verification Time (seconds)</Label>
                <Input
                  id="max-verification-time"
                  type="number"
                  min="1"
                  max="300"
                  value={settings.verification.maxVerificationTime}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      verification: {
                        ...settings.verification,
                        maxVerificationTime: Number.parseInt(e.target.value),
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
              <CardDescription>Configure when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-alerts">Email alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={settings.notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailAlerts: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verification-results">Verification results</Label>
                  <p className="text-sm text-muted-foreground">Get notified when verifications complete</p>
                </div>
                <Switch
                  id="verification-results"
                  checked={settings.notifications.verificationResults}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, verificationResults: checked },
                    })
                  }
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
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Require two-factor authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for account access</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireTwoFactor: checked },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="session-timeout">Session timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
