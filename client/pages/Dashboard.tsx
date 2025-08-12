import { useState, useEffect } from "react";
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
  Video, Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    getUserTasks,
    getUserReports
  } = useCivitasStore();

  const [availableTasks, setAvailableTasks] = useState<StoreTask[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [userMedia, setUserMedia] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Fetch user's media
  const fetchUserMedia = async () => {
    if (!user?.citizenId) return;
    try {
      const { data, error } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user.citizenId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserMedia(data || []);
    } catch (error: any) {
      toast.error('Error loading media: ' + error.message);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Delete media
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
      fetchUserMedia(); // Refresh media list
    } catch (error: any) {
      toast.error('Error deleting media: ' + error.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user's tasks and reports
    setAvailableTasks(getUserTasks());
    setRecentReports(getUserReports());
    
    // Load user's media
    fetchUserMedia();
  }, [isAuthenticated, navigate, getUserTasks, getUserReports, user?.citizenId]);

  if (!isAuthenticated || !user) {
    return null;
  }

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
      case "tree_planting": return "bg-gov-green";
      case "pollution_report": return "bg-gov-navy";
      case "corruption_report": return "bg-gov-maroon";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-gov-green";
      case "pending": return "bg-gov-gold";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleTaskSubmission = (task: StoreTask) => {
    navigate(`/submit-task/${task.id}`);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gov-navy">Citizen Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600">Welcome back, Citizen {user.citizenId}</p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <Badge className="bg-gov-gold text-gov-navy text-xs sm:text-sm">
                  Rank #{user.rank}
                </Badge>
                <Badge className="bg-gov-green text-white text-xs sm:text-sm">
                  {user.points} Points
                </Badge>
                <Badge className="bg-gov-navy text-white text-xs sm:text-sm">
                  {user.tasksCompleted} Tasks
                </Badge>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Media Gallery</span>
                  <MediaUpload userId={user.citizenId} onUploadComplete={fetchUserMedia} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {loadingMedia ? (
                    <p>Loading media...</p>
                  ) : userMedia.length === 0 ? (
                    <p>No media uploaded yet.</p>
                  ) : (
                    userMedia.map((media) => (
                      <Card key={media.id} className="overflow-hidden">
                        <div className="relative aspect-square">
                          {media.file_type.startsWith('image/') ? (
                            <img
                              src={media.file_url}
                              alt={media.title || 'Uploaded media'}
                              className="w-full h-full object-cover"
                            />
                          ) : media.file_type.startsWith('video/') ? (
                            <video
                              src={media.file_url}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : null}
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
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(media.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-gov-navy to-gov-navy/80 text-white">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-200 text-xs sm:text-sm">Total Points</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{user.points.toLocaleString()}</p>
                  </div>
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gov-gold" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-green to-gov-green/80 text-white">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-200 text-xs sm:text-sm">Tasks Completed</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{user.tasksCompleted}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-maroon to-gov-maroon/80 text-white">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-200 text-xs sm:text-sm">National Rank</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">#{user.rank}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gov-gold to-gov-gold/80 text-white">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                  <div className="text-center sm:text-left">
                    <p className="text-gray-800 text-xs sm:text-sm">Success Rate</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gov-navy">{user.successRate}%</p>
                  </div>
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gov-navy" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="tasks" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="tasks" className="text-xs sm:text-sm py-2 sm:py-3">Available Tasks</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs sm:text-sm py-2 sm:py-3">My Reports</TabsTrigger>
              <TabsTrigger value="media" className="text-xs sm:text-sm py-2 sm:py-3">Media Gallery</TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm py-2 sm:py-3">Achievements</TabsTrigger>
            </TabsList>

            {/* Available Tasks */}
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
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getTaskColor(task.type)} rounded-lg flex items-center justify-center`}>
                                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gov-navy text-sm sm:text-base truncate">{task.title}</h3>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">{task.location}</p>
                                </div>
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">{task.description}</p>
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
                              className="w-full sm:w-auto bg-gov-maroon hover:bg-gov-maroon/90 text-sm sm:text-base px-4 py-2"
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

            {/* My Reports */}
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
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gov-navy">{report.title}</h4>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {report.pointsAwarded && (
                            <span className="text-sm font-medium text-gov-green">
                              +{report.pointsAwarded} points
                            </span>
                          )}
                          <Badge className={`${getStatusColor(report.status)} text-white capitalize`}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Gallery */}
            <TabsContent value="media" className="space-y-6">
              <MediaUpload 
                userId={user.citizenId}
                onUploadComplete={() => fetchUserMedia()}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    My Media Gallery
                  </CardTitle>
                  <CardDescription>
                    Your uploaded photos and videos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMedia ? (
                    <div className="text-center py-8 text-gray-500">Loading media...</div>
                  ) : userMedia.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No media uploads yet</p>
                      <p className="text-sm">Share your first photo or video</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userMedia.map((media) => (
                        <Card key={media.id} className="overflow-hidden group">
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
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMedia(media.id, media.file_url)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-medium text-sm line-clamp-1">{media.title}</h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(media.created_at).toLocaleDateString()}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements */}
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
                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gov-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <TreePine className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gov-navy mb-2">Green Warrior</h4>
                      <p className="text-sm text-gray-600">Planted 10+ trees</p>
                      <Badge className="mt-2 bg-gov-green text-white">Earned</Badge>
                    </div>

                    <div className="text-center p-6 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gov-navy mb-2">Pollution Fighter</h4>
                      <p className="text-sm text-gray-600">5+ pollution reports</p>
                      <Badge className="mt-2 bg-gov-navy text-white">Earned</Badge>
                    </div>

                    <div className="text-center p-6 border border-gray-200 rounded-lg opacity-50">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-500 mb-2">Corruption Buster</h4>
                      <p className="text-sm text-gray-400">3+ corruption reports</p>
                      <Badge className="mt-2 bg-gray-400 text-white">Locked</Badge>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-semibold text-gov-navy mb-4">Progress to Next Badge</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Corruption Reports</span>
                          <span>1/3</span>
                        </div>
                        <Progress value={33} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monthly Active Days</span>
                          <span>12/20</span>
                        </div>
                        <Progress value={60} className="h-2" />
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Link to="/leaderboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View Leaderboard
                    </Button>
                  </Link>
                  <Link to="/id-card">
                    <Button variant="outline" className="w-full justify-start border-gov-maroon text-gov-maroon hover:bg-gov-maroon hover:text-white">
                      <User className="w-4 h-4 mr-2" />
                      My ID Card
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Nearby Tasks
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    Redeem Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
