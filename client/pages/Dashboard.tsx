import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import MediaUpload from "@/components/MediaUpload";
import { useCivitasStore, Task as StoreTask, Report } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import {
  TreePine, AlertTriangle, Eye, Award, MapPin, Clock, CheckCircle,
  Camera, Star, TrendingUp, Users, Target, User, Image as ImageIcon,
  Trash2, Activity
} from "lucide-react";
import { toast } from "sonner";
import SimpleAreaChart from "@/components/charts/SimpleAreaChart";

interface DashboardTask extends StoreTask {
  status: 'available' | 'in_progress' | 'completed';
}

interface MediaItem {
  id: string;
  file_url: string;
  file_type: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

const convertTask = (task: StoreTask): DashboardTask => ({
  ...task,
  status: task.isActive ? 'available' : 'completed'
});

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    getUserTasks,
    getUserReports
  } = useCivitasStore();

  const [availableTasks, setAvailableTasks] = useState<DashboardTask[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [userMedia, setUserMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | StoreTask['type']>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchUserMedia = useCallback(async () => {
    if (!user?.citizenId) return;
    try {
      setLoadingMedia(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user.citizenId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserMedia(data || []);
    } catch (error: any) {
      console.error('Error loading media:', error);
      toast.error('Error loading media: ' + error.message);
    } finally {
      setLoadingMedia(false);
    }
  }, [user?.citizenId]);

  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      const supabase = getSupabase();
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
      }

      const { error: dbError } = await supabase
        .from('user_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      toast.success('Media deleted successfully');
      await fetchUserMedia();
    } catch (error: any) {
      console.error('Error deleting media:', error);
      toast.error('Error deleting media: ' + error.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    try {
      const tasks = getUserTasks();
      setAvailableTasks(tasks.map(convertTask));
      setRecentReports(getUserReports());
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error loading dashboard data');
    }
  }, [isAuthenticated, user, getUserTasks, getUserReports]);

  useEffect(() => {
    if (user?.citizenId) {
      fetchUserMedia();
    }
  }, [user?.citizenId, fetchUserMedia]);

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "tree_planting": return TreePine;
      case "pollution_report": return Eye;
      case "corruption_report": return AlertTriangle;
      case "cleanliness_drive": return Target;
      default: return Target;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case "tree_planting": return "bg-gov-green";
      case "pollution_report": return "bg-blue-600";
      case "corruption_report": return "bg-gov-maroon";
      case "cleanliness_drive": return "bg-gov-navy";
      default: return "bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-600 text-white";
      case "pending": return "bg-yellow-600 text-white";
      case "rejected": return "bg-red-600 text-white";
      case "available": return "bg-blue-600 text-white";
      case "in_progress": return "bg-orange-600 text-white";
      case "completed": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const handleTaskSubmission = (task: StoreTask) => {
    navigate(`/submit-task/${task.id}`);
  };

  const taskStats = {
    completed: availableTasks.filter(t => t.status === 'completed').length,
    inProgress: availableTasks.filter(t => t.status === 'in_progress').length,
    available: availableTasks.filter(t => t.status === 'available').length,
    total: availableTasks.length
  };

  const pointsByMonth = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, 0);
    }
    recentReports.forEach(r => {
      if (!r.pointsAwarded) return;
      const d = new Date(r.submittedAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (map.has(key)) map.set(key, (map.get(key) || 0) + r.pointsAwarded);
    });
    const result: { month: string; points: number }[] = [];
    map.forEach((v, k) => {
      const [y, m] = k.split('-').map(Number);
      const label = new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'short' });
      result.push({ month: label, points: v });
    });
    return result;
  }, [recentReports]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return availableTasks;
    return availableTasks.filter(t => t.type === taskFilter);
  }, [taskFilter, availableTasks]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
        <div className="bg-gradient-to-r from-gov-navy via-gov-navy to-gov-maroon rounded-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 rounded-full p-2">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Citizen Dashboard</h1>
                </div>
                <div className="space-y-2">
                  <p className="text-xl sm:text-2xl font-medium text-white/90">
                    Welcome, {user.citizenId}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
                      Region: {user.region || 'Not Set'}
                    </Badge>
                    <Badge className="bg-gov-gold text-gov-navy hover:bg-gov-gold/90 transition-colors">
                      Rank #{user.rank || 'N/A'}
                    </Badge>
                    {user.isAdmin && (
                      <Button size="sm" className="bg-gov-gold text-gov-navy hover:bg-gov-gold/90" onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <Card className="bg-white/10 border-0">
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">Rank</p>
                    <p className="text-2xl font-bold text-white">#{user.rank || 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-0">
                  <CardContent className="p-4 text-center">
                    <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">Points</p>
                    <p className="text-2xl font-bold text-white">{user.points || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-0">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">Tasks</p>
                    <p className="text-2xl font-bold text-white">{user.tasksCompleted || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 border-0">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">{user.successRate || 0}%</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
              <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Task Overview
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex gap-2">
                        <Button variant={taskFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('all')}>All</Button>
                        <Button variant={taskFilter === 'tree_planting' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('tree_planting')}>Tree</Button>
                        <Button variant={taskFilter === 'pollution_report' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('pollution_report')}>Pollution</Button>
                        <Button variant={taskFilter === 'corruption_report' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('corruption_report')}>Corruption</Button>
                        <Button variant={taskFilter === 'cleanliness_drive' ? 'default' : 'outline'} size="sm" onClick={() => setTaskFilter('cleanliness_drive')}>Cleanliness</Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gov-navy border-gov-navy hover:bg-gov-navy hover:text-white w-full sm:w-auto"
                        onClick={() => {
                          const first = availableTasks[0];
                          if (first) navigate(`/submit-task/${first.id}`);
                          else toast.error('No tasks available right now');
                        }}
                      >
                        New Task
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gov-navy text-white hover:bg-gov-navy/90 w-full sm:w-auto"
                        onClick={() => navigate('/my-submissions')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Check Task Status
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-green-700 font-medium">Completed</p>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-700">{taskStats.completed}</p>
                      <Progress value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} className="h-2 mt-2" />
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-yellow-700 font-medium">In Progress</p>
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-700">{taskStats.inProgress}</p>
                      <Progress value={taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0} className="h-2 mt-2" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-700 font-medium">Available</p>
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{taskStats.available}</p>
                      <Progress value={taskStats.total > 0 ? (taskStats.available / taskStats.total) * 100 : 0} className="h-2 mt-2" />
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    <div className="space-y-2">
                      {filteredTasks.slice(0, 5).map((task) => {
                        const IconComponent = getTaskIcon(task.type);
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleTaskSubmission(task)}
                          >
                            <div className={`p-2 rounded-full ${getTaskColor(task.type)}`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{task.title}</p>
                              <p className="text-sm text-gray-500 truncate">{task.description}</p>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        );
                      })}

                      {filteredTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>No tasks available</p>
                          <p className="text-sm">Check back later for new opportunities</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                      <span className="text-sm text-gray-500">{user.tasksCompleted || 0}/20</span>
                    </div>
                    <Progress value={((user.tasksCompleted || 0) / 20) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Success Rate</span>
                      <span className="text-sm text-gray-500">{user.successRate || 0}%</span>
                    </div>
                    <Progress value={user.successRate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Points to Next Level</span>
                      <span className="text-sm text-gray-500">{(user.points || 0) % 1000}/1000</span>
                    </div>
                    <Progress value={((user.points || 0) % 1000) / 10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* In-Progress and Completed containers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    In Progress (Pending Review)
                  </CardTitle>
                  <CardDescription>Submissions awaiting admin approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentReports.filter(r => r.status === 'pending' || r.status === 'under_review').map((r) => (
                      <div key={r.id} className="p-3 border rounded-lg bg-yellow-50/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{r.title}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <MapPin className="w-3 h-3" /> {r.location.address}
                            </p>
                          </div>
                          <Badge variant="secondary">{r.status.replace('_',' ')}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(r.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {recentReports.filter(r => r.status === 'pending' || r.status === 'under_review').length === 0 && (
                      <div className="text-center py-6 text-gray-500">No submissions in progress</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Completed (Approved)
                  </CardTitle>
                  <CardDescription>Approved submissions with awarded points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentReports.filter(r => r.status === 'approved').map((r) => (
                      <div key={r.id} className="p-3 border rounded-lg bg-green-50/60">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{r.title}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> Approved: {new Date(r.reviewedAt || '').toLocaleString()}
                            </p>
                          </div>
                          <Badge className="bg-green-600 text-white">+{r.pointsAwarded || 0} pts</Badge>
                        </div>
                      </div>
                    ))}
                    {recentReports.filter(r => r.status === 'approved').length === 0 && (
                      <div className="text-center py-6 text-gray-500">No approved submissions yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl text-gray-900">Impact Over Last 6 Months</CardTitle>
                <CardDescription>Points earned from approved reports</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <SimpleAreaChart
                  data={pointsByMonth.map(d => ({ label: d.month, value: d.points }))}
                  height={256}
                  stroke="#1b2a41"
                  fill="rgba(27,42,65,0.25)"
                />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto overflow-x-auto no-scrollbar">
                <TabsTrigger value="tasks" className="text-xs sm:text-sm py-2 sm:py-3 whitespace-nowrap min-w-max">
                  Available Tasks
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 sm:py-3 whitespace-nowrap min-w-max">
                  My Reports
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-3 whitespace-nowrap min-w-max">
                  Media Gallery
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2 sm:py-3 whitespace-nowrap min-w-max">
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Available Civic Tasks
                    </CardTitle>
                    <CardDescription>
                      Complete tasks to earn points and contribute to national progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:gap-6">
                      {filteredTasks.map((task) => {
                        const IconComponent = getTaskIcon(task.type);
                        return (
                          <div key={task.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-10 h-10 ${getTaskColor(task.type)} rounded-lg flex items-center justify-center`}>
                                    <IconComponent className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-base truncate">{task.title}</h3>
                                    <p className="text-sm text-gray-600 truncate">{task.location}</p>
                                  </div>
                                </div>
                                <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2">{task.description}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {task.points} points
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button onClick={() => handleTaskSubmission(task)} className="w-full sm:w-auto bg-gov-maroon hover:bg-gov-maroon/90 text-white">
                                Start Task
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Submitted Reports
                    </CardTitle>
                    <CardDescription>
                      Track the status of your submitted civic reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentReports.length > 0 ? recentReports.map((report) => (
                        <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <p className="text-sm text-gray-600">Submitted: {new Date(report.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {report.pointsAwarded && (
                              <span className="text-sm font-medium text-green-600">+{report.pointsAwarded} points</span>
                            )}
                            <Badge className={`${getStatusColor(report.status)} capitalize`}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>No reports submitted yet</p>
                          <p className="text-sm">Start by completing your first task</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Media Gallery
                      </CardTitle>
                      <div className="w-full sm:w-auto">
                        <MediaUpload userId={user.citizenId} onUploadComplete={fetchUserMedia} />
                      </div>
                    </div>
                    <CardDescription>Share and manage your civic activity photos and videos</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loadingMedia ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : userMedia.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Yet</h3>
                        <p className="text-gray-500 mb-4">Start uploading photos and videos of your civic activities</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userMedia.map((media) => (
                          <Card key={media.id} className="group overflow-hidden hover:shadow-lg transition-all">
                            <div className="relative aspect-square bg-gray-100">
                              {media.file_type.startsWith('image/') ? (
                                <img src={media.file_url} alt={media.title || 'Uploaded media'} className="w-full h-full object-cover" loading="lazy" />
                              ) : media.file_type.startsWith('video/') ? (
                                <video src={media.file_url} className="w-full h-full object-cover" controls preload="metadata" />
                              ) : null}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white" onClick={() => window.open(media.file_url, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" className="bg-red-500/90 hover:bg-red-500" onClick={() => handleDeleteMedia(media.id, media.file_url)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <p className="font-medium truncate text-gray-900">{media.title || 'Untitled'}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-500">{new Date(media.created_at).toLocaleDateString()}</p>
                                <Badge variant="secondary" className="text-xs">{media.file_type.split('/')[0]}</Badge>
                              </div>
                              {media.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{media.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Achievements & Badges
                    </CardTitle>
                    <CardDescription>Your civic contributions and recognitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="text-center p-6 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gov-green rounded-full flex items-center justify-center mx-auto mb-4">
                          <TreePine className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Green Warrior</h4>
                        <p className="text-sm text-gray-600">Planted 10+ trees</p>
                        <Badge className="mt-2 bg-gov-green text-white">Earned</Badge>
                      </div>
                      <div className="text-center p-6 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Pollution Fighter</h4>
                        <p className="text-sm text-gray-600">5+ pollution reports</p>
                        <Badge className="mt-2 bg-blue-600 text-white">Earned</Badge>
                      </div>
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Corruption Buster</h4>
                        <p className="text-sm text-gray-400">3+ corruption reports</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Community Leader</h4>
                        <p className="text-sm text-gray-400">Top 10 in region</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>
                      <div className={`${userMedia.length >= 5 ? '' : 'opacity-50'} text-center p-6 border border-gray-200 rounded-lg`}>
                        <div className={`w-16 h-16 ${userMedia.length >= 5 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <h4 className={`${userMedia.length >= 5 ? 'text-gray-900' : 'text-gray-500'} font-semibold mb-2`}>Media Contributor</h4>
                        <p className={`${userMedia.length >= 5 ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Upload 5+ media files</p>
                        <Badge className={`${userMedia.length >= 5 ? 'bg-purple-600' : 'bg-gray-400'} text-white mt-2`}>
                          {userMedia.length >= 5 ? 'Earned' : 'Locked'}
                        </Badge>
                      </div>
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Consistency Champion</h4>
                        <p className="text-sm text-gray-400">30 days active</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Progress to Next Badge</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Corruption Reports</span>
                            <span>1/3</span>
                          </div>
                          <Progress value={33} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Monthly Active Days</span>
                            <span>12/20</span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Media Uploads</span>
                            <span>{userMedia.length}/5</span>
                          </div>
                          <Progress value={Math.min((userMedia.length / 5) * 100, 100)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Regional Ranking</span>
                            <span>{user.rank || 'N/A'}/10</span>
                          </div>
                          <Progress value={user.rank ? Math.max(100 - (user.rank * 10), 0) : 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Access important features and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/leaderboard">
                      <Button variant="outline" className="w-full justify-start h-auto py-3">
                        <Users className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Leaderboard</div>
                          <div className="text-xs text-gray-500">View rankings</div>
                        </div>
                      </Button>
                    </Link>
                    <Link to="/id-card">
                      <Button variant="outline" className="w-full justify-start h-auto py-3 border-gov-maroon text-gov-maroon hover:bg-gov-maroon hover:text-white">
                        <User className="w-4 h-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">ID Card</div>
                          <div className="text-xs opacity-70">Digital identity</div>
                        </div>
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start h-auto py-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Nearby Tasks</div>
                        <div className="text-xs text-gray-500">Find local opportunities</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-auto py-3">
                      <Award className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Redeem Points</div>
                        <div className="text-xs text-gray-500">{user.points || 0} available</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">Emergency Hotline: 108</Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">Corruption Helpline: 1031</Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">Technical Support</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
