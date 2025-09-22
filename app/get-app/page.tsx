import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get App - Kendraa',
  description: 'Download the Kendraa mobile app for healthcare professionals',
};

export default function GetAppPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Get the Kendraa App</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Download the Kendraa mobile app to stay connected with healthcare professionals 
            on the go.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">App Features</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Connect with healthcare professionals worldwide</li>
            <li>Share insights and collaborate on cases</li>
            <li>Stay updated with the latest medical news</li>
            <li>Access job opportunities and events</li>
            <li>Secure messaging and file sharing</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Download Now</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a 
              href="#" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Download for iOS
            </a>
            <a 
              href="#" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Download for Android
            </a>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">iOS</h3>
              <p className="text-gray-600">iOS 14.0 or later</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Android</h3>
              <p className="text-gray-600">Android 8.0 or later</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
