import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { User, LogOut, Settings, Award, Menu, X } from "lucide-react";

export default function Navigation() {
  const { user, logout, isAuthenticated } = useCivitasStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Government Header Strip */}
      <div className="bg-gov-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-10 text-sm">
            <div className="flex items-center space-x-6">
              <span>Government of India</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Ministry of Electronics & IT</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <a href="#" className="hover:text-gov-gold transition-colors">हिंदी</a>
              <span>|</span>
              <a href="#" className="hover:text-gov-gold transition-colors">Accessibility</a>
              <span>|</span>
              <a href="#" className="hover:text-gov-gold transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b-2 border-gov-navy shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo & Emblem */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-2 lg:space-x-3">
                {/* Logo Image */}
                <img 
                  src="/logo.png" 
                  alt="Civitas Logo" 
                  className="w-10 h-10 lg:w-12 lg:h-12 object-contain"
                />
                <div>
                  <Link to="/" className="text-xl lg:text-2xl font-bold text-gov-navy">CIVITAS</Link>
                  <div className="text-xs text-gray-600 uppercase tracking-wide hidden sm:block">
                    Citizen Engagement Platform
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gov-navy hover:text-gov-maroon transition-colors font-medium"
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="text-gov-navy hover:text-gov-maroon transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/leaderboard"
                className="text-gov-navy hover:text-gov-maroon transition-colors font-medium"
              >
                Leaderboard
              </Link>
              <Link
                to="/about"
                className="text-gov-navy hover:text-gov-maroon transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/admin"
                className="text-gov-navy hover:text-gov-maroon transition-colors font-medium"
              >
                Government Portal
              </Link>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  {/* Display Citizen ID and Points */}
                  <div className="hidden xl:flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-mono text-gov-navy font-bold">
                        {user.citizenId}
                      </div>
                      <div className="text-xs text-gray-600">
                        {user.points} points
                      </div>
                    </div>
                    <Badge className="bg-gov-gold text-gov-navy">
                      <Award className="w-3 h-3 mr-1" />
                      Rank #{user.rank}
                    </Badge>
                  </div>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white">
                        <User className="w-4 h-4 mr-2" />
                        <span className="hidden xl:inline">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium">
                        <div className="font-mono">{user.citizenId}</div>
                        <div className="text-xs text-gray-500">{user.points} points</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/id-card" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          My ID Card
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/leaderboard" className="flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          Leaderboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      size="sm"
                      className="bg-gov-maroon hover:bg-gov-maroon/90 text-white"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gov-navy p-2"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              {/* User Info on Mobile */}
              {isAuthenticated && user && (
                <div className="bg-gov-navy/5 rounded-lg p-3 mb-3">
                  <div className="text-sm font-mono text-gov-navy font-bold">
                    {user.citizenId}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {user.points} points • Rank #{user.rank}
                  </div>
                  <Badge className="bg-gov-gold text-gov-navy text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Rank #{user.rank}
                  </Badge>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="block py-3 px-3 text-gov-navy hover:bg-gov-navy/5 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="block py-3 px-3 text-gov-navy hover:bg-gov-navy/5 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/id-card"
                    className="block py-3 px-3 text-gov-maroon hover:bg-gov-maroon/5 rounded-md transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My ID Card
                  </Link>
                </>
              )}

              <Link
                to="/leaderboard"
                className="block py-3 px-3 text-gov-navy hover:bg-gov-navy/5 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>

              <Link
                to="/about"
                className="block py-3 px-3 text-gov-navy hover:bg-gov-navy/5 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>

              <Link
                to="/admin"
                className="block py-3 px-3 text-gov-navy hover:bg-gov-navy/5 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Government Portal
              </Link>

              {/* Mobile Auth Buttons */}
              {isAuthenticated && user ? (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white"
                    >
                      Citizen Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      className="w-full bg-gov-maroon hover:bg-gov-maroon/90 text-white"
                    >
                      Register Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
