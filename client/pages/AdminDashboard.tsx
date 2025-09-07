import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Shield, Users, Lock, AlertCircle, Plus, Activity, Check, UserPlus, Star, 
  Camera, Image as ImageIcon, Video, Trash2, Search, Filter, Download, 
  RefreshCw, Settings, BarChart3, TrendingUp, AlertTriangle, Eye,
  Globe, MapPin, Clock, CheckCircle, XCircle, Edit, Save, X,
  FileText, Mail, Phone, Calendar, Award, Zap, Target, Building2,
  Database, Server, Cpu, HardDrive, Wifi, Monitor
} from "lucide-react";

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
  citizenId: string;
  email: string;
  region: string;
  points: number;
  isAdmin: boolean;
  created_at: string;
  last_sign_in: string | null;
  media?: UserMedia[];
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  tasksCompleted?: number;
  lastActivity?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  systemHealth: number;
  apiResponseTime: number;
  storageUsed: number;
  uptime: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useCivitasStore();

  // Authentication States
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Data States
  const [allUsersData, setAllUsersData] = useState<SupabaseUser[]>([]);
  const [userMediaData, setUserMediaData] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    systemHealth: 98,
    apiResponseTime: 124,
    storageUsed: 45,
    uptime: "99.9%"
  });

  // UI States
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SupabaseUser | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Form States
  const [newUser, setNewUser] = useState({
    citizenId: "",
    email: "",
    region: "",
    points: 0,
    isAdmin: false
  });

  // Constants
  const ADMIN_PIN = "2024";
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 5 * 60 * 1000;

  // Utility Functions
  const convertProfile = (profile: any): SupabaseUser => ({
    id: profile.id,
    citizenId: profile.citizen_id,
    email: profile.email || 'N/A',
    region: profile.region || 'Unknown',
    points: profile.points || 0,
    isAdmin: profile.is_admin || false,
    created_at: profile.created_at || new Date().toISOString(),
    last_sign_in: profile.last_sign_in || null,
    phone: profile.phone || 'Not provided',
    status: profile.status || 'active',
    tasksCompleted: profile.tasks_completed || 0,
    lastActivity: profile.last_activity || null
  });

  // Data Fetching Functions
  const fetchAllUsers = async () => {
    if (!pinAuthenticated) return;
    setIsLoadingUsers(true);
    try {
      const supabase = getSupabase();
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });

      if (profilesError) {
        toast.error('Error fetching profiles: ' + profilesError.message);
        return;
      }

      const usersWithMedia = await Promise.all(
        (profiles || []).map(async (profile) => {
          const supabase = getSupabase();
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
      
      // Update system metrics
      setSystemMetrics(prev => ({
        ...prev,
        totalUsers: usersWithMedia.length,
        activeUsers: usersWithMedia.filter(u => u.last_sign_in && 
          new Date(u.last_sign_in) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
        totalTasks: usersWithMedia.reduce((sum, u) => sum + (u.tasksCompleted || 0), 0)
      }));
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAllMedia = async () => {
    if (!pinAuthenticated) return;
    setIsLoadingMedia(true);
    try {
      const supabase = getSupabase();
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
    } finally {
      setIsLoadingMedia(false);
    }
  };

  // Filtered and sorted data
  const filteredUsers = useMemo(() => {
    let filtered = allUsersData.filter(user => {
      const matchesSearch = user.citizenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "active" && user.last_sign_in) ||
                           (filterStatus === "inactive" && !user.last_sign_in) ||
                           (filterStatus === "admin" && user.isAdmin);
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof SupabaseUser];
      const bValue = b[sortBy as keyof SupabaseUser];
      const comparison = sortOrder === 'asc' ? 
        (aValue > bValue ? 1 : -1) : 
        (aValue < bValue ? 1 : -1);
      return comparison;
    });

    return filtered;
  }, [allUsersData, searchQuery, filterStatus, sortBy, sortOrder]);

  // Authentication Logic
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
      toast.success("Admin access granted");
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (newAttemptCount >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setPinError(`Too many failed attempts. Access locked for 5 minutes.`);
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

  // CRUD Operations
  const handleCreateUser = async () => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .insert([{
          citizen_id: newUser.citizenId,
          email: newUser.email,
          region: newUser.region,
          points: newUser.points,
          is_admin: newUser.isAdmin,
          created_at: new Date().toISOString(),
          status: 'active'
        }]);

      if (error) throw error;

      toast.success('User created successfully');
      setShowCreateUser(false);
      setNewUser({ citizenId: "", email: "", region: "", points: 0, isAdmin: false });
      await fetchAllUsers();
    } catch (error: any) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async (user: SupabaseUser) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('profiles')
        .update({
          email: user.email,
          region: user.region,
          points: user.points,
          is_admin: user.isAdmin,
          status: user.status
        })
        .eq('citizen_id', user.citizenId);

      if (error) throw error;

      toast.success('User updated successfully');
      setEditingUser(null);
      await fetchAllUsers();
    } catch (error: any) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUsers = async (citizenIds: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${citizenIds.length} user(s)?`)) return;

    try {
      const supabase = getSupabase();
      if (citizenIds.includes(user?.citizenId || "")) {
        toast.error("Cannot delete the currently logged-in user!");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .in('citizen_id', citizenIds);

      if (error) throw error;

      toast.success(`${citizenIds.length} user(s) deleted successfully`);
      setSelectedUsers([]);
      await fetchAllUsers();
    } catch (error: any) {
      toast.error('Error deleting users: ' + error.message);
    }
  };

  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      const supabase = getSupabase();
      const filePath = fileUrl.split('/').slice(-2).join('/');
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      toast.success('Media deleted successfully');
      fetchAllMedia();
    } catch (error: any) {
      toast.error('Error deleting media: ' + error.message);
    }
  };

  // Effects
  useEffect(() => {
    if (pinAuthenticated) {
      fetchAllUsers();
      fetchAllMedia();
    }
  }, [pinAuthenticated]);

  // Render Functions
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

  const renderSystemMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Users */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{systemMetrics.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+12% this month</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
          <Progress value={75} className="mt-4 bg-blue-400" />
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Today</p>
              <p className="text-3xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 mr-1" />
                <span className="text-sm">85% engagement</span>
              </div>
            </div>
            <Zap className="w-12 h-12 text-green-200" />
          </div>
          <Progress value={85} className="mt-4 bg-green-400" />
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">System Health</p>
              <p className="text-3xl font-bold">{systemMetrics.systemHealth}%</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">All systems operational</span>
              </div>
            </div>
            <Server className="w-12 h-12 text-purple-200" />
          </div>
          <Progress value={systemMetrics.systemHealth} className="mt-4 bg-purple-400" />
        </CardContent>
      </Card>

      {/* Storage */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Storage Used</p>
              <p className="text-3xl font-bold">{systemMetrics.storageUsed}%</p>
              <div className="flex items-center mt-2">
                <HardDrive className="w-4 h-4 mr-1" />
                <span className="text-sm">2.1TB / 5TB</span>
              </div>
            </div>
            <Database className="w-12 h-12 text-orange-200" />
          </div>
          <Progress value={systemMetrics.storageUsed} className="mt-4 bg-orange-400" />
        </CardContent>
      </Card>
    </div>
  );

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <a href="#admin-main" className="sr-only focus:not-sr-only fixed z-[100] top-2 left-2 bg-gov-gold text-gov-navy px-3 py-2 rounded">Skip to content</a>
        <Navigation />
        <main id="admin-main" className="main-content" role="main" aria-label="Admin main content">
                    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Unauthorized Access</CardTitle>
                <CardDescription className="text-center">
                  Please sign in to access the admin dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => navigate('/signin')}>Sign In</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // PIN Authentication
  if (!pinAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <a href="#admin-main" className="sr-only focus:not-sr-only fixed z-[100] top-2 left-2 bg-gov-gold text-gov-navy px-3 py-2 rounded">Skip to content</a>
        <Navigation />
        <main id="admin-main" className="main-content" role="main" aria-label="Admin main content">
          <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Lock className="w-12 h-12 text-blue-600" />
                </div>
                <CardTitle className="text-center">Admin Authentication</CardTitle>
                <CardDescription className="text-center">
                  Enter your admin PIN to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pin">Admin PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      disabled={isLocked}
                    />
                    {pinError && (
                      <p className="text-sm text-red-500 mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {pinError}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={verifyPin}
                    className="w-full"
                    disabled={isLocked || !pinInput}
                  >
                    {isLocked ? 'Locked' : 'Authenticate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <a href="#admin-main" className="sr-only focus:not-sr-only fixed z-[100] top-2 left-2 bg-gov-gold text-gov-navy px-3 py-2 rounded">Skip to content</a>
        <Navigation />
      <main id="admin-main" className="main-content" role="main" aria-label="Admin main content">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage users, content, and system settings
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPinAuthenticated(false);
                  setAttemptCount(0);
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock Dashboard
              </Button>
              <Button onClick={() => fetchAllUsers()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={() => navigate('/admin/photos')} className="bg-gov-navy text-white hover:bg-gov-navy/90">
                <Eye className="w-4 h-4 mr-2" />
                Review Requests
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="media">
                <ImageIcon className="w-4 h-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              {renderSystemMetrics()}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest actions from users in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <UserPlus className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-gray-500">
                                {user.last_sign_in ? `Last active: ${new Date(user.last_sign_in).toLocaleString()}` : 'Never active'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={user.isAdmin ? 'destructive' : 'outline'}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>
                      Current health and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">API Response Time</span>
                          <span className="text-sm font-medium">
                            {systemMetrics.apiResponseTime}ms
                          </span>
                        </div>
                        <Progress value={100 - (systemMetrics.apiResponseTime / 200 * 100)} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Uptime</span>
                          <span className="text-sm font-medium">
                            {systemMetrics.uptime}
                          </span>
                        </div>
                        <Progress value={parseFloat(systemMetrics.uptime)} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Tasks Completed</span>
                          <span className="text-sm font-medium">
                            {systemMetrics.totalTasks}
                          </span>
                        </div>
                        <Progress value={(systemMetrics.totalTasks / 1000) * 100} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Input
                      placeholder="Search users..."
                      aria-label="Search users"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="points">Points</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="region">Region</SelectItem>
                        <SelectItem value="created_at">Join Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={sortOrder === 'asc' ? 'default' : 'outline'}
                      size="icon"
                      aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4 transform rotate-180" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {allUsersData.length} users
                  </div>
                  <div className="flex space-x-2">
                    {selectedUsers.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUsers(selectedUsers)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedUsers.length})
                      </Button>
                    )}
                    <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Create User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>
                            Add a new user to the system
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="citizenId" className="text-right">
                              Citizen ID
                            </Label>
                            <Input
                              id="citizenId"
                              value={newUser.citizenId}
                              onChange={(e) =>
                                setNewUser({ ...newUser, citizenId: e.target.value })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) =>
                                setNewUser({ ...newUser, email: e.target.value })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="region" className="text-right">
                              Region
                            </Label>
                            <Input
                              id="region"
                              value={newUser.region}
                              onChange={(e) =>
                                setNewUser({ ...newUser, region: e.target.value })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="points" className="text-right">
                              Points
                            </Label>
                            <Input
                              id="points"
                              type="number"
                              value={newUser.points}
                              onChange={(e) =>
                                setNewUser({ ...newUser, points: parseInt(e.target.value) || 0 })
                              }
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isAdmin" className="text-right">
                              Admin
                            </Label>
                            <Switch
                              id="isAdmin"
                              checked={newUser.isAdmin}
                              onCheckedChange={(checked) =>
                                setNewUser({ ...newUser, isAdmin: checked })
                              }
                              className="col-span-3"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateUser}>Create User</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <caption className="sr-only">Users table with sortable columns and actions</caption>
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedUsers.length === filteredUsers.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(filteredUsers.map(u => u.citizenId));
                                  } else {
                                    setSelectedUsers([]);
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Citizen ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Region
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Points
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {isLoadingUsers ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 text-center">
                                <div className="flex justify-center">
                                  <RefreshCw className="w-6 h-6 animate-spin" />
                                </div>
                              </td>
                            </tr>
                          ) : filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.citizenId)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers([...selectedUsers, user.citizenId]);
                                      } else {
                                        setSelectedUsers(selectedUsers.filter(id => id !== user.citizenId));
                                      }
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.citizenId}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{user.region}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant="outline" className="px-3 py-1">
                                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                                    {user.points}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    variant={
                                      user.status === 'active'
                                        ? 'default'
                                        : user.status === 'suspended'
                                        ? 'destructive'
                                        : 'outline'
                                    }
                                  >
                                    {user.status}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      aria-label={`Edit user ${user.citizenId}`}
                                      onClick={() => setEditingUser(user)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      aria-label={`View user ${user.citizenId}`}
                                      onClick={() => navigate(`/profile/${user.citizenId}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
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
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 w-full max-w-md">
                    <Input
                      placeholder="Search media..."
                      aria-label="Search media"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Media</SelectItem>
                        <SelectItem value="image">Images</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isLoadingMedia ? (
                  <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                ) : userMediaData.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No media found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Users haven't uploaded any media yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userMediaData.map((media) => (
                      <Card key={media.id} className="overflow-hidden">
                        <div className="relative aspect-square bg-gray-100">
                          {renderMediaContent(media)}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium line-clamp-1">
                                {media.title || 'Untitled'}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {media.description || 'No description'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete media"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteMedia(media.id, media.file_url)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {media.profiles?.email || 'Unknown user'}
                            </span>
                            <span>
                              {new Date(media.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure platform-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">
                          Temporarily disable access for all non-admin users
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>User Registration</Label>
                        <p className="text-sm text-gray-500">
                          Allow new users to sign up for accounts
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Content Moderation</Label>
                        <p className="text-sm text-gray-500">
                          Enable automated scanning of user-generated content
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Analytics Tracking</Label>
                        <p className="text-sm text-gray-500">
                          Collect usage data to improve the platform
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to user profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-citizenId" className="text-right">
                  Citizen ID
                </Label>
                <Input
                  id="edit-citizenId"
                  value={editingUser.citizenId}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-region" className="text-right">
                  Region
                </Label>
                <Input
                  id="edit-region"
                  value={editingUser.region}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, region: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={editingUser.points}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value) =>
                    setEditingUser({
                      ...editingUser,
                      status: value as 'active' | 'inactive' | 'suspended',
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-isAdmin" className="text-right">
                  Admin
                </Label>
                <Switch
                  id="edit-isAdmin"
                  checked={editingUser.isAdmin}
                  onCheckedChange={(checked) =>
                    setEditingUser({ ...editingUser, isAdmin: checked })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleUpdateUser(editingUser)}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
