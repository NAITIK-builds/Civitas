import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Settings2, Bell, Shield, Key, Globe, UserCircle, Mail } from "lucide-react";

interface UserProfile {
  citizenId: string;
  email: string;
  region: string;
  points: number;
  isAdmin: boolean;
  notifications_enabled?: boolean;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  privacy_level?: 'public' | 'private' | 'friends';
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCivitasStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'private' | 'friends'>('public');
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('citizen_id', user?.citizenId)
          .single();

        if (error) throw error;

        const profileData: UserProfile = {
          citizenId: data.citizen_id,
          email: data.email || '',
          region: data.region || '',
          points: data.points || 0,
          isAdmin: data.is_admin || false,
          notifications_enabled: data.notifications_enabled !== false,
          language: data.language || 'en',
          theme: data.theme || 'system',
          privacy_level: data.privacy_level || 'public'
        };

        setProfile(profileData);
        setEmail(profileData.email);
        setRegion(profileData.region);
        setNotificationsEnabled(profileData.notifications_enabled || true);
        setLanguage(profileData.language || 'en');
        setTheme(profileData.theme || 'system');
        setPrivacyLevel(profileData.privacy_level || 'public');
      } catch (error: any) {
        toast.error('Error loading profile: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, navigate]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .update({
          email: email,
          region: region,
          notifications_enabled: notificationsEnabled,
          language: language,
          theme: theme,
          privacy_level: privacyLevel,
          updated_at: new Date().toISOString()
        })
        .eq('citizen_id', profile.citizenId);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Error updating password: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="main-content p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading settings...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gov-navy flex items-center gap-3">
                <Settings2 className="w-8 h-8" />
                Account Settings
              </h1>
              <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
            </div>
            <Badge className="bg-gov-navy">
              Citizen ID: {profile?.citizenId}
            </Badge>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gov-navy data-[state=active]:text-white"
              >
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gov-navy data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-gov-navy data-[state=active]:text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-gov-navy data-[state=active]:text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and region settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Your region"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="privacy">Privacy Level</Label>
                    <select
                      id="privacy"
                      value={privacyLevel}
                      onChange={(e) => setPrivacyLevel(e.target.value as 'public' | 'private' | 'friends')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="public">Public Profile</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleChangePassword}>
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive updates about your activity
                      </p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>System Preferences</CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
