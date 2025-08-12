import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCivitasStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Settings, 
  Award, 
  Menu, 
  X, 
  ChevronDown,
  Bell,
  Search,
  Shield,
  Home,
  BarChart3,
  Info,
  Building2,
  CreditCard,
  Globe
} from "lucide-react";

export default function Navigation() {
  const { user, logout, isAuthenticated } = useCivitasStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navigationLinks = [
    { path: '/', label: 'Home', icon: Home },
    ...(isAuthenticated ? [{ path: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : []),
    { path: '/leaderboard', label: 'Leaderboard', icon: Award },
    { path: '/about', label: 'About', icon: Info },
    { path: '/admin', label: 'Government Portal', icon: Building2 },
  ];

  return (
    <>
      {/* Enhanced Government Header Strip */}
      <div className="bg-gradient-to-r from-gov-navy via-gov-navy to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gov-gold" />
                <span className="font-medium">Government of India</span>
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="hidden sm:inline text-gray-200">Ministry of Electronics & IT</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <button className="flex items-center space-x-1 hover:text-gov-gold transition-colors">
                <Globe className="w-3 h-3" />
                <span>हिंदी</span>
              </button>
              <span className="text-gray-400">|</span>
              <button className="hover:text-gov-gold transition-colors">
                Accessibility
              </button>
              <span className="text-gray-400">|</span>
              <button className="hover:text-gov-gold transition-colors">
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Navigation */}
      <nav className={`bg-white border-b-2 border-gov-navy sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg backdrop-blur-sm bg-white/95' : 'shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Enhanced Logo & Emblem */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="Civitas Logo" 
                    className="w-10 h-10 lg:w-12 lg:h-12 object-contain transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-full bg-gov-gold/20 animate-pulse opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <Link 
                    to="/" 
                    className="text-xl lg:text-2xl font-bold text-gov-navy hover:text-gov-maroon transition-colors"
                  >
                    CIVITAS
                  </Link>
                  <div className="text-xs text-gray-600 uppercase tracking-wide hidden sm:block">
                    Citizen Engagement Platform
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {navigationLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive(path)
                      ? 'bg-gov-navy text-white shadow-md'
                      : 'text-gov-navy hover:text-gov-maroon hover:bg-gov-navy/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Enhanced Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Search Button */}
              <div className="relative">
                {showSearch ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-gov-navy text-white rounded-r-lg hover:bg-gov-navy/90 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery("");
                      }}
                      className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearch(true)}
                    className="text-gov-navy hover:bg-gov-navy/10"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {isAuthenticated && user ? (
                <>
                  {/* Notifications
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gov-navy hover:bg-gov-navy/10 relative"
                    >
                      <Bell className="w-4 h-4" />
                      {notifications?.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </Button>
                  // </div> */}

                  {/* Enhanced User Stats Display */}
                  <div className="hidden xl:flex items-center space-x-3 bg-gradient-to-r from-gov-navy/5 to-gov-gold/10 px-4 py-2 rounded-lg border border-gov-navy/20">
                    <div className="text-right">
                      <div className="text-sm font-mono text-gov-navy font-bold">
                        {user.citizenId}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center space-x-2">
                        <span>{user.points} points</span>
                        <span>•</span>
                        <span className="text-gov-maroon font-medium">Level {Math.floor(user.points / 100) + 1}</span>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-gov-gold to-yellow-400 text-gov-navy shadow-sm">
                      <Award className="w-3 h-3 mr-1" />
                      #{user.rank}
                    </Badge>
                  </div>

                  {/* Enhanced User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-all duration-200"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span className="hidden xl:inline">Menu</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                      <div className="px-3 py-2 bg-gradient-to-r from-gov-navy/5 to-gov-gold/5 rounded-lg mb-2">
                        <div className="font-mono font-bold text-gov-navy">{user.citizenId}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-between">
                          <span>{user.points} points</span>
                          <span className="text-gov-maroon font-medium">Level {Math.floor(user.points / 100) + 1}</span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center cursor-pointer">
                          <BarChart3 className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/id-card" className="flex items-center cursor-pointer">
                          <CreditCard className="w-4 h-4 mr-3" />
                          My ID Card
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/leaderboard" className="flex items-center cursor-pointer">
                          <Award className="w-4 h-4 mr-3" />
                          Leaderboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="flex items-center cursor-pointer">
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-all duration-200"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-gov-maroon to-red-700 hover:from-gov-maroon/90 hover:to-red-700/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gov-navy p-2 rounded-lg hover:bg-gov-navy/10 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 border-t border-gray-200' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-white px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gov-navy text-white rounded-lg hover:bg-gov-navy/90 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Enhanced User Info on Mobile */}
            {isAuthenticated && user && (
              <div className="bg-gradient-to-r from-gov-navy/5 to-gov-gold/10 rounded-xl p-4 mb-4 border border-gov-navy/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono text-gov-navy font-bold">
                      {user.citizenId}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center space-x-2 mt-1">
                      <span>{user.points} points</span>
                      <span>•</span>
                      <span className="text-gov-maroon font-medium">Level {Math.floor(user.points / 100) + 1}</span>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-gov-gold to-yellow-400 text-gov-navy shadow-sm">
                    <Award className="w-3 h-3 mr-1" />
                    #{user.rank}
                  </Badge>
                </div>
                {/* Notifications indicator on mobile
                {notifications?.length > 0 && (
                  <div className="mt-2 text-xs text-gov-maroon flex items-center">
                    <Bell className="w-3 h-3 mr-1" />
                    {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}
                  </div>
                )} */}
              </div>
            )}

            {/* Enhanced Mobile Navigation Links */}
            <div className="space-y-1">
              {navigationLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gov-navy text-white shadow-md'
                      : 'text-gov-navy hover:bg-gov-navy/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}

              {/* Additional mobile-only links */}
              {isAuthenticated && (
                <Link
                  to="/id-card"
                  className="flex items-center space-x-3 py-3 px-4 text-gov-maroon hover:bg-gov-maroon/5 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>My ID Card</span>
                </Link>
              )}
            </div>

            {/* Enhanced Mobile Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-all duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Citizen Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    className="w-full bg-gradient-to-r from-gov-maroon to-red-700 hover:from-gov-maroon/90 hover:to-red-700/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Register Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}