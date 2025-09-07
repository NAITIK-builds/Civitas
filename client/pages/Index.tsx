import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { TreePine, AlertTriangle, Eye, Award, Users, MapPin, Shield, FileText, CheckCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCivitasStore } from "@/lib/store";

export default function Index() {
  const stats = [
    { label: "Trees Planted", value: "1M+", icon: TreePine, desc: "Verified plantations" },
    { label: "Reports Submitted", value: "50K+", icon: FileText, desc: "Citizen submissions" },
    { label: "Cities Covered", value: "500+", icon: MapPin, desc: "Across all states" },
    { label: "Impact Value", value: "₹10Cr", icon: Award, desc: "Economic benefit" },
  ];

  const initiatives = [
    {
      icon: TreePine,
      title: "Hariyali Mission",
      description: "Plant trees and create green corridors in urban and rural areas",
      color: "bg-gov-green",
      features: ["GPS-verified planting", "Species tracking", "Growth monitoring"]
    },
    {
      icon: AlertTriangle,
      title: "Anti-Corruption Drive",
      description: "Report corruption incidents with complete anonymity protection",
      color: "bg-gov-maroon",
      features: ["Anonymous reporting", "Legal protection", "Fast-track resolution"]
    },
    {
      icon: Eye,
      title: "Swachh Monitoring",
      description: "Monitor pollution levels and cleanliness in your locality",
      color: "bg-gov-navy",
      features: ["Real-time tracking", "Photo evidence", "Automated alerts"]
    },
  ];

  const prefersReduced = useReducedMotion();
  const { isAuthenticated } = useCivitasStore();

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: prefersReduced ? 0 : 0.6, ease: "easeOut" } }
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="main-content">

      {/* Hero Section - Government Style */}
      <section className="relative bg-gradient-to-r from-gov-navy via-gov-navy to-gov-maroon text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Decorative floating accents */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full bg-gov-gold/20 blur-3xl"
          animate={{ y: prefersReduced ? 0 : [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-gov-maroon/20 blur-3xl"
          animate={{ y: prefersReduced ? 0 : [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp}>
              <Badge className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gov-gold text-gov-navy border-0 text-xs sm:text-sm font-medium">
                DIGITAL INDIA INITIATIVE
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
              Building a
              <span className="block text-gov-gold">New India</span>
              <span className="block">Together</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Join the national movement for transparency, environmental protection,
              and good governance. Your participation matters.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gov-gold hover:bg-gov-gold/90 text-gov-navy px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                  {isAuthenticated ? "Open Dashboard" : "Get Citizen ID"}
                </Button>
              </Link>
              <Link to="/leaderboard" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gov-navy px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  View Impact Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section - Separated with depth */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white relative -mt-6 sm:-mt-8 lg:-mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gov-navy mb-2 sm:mb-4">National Impact Statistics</h2>
              <p className="text-gray-600 text-sm sm:text-lg">Real-time data from verified citizen actions across India</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    className="text-center p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: prefersReduced ? 0 : 0.5, delay: index * 0.08 }}
                    whileHover={prefersReduced ? undefined : { y: -2, scale: 1.02 }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gov-navy/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-gov-navy" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gov-navy mb-1 sm:mb-2">{stat.value}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-600 hidden sm:block">{stat.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Section - Clear separation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gov-navy mb-4 sm:mb-6">National Civic Initiatives</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl mx-auto px-4">
              Participate in government-backed programs designed to create measurable impact
              in your community and across the nation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {initiatives.map((initiative, index) => {
              const IconComponent = initiative.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${initiative.color} rounded-lg flex items-center justify-center mb-4 sm:mb-6`}>
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gov-navy mb-3 sm:mb-4">{initiative.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">{initiative.description}</p>

                    <div className="space-y-2 sm:space-y-3">
                      {initiative.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs sm:text-sm text-gray-700">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gov-green mr-2 sm:mr-3 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                    <Button className="w-full bg-gov-navy hover:bg-gov-navy/90 text-white text-sm sm:text-base">
                      Join Initiative
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section - Government methodology */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gov-navy mb-6">Verification Process</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Our AI-powered verification system ensures authenticity and prevents fraud,
              maintaining the integrity of all citizen contributions.
            </p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Secure Registration",
                  desc: "Anonymous yet verified citizen identity",
                  icon: Shield
                },
                {
                  step: "02",
                  title: "Task Assignment",
                  desc: "Government-approved civic activities",
                  icon: FileText
                },
                {
                  step: "03",
                  title: "Evidence Submission",
                  desc: "Photo, location, and timestamp verification",
                  icon: Eye
                },
                {
                  step: "04",
                  title: "Reward Distribution",
                  desc: "Points, certificates, and recognition",
                  icon: Award
                },
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={index}
                    className="text-center relative"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {index < 3 && (
                      <motion.div
                        className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gov-gold/30 z-0 origin-left"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: prefersReduced ? 0 : 0.6, delay: index * 0.1 }}
                      />
                    )}

                    <div className="relative bg-white">
                      <div className="w-12 h-12 bg-gov-gold rounded-full flex items-center justify-center text-gov-navy font-bold text-lg mx-auto mb-4 relative z-10">
                        {item.step}
                      </div>
                      <div className="w-16 h-16 bg-gov-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-gov-navy" />
                      </div>
                      <h3 className="text-lg font-bold text-gov-navy mb-3">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Government appeal */}
      <section className="py-20 bg-gradient-to-r from-gov-maroon to-gov-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30l15-15v30l-15-15zm-15 0l15 15v-30l-15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <motion.div
          className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gov-gold rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-gov-navy font-bold text-2xl">IN</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Your Nation Needs You
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join millions of responsible citizens in building a transparent, clean, and corruption-free India.
            Every action counts towards our collective progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" className="bg-gov-gold hover:bg-gov-gold/90 text-gov-navy px-10 py-4 text-lg font-bold">
                Start Contributing Today
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-gov-navy px-10 py-4 text-lg font-semibold"
              >
                Government Portal
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer - Official government footer */}
      <footer className="bg-gov-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/logo.png"
                  alt="Civitas Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <div className="text-xl font-bold">CIVITAS</div>
                  <div className="text-xs text-gray-300">Ministry of Electronics & IT</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                A Digital India initiative to empower citizens in building a better nation
                through verified civic participation.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Quick Links</h4>
              <div className="space-y-3">
                <Link to="/register" className="block text-gray-300 hover:text-gov-gold transition-colors">Citizen Registration</Link>
                <Link to="/leaderboard" className="block text-gray-300 hover:text-gov-gold transition-colors">Impact Leaderboard</Link>
                <Link to="/admin" className="block text-gray-300 hover:text-gov-gold transition-colors">Government Portal</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Legal</h4>
              <div className="space-y-3">
                <Link to="/privacy" className="block text-gray-300 hover:text-gov-gold transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="block text-gray-300 hover:text-gov-gold transition-colors">Terms of Service</Link>
                <a href="#" className="block text-gray-300 hover:text-gov-gold transition-colors">RTI Portal</a>
                <a href="#" className="block text-gray-300 hover:text-gov-gold transition-colors">Grievance Redressal</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Contact</h4>
              <div className="space-y-3 text-sm">
                <p className="text-gray-300">
                  <strong>Helpline:</strong><br />
                  1800-CIVITAS (1800-248-4827)
                </p>
                <p className="text-gray-300">
                  <strong>Email:</strong><br />
                  support@civitas.gov.in
                </p>
                <p className="text-gray-300">
                  <strong>Office Hours:</strong><br />
                  Mon-Fri: 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm mb-4 md:mb-0">
                © 2025 Government of India. All rights reserved. | Last updated: 2025
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-gov-gold transition-colors">Website Policies</a>
                <a href="#" className="text-gray-300 hover:text-gov-gold transition-colors">Accessibility</a>
                <a href="#" className="text-gray-300 hover:text-gov-gold transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
