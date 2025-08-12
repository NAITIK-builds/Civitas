import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Shield, Users, Lock, AlertCircle, Plus, Activity, Check, UserPlus, Star, Camera, Image as ImageIcon, Video, Trash2 } from "lucide-react";

interface UserMedia {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  title: string;
  description?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface SupabaseUser {
  id: string;
  citizenId: string; // Matching the store's User type
  email: string;
  region: string;
  points: number;
  isAdmin: boolean;  // Matching the store's User type
  created_at: string;
  last_sign_in: string | null;
  media?: UserMedia[]; // Added media field
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated
  } = useCivitasStore();

  // PIN Authentication States
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // User Management States
  const [allUsersData, setAllUsersData] = useState<SupabaseUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userMediaData, setUserMediaData] = useState<any[]>([]);

  // Admin PIN Constants
  const ADMIN_PIN = "2024";
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

  // Convert Supabase profile to our format
  const convertProfile = (profile: any): SupabaseUser => ({
    id: profile.id,
    citizenId: profile.citizen_id, // Converting from snake_case to camelCase
    email: profile.email || 'N/A',
    region: profile.region || 'Unknown',
    points: profile.points || 0,
    isAdmin: profile.is_admin || false,
    created_at: profile.created_at || new Date().toISOString(),
    last_sign_in: profile.last_sign_in || null
  });

  // Fetch all users from Supabase
  // Fetch all media with user information
  const fetchAllMedia = async () => {
    if (!pinAuthenticated) return;
    try {
      const { data, error } = await supabase
        .from('user_media')
        .select(`
          *,
          profiles:user_id (
            citizen_id,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserMediaData(data || []);
    } catch (error: any) {
      toast.error('Error fetching media: ' + error.message);
    }
  };

  // Function to render media content
  const renderMediaContent = (media: any) => {
    if (media.file_type.startsWith('image/')) {
      return (
        <img
          src={media.file_url}
          alt={media.title || 'User media'}
          className="w-full h-full object-cover"
        />
      );
    } else if (media.file_type.startsWith('video/')) {
      return (
        <video
          src={media.file_url}
          controls
          className="w-full h-full object-cover"
        />
      );
    }
    return null;
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      // Delete from storage
      const filePath = fileUrl.split('/').slice(-2).join('/'); // Get relative path
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      toast.success('Media deleted successfully');
      fetchAllMedia(); // Refresh media list
    } catch (error: any) {
      toast.error('Error deleting media: ' + error.message);
    }
  };

  const fetchAllUsers = async () => {
    if (!pinAuthenticated) return;
    setIsLoadingUsers(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });

      if (profilesError) {
        toast.error('Error fetching profiles: ' + profilesError.message);
        return;
      }

      // Fetch media for each user
      const usersWithMedia = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: media } = await supabase
            .from('user_media')
            .select('*')
            .eq('user_id', profile.citizen_id);
          return {
            ...convertProfile(profile),
            media: media || []
          };
        })
      );

      setAllUsersData(usersWithMedia);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch users and media when authenticated
  useEffect(() => {
    if (pinAuthenticated) {
      fetchAllUsers();
      fetchAllMedia();
    }
  }, [pinAuthenticated]);

  // PIN verification function
  const verifyPin = () => {
    if (isLocked) {
      setPinError("Access temporarily locked. Please try again later.");
      return;
    }

    if (pinInput === ADMIN_PIN) {
      setPinAuthenticated(true);
      setPinError("");
      setAttemptCount(0);
      setPinInput("");
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setPinError(`Too many failed attempts. Access locked for 5 minutes.`);
        // Reset lockout after timeout
        setTimeout(() => {
          setIsLocked(false);
          setAttemptCount(0);
          setPinError("");
        }, LOCKOUT_TIME);
      } else {
        setPinError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`);
      }
      setPinInput("");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin();
  };

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPin();
    }
  };

  const handleEditUser = async (citizenId: string) => {
    const userData = allUsersData.find(u => u.citizenId === citizenId);
    if (!userData) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          citizen_id: citizenId,
          points: userData.points,
          region: userData.region,
          is_admin: userData.isAdmin
        })
        .eq('citizen_id', citizenId);

      if (error) throw error;

      toast.success('User updated successfully');
      await fetchAllUsers();
    } catch (error: any) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (citizenId: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${citizenId}?`)) return;
    
    try {
      // First check if this is not the current user
      if (user?.citizenId === citizenId) {
        toast.error("Cannot delete the currently logged-in user!");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('citizen_id', citizenId);

      if (error) throw error;

      toast.success('User deleted successfully');
      await fetchAllUsers();
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="main-content">
          <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto text-center">
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <Lock className="w-12 h-12 text-gov-navy mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gov-navy mb-4">Authentication Required</h2>
                  <p className="text-gray-600 mb-6">Please login first to access the admin panel.</p>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gov-navy hover:bg-gov-navy/90"
                  >
                    Go to Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!pinAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="main-content">
          <div className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gov-navy text-white text-center p-6">
                  <Shield className="w-12 h-12 mx-auto mb-4" />
                  <CardTitle className="text-2xl">Government Admin Access</CardTitle>
                  <CardDescription className="text-gray-200">
                    Restricted Area - PIN Required
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handlePinSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="adminPin" className="text-lg font-semibold text-gov-navy">
                        Enter Admin PIN
                      </Label>
                      <Input
                        id="adminPin"
                        type="password"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        onKeyPress={handlePinKeyPress}
                        placeholder="****"
                        className="text-center text-2xl tracking-widest mt-2 border-2 border-gov-navy focus:border-gov-maroon"
                        maxLength={4}
                        disabled={isLocked}
                      />
                    </div>

                    {pinError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">{pinError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gov-maroon hover:bg-gov-maroon/90 text-white py-3 text-lg font-semibold"
                      disabled={isLocked || !pinInput}
                    >
                      {isLocked ? "Access Locked" : "Access Admin Panel"}
                    </Button>
                  </form>

                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Security Notice:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Authorized personnel only</li>
                      <li>• Maximum 3 attempts allowed</li>
                      <li>• Access is logged and monitored</li>
                      <li>• Contact IT support for assistance</li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Demo PIN:</h4>
                    <p className="text-sm text-blue-700">
                      For demonstration: <strong className="font-mono">2024</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gov-navy flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    Government Admin Portal
                  </h1>
                  <p className="text-gray-600 mt-2">Civitas Platform Management System</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">System Online</Badge>
                  <Badge className="bg-gov-navy">Admin Mode</Badge>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{allUsersData.length}</div>
                  <div className="text-sm">Total Users</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {allUsersData.filter(u => u.last_sign_in && 
                      new Date(u.last_sign_in) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm">Active Today</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {allUsersData.filter(u => u.isAdmin).length}
                  </div>
                  <div className="text-sm">Admin Users</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {allUsersData.reduce((sum, u) => sum + (u.points || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm">Total Points</div>
                </CardContent>
              </Card>
            </div>

            {/* Media Management Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">Media Management</CardTitle>
                <CardDescription>Review and manage user uploaded media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userMediaData.map((media) => (
                    <Card key={media.id} className="overflow-hidden">
                      <div className="relative aspect-square">
                        {renderMediaContent(media)}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleDeleteMedia(media.id, media.file_url)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-2">
                        <p className="font-medium truncate">{media.title || 'Untitled'}</p>
                        <p className="text-sm text-gray-500">
                          User: {media.profiles?.citizen_id || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(media.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Pending Review</span>
                      <Badge className="bg-white text-indigo-600">24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>In Progress</span>
                      <Badge className="bg-white text-indigo-600">15</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed</span>
                      <Badge className="bg-white text-indigo-600">89</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-pink-400 to-pink-500 text-white">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Region Activity</h3>
                  <div className="space-y-2">
                    {Object.entries(
                      allUsersData.reduce((acc, user) => {
                        acc[user.region] = (acc[user.region] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([region, count]) => (
                      <div key={region} className="flex justify-between items-center">
                        <span>{region || 'Unspecified'}</span>
                        <Badge className="bg-white text-pink-600">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-400 to-amber-500 text-white">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">System Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Server Health</span>
                      <Badge className="bg-white text-amber-600">98%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Response</span>
                      <Badge className="bg-white text-amber-600">124ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Storage Used</span>
                      <Badge className="bg-white text-amber-600">45%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Media */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  User Media Uploads
                </CardTitle>
                <CardDescription>
                  Recent photos and videos from citizens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allUsersData.flatMap(user => user.media || []).sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  ).slice(0, 6).map((media) => (
                    <Card key={media.id} className="overflow-hidden">
                      <div className="relative aspect-video">
                        {media.file_type.startsWith('image/') ? (
                          <img
                            src={media.file_url}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={media.file_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{media.title}</h4>
                            <p className="text-xs text-gray-500">
                              By: {media.user_id} • {new Date(media.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge>
                            {media.file_type.startsWith('image/') ? (
                              <ImageIcon className="w-3 h-3" />
                            ) : (
                              <Video className="w-3 h-3" />
                            )}
                          </Badge>
                        </div>
                        {media.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {media.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Platform Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Task Completed</p>
                      <p className="text-sm text-gray-600">User ID-2389 completed "Community Clean-up"</p>
                    </div>
                    <Badge className="ml-auto">2 mins ago</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New Registration</p>
                      <p className="text-sm text-gray-600">New user registered from North Region</p>
                    </div>
                    <Badge className="ml-auto">5 mins ago</Badge>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Achievement Unlocked</p>
                      <p className="text-sm text-gray-600">User ID-1567 reached 1000 points</p>
                    </div>
                    <Badge className="ml-auto">15 mins ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>All Users Database ({allUsersData.length} records)</span>
                  </div>
                  <Button
                    onClick={() => setShowCreateUser(true)}
                    size="sm"
                    className="bg-gov-green text-white hover:bg-gov-green/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add User
                  </Button>
                </CardTitle>
                <CardDescription>
                  Complete user records from Supabase database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gov-navy text-white">
                        <th className="border border-gray-300 p-3 text-left">Citizen ID</th>
                        <th className="border border-gray-300 p-3 text-left">Email</th>
                        <th className="border border-gray-300 p-3 text-left">Points</th>
                        <th className="border border-gray-300 p-3 text-left">Region</th>
                        <th className="border border-gray-300 p-3 text-left">Joined</th>
                        <th className="border border-gray-300 p-3 text-left">Last Active</th>
                        <th className="border border-gray-300 p-3 text-left">Status</th>
                        <th className="border border-gray-300 p-3 text-left">Admin</th>
                        <th className="border border-gray-300 p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={9} className="text-center p-4 text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : allUsersData.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center p-4 text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        allUsersData.map((userData, index) => (
                          <tr key={userData.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                            <td className="border border-gray-300 p-3">
                              <div className="font-mono font-bold text-gov-navy">{userData.citizenId}</div>
                              {userData.citizenId === user?.citizenId && (
                                <Badge className="mt-1 bg-blue-500 text-white text-xs">CURRENT USER</Badge>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              <span className="text-sm">{userData.email || 'No email'}</span>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <span className="font-bold text-gov-green">{userData.points?.toLocaleString() || '0'}</span>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <span className="text-sm">{userData.region}</span>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <span className="text-sm">{new Date(userData.created_at).toLocaleDateString()}</span>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <span className="text-sm">{userData.last_sign_in ? new Date(userData.last_sign_in).toLocaleDateString() : 'Never'}</span>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <Badge className={userData.last_sign_in ? 'bg-green-500' : 'bg-gray-500'}>
                                {userData.last_sign_in ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <Badge className={userData.isAdmin ? 'bg-gov-navy' : 'bg-gray-500'}>
                                {userData.isAdmin ? 'Admin' : 'User'}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 p-3">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(userData.citizenId)}
                                  className="text-xs px-2 py-1"
                                >
                                  Edit
                                </Button>
                                {userData.citizenId !== user?.citizenId && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(userData.citizenId)}
                                    className="text-xs px-2 py-1"
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
