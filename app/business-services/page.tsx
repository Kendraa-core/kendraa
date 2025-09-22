import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Services - Kendraa',
  description: 'Business services and solutions for healthcare organizations',
};

export default function BusinessServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Services</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Comprehensive business solutions for healthcare organizations and institutions.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Institution Management</h3>
              <p className="text-gray-600">Complete platform management for healthcare institutions</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Professional Networking</h3>
              <p className="text-gray-600">Connect your team with the broader healthcare community</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Event Management</h3>
              <p className="text-gray-600">Organize and promote healthcare events and conferences</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Job Posting</h3>
              <p className="text-gray-600">Recruit top healthcare talent for your organization</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            For business service inquiries, please contact us at business@kendraa.com
          </p>
        </div>
      </div>
    </div>
  );
}
