'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BuildingOffice2Icon, 
  UserIcon, 
  HeartIcon,
  BeakerIcon,
  AcademicCapIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfileCreationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to create a profile</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const profileTypes = [
    {
      type: 'corporate',
      title: 'Corporate Profile',
      subtitle: 'For Medical Organizations',
      description: 'Create a profile for your medical organization, hospital, pharmaceutical company, or research institution.',
      icon: BuildingOffice2Icon,
      features: [
        'Organization branding and logo',
        'Company information and partnerships',
        'Project showcase and achievements',
        'Global presence and focus areas',
        'CEO and employee information',
        'Professional overview and mission'
      ],
      benefits: [
        'Establish organizational presence',
        'Connect with medical professionals',
        'Showcase innovations and research',
        'Build partnerships and collaborations',
        'Recruit top medical talent',
        'Share industry insights and updates'
      ],
      color: 'blue',
      href: '/profile/create/corporate'
    },
    {
      type: 'individual',
      title: 'Medical Professional Profile',
      subtitle: 'For Healthcare Practitioners',
      description: 'Create a professional profile for doctors, researchers, nurses, and other healthcare professionals.',
      icon: UserIcon,
      features: [
        'Medical credentials and certifications',
        'Professional experience and education',
        'Research interests and publications',
        'Specializations and expertise',
        'Board certifications and licenses',
        'Professional bio and achievements'
      ],
      benefits: [
        'Build professional reputation',
        'Connect with colleagues worldwide',
        'Share research and publications',
        'Find collaboration opportunities',
        'Stay updated with medical advances',
        'Network with industry leaders'
      ],
      color: 'green',
      href: '/profile/create/individual'
    }
  ];

  const medicalIndustryFeatures = [
    {
      icon: HeartIcon,
      title: 'Healthcare Focused',
      description: 'Specifically designed for the medical and healthcare industry'
    },
    {
      icon: BeakerIcon,
      title: 'Research Integration',
      description: 'Showcase research projects, publications, and innovations'
    },
    {
      icon: AcademicCapIcon,
      title: 'Professional Credentials',
      description: 'Highlight medical degrees, certifications, and specializations'
    },
    {
      icon: UserGroupIcon,
      title: 'Medical Network',
      description: 'Connect with healthcare professionals worldwide'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Access to international medical community and opportunities'
    },
    {
      icon: CheckCircleIcon,
      title: 'Verified Profiles',
      description: 'Professional verification and credibility assurance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Medical Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join the global medical community on MedProf. Choose the profile type that best represents you or your organization.
          </p>
        </div>

        {/* Profile Type Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {profileTypes.map((profileType) => (
            <Card key={profileType.type} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className={`absolute top-0 left-0 w-full h-1 bg-${profileType.color}-600`}></div>
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 bg-${profileType.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <profileType.icon className={`w-8 h-8 text-${profileType.color}-600`} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {profileType.title}
                </CardTitle>
                <p className="text-lg text-gray-600 font-medium">
                  {profileType.subtitle}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-gray-600 text-center">
                  {profileType.description}
                </p>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {profileType.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircleIcon className={`w-5 h-5 text-${profileType.color}-600 mt-0.5 flex-shrink-0`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Benefits:</h4>
                  <ul className="space-y-2">
                    {profileType.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ArrowRightIcon className={`w-4 h-4 text-${profileType.color}-600 mt-0.5 flex-shrink-0`} />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={profileType.href} className="block">
                  <Button 
                    className={`w-full bg-${profileType.color}-600 hover:bg-${profileType.color}-700 text-white`}
                  >
                    Create {profileType.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Medical Industry Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose MedProf?
            </h2>
            <p className="text-lg text-gray-600">
              The premier platform for medical professionals and healthcare organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalIndustryFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Join the Medical Community?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Connect with healthcare professionals worldwide, share your expertise, and stay updated with the latest medical advances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile/create/corporate">
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Create Corporate Profile
                </Button>
              </Link>
              <Link href="/profile/create/individual">
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Create Professional Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 