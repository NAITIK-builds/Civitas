import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useCivitasStore, Report } from "@/lib/store";
import {
  Shield, Users, FileText, CheckCircle, XCircle, Clock, AlertTriangle,
  TreePine, Eye, TrendingUp, Download, Plus, Search, Filter, MapPin,
  Calendar, BarChart3, PieChart, Activity, Lock, AlertCircle, User
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    getPendingReports,
    reviewReport,
    createTask,
    allUsers,
    reports,
    createUser,
    updateUser,
    deleteUser,
    getAllUsersWithCurrent
  } = useCivitasStore();

  // PIN Authentication States
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [newTaskForm, setNewTaskForm] = useState({
    type: "",
    title: "",
    description: "",
    points: "",
    deadline: "",
    regions: [] as string[]
  });

  // User Management States
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    email: "",
    points: "",
    rank: "",
    tasksCompleted: "",
    successRate: "",
    region: "",
    isAdmin: false
  });
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    points: "",
    region: "",
    isAdmin: false
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);

  // Admin PIN - In production, this would be more secure
  const ADMIN_PIN = "2024";
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

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

  // Handle PIN input
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin();
  };

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPin();
    }
  };

  // User Management Functions
  const handleEditUser = (citizenId: string) => {
    const userData = allUsersData.find(u => u.citizenId === citizenId);
    if (userData) {
      setUserFormData({
        email: userData.email || "",
        points: userData.points.toString(),
        rank: userData.rank.toString(),
        tasksCompleted: userData.tasksCompleted.toString(),
        successRate: userData.successRate.toString(),
        region: userData.region,
        isAdmin: userData.isAdmin
      });
      setEditingUser(citizenId);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updates = {
      email: userFormData.email || undefined,
      points: parseInt(userFormData.points) || 0,
      rank: parseInt(userFormData.rank) || 1,
      tasksCompleted: parseInt(userFormData.tasksCompleted) || 0,
      successRate: parseInt(userFormData.successRate) || 0,
      region: userFormData.region,
      isAdmin: userFormData.isAdmin
    };

    updateUser(editingUser, updates);
    setAllUsersData(getAllUsersWithCurrent());
    setEditingUser(null);
    setUserFormData({
      email: "",
      points: "",
      rank: "",
      tasksCompleted: "",
      successRate: "",
      region: "",
      isAdmin: false
    });
  };

  const handleDeleteUser = (citizenId: string) => {
    if (window.confirm(`Are you sure you want to delete user ${citizenId}?`)) {
      if (deleteUser(citizenId)) {
        setAllUsersData(getAllUsersWithCurrent());
      } else {
        alert("Cannot delete the currently logged-in user!");
      }
    }
  };

  const handleCreateUser = () => {
    const userData = {
      email: newUserForm.email || undefined,
      points: parseInt(newUserForm.points) || 1000,
      isLoggedIn: false,
      rank: allUsersData.length + 1,
      tasksCompleted: 0,
      successRate: 100,
      badges: [],
      region: newUserForm.region || "Delhi",
      isAdmin: newUserForm.isAdmin
    };

    const newCitizenId = createUser(userData);
    setAllUsersData(getAllUsersWithCurrent());
    setShowCreateUser(false);
    setNewUserForm({
      email: "",
      points: "",
      region: "",
      isAdmin: false
    });
    alert(`User created successfully! Citizen ID: ${newCitizenId}`);
  };

  useEffect(() => {
    // Only load pending reports and users if PIN authenticated
    if (pinAuthenticated) {
      setPendingReports(getPendingReports());
      setAllUsersData(getAllUsersWithCurrent());
    }
  }, [pinAuthenticated, getPendingReports, getAllUsersWithCurrent]);

  // Show login if not authenticated
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

  // Show PIN entry screen if not PIN authenticated
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

  const systemStats = {
    totalUsers: allUsers.length + 1000000, // Add base count
    totalReports: reports.length + 456000, // Add base count
    pendingReviews: pendingReports.length,
    approvedToday: reports.filter(r =>
      r.status === 'approved' &&
      new Date(r.reviewedAt || '').toDateString() === new Date().toDateString()
    ).length,
    rejectedToday: reports.filter(r =>
      r.status === 'rejected' &&
      new Date(r.reviewedAt || '').toDateString() === new Date().toDateString()
    ).length,
    totalPoints: allUsers.reduce((sum, u) => sum + u.points, 0) + 15000000,
    averageResponseTime: "18.5 hours",
    systemUptime: "99.97%"
  };

  const handleReportAction = (reportId: string, action: "approve" | "reject") => {
    reviewReport(reportId, action, reviewComment);
    setPendingReports(getPendingReports()); // Refresh the list
    setSelectedReport(null);
    setReviewComment("");
  };

  const handleCreateTask = () => {
    if (!newTaskForm.type || !newTaskForm.title || !newTaskForm.description) {
      alert("Please fill in all required fields");
      return;
    }

    createTask({
      type: newTaskForm.type as any,
      title: newTaskForm.title,
      description: newTaskForm.description,
      points: parseInt(newTaskForm.points) || 50,
      deadline: newTaskForm.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: "To be specified",
      requirements: ["Complete the assigned task", "Provide photo evidence", "Submit accurate information"],
      isActive: true,
      assignedRegions: newTaskForm.regions.length > 0 ? newTaskForm.regions : undefined
    });

    // Reset form
    setNewTaskForm({
      type: "",
      title: "",
      description: "",
      points: "",
      deadline: "",
      regions: []
    });

    alert("Task created successfully!");
  };

  const getTaskTypeIcon = (taskId: string) => {
    // Find task by ID to get type
    const task = useCivitasStore.getState().tasks.find(t => t.id === taskId);
    const type = task?.type || "unknown";

    switch (type) {
      case "tree_planting": return <TreePine className="w-4 h-4" />;
      case "pollution_report": return <Eye className="w-4 h-4" />;
      case "corruption_report": return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTaskTypeColor = (taskId: string) => {
    const task = useCivitasStore.getState().tasks.find(t => t.id === taskId);
    const type = task?.type || "unknown";

    switch (type) {
      case "tree_planting": return "bg-gov-green";
      case "pollution_report": return "bg-gov-navy";
      case "corruption_report": return "bg-gov-maroon";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (aiScore: number) => {
    if (aiScore >= 90) return "bg-green-500";
    if (aiScore >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTaskTypeName = (taskId: string) => {
    const task = useCivitasStore.getState().tasks.find(t => t.id === taskId);
    const type = task?.type || "unknown";
    return type.replace('_', ' ').toUpperCase();
  };

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
                <p className="text-gray-600 mt-2">Civitas Platform Management & Monitoring System</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">System Online</Badge>
                <Badge className="bg-gov-gold text-gov-navy">Admin Access</Badge>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-gov-navy to-gov-navy/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Total Citizens</p>
                    <p className="text-3xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-10 h-10 text-gov-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-maroon to-gov-maroon/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Pending Reviews</p>
                    <p className="text-3xl font-bold">{systemStats.pendingReviews.toLocaleString()}</p>
                  </div>
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-green to-gov-green/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-200 text-sm">Approved Today</p>
                    <p className="text-3xl font-bold">{systemStats.approvedToday}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-gold to-gov-gold/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-800 text-sm">Avg Response</p>
                    <p className="text-3xl font-bold text-gov-navy">{systemStats.averageResponseTime}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-gov-navy" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users Database</TabsTrigger>
              <TabsTrigger value="reports">Reports Review</TabsTrigger>
              <TabsTrigger value="tasks">Task Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Real-Time System Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">{systemStats.approvedToday} reports approved today</p>
                          <p className="text-sm text-green-600">Average processing time: {systemStats.averageResponseTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-800">{systemStats.pendingReviews} reports pending review</p>
                          <p className="text-sm text-yellow-600">All citizen submissions tracked & stored</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">{systemStats.totalUsers.toLocaleString()} registered citizens</p>
                          <p className="text-sm text-blue-600">All logins & IDs stored securely</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">{reports.length} total reports in database</p>
                          <p className="text-sm text-purple-600">Complete admin access & oversight</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Registered Citizens Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gov-navy/10 rounded-lg">
                          <div className="text-2xl font-bold text-gov-navy">{allUsers.length + 1}</div>
                          <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                        <div className="text-center p-3 bg-gov-green/10 rounded-lg">
                          <div className="text-2xl font-bold text-gov-green">{allUsers.filter(u => u.isLoggedIn).length + (user?.isLoggedIn ? 1 : 0)}</div>
                          <div className="text-sm text-gray-600">Currently Online</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800">Recent Citizens:</h4>
                        {user && (
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                            <div>
                              <span className="font-mono text-sm font-medium">{user.citizenId}</span>
                              <span className="ml-2 text-xs text-blue-600">({user.region})</span>
                              {user.isAdmin && <Badge className="ml-2 bg-red-500 text-white text-xs">ADMIN</Badge>}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.points} pts • {user.tasksCompleted} tasks
                            </div>
                          </div>
                        )}
                        {allUsers.slice(0, 3).map((citizen, index) => (
                          <div key={citizen.citizenId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-mono text-sm font-medium">{citizen.citizenId}</span>
                              <span className="ml-2 text-xs text-gray-600">({citizen.region})</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {citizen.points} pts • {citizen.tasksCompleted} tasks
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Report Processing Efficiency</span>
                          <span>94.3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gov-green h-2 rounded-full" style={{width: '94.3%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>AI Verification Accuracy</span>
                          <span>96.7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gov-navy h-2 rounded-full" style={{width: '96.7%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>System Uptime</span>
                          <span>99.97%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gov-gold h-2 rounded-full" style={{width: '99.97%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Citizen Satisfaction</span>
                          <span>91.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gov-maroon h-2 rounded-full" style={{width: '91.2%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Database Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gov-navy">Users Database Management</h3>
                  <p className="text-gray-600">Complete user registry - View, Edit, Update, Delete all users</p>
                </div>
                <Button
                  onClick={() => setShowCreateUser(true)}
                  className="bg-gov-green hover:bg-gov-green/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New User
                </Button>
              </div>

              {/* Database Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{allUsersData.length}</div>
                    <div className="text-sm">Total Users</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{allUsersData.filter(u => u.isLoggedIn).length}</div>
                    <div className="text-sm">Online Now</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-400 to-purple-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{allUsersData.filter(u => u.isAdmin).length}</div>
                    <div className="text-sm">Admin Users</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{allUsersData.reduce((sum, u) => sum + u.points, 0).toLocaleString()}</div>
                    <div className="text-sm">Total Points</div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    All Users Database ({allUsersData.length} records)
                  </CardTitle>
                  <CardDescription>
                    Complete user management system - All data is stored locally and persists across sessions
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
                          <th className="border border-gray-300 p-3 text-left">Rank</th>
                          <th className="border border-gray-300 p-3 text-left">Tasks</th>
                          <th className="border border-gray-300 p-3 text-left">Success %</th>
                          <th className="border border-gray-300 p-3 text-left">Region</th>
                          <th className="border border-gray-300 p-3 text-left">Status</th>
                          <th className="border border-gray-300 p-3 text-left">Admin</th>
                          <th className="border border-gray-300 p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsersData.map((userData, index) => (
                          <tr key={userData.citizenId} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                            <td className="border border-gray-300 p-3">
                              <div className="font-mono font-bold text-gov-navy">{userData.citizenId}</div>
                              {userData.citizenId === user?.citizenId && (
                                <Badge className="mt-1 bg-blue-500 text-white text-xs">CURRENT USER</Badge>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Input
                                  value={userFormData.email}
                                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                                  className="w-full"
                                  placeholder="email@example.com"
                                />
                              ) : (
                                <span className="text-sm">{userData.email || 'No email'}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Input
                                  type="number"
                                  value={userFormData.points}
                                  onChange={(e) => setUserFormData({...userFormData, points: e.target.value})}
                                  className="w-20"
                                />
                              ) : (
                                <span className="font-bold text-gov-green">{userData.points.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Input
                                  type="number"
                                  value={userFormData.rank}
                                  onChange={(e) => setUserFormData({...userFormData, rank: e.target.value})}
                                  className="w-16"
                                />
                              ) : (
                                <span className="font-bold">#{userData.rank}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Input
                                  type="number"
                                  value={userFormData.tasksCompleted}
                                  onChange={(e) => setUserFormData({...userFormData, tasksCompleted: e.target.value})}
                                  className="w-16"
                                />
                              ) : (
                                <span>{userData.tasksCompleted}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Input
                                  type="number"
                                  value={userFormData.successRate}
                                  onChange={(e) => setUserFormData({...userFormData, successRate: e.target.value})}
                                  className="w-16"
                                />
                              ) : (
                                <span>{userData.successRate}%</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <Select value={userFormData.region} onValueChange={(value) => setUserFormData({...userFormData, region: value})}>
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                                    <SelectItem value="Chennai">Chennai</SelectItem>
                                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                                    <SelectItem value="Pune">Pune</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-sm">{userData.region}</span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {userData.isLoggedIn ? (
                                <Badge className="bg-green-500 text-white text-xs">ONLINE</Badge>
                              ) : (
                                <Badge className="bg-gray-400 text-white text-xs">OFFLINE</Badge>
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <input
                                  type="checkbox"
                                  checked={userFormData.isAdmin}
                                  onChange={(e) => setUserFormData({...userFormData, isAdmin: e.target.checked})}
                                  className="rounded"
                                />
                              ) : (
                                userData.isAdmin ? (
                                  <Badge className="bg-red-500 text-white text-xs">ADMIN</Badge>
                                ) : (
                                  <Badge className="bg-gray-300 text-gray-700 text-xs">USER</Badge>
                                )
                              )}
                            </td>
                            <td className="border border-gray-300 p-3">
                              {editingUser === userData.citizenId ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateUser}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                    className="text-xs px-2 py-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
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
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Data Management Section */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gov-navy mb-4">Data Management:</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Users CSV
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Users JSON
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Backup Database
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAllUsersData(getAllUsersWithCurrent())}
                        className="flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create User Modal */}
              {showCreateUser && (
                <Card className="border-2 border-gov-green">
                  <CardHeader className="bg-gov-green text-white">
                    <CardTitle>Create New User</CardTitle>
                    <CardDescription className="text-green-100">
                      Add a new citizen to the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newEmail">Email (Optional)</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPoints">Starting Points</Label>
                        <Input
                          id="newPoints"
                          type="number"
                          value={newUserForm.points}
                          onChange={(e) => setNewUserForm({...newUserForm, points: e.target.value})}
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newRegion">Region</Label>
                        <Select value={newUserForm.region} onValueChange={(value) => setNewUserForm({...newUserForm, region: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Mumbai">Mumbai</SelectItem>
                            <SelectItem value="Bangalore">Bangalore</SelectItem>
                            <SelectItem value="Chennai">Chennai</SelectItem>
                            <SelectItem value="Kolkata">Kolkata</SelectItem>
                            <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                            <SelectItem value="Pune">Pune</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="newIsAdmin"
                          checked={newUserForm.isAdmin}
                          onChange={(e) => setNewUserForm({...newUserForm, isAdmin: e.target.checked})}
                          className="rounded"
                        />
                        <Label htmlFor="newIsAdmin">Make Admin User</Label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleCreateUser}
                        className="bg-gov-green hover:bg-gov-green/90"
                      >
                        Create User
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateUser(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reports Review Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gov-navy">Complete Reports Management</h3>
                  <p className="text-gray-600">View and manage all citizen submissions - {reports.length} total reports stored</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-yellow-500 text-white">
                    {pendingReports.length} Pending
                  </Badge>
                  <Badge className="bg-gov-navy text-white">
                    {reports.length} Total
                  </Badge>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</div>
                    <div className="text-sm">Pending Review</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{reports.filter(r => r.status === 'approved').length}</div>
                    <div className="text-sm">Approved</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-400 to-red-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{reports.filter(r => r.status === 'rejected').length}</div>
                    <div className="text-sm">Rejected</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{allUsers.filter(u => u.isLoggedIn).length + (user?.isLoggedIn ? 1 : 0)}</div>
                    <div className="text-sm">Active Citizens</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search reports by Citizen ID, location, or description..." className="pl-10" />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter Status
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All Data
                </Button>
              </div>

              {/* All Reports Display */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gov-navy flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Reports Database ({reports.length} total records)
                </h4>

                {reports.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                      <p className="text-gray-600">Reports will appear here as citizens submit them. All data is automatically stored and tracked.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {reports.slice().reverse().map((report) => (
                      <Card key={report.id} className={`hover:shadow-lg transition-shadow ${
                        report.status === 'pending' ? 'border-l-4 border-yellow-500' :
                        report.status === 'approved' ? 'border-l-4 border-green-500' :
                        'border-l-4 border-red-500'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className={`${getTaskTypeColor(report.taskId)} text-white`}>
                                  {getTaskTypeIcon(report.taskId)}
                                  {getTaskTypeName(report.taskId)}
                                </Badge>
                                <Badge className={`${getPriorityColor(report.aiVerificationScore)} text-white`}>
                                  AI: {report.aiVerificationScore}%
                                </Badge>
                                <Badge className={
                                  report.status === 'pending' ? 'bg-yellow-500 text-white' :
                                  report.status === 'approved' ? 'bg-green-500 text-white' :
                                  'bg-red-500 text-white'
                                }>
                                  {report.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-gov-navy mb-2">{report.title}</h3>
                              <p className="text-gray-700 mb-3">{report.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Citizen: <strong className="font-mono">{report.citizenId}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location.address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(report.submittedAt).toLocaleString()}
                                </span>
                              </div>

                              {report.reviewedAt && (
                                <div className="bg-gray-50 p-3 rounded-lg mt-3">
                                  <div className="text-sm">
                                    <span className="font-medium">Reviewed:</span> {new Date(report.reviewedAt).toLocaleString()}
                                    {report.reviewedBy && <span className="ml-2">by {report.reviewedBy}</span>}
                                    {report.pointsAwarded && (
                                      <span className="ml-2 text-green-600 font-medium">+{report.pointsAwarded} points awarded</span>
                                    )}
                                  </div>
                                  {report.reviewComments && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <span className="font-medium">Comments:</span> {report.reviewComments}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {report.status === 'pending' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-gov-green hover:bg-gov-green/90"
                                  onClick={() => handleReportAction(report.id, "approve")}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReportAction(report.id, "reject")}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>

                          {report.photos.length > 0 && (
                            <div className="border-t pt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Attached Photos ({report.photos.length})
                              </p>
                              <div className="flex gap-2">
                                {report.photos.map((photo, index) => (
                                  <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">{photo}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Task Management Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Task
                  </CardTitle>
                  <CardDescription>
                    Add new civic tasks for citizens to complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="taskType">Task Type</Label>
                        <Select value={newTaskForm.type} onValueChange={(value) => setNewTaskForm({...newTaskForm, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tree_planting">Tree Planting</SelectItem>
                            <SelectItem value="pollution_report">Pollution Monitoring</SelectItem>
                            <SelectItem value="corruption_report">Corruption Reporting</SelectItem>
                            <SelectItem value="cleanliness_drive">Cleanliness Drive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="points">Points Reward</Label>
                        <Input
                          id="points"
                          type="number"
                          placeholder="50"
                          value={newTaskForm.points}
                          onChange={(e) => setNewTaskForm({...newTaskForm, points: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        placeholder="Plant Trees in Sector 14 Green Belt"
                        value={newTaskForm.title}
                        onChange={(e) => setNewTaskForm({...newTaskForm, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Task Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed instructions for citizens..."
                        value={newTaskForm.description}
                        onChange={(e) => setNewTaskForm({...newTaskForm, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newTaskForm.deadline}
                        onChange={(e) => setNewTaskForm({...newTaskForm, deadline: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="regions">Target Regions (Optional)</Label>
                      <Input
                        id="regions"
                        placeholder="Delhi, Mumbai, Bangalore (comma separated)"
                        value={newTaskForm.regions.join(', ')}
                        onChange={(e) => setNewTaskForm({
                          ...newTaskForm,
                          regions: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to assign to all regions
                      </p>
                    </div>

                    <Button
                      onClick={handleCreateTask}
                      className="bg-gov-maroon hover:bg-gov-maroon/90"
                      type="button"
                    >
                      Create Task
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Citizens Database Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Citizens Database - Complete Registry
                  </CardTitle>
                  <CardDescription>
                    All registered citizens, login history, and activity tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Database Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{allUsers.length + 1}</div>
                        <div className="text-sm text-blue-800">Total Citizens</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.isLoggedIn).length + (user?.isLoggedIn ? 1 : 0)}</div>
                        <div className="text-sm text-green-800">Currently Online</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{allUsers.reduce((sum, u) => sum + u.tasksCompleted, 0) + (user?.tasksCompleted || 0)}</div>
                        <div className="text-sm text-purple-800">Total Tasks</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600">{allUsers.reduce((sum, u) => sum + u.points, 0) + (user?.points || 0)}</div>
                        <div className="text-sm text-yellow-800">Total Points</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{allUsers.filter(u => u.isAdmin).length + (user?.isAdmin ? 1 : 0)}</div>
                        <div className="text-sm text-red-800">Admin Users</div>
                      </div>
                    </div>

                    {/* Citizens List */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gov-navy">All Registered Citizens:</h4>

                      {/* Current logged in user */}
                      {user && (
                        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user.citizenId.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-mono font-bold text-lg text-blue-700">{user.citizenId}</div>
                                <div className="text-sm text-blue-600">
                                  {user.email && <span>📧 {user.email} • </span>}
                                  📍 {user.region}
                                  {user.isAdmin && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">ADMIN</span>}
                                  <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded">ONLINE NOW</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-700">{user.points.toLocaleString()} pts</div>
                              <div className="text-sm text-blue-600">
                                Rank #{user.rank} • {user.tasksCompleted} tasks • {user.successRate}% success
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Other registered citizens */}
                      {allUsers.map((citizen, index) => (
                        <div key={citizen.citizenId} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                                {citizen.citizenId.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-mono font-bold text-lg text-gray-700">{citizen.citizenId}</div>
                                <div className="text-sm text-gray-600">
                                  📍 {citizen.region}
                                  {citizen.isAdmin && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">ADMIN</span>}
                                  {citizen.isLoggedIn ? (
                                    <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded">ONLINE</span>
                                  ) : (
                                    <span className="ml-2 px-2 py-1 bg-gray-400 text-white text-xs rounded">OFFLINE</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-700">{citizen.points.toLocaleString()} pts</div>
                              <div className="text-sm text-gray-600">
                                Rank #{citizen.rank} • {citizen.tasksCompleted} tasks • {citizen.successRate}% success
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Data Export Options */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold text-gov-navy mb-4">Data Management & Export:</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Citizens List
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export All Reports
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export System Analytics
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Generate Security Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Report Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gov-green rounded"></div>
                          Tree Planting
                        </span>
                        <span className="font-semibold">45.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gov-navy rounded"></div>
                          Pollution Reports
                        </span>
                        <span className="font-semibold">32.8%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gov-maroon rounded"></div>
                          Corruption Reports
                        </span>
                        <span className="font-semibold">22.0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat"].map((state, index) => (
                        <div key={state}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{state}</span>
                            <span>{(95 - index * 3).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gov-gold h-2 rounded-full" 
                              style={{width: `${95 - index * 3}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Database Status</span>
                        <Badge className="bg-green-500 text-white">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>AI Processing</span>
                        <Badge className="bg-green-500 text-white">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>File Storage</span>
                        <Badge className="bg-green-500 text-white">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>API Gateway</span>
                        <Badge className="bg-green-500 text-white">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export System Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Admin Users
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Security Settings
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Performance Monitoring
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </main>
    </div>
  );
}
