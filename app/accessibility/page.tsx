import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility - Kendraa',
  description: 'Accessibility information for Kendraa healthcare professional network',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Accessibility</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Kendraa is committed to providing an accessible and inclusive experience for all users, 
            including those with disabilities.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-600 mb-4">
            We strive to ensure that our platform is accessible to everyone, regardless of their 
            abilities or the technology they use to access our services.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Features</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Keyboard navigation support</li>
            <li>Screen reader compatibility</li>
            <li>High contrast mode support</li>
            <li>Alternative text for images</li>
            <li>Semantic HTML structure</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            If you encounter any accessibility barriers or have suggestions for improvement, 
            please contact us at accessibility@kendraa.com
          </p>
        </div>
      </div>
    </div>
  );
}
