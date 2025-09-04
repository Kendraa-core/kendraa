'use client';

import React, { useState, useEffect } from 'react';
import { HeartIcon, AcademicCapIcon, BeakerIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { BeakerIcon as BeakerIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MedicalNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_date: string;
  category: 'research' | 'clinical_trial' | 'drug_approval' | 'guidelines' | 'technology';
  specialty_tags: string[];
  url?: string;
  image_url?: string;
}

interface ResearchUpdate {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  abstract: string;
  doi?: string;
  specialty: string;
  study_type: 'clinical_trial' | 'systematic_review' | 'meta_analysis' | 'observational' | 'case_study';
  significance_score: number; // 1-10
}

interface CMESpotlight {
  id: string;
  title: string;
  provider: string;
  credit_hours: number;
  specialty: string;
  deadline?: string;
  is_free: boolean;
  rating: number;
  enrollment_count: number;
}

export default function MedicalFeed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'news' | 'research' | 'cme' | 'discussions'>('news');
  const [loading, setLoading] = useState(true);
  const [medicalNews, setMedicalNews] = useState<MedicalNewsItem[]>([]);
  const [researchUpdates, setResearchUpdates] = useState<ResearchUpdate[]>([]);
  const [cmeSpotlight, setCmeSpotlight] = useState<CMESpotlight[]>([]);

  useEffect(() => {
    loadFeedContent();
  }, [activeTab, user]);

  const loadFeedContent = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual medical content APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'news') {
        setMedicalNews([
          {
            id: '1',
            title: 'New AI-Powered Diagnostic Tool Shows 95% Accuracy in Early Cancer Detection',
            summary: 'Breakthrough study demonstrates significant improvement in early-stage cancer diagnosis using machine learning algorithms trained on radiological images.',
            source: 'Nature Medicine',
            published_date: '2024-01-15',
            category: 'technology',
            specialty_tags: ['Oncology', 'Radiology', 'AI/ML'],
            image_url: '/medical-ai.jpg'
          },
          {
            id: '2',
            title: 'FDA Approves Novel Immunotherapy for Rare Autoimmune Disease',
            summary: 'First-in-class treatment receives accelerated approval for patients with severe forms of systemic lupus erythematosus.',
            source: 'FDA News',
            published_date: '2024-01-14',
            category: 'drug_approval',
            specialty_tags: ['Rheumatology', 'Immunology'],
          },
          {
            id: '3',
            title: 'Updated Guidelines for Cardiovascular Risk Assessment Released',
            summary: 'American Heart Association publishes comprehensive updates to cholesterol management and risk stratification protocols.',
            source: 'American Heart Association',
            published_date: '2024-01-13',
            category: 'guidelines',
            specialty_tags: ['Cardiology', 'Preventive Medicine'],
          }
        ]);
      } else if (activeTab === 'research') {
        setResearchUpdates([
          {
            id: '1',
            title: 'Long-term Outcomes of Minimally Invasive Cardiac Surgery: A 10-Year Follow-up Study',
            authors: ['Dr. Sarah Chen', 'Dr. Michael Rodriguez', 'Dr. Aisha Patel'],
            journal: 'Journal of Thoracic and Cardiovascular Surgery',
            publication_date: '2024-01-12',
            abstract: 'This comprehensive study followed 2,847 patients over 10 years to assess long-term outcomes of minimally invasive cardiac procedures...',
            doi: '10.1016/j.jtcvs.2024.01.012',
            specialty: 'Cardiac Surgery',
            study_type: 'observational',
            significance_score: 8
          },
          {
            id: '2',
            title: 'Efficacy of Novel Gene Therapy in Treating Inherited Retinal Dystrophies',
            authors: ['Dr. Jennifer Liu', 'Dr. Robert Thompson', 'Dr. Maria Santos'],
            journal: 'The Lancet Ophthalmology',
            publication_date: '2024-01-10',
            abstract: 'Phase III clinical trial results demonstrate significant visual improvement in patients with Leber congenital amaurosis...',
            doi: '10.1016/S2468-2667(24)00001-2',
            specialty: 'Ophthalmology',
            study_type: 'clinical_trial',
            significance_score: 9
          }
        ]);
      } else if (activeTab === 'cme') {
        setCmeSpotlight([
          {
            id: '1',
            title: 'Advanced Cardiac Life Support (ACLS) Recertification',
            provider: 'American Heart Association',
            credit_hours: 8,
            specialty: 'Emergency Medicine',
            deadline: '2024-02-15',
            is_free: false,
            rating: 4.8,
            enrollment_count: 1247
          },
          {
            id: '2',
            title: 'Pain Management in Chronic Conditions: Evidence-Based Approaches',
            provider: 'Mayo Clinic',
            credit_hours: 4,
            specialty: 'Pain Management',
            is_free: true,
            rating: 4.6,
            enrollment_count: 823
          }
        ]);
      }
    } catch (error) {
      // Silent error handling for feed content
    } finally {
      setLoading(false);
    }
  };

  const renderNewsItem = (item: MedicalNewsItem) => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {item.image_url && (
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-azure-100 to-azure-200 flex items-center justify-center">
              <HeartIconSolid className="w-8 h-8 text-azure-600" />
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              item.category === 'research' ? 'bg-azure-100 text-azure-700' :
              item.category === 'drug_approval' ? 'bg-azure-100 text-azure-700' :
              item.category === 'guidelines' ? 'bg-azure-100 text-azure-700' :
              item.category === 'technology' ? 'bg-azure-100 text-azure-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {item.category.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-gray-500 text-sm">{item.source}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {item.specialty_tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-gray-400 text-sm">{new Date(item.published_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResearchItem = (item: ResearchUpdate) => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BeakerIconSolid className="w-5 h-5 text-azure-600" />
          <span className="text-sm font-medium text-azure-700">{item.study_type.replace('_', ' ').toUpperCase()}</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < Math.round(item.significance_score / 2) ? 'bg-azure-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-500">{item.specialty}</span>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-3">
        <span className="font-medium">Authors:</span> {item.authors.join(', ')}
      </p>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.abstract}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{item.journal}</span> • {new Date(item.publication_date).toLocaleDateString()}
        </div>
        {item.doi && (
          <button className="text-azure-600 hover:text-azure-700 text-sm font-medium">
            View Paper
          </button>
        )}
      </div>
    </div>
  );

  const renderCMEItem = (item: CMESpotlight) => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AcademicCapIcon className="w-5 h-5 text-azure-600" />
          <span className="text-sm font-medium text-azure-700">{item.credit_hours} CME Credits</span>
          {item.is_free && (
            <span className="px-2 py-1 bg-azure-100 text-azure-700 text-xs font-medium rounded">FREE</span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <span>★</span>
          <span>{item.rating}</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-sm text-gray-600 mb-3">
        <span className="font-medium">Provider:</span> {item.provider}
      </p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{item.specialty}</span>
          {item.deadline && (
            <span> • Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
          )}
        </div>
        <button className="bg-azure-600 hover:bg-azure-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Enroll Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex overflow-x-auto">
          {[
            { id: 'news', label: 'Medical News', icon: HeartIcon },
            { id: 'research', label: 'Research Updates', icon: BeakerIcon },
            { id: 'cme', label: 'CME Spotlight', icon: AcademicCapIcon },
            { id: 'discussions', label: 'Case Discussions', icon: ChatBubbleLeftRightIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-azure-600 text-azure-600 bg-azure-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'news' && medicalNews.map(renderNewsItem)}
            {activeTab === 'research' && researchUpdates.map(renderResearchItem)}
            {activeTab === 'cme' && cmeSpotlight.map(renderCMEItem)}
            {activeTab === 'discussions' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Discussions Coming Soon</h3>
                <p className="text-gray-600">
                  HIPAA-compliant case discussion forums are currently in development. 
                  You&apos;ll be able to discuss challenging cases anonymously with global experts.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
