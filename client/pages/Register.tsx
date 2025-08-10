import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useCivitasStore } from "@/lib/store";
import { Shield, CheckCircle, User, Mail, MapPin, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    region: "",
    preferredLanguage: "en",
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCitizenId, setGeneratedCitizenId] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { register } = useCivitasStore();

  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", 
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const generateCitizenId = () => {
    const prefix = "CIV";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      alert("Please agree to the terms and privacy policy");
      return;
    }

    setIsSubmitting(true);

    try {
      const citizenId = await register(formData);
      setGeneratedCitizenId(citizenId);
      setRegistrationComplete(true);
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-gov-green shadow-xl">
              <CardHeader className="text-center bg-gov-green text-white">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gov-green" />
                </div>
                <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                <CardDescription className="text-green-100">
                  Your Citizen ID has been generated
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gov-navy mb-4">Your Citizen ID</h3>
                  <div className="bg-gov-navy text-white text-3xl font-bold py-4 px-6 rounded-lg mb-6 font-mono tracking-wider">
                    {generatedCitizenId}
                  </div>
                  <p className="text-gray-600 text-sm mb-6">
                    Please save this Citizen ID securely. You will need it to log in and participate in civic activities.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Security Notice:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your identity remains completely anonymous</li>
                    <li>• Only you have access to this Citizen ID</li>
                    <li>• Government cannot track your personal information</li>
                    <li>• All reports are processed anonymously</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login" className="flex-1">
                    <Button className="w-full bg-gov-navy hover:bg-gov-navy/90">
                      Login with Citizen ID
                    </Button>
                  </Link>
                  <Link to="/id-card" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-gov-maroon text-gov-maroon hover:bg-gov-maroon hover:text-white"
                    >
                      View Digital ID Card
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gov-navy mb-2">Citizen Registration</h1>
            <p className="text-gray-600">Join millions of Indians in building a better nation</p>
            <Badge className="mt-4 bg-gov-gold text-gov-navy">
              100% Anonymous & Secure
            </Badge>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gov-navy text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Secure Registration Form
              </CardTitle>
              <CardDescription className="text-gray-200">
                All information is encrypted and your identity remains anonymous
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="border-gray-300 focus:border-gov-navy"
                  />
                  <p className="text-xs text-gray-500">
                    Used only for password recovery. You can register without email for complete anonymity.
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="border-gray-300 focus:border-gov-navy pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    State/UT
                  </Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-gov-navy">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData({...formData, preferredLanguage: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-gov-navy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="ta">தம���ழ் (Tamil)</SelectItem>
                      <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                      <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                      <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                      <SelectItem value="ml">മല��ാളം (Malayalam)</SelectItem>
                      <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the <Link to="/terms" className="text-gov-navy hover:underline">Terms of Service</Link> and understand that my participation in civic activities will be verified by AI systems.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.agreeToPrivacy}
                      onCheckedChange={(checked) => setFormData({...formData, agreeToPrivacy: checked as boolean})}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed">
                      I acknowledge the <Link to="/privacy" className="text-gov-navy hover:underline">Privacy Policy</Link> and confirm my identity will remain anonymous while participating in government transparency initiatives.
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gov-maroon hover:bg-gov-maroon/90 text-white py-3 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating Citizen ID..." : "Generate My Citizen ID"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have a Citizen ID?{" "}
                  <Link to="/login" className="text-gov-navy hover:underline font-medium">
                    Login here
                  </Link>
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
