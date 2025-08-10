import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Shield, Lock, Eye, AlertTriangle, FileText, Calendar } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gov-navy mb-4">Privacy Policy</h1>
            <Badge className="mb-4 px-4 py-2 bg-gov-gold text-gov-navy">
              Last Updated: December 2024
            </Badge>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy and anonymity are our highest priorities. This policy explains how we protect your data.
            </p>
          </div>

          {/* Key Principles */}
          <Card className="mb-8 bg-gradient-to-r from-gov-green to-gov-navy text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Our Privacy Principles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Complete Anonymity</h3>
                  <p className="text-sm text-gray-200">No personal identification required</p>
                </div>
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Tracking</h3>
                  <p className="text-sm text-gray-200">We don't track your browsing or behavior</p>
                </div>
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Secure Storage</h3>
                  <p className="text-sm text-gray-200">All data encrypted and protected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Sections */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Anonymous Information Only:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Unique Citizen ID (randomly generated, not linked to personal identity)</li>
                  <li>Optional email address (only for password recovery if provided)</li>
                  <li>State/region selection (for task assignment purposes)</li>
                  <li>Task submissions (photos, location data, descriptions)</li>
                  <li>Points and achievement data</li>
                </ul>
                
                <h4 className="font-semibold text-gov-navy mt-6">What We DON'T Collect:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Real names or personal identification</li>
                  <li>Phone numbers or addresses</li>
                  <li>Aadhaar numbers or government IDs</li>
                  <li>Banking or financial information</li>
                  <li>Browsing history or cookies for tracking</li>
                  <li>Device identifiers or fingerprinting</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">We use the collected information solely for:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Task Assignment:</strong> Providing relevant civic tasks based on your region</li>
                  <li><strong>Verification:</strong> AI-powered verification of submitted reports</li>
                  <li><strong>Progress Tracking:</strong> Maintaining your points, badges, and achievements</li>
                  <li><strong>Platform Security:</strong> Preventing fraud and ensuring system integrity</li>
                  <li><strong>Aggregate Statistics:</strong> Creating anonymized national impact reports</li>
                </ul>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Government Transparency</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    Even government officials cannot identify individual citizens. All reports are processed 
                    anonymously, ensuring your safety when reporting sensitive issues.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  3. Data Security & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Security Measures:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Advanced encryption (AES-256) for data storage</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Secure government-grade infrastructure</li>
                  <li>No third-party tracking or analytics services</li>
                  <li>Automatic data deletion after specified retention periods</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">Data Retention:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Citizen IDs and points: Retained indefinitely for continuity</li>
                  <li>Task submissions: Archived after 2 years</li>
                  <li>Photos and media: Automatically deleted after verification</li>
                  <li>Location data: Anonymized immediately after verification</li>
                  <li>Login sessions: Cleared after 30 days of inactivity</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  4. Information Sharing & Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">We NEVER Share:</h4>
                  <ul className="list-disc list-inside space-y-2 text-red-700 text-sm ml-4">
                    <li>Individual citizen identities or personal information</li>
                    <li>Specific user data with third parties</li>
                    <li>Data for commercial purposes</li>
                    <li>Information that could identify specific users</li>
                  </ul>
                </div>

                <h4 className="font-semibold text-gov-navy mt-6">What We May Share:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Aggregate Statistics:</strong> Anonymized data for public impact reports</li>
                  <li><strong>Verified Reports:</strong> Task outcomes with government departments (anonymized)</li>
                  <li><strong>Regional Data:</strong> State-wise performance metrics for policy making</li>
                  <li><strong>Legal Compliance:</strong> Only if required by court order (still anonymized)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  5. Your Rights & Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">You Have the Right To:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Access Your Data:</strong> View all information associated with your Citizen ID</li>
                  <li><strong>Delete Your Account:</strong> Permanent removal of all associated data</li>
                  <li><strong>Data Portability:</strong> Export your points and achievement history</li>
                  <li><strong>Opt-out:</strong> Stop participating at any time without consequences</li>
                  <li><strong>Update Information:</strong> Modify optional details like region or language</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Contact for Privacy Concerns:</h4>
                  <p className="text-blue-700 text-sm">
                    Email: privacy@civitas.gov.in<br />
                    Phone: 1800-CIVITAS (1800-248-4827)<br />
                    Response time: Within 72 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Updates to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  We may update this privacy policy to reflect changes in our practices or legal requirements. 
                  When we make significant changes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We'll notify all users through the platform dashboard</li>
                  <li>Email notifications to users who provided email addresses</li>
                  <li>30-day notice period before changes take effect</li>
                  <li>Clear explanation of what changed and why</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              By using Civitas, you agree to this Privacy Policy and our commitment to protecting your anonymity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/terms">
                <button className="px-6 py-2 border border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-colors rounded">
                  Terms of Service
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2 bg-gov-maroon text-white hover:bg-gov-maroon/90 transition-colors rounded">
                  Start Contributing Anonymously
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
