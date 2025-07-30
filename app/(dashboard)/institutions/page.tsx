'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getInstitutions, type Institution } from '@/lib/queries';

const INSTITUTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'research_center', label: 'Research Centers' },
  { value: 'university', label: 'Universities' },
  { value: 'pharmaceutical', label: 'Pharmaceutical' },
  { value: 'medical_device', label: 'Medical Device' },
  { value: 'other', label: 'Other' },
];

export default function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Debug logging
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[InstitutionsPage] ${message}`, data);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchQuery, selectedType]);

  const fetchInstitutions = async () => {
    setLoading(true);
    debugLog('Fetching institutions');
    
    try {
      const data = await getInstitutions(50);
      setInstitutions(data);
      debugLog('Institutions fetched successfully', { count: data.length });
    } catch (error) {
      debugLog('Error fetching institutions', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(institution => institution.type === selectedType);
    }

    setFilteredInstitutions(filtered);
    debugLog('Institutions filtered', { total: institutions.length, filtered: filtered.length });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'clinic':
        return '⚕️';
      case 'research_center':
        return '🔬';
      case 'university':
        return '🎓';
      case 'pharmaceutical':
        return '💊';
      case 'medical_device':
        return '🩺';
      default:
        return '🏢';
    }
  };

  const getSizeLabel = (size: string | null) => {
    switch (size) {
      case 'small':
        return '1-50 employees';
      case 'medium':
        return '51-200 employees';
      case 'large':
        return '201-1000 employees';
      case 'enterprise':
        return '1000+ employees';
      default:
        return 'Size not specified';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen modern-gradient-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Institutions</h1>
              <p className="text-slate-600">Discover hospitals, clinics, research centers, and more</p>
            </div>
            
            {user && (
              <Button className="modern-button-primary">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Institution
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="modern-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search institutions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="modern-input pl-10"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="md:w-64">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="modern-input"
                  >
                    {INSTITUTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-slate-600">
            Showing {filteredInstitutions.length} of {institutions.length} institutions
          </p>
        </motion.div>

        {/* Institutions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredInstitutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution) => (
                <motion.div
                  key={institution.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="modern-card hover:shadow-modern-lg transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="relative inline-block mb-4">
                        <Avatar
                          src={institution.logo_url}
                          alt={institution.name}
                          size="xl"
                          className="mx-auto"
                        />
                        {institution.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckBadgeSolidIcon className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-2xl" role="img" aria-label={institution.type}>
                          {getTypeIcon(institution.type)}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {institution.name}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-primary-600 font-medium mb-2 capitalize">
                        {institution.type.replace('_', ' ')}
                      </p>

                      {institution.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                          {institution.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {institution.location && (
                        <div className="flex items-center text-sm text-slate-500">
                          <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{institution.location}</span>
                        </div>
                      )}
                      
                      {institution.size && (
                        <div className="flex items-center text-sm text-slate-500">
                          <UserGroupIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{getSizeLabel(institution.size)}</span>
                        </div>
                      )}

                      {institution.website && (
                        <div className="flex items-center text-sm text-slate-500">
                          <GlobeAltIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <a
                            href={institution.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline truncate"
                          >
                            Website
                          </a>
                        </div>
                      )}

                      {institution.established_year && (
                        <div className="flex items-center text-sm text-slate-500">
                          <BuildingOfficeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Established {institution.established_year}</span>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {institution.specialties && institution.specialties.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1">
                          {institution.specialties.slice(0, 3).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                            >
                              {specialty}
                            </span>
                          ))}
                          {institution.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{institution.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link href={`/institutions/${institution.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          View Profile
                        </Button>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-primary-600 hover:bg-primary-50"
                      >
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="modern-card">
              <CardContent className="p-12 text-center">
                <BuildingOfficeIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No institutions found</h3>
                <p className="text-slate-500 mb-6">
                  {searchQuery || selectedType !== 'all'
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Be the first to add an institution to the platform.'}
                </p>
                {user && (
                  <Button className="modern-button-primary">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Institution
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
} 