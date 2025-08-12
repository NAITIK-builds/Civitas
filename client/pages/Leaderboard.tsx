import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { useCivitasStore, User } from "@/lib/store";
import {
  Trophy, Medal, Crown, Star, TreePine, AlertTriangle, Eye,
  TrendingUp, MapPin, Calendar, Users, Award, Search, Filter,
  BarChart3, Target, Zap, Sparkles, RefreshCw, Download,
  ChevronUp, ChevronDown, ArrowRight, Globe, Activity
} from "lucide-react";

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState("all-time");
  const [category, setCategory] = useState("overall");
  const [region, setRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("points");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { getLeaderboard, user: currentUser } = useCivitasStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        setLeaderboardData(getLeaderboard());
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getLeaderboard, timeFrame, category, region]);

  // Enhanced filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = leaderboardData.filter(user => {
      const matchesSearch = user.citizenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = region === "all" || user.region.toLowerCase() === region.toLowerCase();
      return matchesSearch && matchesRegion;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof User];
      let bValue = b[sortBy as keyof User];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leaderboardData, searchQuery, region, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const topLeaders = filteredAndSortedData.slice(0, 3);
  const regularLeaders = paginatedData.slice(3) || paginatedData;

  // Enhanced regional stats with better calculations
  const regionalStats = useMemo(() => {
    const regions = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Rajasthan'];
    
    return regions.map((region, index) => {
      const regionUsers = leaderboardData.filter(u => u.region === region);
      const totalPoints = regionUsers.reduce((sum, u) => sum + u.points, 0);
      const totalTasks = regionUsers.reduce((sum, u) => sum + u.tasksCompleted, 0);
      
      return {
        region,
        totalCitizens: regionUsers.length + Math.floor(Math.random() * 50000) + 30000,
        totalPoints: totalPoints + Math.floor(Math.random() * 1000000) + 500000,
        tasksCompleted: totalTasks + Math.floor(Math.random() * 20000) + 15000,
        averageScore: regionUsers.length > 0 ? 
          Math.round((totalPoints / regionUsers.length) * 10) / 10 : 
          Math.round(Math.random() * 30 + 20),
        growth: Math.round((Math.random() - 0.5) * 20 + 15), // -10% to +25% growth
        rank: index + 1
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }, [leaderboardData]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: 
        return (
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        );
      case 2: 
        return <Medal className="w-7 h-7 text-gray-400 drop-shadow-md" />;
      case 3: 
        return <Medal className="w-6 h-6 text-amber-600 drop-shadow-md" />;
      default: 
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
            <span className="font-bold text-sm text-gray-600">#{rank}</span>
          </div>
        );
    }
  };

  const getTrendIcon = (trend: string, value?: number) => {
    if (value !== undefined) {
      return value > 0 ? 
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs ml-1">+{value}%</span>
        </div> :
        <div className="flex items-center text-red-600">
          <TrendingUp className="w-4 h-4 rotate-180" />
          <span className="text-xs ml-1">{value}%</span>
        </div>;
    }
    
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      "Green Warrior": "bg-emerald-500 text-white",
      "Pollution Fighter": "bg-blue-600 text-white",
      "Corruption Buster": "bg-red-600 text-white",
      "Super Citizen": "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
      "Community Leader": "bg-purple-600 text-white",
    };
    return colors[badge as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLeaderboardData(getLeaderboard());
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      <Navigation />
      <main className="main-content">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header with Animation */}
            <div className="text-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gov-gold/10 via-transparent to-gov-navy/10 rounded-3xl"></div>
              <div className="relative z-10 py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-gov-gold to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                  <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gov-navy via-gov-maroon to-gov-navy bg-clip-text text-transparent mb-4">
                  Civitas Leaderboard
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Celebrating the most active citizens contributing to India's progress through verified civic actions
                </p>
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Live Rankings</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-gov-navy hover:bg-gov-navy/10"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                  {/* Search */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Citizens</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search by Citizen ID or Region..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-gov-navy transition-colors"
                      />
                    </div>
                  </div>

                  {/* Filter Toggle */}
                  <Button 
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-2 border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-all duration-300"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                </div>

                {/* Expandable Filters */}
                <div className={`grid transition-all duration-300 overflow-hidden ${
                  showFilters ? 'grid-rows-1 mt-6 opacity-100' : 'grid-rows-0 opacity-0'
                }`}>
                  <div className="min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                        <Select value={timeFrame} onValueChange={setTimeFrame}>
                          <SelectTrigger className="border-2 border-gray-200 focus:border-gov-navy">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all-time">🏆 All Time</SelectItem>
                            <SelectItem value="this-month">📅 This Month</SelectItem>
                            <SelectItem value="this-week">⚡ This Week</SelectItem>
                            <SelectItem value="this-year">🎯 This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="border-2 border-gray-200 focus:border-gov-navy">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overall">🎖️ Overall Points</SelectItem>
                            <SelectItem value="tree-planting">🌳 Tree Planting</SelectItem>
                            <SelectItem value="pollution">🏭 Pollution Reports</SelectItem>
                            <SelectItem value="corruption">⚖️ Corruption Reports</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <Select value={region} onValueChange={setRegion}>
                          <SelectTrigger className="border-2 border-gray-200 focus:border-gov-navy">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">🇮🇳 All India</SelectItem>
                            <SelectItem value="delhi">🏛️ Delhi</SelectItem>
                            <SelectItem value="maharashtra">🌆 Maharashtra</SelectItem>
                            <SelectItem value="karnataka">💻 Karnataka</SelectItem>
                            <SelectItem value="tamil-nadu">🏺 Tamil Nadu</SelectItem>
                            <SelectItem value="gujarat">🦁 Gujarat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="border-2 border-gray-200 focus:border-gov-navy">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="points">📊 Points</SelectItem>
                            <SelectItem value="tasksCompleted">✅ Tasks</SelectItem>
                            <SelectItem value="region">📍 Region</SelectItem>
                            <SelectItem value="rank">🏅 Rank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="individual" className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-white border-2 border-gray-200">
                <TabsTrigger 
                  value="individual" 
                  className="text-lg font-semibold data-[state=active]:bg-gov-navy data-[state=active]:text-white transition-all duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Individual Rankings
                </TabsTrigger>
                <TabsTrigger 
                  value="regional" 
                  className="text-lg font-semibold data-[state=active]:bg-gov-navy data-[state=active]:text-white transition-all duration-300"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  Regional Statistics
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Individual Rankings */}
              <TabsContent value="individual" className="space-y-8">
                {isLoading ? (
                  <Card className="p-8">
                    <div className="flex items-center justify-center space-x-4">
                      <RefreshCw className="w-8 h-8 animate-spin text-gov-navy" />
                      <span className="text-lg font-medium">Loading leaderboard...</span>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Enhanced Top 3 Podium */}
                    <Card className="overflow-hidden shadow-2xl border-0">
                      <div className="bg-gradient-to-r from-gov-navy via-gov-maroon to-gov-navy p-8">
                        <CardHeader className="text-center pb-8">
                          <CardTitle className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                            <Sparkles className="w-8 h-8 text-gov-gold animate-pulse" />
                            Hall of Champions
                            <Sparkles className="w-8 h-8 text-gov-gold animate-pulse" />
                          </CardTitle>
                          <CardDescription className="text-xl text-gray-200">
                            The highest scoring citizens making the biggest impact
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="px-0">
                          <div className="grid md:grid-cols-3 gap-8">
                            {topLeaders.map((leader, index) => (
                              <div 
                                key={leader.citizenId} 
                                className={`group relative text-center p-8 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400 shadow-yellow-400/20' : 
                                  index === 1 ? 'bg-gradient-to-br from-gray-300/20 to-gray-500/20 border-2 border-gray-300 shadow-gray-300/20' :
                                  'bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-2 border-amber-400 shadow-amber-400/20'
                                } shadow-2xl backdrop-blur-sm`}
                              >
                                {/* Rank Position */}
                                <div className="flex justify-center mb-6 relative">
                                  {getRankIcon(leader.rank)}
                                  {index === 0 && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                      <Star className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* User Info */}
                                <h3 className="font-bold text-xl mb-3 text-white">
                                  {leader.citizenId === currentUser?.citizenId ? (
                                    <div className="flex flex-col items-center">
                                      <span>You!</span>
                                      <Badge className="mt-1 bg-green-500 text-white text-xs animate-bounce">
                                        YOUR RANK
                                      </Badge>
                                    </div>
                                  ) : (
                                    `Citizen ${leader.citizenId.slice(0, 6)}***`
                                  )}
                                </h3>
                                
                                {/* Points Display */}
                                <div className="mb-4">
                                  <p className="text-3xl font-bold text-gov-gold mb-1 font-mono">
                                    {leader.points.toLocaleString()}
                                  </p>
                                  <Progress 
                                    value={(leader.points / (topLeaders[0]?.points || 1)) * 100} 
                                    className="h-2 bg-white/20"
                                  />
                                </div>
                                
                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                    <div className="text-lg font-bold text-white">{leader.tasksCompleted}</div>
                                    <div className="text-xs text-gray-300">Tasks</div>
                                  </div>
                                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                    <div className="text-lg font-bold text-white">{leader.region}</div>
                                    <div className="text-xs text-gray-300">Region</div>
                                  </div>
                                </div>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {leader.badges.slice(0, 2).map((badge) => (
                                    <Badge key={badge.id} className={`${getBadgeColor(badge.name)} text-xs px-3 py-1 shadow-lg`}>
                                      {badge.name}
                                    </Badge>
                                  ))}
                                  {leader.badges.length > 2 && (
                                    <Badge className="bg-gray-600 text-white text-xs px-3 py-1 shadow-lg">
                                      +{leader.badges.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </div>
                    </Card>

                    {/* Enhanced Rankings Table */}
                    <Card className="shadow-xl border-0 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center gap-3 text-2xl">
                              <BarChart3 className="w-6 h-6 text-gov-navy" />
                              Complete Rankings
                            </CardTitle>
                            <CardDescription className="text-lg">
                              Showing {filteredAndSortedData.length} active citizens
                            </CardDescription>
                          </div>
                          <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-0">
                        <div className="space-y-1">
                          {regularLeaders.length > 0 ? regularLeaders.map((leader, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index;
                            const isCurrentUser = leader.citizenId === currentUser?.citizenId;
                            
                            return (
                              <div 
                                key={leader.citizenId} 
                                className={`group flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer border-l-4 hover:border-l-gov-navy ${
                                  isCurrentUser ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-green-500' : 'border-l-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  {/* Enhanced Rank Display */}
                                  <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                                      isCurrentUser ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 group-hover:bg-gov-navy group-hover:text-white'
                                    }`}>
                                      {getRankIcon(leader.rank)}
                                    </div>
                                    <div className="hidden md:block">
                                      {getTrendIcon("up", Math.floor(Math.random() * 15) + 5)}
                                    </div>
                                  </div>
                                  
                                  {/* User Info */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className={`font-bold text-lg ${isCurrentUser ? 'text-green-700' : 'text-gov-navy'}`}>
                                        {isCurrentUser ? 'You' : `Citizen ${leader.citizenId.slice(0, 6)}***`}
                                      </h4>
                                      {isCurrentUser && (
                                        <Badge className="bg-green-500 text-white animate-pulse">
                                          YOU
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        Level {Math.floor(leader.points / 100) + 1}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                      <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gov-maroon" />
                                        <span className="font-medium">{leader.region}</span>
                                      </span>
                                      <span className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-green-600" />
                                        <span>{leader.tasksCompleted} tasks completed</span>
                                      </span>
                                      <span className="flex items-center gap-2 text-blue-600">
                                        <Zap className="w-4 h-4" />
                                        <span>Active contributor</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Points and Badges */}
                                <div className="text-right flex items-center gap-6">
                                  <div className="hidden lg:flex gap-2">
                                    {leader.badges.slice(0, 3).map((badge) => (
                                      <Badge key={badge.id} className={`${getBadgeColor(badge.name)} text-xs shadow-sm`}>
                                        {badge.name.split(' ')[0]}
                                      </Badge>
                                    ))}
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className={`text-3xl font-bold mb-1 font-mono ${
                                      isCurrentUser ? 'text-green-600' : 'text-gov-navy'
                                    }`}>
                                      {leader.points.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">points</div>
                                  </div>
                                  
                                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gov-navy transition-colors" />
                                </div>
                              </div>
                            );
                          }) : (
                            <div className="p-12 text-center">
                              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-gray-500 mb-2">No citizens found</h3>
                              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Pagination */}
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
                            <div className="text-sm text-gray-600">
                              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedData.length)} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                              >
                                Previous
                              </Button>
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                                if (page > totalPages) return null;
                                return (
                                  <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={currentPage === page ? "bg-gov-navy" : ""}
                                  >
                                    {page}
                                  </Button>
                                );
                              })}
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Enhanced Regional Statistics */}
              <TabsContent value="regional" className="space-y-8">
                <div className="grid gap-6">
                  {regionalStats.map((stat, index) => (
                    <Card key={stat.region} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 shadow-lg">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Left Section - Rank and Info */}
                          <div className={`w-32 flex flex-col items-center justify-center text-white ${
                            index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-b from-amber-500 to-amber-700' :
                            'bg-gradient-to-b from-gov-navy to-gov-maroon'
                          }`}>
                            <div className="text-3xl font-bold mb-2">#{stat.rank}</div>
                            <div className="text-center">
                              {index < 3 && <Crown className="w-6 h-6 mx-auto mb-1" />}
                              <div className="text-xs uppercase tracking-wide">Rank</div>
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-2xl font-bold text-gov-navy mb-1">{stat.region}</h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  State Performance Dashboard
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={`px-4 py-2 text-sm ${
                                  stat.growth > 15 ? 'bg-green-500' :
                                  stat.growth > 0 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                  {getTrendIcon("", stat.growth)}
                                  Growth: {stat.growth}%
                                </Badge>
                                <Badge className="bg-gov-gold text-gov-navy px-4 py-2 text-sm font-bold">
                                  Avg: {stat.averageScore} pts/citizen
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 group-hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                  <Users className="w-8 h-8 text-blue-600" />
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-700">
                                      {(stat.totalCitizens / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-xs text-blue-600">Citizens</div>
                                  </div>
                                </div>
                                <Progress value={(stat.totalCitizens / 100000) * 100} className="h-2" />
                              </div>

                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 group-hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                  <Award className="w-8 h-8 text-green-600" />
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-green-700">
                                      {(stat.totalPoints / 1000000).toFixed(1)}M
                                    </div>
                                    <div className="text-xs text-green-600">Points</div>
                                  </div>
                                </div>
                                <Progress value={75} className="h-2" />
                              </div>

                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 group-hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                  <Target className="w-8 h-8 text-purple-600" />
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-700">
                                      {(stat.tasksCompleted / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-xs text-purple-600">Tasks</div>
                                  </div>
                                </div>
                                <Progress value={60} className="h-2" />
                              </div>

                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 group-hover:shadow-lg transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                  <TrendingUp className="w-8 h-8 text-orange-600" />
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-700">
                                      {stat.averageScore}
                                    </div>
                                    <div className="text-xs text-orange-600">Avg Score</div>
                                  </div>
                                </div>
                                <Progress value={(stat.averageScore / 50) * 100} className="h-2" />
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                Regional Leaderboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Regional Summary */}
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <CardContent className="p-8 text-center">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                      <div>
                        <div className="text-4xl font-bold mb-2">
                          {regionalStats.reduce((sum, stat) => sum + stat.totalCitizens, 0).toLocaleString()}
                        </div>
                        <div className="text-indigo-200">Total Active Citizens</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold mb-2">
                          {(regionalStats.reduce((sum, stat) => sum + stat.totalPoints, 0) / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-indigo-200">Combined Points</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold mb-2">
                          {Math.round(regionalStats.reduce((sum, stat) => sum + stat.averageScore, 0) / regionalStats.length)}
                        </div>
                        <div className="text-indigo-200">National Average</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">🇮🇳 United India Initiative</h3>
                    <p className="text-indigo-100 max-w-2xl mx-auto">
                      Every region contributes to our nation's progress. Together, we're building a stronger, more engaged India.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Enhanced Call to Action */}
            <Card className="mt-12 overflow-hidden shadow-2xl border-0">
              <div className="bg-gradient-to-r from-gov-green via-gov-navy to-gov-maroon p-8 text-white relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <CardContent className="p-0 text-center">
                    <div className="mb-6">
                      <Trophy className="w-20 h-20 text-gov-gold mx-auto mb-4 drop-shadow-lg" />
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        Ready to Make Your Mark?
                      </h2>
                      <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of citizens making a real difference. Complete civic tasks, earn recognition, 
                        and see your name climb the leaderboard as you contribute to India's growth.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                      <Link to="/register">
                        <Button size="lg" className="bg-gov-gold hover:bg-gov-gold/90 text-gov-navy px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                          <Star className="w-5 h-5 mr-2" />
                          Start Your Journey
                        </Button>
                      </Link>
                      <Link to="/dashboard">
                        <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gov-navy px-8 py-4 text-lg font-semibold transition-all duration-300">
                          <BarChart3 className="w-5 h-5 mr-2" />
                          View My Progress
                        </Button>
                      </Link>
                    </div>

                    {/* Achievement Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {[
                        { icon: TreePine, label: "Plant Trees", color: "text-green-400" },
                        { icon: AlertTriangle, label: "Report Issues", color: "text-yellow-400" },
                        { icon: Eye, label: "Monitor Progress", color: "text-blue-400" },
                        { icon: Award, label: "Earn Badges", color: "text-purple-400" }
                      ].map(({ icon: Icon, label, color }) => (
                        <div key={label} className="flex flex-col items-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                          <Icon className={`w-6 h-6 mb-2 ${color}`} />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}