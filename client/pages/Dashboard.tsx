import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import MediaUpload from "@/components/MediaUpload";
import { useCivitasStore, Task as StoreTask, Report } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import {
  TreePine, AlertTriangle, Eye, Award, MapPin, Clock, CheckCircle,
  Upload, Camera, Star, TrendingUp, Users, Target, User, Image as ImageIcon,
  Video, Trash2, Activity, TrendingDown
} from "lucide-react";
import { toast } from "sonner";

// Extended Task type to include status
interface DashboardTask extends StoreTask {
  status: 'available' | 'in_progress' | 'completed';
}

// Media type
interface MediaItem {
  id: string;
  file_url: string;
  file_type: string;
  title: string;
  description?: string;
  created_at: string;
  user_id: string;
}

// Convert StoreTask to DashboardTask
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

  // State management
  const [availableTasks, setAvailableTasks] = useState<DashboardTask[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [userMedia, setUserMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's media with useCallback to prevent unnecessary re-renders
  const fetchUserMedia = useCallback(async () => {
    if (!user?.citizenId) return;
    
    try {
      setLoadingMedia(true);
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

  // Delete media with better error handling
  const handleDeleteMedia = async (mediaId: string, fileUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get relative path

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      toast.success('Media deleted successfully');
      await fetchUserMedia(); // Refresh media list
    } catch (error: any) {
      console.error('Error deleting media:', error);
      toast.error('Error deleting media: ' + error.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    try {
      // Load user's tasks and reports
      const tasks = getUserTasks();
      setAvailableTasks(tasks.map(convertTask));
      setRecentReports(getUserReports());
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error loading dashboard data');
    }
  }, [isAuthenticated, user, getUserTasks, getUserReports]);

  // Load media when user changes
  useEffect(() => {
    if (user?.citizenId) {
      fetchUserMedia();
    }
  }, [user?.citizenId, fetchUserMedia]);

  // Helper functions
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "tree_planting": return TreePine;
      case "pollution_report": return Eye;
      case "corruption_report": return AlertTriangle;
      default: return Target;
    }
  };

  const getTaskColor = (type: string) => {
    switch (type) {
      case "tree_planting": return "bg-green-600";
      case "pollution_report": return "bg-blue-600";
      case "corruption_report": return "bg-red-600";
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

  // Statistics calculations
  const taskStats = {
    completed: availableTasks.filter(t => t.status === 'completed').length,
    inProgress: availableTasks.filter(t => t.status === 'in_progress').length,
    available: availableTasks.filter(t => t.status === 'available').length,
    total: availableTasks.length
  };

  // Don't render if not authenticated
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      
      <main className="main-content">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Hero Header */}
            <div className="mb-8 sm:mb-10 bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 rounded-full p-2">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h1>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl sm:text-2xl font-medium text-white/90">
                      Citizen {user.citizenId}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
                        Region: {user.region || 'Not Set'}
                      </Badge>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
                        Joined: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
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

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Task Overview Card */}
              <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Task Overview
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => navigate('/submit-task')}
                    >
                      New Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    
                    {/* Task Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-green-700 font-medium">Completed</p>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-700">{taskStats.completed}</p>
                        <Progress 
                          value={taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0} 
                          className="h-2 mt-2" 
                        />
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-yellow-700 font-medium">In Progress</p>
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">{taskStats.inProgress}</p>
                        <Progress 
                          value={taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0} 
                          className="h-2 mt-2" 
                        />
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-blue-700 font-medium">Available</p>
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700">{taskStats.available}</p>
                        <Progress 
                          value={taskStats.total > 0 ? (taskStats.available / taskStats.total) * 100 : 0} 
                          className="h-2 mt-2" 
                        />
                      </div>
                    </div>
                    
                    {/* Recent Activity */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                      <div className="space-y-2">
                        {availableTasks.slice(0, 3).map((task) => {
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
                        
                        {availableTasks.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No tasks available</p>
                            <p className="text-sm">Check back later for new opportunities</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Monthly Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                      <span className="text-sm text-gray-500">
                        {user.tasksCompleted || 0}/20
                      </span>
                    </div>
                    <Progress value={((user.tasksCompleted || 0) / 20) * 100} className="h-2" />
                  </div>

                  {/* Success Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Success Rate</span>
                      <span className="text-sm text-gray-500">{user.successRate || 0}%</span>
                    </div>
                    <Progress value={user.successRate || 0} className="h-2" />
                  </div>

                  {/* Point Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Points to Next Level</span>
                      <span className="text-sm text-gray-500">
                        {(user.points || 0) % 1000}/1000
                      </span>
                    </div>
                    <Progress value={((user.points || 0) % 1000) / 10} className="h-2" />
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="tasks" className="text-xs sm:text-sm py-2 sm:py-3">
                  Available Tasks
                </TabsTrigger>
                <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 sm:py-3">
                  My Reports
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-3">
                  Media Gallery
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2 sm:py-3">
                  Achievements
                </TabsTrigger>
              </TabsList>

              {/* Available Tasks Tab */}
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
                      {availableTasks.map((task) => {
                        const IconComponent = getTaskIcon(task.type);
                        return (
                          <div 
                            key={task.id} 
                            className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getTaskColor(task.type)} rounded-lg flex items-center justify-center`}>
                                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                      {task.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                                      {task.location}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">
                                  {task.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {task.points} points
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Due: {new Date(task.deadline).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleTaskSubmission(task)}
                                className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-sm sm:text-base px-4 py-2"
                              >
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

              {/* My Reports Tab */}
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
                        <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                            <p className="text-sm text-gray-600">
                              Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {report.pointsAwarded && (
                              <span className="text-sm font-medium text-green-600">
                                +{report.pointsAwarded} points
                              </span>
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

              {/* Media Gallery Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Media Gallery
                      </CardTitle>
                      <MediaUpload userId={user.citizenId} onUploadComplete={fetchUserMedia} />
                    </div>
                    <CardDescription>
                      Share and manage your civic activity photos and videos
                    </CardDescription>
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
                                <img
                                  src={media.file_url}
                                  alt={media.title || 'Uploaded media'}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : media.file_type.startsWith('video/') ? (
                                <video
                                  src={media.file_url}
                                  className="w-full h-full object-cover"
                                  controls
                                  preload="metadata"
                                />
                              ) : null}
                              
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="bg-white/90 hover:bg-white"
                                  onClick={() => window.open(media.file_url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="bg-red-500/90 hover:bg-red-500"
                                  onClick={() => handleDeleteMedia(media.id, media.file_url)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <CardContent className="p-3">
                              <p className="font-medium truncate text-gray-900">
                                {media.title || 'Untitled'}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-500">
                                  {new Date(media.created_at).toLocaleDateString()}
                                </p>
                                <Badge variant="secondary" className="text-xs">
                                  {media.file_type.split('/')[0]}
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Achievements & Badges
                    </CardTitle>
                    <CardDescription>
                      Your civic contributions and recognitions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      {/* Green Warrior Badge */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TreePine className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Green Warrior</h4>
                        <p className="text-sm text-gray-600">Planted 10+ trees</p>
                        <Badge className="mt-2 bg-green-600 text-white">Earned</Badge>
                      </div>

                      {/* Pollution Fighter Badge */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Eye className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Pollution Fighter</h4>
                        <p className="text-sm text-gray-600">5+ pollution reports</p>
                        <Badge className="mt-2 bg-blue-600 text-white">Earned</Badge>
                      </div>

                      {/* Corruption Buster Badge */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Corruption Buster</h4>
                        <p className="text-sm text-gray-400">3+ corruption reports</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>

                      {/* Community Leader Badge */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Community Leader</h4>
                        <p className="text-sm text-gray-400">Top 10 in region</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>

                      {/* Media Contributor Badge */}
                      <div className={`text-center p-6 border border-gray-200 rounded-lg ${userMedia.length >= 5 ? '' : 'opacity-50'}`}>
                        <div className={`w-16 h-16 ${userMedia.length >= 5 ? 'bg-purple-600' : 'bg-gray-300'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <h4 className={`font-semibold ${userMedia.length >= 5 ? 'text-gray-900' : 'text-gray-500'} mb-2`}>Media Contributor</h4>
                        <p className={`text-sm ${userMedia.length >= 5 ? 'text-gray-600' : 'text-gray-400'}`}>Upload 5+ media files</p>
                        <Badge className={`mt-2 ${userMedia.length >= 5 ? 'bg-purple-600' : 'bg-gray-400'} text-white`}>
                          {userMedia.length >= 5 ? 'Earned' : 'Locked'}
                        </Badge>
                      </div>

                      {/* Consistency Champion Badge */}
                      <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-500 mb-2">Consistency Champion</h4>
                        <p className="text-sm text-gray-400">30 days active</p>
                        <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                      </div>
                    </div>

                    {/* Progress to Next Badge */}
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

            {/* Quick Actions */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Access important features and services
                  </CardDescription>
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
                      <Button variant="outline" className="w-full justify-start h-auto py-3 border-red-700 text-red-700 hover:bg-red-700 hover:text-white">
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

            {/* Emergency Contact Section */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Emergency & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    Emergency Hotline: 108
                  </Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    Corruption Helpline: 1031
                  </Button>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    Technical Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}