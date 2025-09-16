'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Avatar from '@/components/common/Avatar';
import Breadcrumb from '@/components/common/Breadcrumb';
import EditProfileModal from '@/components/profile/EditProfileModal';
import EnhancedProfileImageEditor from '@/components/profile/EnhancedProfileImageEditor';
import PostCard from '@/components/post/PostCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { cn, formatDate, formatNumber } from '@/lib/utils';
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  UserPlusIcon,
  ShareIcon,
  CalendarDaysIcon,
  CameraIcon,
  CheckIcon,
  PlusIcon,
  ChevronRightIcon,
  StarIcon,
  BuildingOfficeIcon,
  UserIcon,
  FireIcon,
  BellIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getProfile,
  getExperiences,
  getEducation,
  getPostsByAuthor,
  getConnectionStatus,
  sendConnectionRequest,
  followUser,
  unfollowUser,
  isFollowing,
  getConnectionCount,
  getEventsByOrganizer,
  getJobsByInstitution,
  getEventsByInstitution,
  updateProfile,
  createExperience,
  updateExperience,
  createEducation,
  updateEducation,
  getInstitutionByAdminId,
  type Profile,
  type Experience,
  type Education,
  type PostWithAuthor,
  type Institution,
  type JobWithCompany,
  type EventWithOrganizer,
} from '@/lib/queries';

// Helper function to format dates to month/year
const formatDateToMonthYear = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Helper function to format institution type as headline
const formatInstitutionTypeAsHeadline = (type: string | null | undefined): string => {
  if (!type) return 'Healthcare Organization';
  
  const typeMap: Record<string, string> = {
    'hospital': 'Hospital',
    'clinic': 'Medical Clinic',
    'research_center': 'Research Center',
    'university': 'University',
    'pharmaceutical': 'Pharmaceutical Company',
    'medical_device': 'Medical Device Company',
    'other': 'Healthcare Organization'
  };
  
  return typeMap[type] || 'Healthcare Organization';
};

