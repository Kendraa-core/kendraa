import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ad Choices - Kendraa',
  description: 'Advertising choices and privacy options on Kendraa',
};

export default function AdChoicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ad Choices</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Learn about your advertising choices and privacy options on Kendraa.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
          <p className="text-gray-600 mb-4">
            We respect your privacy and provide you with choices about how your information 
            is used for advertising purposes.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Advertising Preferences</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Opt out of personalized advertising</li>
            <li>Manage your data sharing preferences</li>
            <li>Control cookie settings</li>
            <li>Update your privacy settings</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            For questions about advertising choices, please contact us at privacy@kendraa.com
          </p>
        </div>
      </div>
    </div>
  );
}
