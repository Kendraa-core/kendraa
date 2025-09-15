'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

export default function Specializations() {
  const { user } = useAuth();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement specializations functionality
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <LoadingSpinner variant="fullscreen" text="Loading specializations..." />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-gray-600">
            Explore different medical specialties and connect with professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Cardiology', description: 'Heart and cardiovascular system', members: 1250 },
            { name: 'Neurology', description: 'Nervous system and brain disorders', members: 980 },
            { name: 'Oncology', description: 'Cancer treatment and research', members: 750 },
            { name: 'Pediatrics', description: 'Child and adolescent healthcare', members: 1100 },
            { name: 'Psychiatry', description: 'Mental health and behavioral disorders', members: 850 },
            { name: 'Surgery', description: 'Surgical procedures and techniques', members: 650 },
            { name: 'Emergency Medicine', description: 'Acute care and trauma', members: 720 },
            { name: 'Radiology', description: 'Medical imaging and diagnostics', members: 580 },
            { name: 'Dermatology', description: 'Skin conditions and treatments', members: 420 },
          ].map((spec, index) => (
            <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {spec.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {spec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {spec.members} members
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
