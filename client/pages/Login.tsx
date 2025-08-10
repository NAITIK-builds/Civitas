import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { Shield, LogIn, User, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCivitasStore();
  const [loginMethod, setLoginMethod] = useState("citizen-id");
  const [formData, setFormData] = useState({
    citizenId: "",
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    // Basic validation
    if (loginMethod === "citizen-id" && !formData.citizenId) {
      setLoginError("Please enter your Citizen ID");
      setIsSubmitting(false);
      return;
    }

    if (loginMethod === "email" && !formData.email) {
      setLoginError("Please enter your email address");
      setIsSubmitting(false);
      return;
    }

    if (!formData.password) {
      setLoginError("Please enter your password");
      setIsSubmitting(false);
      return;
    }

    // Use store login function
    try {
      const success = await login({
        citizenId: loginMethod === "citizen-id" ? formData.citizenId : undefined,
        email: loginMethod === "email" ? formData.email : undefined,
        password: formData.password
      });

      if (success) {
        navigate("/dashboard");
      } else {
        setLoginError("Invalid credentials. Please check your Citizen ID/Email and password.");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      
      <div className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gov-navy mb-2">Citizen Login</h1>
            <p className="text-sm sm:text-base text-gray-600">Access your civic engagement dashboard</p>
            <Badge className="mt-3 sm:mt-4 bg-gov-green text-white text-xs sm:text-sm">
              Secure & Anonymous
            </Badge>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gov-navy text-white p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                Secure Login
              </CardTitle>
              <CardDescription className="text-gray-200 text-sm">
                Your identity remains completely protected
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={loginMethod} onValueChange={setLoginMethod} className="mb-4 sm:mb-6">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                  <TabsTrigger value="citizen-id" className="text-xs sm:text-sm py-2 sm:py-3">Citizen ID</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs sm:text-sm py-2 sm:py-3">Email</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <TabsContent value="citizen-id" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="citizenId" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Citizen ID
                      </Label>
                      <Input
                        id="citizenId"
                        type="text"
                        placeholder="CIV123456ABCDEF"
                        value={formData.citizenId}
                        onChange={(e) => setFormData({...formData, citizenId: e.target.value.toUpperCase()})}
                        className="border-gray-300 focus:border-gov-navy font-mono tracking-wider"
                        required={loginMethod === "citizen-id"}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the Citizen ID provided during registration
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="email" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="border-gray-300 focus:border-gov-navy"
                        required={loginMethod === "email"}
                      />
                    </div>
                  </TabsContent>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="border-gray-300 focus:border-gov-navy pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{loginError}</span>
                    </div>
                  )}

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                      className="rounded border-gray-300 text-gov-navy focus:ring-gov-navy"
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      Remember me for 30 days
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gov-maroon hover:bg-gov-maroon/90 text-white py-3 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Authenticating..." : "Login to Dashboard"}
                  </Button>
                </form>
              </Tabs>

              {/* Additional Options */}
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Link to="#" className="text-sm text-gov-navy hover:underline">
                    Forgot your password?
                  </Link>
                </div>

                <div className="border-t pt-4">
                  <p className="text-center text-gray-600 text-sm mb-4">
                    Don't have a Citizen ID yet?
                  </p>
                  <Link to="/register">
                    <Button variant="outline" className="w-full border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white">
                      Register as New Citizen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Security & Privacy</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your login is encrypted and secure</li>
              <li>• No personal information is stored or tracked</li>
              <li>• Your civic contributions remain anonymous</li>
              <li>• Government cannot identify individual users</li>
            </ul>
          </div>

          {/* Demo Access */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Demo Access</h4>
            <p className="text-sm text-yellow-700 mb-3">
              For demonstration purposes, use any Citizen ID (6+ characters) and password (6+ characters).
            </p>
            <div className="flex flex-col gap-2 text-xs text-yellow-600">
              <span><strong>Example Citizen ID:</strong> CIV123DEMO</span>
              <span><strong>Example Password:</strong> demo123</span>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