// AboutCard Component for Institution
const AboutCard = React.memo(function AboutCard({ 
  profile, 
  isOwnProfile, 
  editingField, 
  editValues, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit 
}: {
  profile: Profile;
  isOwnProfile: boolean;
  editingField: string | null;
  editValues: any;
  onStartEdit: (field: string, value: any) => void;
  onSaveEdit: (field: string) => void;
  onCancelEdit: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-[#007fff]" />
            About Our Institution
          </h2>
          {isOwnProfile && (
            <button 
              onClick={() => onStartEdit('bio', profile.bio)}
              className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-colors duration-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {editingField === 'bio' ? (
          <div className="space-y-4">
            <textarea
              value={editValues.bio || profile.bio || ''}
              onChange={(e) => onStartEdit('bio', e.target.value)}
              className="w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
              rows={6}
              placeholder="Tell us about your institution..."
            />
            <div className="flex gap-3">
              <button 
                onClick={() => onSaveEdit('bio')}
                className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors font-medium"
              >
                Save
              </button>
              <button 
                onClick={onCancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.bio || 'No description available for this institution.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// JobCard Component
const JobCard = React.memo(function JobCard({ job }: { job: JobWithCompany }) {
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#007fff]/30 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{job.title}</h4>
          <span className="text-xs text-gray-500">{formatDate(job.created_at)}</span>
        </div>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{job.location}</span>
          <span className="text-[#007fff] font-medium">{formatSalary(job.salary_min, job.salary_max)}</span>
        </div>
      </div>
    </Link>
  );
});

// EventCard Component
const EventCard = React.memo(function EventCard({ event }: { event: EventWithOrganizer }) {
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#007fff]/30 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{event.title}</h4>
          <span className="text-xs text-gray-500">{formatEventDate(event.start_date)}</span>
        </div>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{event.location}</span>
          {event.max_attendees && (
            <span className="text-[#007fff] font-medium">{event.max_attendees} attendees</span>
          )}
        </div>
      </div>
    </Link>
  );
});

// ActivityCard Component for Institution
const ActivityCard = React.memo(function ActivityCard({ 
  posts, 
  jobs, 
  events, 
  isOwnProfile, 
  connectionCount, 
  router 
}: { 
  posts: PostWithAuthor[]; 
  jobs: JobWithCompany[];
  events: EventWithOrganizer[];
  isOwnProfile: boolean; 
  connectionCount: number; 
  router: any; 
}) {
  const [activeTab, setActiveTab] = useState<'posts' | 'jobs' | 'events'>('posts');

  const allUpdates = [
    ...posts.map(post => ({ type: 'post', data: post, date: post.created_at })),
    ...jobs.map(job => ({ type: 'job', data: job, date: job.created_at })),
    ...events.map(event => ({ type: 'event', data: event, date: event.created_at }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'posts':
        return posts.slice(0, 5);
      case 'jobs':
        return jobs.slice(0, 5);
      case 'events':
        return events.slice(0, 5);
      default:
        return [];
    }
  };

  const getCurrentTabCount = () => {
    switch (activeTab) {
      case 'posts':
        return posts.length;
      case 'jobs':
        return jobs.length;
      case 'events':
        return events.length;
      default:
        return 0;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#007fff]/10 rounded-lg flex items-center justify-center">
            <FireIcon className="w-4 h-4 text-[#007fff]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Institution Updates</h3>
            <p className="text-sm text-gray-600">{formatNumber(connectionCount)} followers</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === 'posts'
              ? "bg-white text-[#007fff] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            <span>Posts ({posts.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === 'jobs'
              ? "bg-white text-[#007fff] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <BriefcaseIcon className="w-4 h-4" />
            <span>Jobs ({jobs.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeTab === 'events'
              ? "bg-white text-[#007fff] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Events ({events.length})</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {getCurrentTabCount() > 0 ? (
        <div>
          <div className="space-y-3">
            {getCurrentTabData().map((item, index) => (
              <motion.div 
                key={`${activeTab}-${item.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border border-gray-100 rounded-lg p-3 hover:border-[#007fff]/20 transition-colors"
              >
                {activeTab === 'posts' && <PostCard post={item as PostWithAuthor} />}
                {activeTab === 'jobs' && <JobCard job={item as JobWithCompany} />}
                {activeTab === 'events' && <EventCard event={item as EventWithOrganizer} />}
              </motion.div>
            ))}
          </div>
          {getCurrentTabCount() > 5 && (
            <div className="mt-4 text-center">
              <button className="text-[#007fff] hover:text-[#007fff]/80 text-sm font-medium hover:underline transition-all duration-200">
                Show all {getCurrentTabCount()} {activeTab} →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          {activeTab === 'posts' && (
            <>
              <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-lg mb-2">No posts yet</p>
              <p className="text-gray-500 text-sm mb-4">Share your institution&apos;s news and updates</p>
              {isOwnProfile && (
                <button 
                  onClick={() => router.push('/feed')}
                  className="px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors text-sm font-medium"
                >
                  Create Post
                </button>
              )}
            </>
          )}
          {activeTab === 'jobs' && (
            <>
              <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-lg mb-2">No job postings yet</p>
              <p className="text-gray-500 text-sm mb-4">Post job opportunities to attract top talent</p>
              {isOwnProfile && (
                <button 
                  onClick={() => router.push('/institution/jobs/create')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Post Job
                </button>
              )}
            </>
          )}
          {activeTab === 'events' && (
            <>
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-lg mb-2">No events yet</p>
              <p className="text-gray-500 text-sm mb-4">Create events to engage with the healthcare community</p>
              {isOwnProfile && (
                <button 
                  onClick={() => router.push('/institution/events/create')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Create Event
                </button>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
});


export default function InstitutionProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [jobs, setJobs] = useState<JobWithCompany[]>([]);
  const [events, setEvents] = useState<EventWithOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>('none');
  const [followStatus, setFollowStatus] = useState<string>('none');
  const [connectionCount, setConnectionCount] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    full_name?: string;
    headline?: string;
    location?: string;
    specialization?: string[];
    bio?: string;
    [key: string]: any;
  }>({});

  const isOwnProfile = user?.id === profile?.id;

  // Get only current (ongoing) experiences and education
  const currentExperiences = useMemo(() => 
    experiences.filter(exp => exp.current), [experiences]
  );
  
  const currentEducation = useMemo(() => 
    education.filter(edu => edu.current), [education]
  );

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [profileData, institutionData, experiencesData, educationData, postsData, connectionCountData] = await Promise.all([
        getProfile(user.id),
        getInstitutionByAdminId(user.id),
        getExperiences(user.id),
        getEducation(user.id),
        getPostsByAuthor(user.id),
        getConnectionCount(user.id)
      ]);

      setProfile(profileData);
      setInstitution(institutionData);
      setExperiences(experiencesData);
      setEducation(educationData);
      setPosts(postsData);
      setConnectionCount(connectionCountData);

      // Fetch jobs and events if institution exists
      if (institutionData?.id) {
        const [jobsData, eventsData] = await Promise.all([
          getJobsByInstitution(institutionData.id),
          getEventsByInstitution(institutionData.id)
        ]);
        setJobs(jobsData);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Redirect if not an institution user
  useEffect(() => {
    if (profile && profile.user_type !== 'institution' && profile.profile_type !== 'institution') {
      router.push(`/profile/${user?.id}`);
    }
  }, [profile, user?.id, router]);

  const startEdit = (field: string, value: any) => {
    setEditingField(field);
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (field: string) => {
    if (!user?.id || !profile) return;

    try {
      const updates = { [field]: editValues[field] };
      await updateProfile(user.id, updates);
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setEditingField(null);
      setEditValues({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleEditImages = () => {
    setShowImageEditor(true);
  };

  const handleViewContactInfo = () => {
    setShowContactModal(true);
  };

  if (loading) {
    return (
      <LoadingSpinner 
        variant="fullscreen" 
        text="Loading institution profile..." 
      />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BuildingOfficeIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Institution Profile Not Found</h2>
          <p className="text-gray-600 mb-6">It looks like your institution profile hasn&apos;t been set up yet.</p>
          <button 
            onClick={() => router.push('/institution/onboarding')}
            className="px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-colors font-medium"
          >
            Complete Institution Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-[#007fff]/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Content Container */}
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Banner */}
            <div className="relative h-56 bg-[#007fff] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-6 right-6 w-16 h-16 border-2 border-white rounded-full"></div>
                <div className="absolute top-16 left-8 w-12 h-12 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-8 right-1/4 w-8 h-8 border border-white rounded-full"></div>
                <div className="absolute bottom-16 left-1/3 w-10 h-10 border border-white rounded-full"></div>
              </div>
              
              {/* Banner Image if exists */}
              {profile.banner_url && (
                <Image
                  src={profile.banner_url}
                  alt="Institution banner"
                  fill
                  className="object-cover mix-blend-overlay"
                />
              )}
              
              {/* Edit Banner Button */}
              {isOwnProfile && (
                <button
                  onClick={handleEditImages}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110 border border-white/30"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Content */}
            <div className="px-4 py-3">
              {/* Avatar positioned to overlap banner */}
              <div className="flex justify-start -mt-20 mb-3">
                <div className="relative">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.full_name || 'Institution'}
                    size="2xl"
                    className="border-4 border-white shadow-2xl ring-4 ring-[#007fff]/20 w-32 h-32"
                  />
                  {/* Edit Avatar Button */}
                  {isOwnProfile && (
                    <button
                      onClick={handleEditImages}
                      className="absolute -bottom-2 -right-2 bg-[#007fff] text-white p-2 rounded-full hover:bg-[#007fff]/90 transition-all duration-300 shadow-lg transform hover:scale-110"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Information and Actions */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                {/* Left Side: Profile Info and Stats */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Name */}
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#007fff] leading-tight">
                      {profile.full_name || 'Healthcare Institution'}
                    </h1>
                    
                    {/* Headline */}
                    <p className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed">
                      {formatInstitutionTypeAsHeadline(institution?.type)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <MapPinIcon className="w-3 h-3 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium">
                        {profile.location || 'No location set'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="flex items-center gap-6 pt-2 text-sm text-gray-600">
                    <button 
                      onClick={handleViewContactInfo}
                      className="text-[#007fff] hover:text-[#007fff]/80 hover:underline font-semibold transition-all duration-200 flex items-center gap-2 group"
                    >
                      <div className="w-4 h-4 bg-[#007fff]/10 rounded-full flex items-center justify-center group-hover:bg-[#007fff]/20 transition-colors duration-200">
                        <EnvelopeIcon className="w-2 h-2 text-[#007fff]" />
                      </div>
                      Contact info
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
              <div className="space-y-3">
                {/* About Section - Moved to top */}
                <AboutCard
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  editingField={editingField}
                  editValues={editValues}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                />

                {/* Activity Section - Now includes posts, jobs, and events */}
                <ActivityCard 
                  posts={posts} 
                  jobs={jobs}
                  events={events}
                  isOwnProfile={isOwnProfile} 
                  connectionCount={connectionCount} 
                  router={router}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
        
      {/* Modals */}
      {showImageEditor && profile && (
        <EnhancedProfileImageEditor
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          onUpdate={() => {
            setShowImageEditor(false);
            fetchProfileData();
          }}
          currentAvatar={profile.avatar_url}
          currentBanner={profile.banner_url}
        />
      )}

      {/* Contact Info Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{profile.phone}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#007fff] hover:underline">
                  {profile.website}
                </a>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowContactModal(false)}
            className="mt-6 w-full px-4 py-2 bg-[#007fff] text-white rounded-lg hover:bg-[#007fff]/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
