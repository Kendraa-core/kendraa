import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Network Suggestions - Kendraa',
  description: 'Discover healthcare professionals to connect with on Kendraa',
};

export default function NetworkSuggestionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Network Suggestions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Discover healthcare professionals and institutions to connect with based on your 
            interests, location, and professional background.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How Suggestions Work</h2>
          <p className="text-gray-600 mb-4">
            Our algorithm analyzes your profile, interests, and activity to suggest relevant 
            connections that can help you grow your professional network.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Suggestion Criteria</h2>
          <ul className="list-disc list-inside text-gray-600 mb-6">
            <li>Similar professional interests and specializations</li>
            <li>Geographic proximity</li>
            <li>Mutual connections</li>
            <li>Professional experience level</li>
            <li>Activity and engagement patterns</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-600">
            To see personalized network suggestions, please sign in to your Kendraa account 
            and visit the Network page.
          </p>
        </div>
      </div>
    </div>
  );
}
