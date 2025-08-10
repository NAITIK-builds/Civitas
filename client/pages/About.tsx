import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Shield, Users, TreePine, Eye, AlertTriangle, Award, 
  CheckCircle, Globe, Smartphone, Lock, TrendingUp
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Shield,
      title: "Complete Anonymity",
      description: "Your identity remains completely protected while participating in civic activities"
    },
    {
      icon: CheckCircle,
      title: "AI Verification",
      description: "Advanced AI systems verify all submissions to prevent fraud and ensure authenticity"
    },
    {
      icon: Award,
      title: "Reward System",
      description: "Earn points, badges, and recognition for your positive contributions to society"
    },
    {
      icon: Globe,
      title: "National Impact",
      description: "Your actions contribute to measurable change across all states and territories"
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Optimized for smartphones to ensure accessibility for all citizens"
    },
    {
      icon: Lock,
      title: "Government Grade Security",
      description: "Built with the highest security standards to protect citizen data"
    }
  ];

  const initiatives = [
    {
      icon: TreePine,
      title: "Environmental Protection",
      description: "Tree planting drives, pollution monitoring, and green corridor development",
      count: "1M+ trees planted"
    },
    {
      icon: AlertTriangle,
      title: "Anti-Corruption",
      description: "Anonymous reporting system for corruption incidents with legal protection",
      count: "50K+ reports processed"
    },
    {
      icon: Eye,
      title: "Transparency Monitoring",
      description: "Public works monitoring, government accountability, and citizen oversight",
      count: "500+ cities covered"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="mb-6 px-6 py-3 bg-gov-gold text-gov-navy border-0 text-sm font-medium">
              DIGITAL INDIA INITIATIVE
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-gov-navy mb-6">
              About Civitas Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Civitas is India's premier citizen engagement platform, empowering every Indian to 
              participate in building a transparent, clean, and corruption-free nation through 
              verified civic actions.
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-16 bg-gradient-to-r from-gov-navy to-gov-maroon text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                To create a transparent and participatory democracy where every citizen can 
                contribute meaningfully to national development while maintaining complete 
                anonymity and receiving recognition for their positive actions.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gov-navy mb-4">Platform Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built with cutting-edge technology to ensure security, scalability, and accessibility
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-gov-navy rounded-lg flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gov-navy mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Civic Initiatives */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gov-navy mb-4">Civic Initiatives</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Three key areas where citizens can make the most impact
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {initiatives.map((initiative, index) => {
                const IconComponent = initiative.icon;
                return (
                  <Card key={index} className="bg-white shadow-lg">
                    <CardHeader className="text-center">
                      <div className="w-20 h-20 bg-gov-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gov-navy">{initiative.title}</CardTitle>
                      <Badge className="bg-gov-gold text-gov-navy">
                        {initiative.count}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600">{initiative.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gov-navy mb-4">How Civitas Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A simple, secure, and transparent process for civic engagement
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Anonymous Registration",
                  description: "Get a unique Citizen ID without revealing personal information"
                },
                {
                  step: "02", 
                  title: "Choose Tasks",
                  description: "Select from government-approved civic activities in your area"
                },
                {
                  step: "03",
                  title: "Submit Evidence",
                  description: "Upload photos and location data for AI verification"
                },
                {
                  step: "04",
                  title: "Earn Recognition",
                  description: "Receive points, badges, and contribute to national progress"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gov-gold rounded-full flex items-center justify-center text-gov-navy font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gov-navy mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-16">
            <Card className="bg-gray-100">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gov-navy mb-4">Impact Statistics</h2>
                  <p className="text-xl text-gray-600">Real numbers showing the power of collective action</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { number: "1.2M+", label: "Active Citizens", icon: Users },
                    { number: "456K+", label: "Reports Verified", icon: CheckCircle },
                    { number: "500+", label: "Cities Covered", icon: Globe },
                    { number: "₹156Cr", label: "Economic Impact", icon: TrendingUp }
                  ].map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={index} className="text-center">
                        <IconComponent className="w-12 h-12 text-gov-navy mx-auto mb-4" />
                        <div className="text-3xl font-bold text-gov-navy mb-2">{stat.number}</div>
                        <div className="text-gray-600">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Government Partners */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gov-navy mb-4">Government Partners</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Supported by key government ministries and departments
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                "Ministry of Electronics & Information Technology",
                "Ministry of Environment, Forest and Climate Change", 
                "Central Vigilance Commission"
              ].map((ministry, index) => (
                <Card key={index} className="text-center p-6 border-2 border-gov-navy/20">
                  <div className="w-16 h-16 bg-gov-navy rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gov-navy">{ministry}</h3>
                </Card>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-gov-green to-gov-navy text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Become part of India's largest civic engagement platform. 
                Your contributions matter, your identity stays protected.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-gov-gold hover:bg-gov-gold/90 text-gov-navy px-8 py-3">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gov-navy px-8 py-3">
                    View Impact Dashboard
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
