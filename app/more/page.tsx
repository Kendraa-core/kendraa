import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'More - Kendraa',
  description: 'Additional resources and information about Kendraa',
};

export default function MorePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">More</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Additional resources, tools, and information to help you get the most out of Kendraa.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resources</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Help Center</h3>
              <p className="text-gray-600">Find answers to common questions and learn how to use Kendraa effectively</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Community Guidelines</h3>
              <p className="text-gray-600">Learn about our community standards and best practices</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">API Documentation</h3>
              <p className="text-gray-600">Integrate Kendraa with your existing systems and workflows</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Developer Resources</h3>
              <p className="text-gray-600">Tools and resources for developers building on Kendraa</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Support</h2>
          <p className="text-gray-600">
            Need help? Contact our support team at support@kendraa.com or visit our help center.
          </p>
        </div>
      </div>
    </div>
  );
}
