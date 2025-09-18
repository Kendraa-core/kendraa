'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '@/components/common/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  HeartIcon, 
  SparklesIcon, 
  AcademicCapIcon, 
  BeakerIcon, 
  GlobeAltIcon, 
  ChatBubbleLeftRightIcon, 
  LightBulbIcon, 
  UserIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const isClient = useIsClient();
  const { user, profile } = useAuth();
  const router = useRouter();

  // Handle redirects for logged-in users
  useEffect(() => {
    if (user && profile) {
      if (profile.onboarding_completed) {
        // Redirect based on user type
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          router.push('/institution/feed');
        } else {
          router.push('/feed');
        }
      } else {
        // Redirect based on user type
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          router.push('/institution/onboarding');
        } else {
          router.push('/onboarding');
        }
      }
    }
  }, [user, profile, router]);

  // Show loading while checking authentication
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting logged-in users
  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-blue-600 font-medium">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Logo size="sm" className="h-8" />
              <span className="text-sm text-gray-500 hidden sm:inline">🏥</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Features
              </Link>
              <Link href="#specialties" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Specialties
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                About
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-[#007fff] transition-colors font-medium">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/signin"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/signup"
                className="bg-[#007fff] text-white px-6 py-2 rounded-full hover:bg-[#007fff]/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Join Kendraa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-[#007fff]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-6">
                    🏥 Royal Network for Healthcare Professionals
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Connect. <span className="text-[#007fff]">Collaborate.</span><br />
                  <span className="bg-gradient-to-r from-[#007fff] to-purple-600 bg-clip-text text-transparent">
                    Advance Healthcare.
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Join the premier networking platform designed exclusively for healthcare professionals. 
                  Connect with peers, discover opportunities, and advance your medical career.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/signup"
                    className="bg-[#007fff] hover:bg-[#007fff]/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Networking Today
                  </Link>
                  <Link
                    href="/about"
                    className="border-2 border-[#007fff] text-[#007fff] hover:bg-[#007fff]/5 px-8 py-3 rounded-full font-semibold transition-all duration-300"
                  >
                    Learn More
                  </Link>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">Trusted by healthcare professionals worldwide</p>
                  <div className="flex items-center justify-center lg:justify-start space-x-8 text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#007fff]">50K+</span>
                      <span className="text-sm">Medical Professionals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#007fff]">500+</span>
                      <span className="text-sm">Healthcare Institutions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#007fff]">23+</span>
                      <span className="text-sm">Medical Specialties</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <div className="p-8 text-center">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#007fff]/10 rounded-2xl p-6">
                      <UsersIcon className="w-8 h-8 text-[#007fff] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">50K+</div>
                      <div className="text-sm text-gray-600">Professionals</div>
                    </div>
                    <div className="bg-purple-100 rounded-2xl p-6">
                      <BuildingOfficeIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">500+</div>
                      <div className="text-sm text-gray-600">Institutions</div>
                    </div>
                    <div className="bg-green-100 rounded-2xl p-6">
                      <AcademicCapIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">23+</div>
                      <div className="text-sm text-gray-600">Specialties</div>
                    </div>
                    <div className="bg-orange-100 rounded-2xl p-6">
                      <HeartIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">99.9%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">Healthcare Innovation Award</div>
                  <div className="text-sm text-gray-600">Best Professional Network 2024</div>
                </div>
              </Card>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#007fff]/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-4">
              ✨ Platform Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="text-[#007fff]"> Professional Growth</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kendraa provides comprehensive tools and features designed specifically for healthcare professionals 
              to network, collaborate, and advance their careers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UsersIcon,
                title: "Professional Networking",
                description: "Connect with healthcare professionals globally. Build meaningful relationships across 23+ medical specialties."
              },
              {
                icon: BriefcaseIcon,
                title: "Career Opportunities",
                description: "Discover job openings, apply for positions, and advance your medical career with our comprehensive job board."
              },
              {
                icon: CalendarDaysIcon,
                title: "Medical Events",
                description: "Attend conferences, workshops, and CME events. Stay updated with the latest in medical education and research."
              },
              {
                icon: BuildingOfficeIcon,
                title: "Institution Profiles",
                description: "Healthcare institutions can showcase their services, post jobs, and connect with qualified professionals."
              },
              {
                icon: DevicePhoneMobileIcon,
                title: "Mobile Experience",
                description: "Access Kendraa on-the-go with our optimized mobile interface. Network anywhere, anytime."
              },
              {
                icon: ShieldCheckIcon,
                title: "Privacy & Security",
                description: "HIPAA compliant platform ensuring your professional data is secure and protected at all times."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-gray-200/50 bg-white/80 backdrop-blur-sm h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#007fff]/20 transition-colors duration-300">
                      <feature.icon className="w-8 h-8 text-[#007fff]" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-[#007fff] transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              🩺 Medical Specialties
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supporting <span className="text-[#007fff]">23+ Medical Specialties</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with professionals across all major medical specialties and subspecialties.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-16">
            {[
              "Cardiology", "Neurology", "Oncology", "Pediatrics",
              "Psychiatry", "Surgery", "Emergency Medicine", "Family Medicine",
              "Internal Medicine", "Radiology", "Anesthesiology", "Pathology",
              "Dermatology", "Ophthalmology", "Orthopedics", "OB/GYN",
              "Endocrinology", "Gastroenterology", "Pulmonology", "Rheumatology",
              "Urology", "Nephrology", "Infectious Disease", "Physical Medicine"
            ].map((specialty, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer border-gray-200/50 bg-white/50">
                  <CardContent className="p-4 text-center">
                    <span className="text-sm font-medium text-gray-600 group-hover:text-[#007fff] transition-colors">
                      {specialty}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* User Types */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserIcon,
                title: "Medical Professionals",
                description: "Doctors, nurses, residents, fellows, and medical students",
                features: ["Professional networking", "Career opportunities", "CME events", "Research collaboration"]
              },
              {
                icon: BuildingOfficeIcon,
                title: "Healthcare Institutions",
                description: "Hospitals, clinics, research centers, and medical schools",
                features: ["Talent recruitment", "Institution promotion", "Event hosting", "Professional partnerships"]
              },
              {
                icon: BeakerIcon,
                title: "Medical Researchers",
                description: "Research scientists, principal investigators, and academicians",
                features: ["Research networking", "Collaboration opportunities", "Publication sharing", "Grant partnerships"]
              }
            ].map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-gray-200/50 bg-white/80">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#007fff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#007fff]/20 transition-colors duration-300">
                      <type.icon className="w-8 h-8 text-[#007fff]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#007fff] transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {type.description}
                    </p>
                    <ul className="space-y-2">
                      {type.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-600 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-[#007fff] rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-[#007fff]/5 via-purple-50/50 to-[#007fff]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center px-4 py-2 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium mb-4">
              📊 Platform Statistics
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
              <span className="text-[#007fff]"> Worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Join a thriving community of medical professionals who are already networking, 
              learning, and growing their careers on Kendraa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { number: "50,000+", label: "Healthcare Professionals", description: "Medical professionals from around the world" },
                { number: "500+", label: "Healthcare Institutions", description: "Hospitals, clinics, and research centers" },
                { number: "23+", label: "Medical Specialties", description: "Comprehensive coverage across all fields" },
                { number: "10,000+", label: "Job Opportunities", description: "Active healthcare positions posted" },
                { number: "1,000+", label: "Medical Events", description: "Conferences, CME courses, and workshops" },
                { number: "99.9%", label: "Uptime Reliability", description: "Always available when you need it" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl md:text-4xl font-bold text-[#007fff] mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.number}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {stat.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stat.description}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              💬 What Our Users Say
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Stories from
              <span className="text-[#007fff]"> Healthcare Professionals</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Kendraa has transformed how I connect with fellow cardiologists. I've found incredible collaboration opportunities and advanced my research significantly.",
                name: "Dr. Sarah Chen",
                title: "Cardiologist, Mayo Clinic",
                specialty: "Cardiology"
              },
              {
                quote: "As a hospital administrator, Kendraa helps us recruit top talent and showcase our institution to qualified professionals worldwide.",
                name: "Michael Rodriguez",
                title: "Chief Medical Officer",
                specialty: "Administration",
                institution: "Johns Hopkins Hospital"
              },
              {
                quote: "The platform's job board helped me land my dream position in pediatric surgery. The networking features are unmatched in healthcare.",
                name: "Dr. Aisha Patel",
                title: "Pediatric Surgeon",
                specialty: "Pediatric Surgery"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-gray-200/50 bg-white/90 backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex text-[#007fff] text-lg mb-3">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-gray-600 leading-relaxed mb-6">
                        "{testimonial.quote}"
                      </blockquote>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                      <div className="text-xs text-[#007fff] mt-1">
                        {testimonial.specialty} {testimonial.institution && `• ${testimonial.institution}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-[#007fff] to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Healthcare Career?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals who are already networking, 
              learning, and growing their careers on Kendraa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-[#007fff] px-8 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="sm" className="h-8" />
                <span className="text-xl font-bold">Kendraa</span>
              </div>
              <p className="text-gray-400 mb-4">
                The premier networking platform for healthcare professionals worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">🌐</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">📧</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#specialties" className="hover:text-white transition-colors">Specialties</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors">Join Network</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors">Find Jobs</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Medical Events</Link></li>
                <li><Link href="/specializations" className="hover:text-white transition-colors">Specializations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Institutions</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><Link href="/jobs/create" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link href="/events/create" className="hover:text-white transition-colors">Host Events</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Sales</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kendraa. All rights reserved. | <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link> | <Link href="/help" className="hover:text-white transition-colors">Terms of Service</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
