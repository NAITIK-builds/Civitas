import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { FileText, Shield, AlertTriangle, CheckCircle, Scale, Users } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-6">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gov-navy mb-4">Terms of Service</h1>
            <Badge className="mb-4 px-4 py-2 bg-gov-gold text-gov-navy">
              Effective Date: December 2024
            </Badge>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These terms govern your use of the Civitas platform and your participation in civic activities.
            </p>
          </div>

          {/* Key Commitments */}
          <Card className="mb-8 bg-gradient-to-r from-gov-navy to-gov-maroon text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Our Commitments to You</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Anonymous Protection</h3>
                  <p className="text-sm text-gray-200">Your identity remains completely protected</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Fair Verification</h3>
                  <p className="text-sm text-gray-200">Transparent and unbiased review process</p>
                </div>
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Equal Access</h3>
                  <p className="text-sm text-gray-200">All citizens have equal participation rights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Terms */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  By accessing or using the Civitas platform ("Service"), you agree to be bound by these 
                  Terms of Service ("Terms"). If you disagree with any part of these terms, you may not 
                  access the Service.
                </p>
                
                <h4 className="font-semibold text-gov-navy">Who Can Use Civitas:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Indian citizens aged 18 and above</li>
                  <li>Legal residents of India with valid documentation</li>
                  <li>Government officials and authorized personnel</li>
                  <li>Individuals acting in good faith for civic improvement</li>
                </ul>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Important Note</h4>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    While registration is anonymous, you must be eligible to participate in Indian civic activities. 
                    False representation of eligibility may result in account termination.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  2. User Responsibilities & Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">You Agree To:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Provide accurate and truthful information in all submissions</li>
                  <li>Upload authentic photos and evidence of your civic activities</li>
                  <li>Respect the anonymous nature of other participants</li>
                  <li>Use the platform solely for legitimate civic purposes</li>
                  <li>Report only genuine incidents and observations</li>
                  <li>Maintain the security of your Citizen ID credentials</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">You Must NOT:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Submit false, misleading, or fabricated reports</li>
                  <li>Upload inappropriate, offensive, or unrelated content</li>
                  <li>Attempt to identify other anonymous users</li>
                  <li>Use the platform for commercial or promotional purposes</li>
                  <li>Manipulate or game the points/rewards system</li>
                  <li>Interfere with platform security or operations</li>
                  <li>Create multiple accounts to gain unfair advantages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  3. Verification Process & Points System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">AI Verification System:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>All submissions undergo automated AI verification</li>
                  <li>Verification scores range from 0-100% based on authenticity indicators</li>
                  <li>Government officials review submissions with scores below 70%</li>
                  <li>Appeals process available for rejected submissions</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">Points & Rewards:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Points awarded only for verified, genuine contributions</li>
                  <li>Point values determined by task complexity and impact</li>
                  <li>Badges and rankings based on sustained positive contributions</li>
                  <li>Points cannot be transferred, sold, or exchanged for money</li>
                  <li>Fraudulent activity results in point forfeiture</li>
                </ul>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Fair Review Guarantee:</h4>
                  <p className="text-green-700 text-sm">
                    All submissions receive fair, unbiased review. If you believe your submission was 
                    incorrectly rejected, you can appeal within 30 days with additional evidence.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  4. Prohibited Activities & Consequences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Serious Violations Include:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Fraud:</strong> Submitting fake reports or manipulated evidence</li>
                  <li><strong>Abuse:</strong> Misusing the corruption reporting system</li>
                  <li><strong>Harassment:</strong> Attempting to identify or target other users</li>
                  <li><strong>System Abuse:</strong> Exploiting platform vulnerabilities</li>
                  <li><strong>Illegal Activity:</strong> Using the platform for unlawful purposes</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">Consequences:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">First Offense</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Warning notification</li>
                      <li>• Temporary point suspension</li>
                      <li>• Mandatory re-education</li>
                    </ul>
                  </div>
                  <div className="border border-orange-200 rounded-lg p-4">
                    <h5 className="font-semibold text-orange-800 mb-2">Repeat Offense</h5>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• 30-day suspension</li>
                      <li>• Point forfeiture</li>
                      <li>• Badge removal</li>
                    </ul>
                  </div>
                  <div className="border border-red-200 rounded-lg p-4">
                    <h5 className="font-semibold text-red-800 mb-2">Serious Violations</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Permanent account ban</li>
                      <li>• Legal action if applicable</li>
                      <li>• Report to authorities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Platform Availability & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Service Availability:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                  <li>Planned maintenance will be announced 48 hours in advance</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>No compensation for temporary service interruptions</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">User Support:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Help desk available during business hours (9 AM - 6 PM IST)</li>
                  <li>Response time: Within 72 hours for general inquiries</li>
                  <li>Priority support for corruption and safety-related reports</li>
                  <li>Multilingual support in Hindi, English, and regional languages</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Intellectual Property & Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Your Content:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You retain ownership of photos and content you submit</li>
                  <li>You grant Civitas license to use content for verification and reporting</li>
                  <li>Content may be used in anonymized aggregate reports</li>
                  <li>You confirm you have the right to submit all content</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">Platform Content:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Civitas platform, design, and features are government property</li>
                  <li>You may not copy, modify, or redistribute platform elements</li>
                  <li>Screenshots and sharing for civic promotion are permitted</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Disclaimer & Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Service Provided "As Is":</h4>
                  <p className="text-gray-700 text-sm">
                    Civitas is provided as a public service without warranties of any kind. 
                    While we strive for accuracy and reliability, we cannot guarantee the platform 
                    will meet all your requirements or be error-free.
                  </p>
                </div>

                <h4 className="font-semibold text-gov-navy">Limitations:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We are not liable for user-generated content or reports</li>
                  <li>Participation in civic activities is at your own discretion and risk</li>
                  <li>We cannot guarantee specific outcomes from reported issues</li>
                  <li>Points and badges have no monetary value</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes to Terms & Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-gov-navy">Updates to Terms:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We may update these terms to reflect legal or operational changes</li>
                  <li>Users will be notified 30 days before significant changes</li>
                  <li>Continued use after notification constitutes acceptance</li>
                  <li>You may terminate your account if you disagree with changes</li>
                </ul>

                <h4 className="font-semibold text-gov-navy mt-6">Account Termination:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You may delete your account at any time</li>
                  <li>We may suspend accounts for terms violations</li>
                  <li>Data retention follows our Privacy Policy</li>
                  <li>Points and achievements are forfeited upon termination</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact & Legal */}
          <Card className="mt-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gov-navy mb-4">Questions About These Terms?</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold text-gov-navy mb-2">General Inquiries:</h4>
                  <p>Email: legal@civitas.gov.in</p>
                  <p>Phone: 1800-CIVITAS</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gov-navy mb-2">Legal Department:</h4>
                  <p>Ministry of Electronics & IT</p>
                  <p>Electronics Niketan, New Delhi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              By using Civitas, you acknowledge that you have read, understood, and agree to these Terms of Service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/privacy">
                <button className="px-6 py-2 border border-gov-navy text-gov-navy hover:bg-gov-navy hover:text-white transition-colors rounded">
                  Privacy Policy
                </button>
              </Link>
              <Link to="/register">
                <button className="px-6 py-2 bg-gov-maroon text-white hover:bg-gov-maroon/90 transition-colors rounded">
                  Accept & Get Started
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
