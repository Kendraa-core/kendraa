import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertising - Kendraa',
  description: 'Advertising opportunities on Kendraa healthcare professional network',
};

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Advertising</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Reach healthcare professionals and institutions through targeted advertising on Kendraa.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Advertise on Kendraa?</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Access to a network of healthcare professionals</li>
            <li>Targeted audience segmentation</li>
            <li>Professional and trusted environment</li>
            <li>Multiple advertising formats available</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Advertising Options</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Sponsored Content</h3>
              <p className="text-gray-600">Promote your content to relevant healthcare professionals</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Display Ads</h3>
              <p className="text-gray-600">Banner and sidebar advertising opportunities</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            For advertising inquiries, please contact us at advertising@kendraa.com
          </p>
        </div>
      </div>
    </div>
  );
}
