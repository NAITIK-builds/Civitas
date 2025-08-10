import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { useCivitasStore, User } from "@/lib/store";
import {
  Trophy, Medal, Crown, Star, TreePine, AlertTriangle, Eye,
  TrendingUp, MapPin, Calendar, Users, Award
} from "lucide-react";

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState("all-time");
  const [category, setCategory] = useState("overall");
  const [region, setRegion] = useState("all");
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);

  const { getLeaderboard } = useCivitasStore();

  useEffect(() => {
    setLeaderboardData(getLeaderboard());
  }, [getLeaderboard]);

  const topLeaders = leaderboardData.slice(0, 3);
  const regularLeaders = leaderboardData.slice(3, 11);

  const regionalStats = [
    {
      region: "Delhi",
      totalCitizens: leaderboardData.filter(u => u.region === "Delhi").length + 45000,
      totalPoints: leaderboardData.filter(u => u.region === "Delhi").reduce((sum, u) => sum + u.points, 0) + 1200000,
      tasksCompleted: leaderboardData.filter(u => u.region === "Delhi").reduce((sum, u) => sum + u.tasksCompleted, 0) + 23000,
      averageScore: 27.4
    },
    {
      region: "Maharashtra",
      totalCitizens: leaderboardData.filter(u => u.region === "Maharashtra").length + 67000,
      totalPoints: leaderboardData.filter(u => u.region === "Maharashtra").reduce((sum, u) => sum + u.points, 0) + 1850000,
      tasksCompleted: leaderboardData.filter(u => u.region === "Maharashtra").reduce((sum, u) => sum + u.tasksCompleted, 0) + 34000,
      averageScore: 27.8
    },
    {
      region: "Karnataka",
      totalCitizens: leaderboardData.filter(u => u.region === "Karnataka").length + 38000,
      totalPoints: leaderboardData.filter(u => u.region === "Karnataka").reduce((sum, u) => sum + u.points, 0) + 950000,
      tasksCompleted: leaderboardData.filter(u => u.region === "Karnataka").reduce((sum, u) => sum + u.tasksCompleted, 0) + 18000,
      averageScore: 25.2
    },
    {
      region: "Tamil Nadu",
      totalCitizens: leaderboardData.filter(u => u.region === "Tamil Nadu").length + 52000,
      totalPoints: leaderboardData.filter(u => u.region === "Tamil Nadu").reduce((sum, u) => sum + u.points, 0) + 1300000,
      tasksCompleted: leaderboardData.filter(u => u.region === "Tamil Nadu").reduce((sum, u) => sum + u.tasksCompleted, 0) + 26000,
      averageScore: 25.6
    },
    {
      region: "Gujarat",
      totalCitizens: leaderboardData.filter(u => u.region === "Gujarat").length + 41000,
      totalPoints: leaderboardData.filter(u => u.region === "Gujarat").reduce((sum, u) => sum + u.points, 0) + 1100000,
      tasksCompleted: leaderboardData.filter(u => u.region === "Gujarat").reduce((sum, u) => sum + u.tasksCompleted, 0) + 21000,
      averageScore: 27.1
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-bold text-lg text-gray-600">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Green Warrior": return "bg-gov-green";
      case "Pollution Fighter": return "bg-gov-navy";
      case "Corruption Buster": return "bg-gov-maroon";
      case "Super Citizen": return "bg-gov-gold text-gov-navy";
      case "Community Leader": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gov-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gov-navy" />
            </div>
            <h1 className="text-3xl font-bold text-gov-navy mb-2">Civitas Leaderboard</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Celebrating the most active citizens contributing to India's progress through verified civic actions
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall Points</SelectItem>
                      <SelectItem value="tree-planting">Tree Planting</SelectItem>
                      <SelectItem value="pollution">Pollution Reports</SelectItem>
                      <SelectItem value="corruption">Corruption Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All India</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="individual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Rankings</TabsTrigger>
              <TabsTrigger value="regional">Regional Statistics</TabsTrigger>
            </TabsList>

            {/* Individual Rankings */}
            <TabsContent value="individual" className="space-y-6">
              {/* Top 3 */}
              <Card className="bg-gradient-to-r from-gov-navy to-gov-maroon text-white">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Top Contributors</CardTitle>
                  <CardDescription className="text-center text-gray-200">
                    The highest scoring citizens making the biggest impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {topLeaders.map((leader, index) => (
                      <div key={leader.citizenId} className={`text-center p-6 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-400' : 
                        index === 1 ? 'bg-gray-300/20 border-2 border-gray-300' :
                        'bg-amber-600/20 border-2 border-amber-500'
                      }`}>
                        <div className="flex justify-center mb-4">
                          {getRankIcon(leader.rank)}
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                          Citizen {leader.citizenId.slice(0, 6)}***
                        </h3>
                        <p className="text-2xl font-bold text-gov-gold mb-2">
                          {leader.points.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-200 mb-3">
                          {leader.tasksCompleted} tasks • {leader.region}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {leader.badges.slice(0, 2).map((badge) => (
                            <Badge key={badge.id} className={`${badge.color} text-white text-xs`}>
                              {badge.name}
                            </Badge>
                          ))}
                          {leader.badges.length > 2 && (
                            <Badge className="bg-gray-500 text-white text-xs">
                              +{leader.badges.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rest of Rankings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Complete Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regularLeaders.map((leader) => (
                      <div key={leader.citizenId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {getRankIcon(leader.rank)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gov-navy">
                                Citizen {leader.citizenId.slice(0, 6)}***
                              </h4>
                              {getTrendIcon("up")}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {leader.region}
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                {leader.tasksCompleted} tasks
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Active member
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gov-navy mb-1">
                            {leader.points.toLocaleString()}
                          </div>
                          <div className="flex gap-1">
                            {leader.badges.slice(0, 3).map((badge) => (
                              <Badge key={badge.id} className={`${badge.color} text-white text-xs`}>
                                {badge.name.split(' ')[0]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button variant="outline" className="border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white">
                      Load More Rankings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Regional Statistics */}
            <TabsContent value="regional" className="space-y-6">
              <div className="grid gap-6">
                {regionalStats.map((stat, index) => (
                  <Card key={stat.region} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-gov-navy'
                          }`}>
                            <span className="text-white font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gov-navy">{stat.region}</h3>
                            <p className="text-gray-600">State Performance</p>
                          </div>
                        </div>
                        <Badge className="bg-gov-gold text-gov-navy">
                          Avg: {stat.averageScore} pts/citizen
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Users className="w-6 h-6 text-gov-navy mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gov-navy">
                            {stat.totalCitizens.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Citizens</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Award className="w-6 h-6 text-gov-green mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gov-green">
                            {(stat.totalPoints / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-sm text-gray-600">Total Points</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Star className="w-6 h-6 text-gov-maroon mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gov-maroon">
                            {stat.tasksCompleted.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Tasks Done</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-gov-gold mx-auto mb-2" />
                          <div className="text-2xl font-bold text-gov-navy">
                            {stat.averageScore}
                          </div>
                          <div className="text-sm text-gray-600">Avg Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-gov-green to-gov-navy text-white">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-gov-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Join the Leaderboard!</h2>
              <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
                Start contributing to your community and nation. Complete civic tasks, earn points, 
                and see your name among India's top civic contributors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-gov-gold hover:bg-gov-gold/90 text-gov-navy px-8 py-3">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gov-navy px-8 py-3">
                    View My Progress
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </div>
  );
}
