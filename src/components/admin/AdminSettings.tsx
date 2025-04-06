
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function AdminSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    siteName: "CuckoldMemeGen",
    freeMemesCount: 5,
    subscriptionPrice: 9.99,
    enableNotifications: true,
    enableRealTimeUpdates: true,
    enableAdminAlerts: true,
    enableAnalytics: true
  });

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    }, 1000);
  };

  const handleChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure and customize your application.
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general site settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the name that appears in the header of your site.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Site Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                    />
                    <Button variant="outline">Upload</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="realTimeUpdates">Enable Real-Time Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Show real-time updates for meme creation and user activities.
                      </p>
                    </div>
                    <Switch
                      id="realTimeUpdates"
                      checked={settings.enableRealTimeUpdates}
                      onCheckedChange={(checked) => handleChange("enableRealTimeUpdates", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Enable Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Track and analyze user behavior and site performance.
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={settings.enableAnalytics}
                      onCheckedChange={(checked) => handleChange("enableAnalytics", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
              <CardDescription>
                Configure subscription plans and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="freeMemesCount">Free Memes Count</Label>
                  <Input
                    id="freeMemesCount"
                    type="number"
                    value={settings.freeMemesCount}
                    onChange={(e) => handleChange("freeMemesCount", parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of free memes users can create before requiring a subscription.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionPrice">Subscription Price ($/month)</Label>
                  <Input
                    id="subscriptionPrice"
                    type="number"
                    step="0.01"
                    value={settings.subscriptionPrice}
                    onChange={(e) => handleChange("subscriptionPrice", parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Monthly subscription price for premium features.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Stripe Configuration</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your Stripe API keys for payment processing.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                    <Input id="stripePublicKey" type="password" placeholder="pk_test_..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                    <Input id="stripeSecretKey" type="password" placeholder="sk_test_..." />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                    <Input id="stripeWebhookSecret" type="password" placeholder="whsec_..." />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableNotifications">User Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to users for important events.
                      </p>
                    </div>
                    <Switch
                      id="enableNotifications"
                      checked={settings.enableNotifications}
                      onCheckedChange={(checked) => handleChange("enableNotifications", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAdminAlerts">Admin Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive admin alerts for important system events.
                      </p>
                    </div>
                    <Switch
                      id="enableAdminAlerts"
                      checked={settings.enableAdminAlerts}
                      onCheckedChange={(checked) => handleChange("enableAdminAlerts", checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Notification Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address for receiving admin notifications.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced system settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dbBackup">Database Backup</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      Export Database
                    </Button>
                    <Button variant="outline">
                      Import Database
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export or import database backups.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="systemLogs">System Logs</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      View Logs
                    </Button>
                    <Button variant="outline">
                      Clear Logs
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View or clear system logs.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-destructive">Danger Zone</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="destructive">
                      Reset System
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reset the system to its default state. This action cannot be undone.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
