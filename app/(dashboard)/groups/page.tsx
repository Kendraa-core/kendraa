'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserGroupIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isMember: boolean;
  category: string;
  imageUrl?: string;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // TODO: Implement getGroups query
        // Mock data for now
        const mockGroups: Group[] = [
          {
            id: '1',
            name: 'Healthcare Professionals Network',
            description: 'Connect with healthcare professionals from around the world. Share insights, discuss trends, and build meaningful connections.',
            memberCount: 1247,
            isMember: true,
            category: 'Healthcare',
          },
          {
            id: '2',
            name: 'Medical Innovation Hub',
            description: 'Stay updated with the latest medical innovations, research breakthroughs, and technological advancements in healthcare.',
            memberCount: 892,
            isMember: true,
            category: 'Innovation',
          },
          {
            id: '3',
            name: 'Physician Leadership Forum',
            description: 'A community for physician leaders to discuss leadership challenges, share best practices, and mentor emerging leaders.',
            memberCount: 456,
            isMember: false,
            category: 'Leadership',
          },
          {
            id: '4',
            name: 'Medical Research Collaboration',
            description: 'Connect with researchers, share findings, and collaborate on medical research projects across different specialties.',
            memberCount: 678,
            isMember: false,
            category: 'Research',
          },
        ];
        setGroups(mockGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.id]);

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, isMember: true, memberCount: group.memberCount + 1 } : group
    ));
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, isMember: false, memberCount: group.memberCount - 1 } : group
    ));
  };

  const myGroups = groups.filter(group => group.isMember);
  const discoverGroups = groups.filter(group => !group.isMember);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                <p className="text-gray-600">Connect with professional communities</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'my-groups'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Groups ({myGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Discover Groups ({discoverGroups.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'my-groups' ? myGroups : discoverGroups).map((group) => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4" />
                      <span>{group.memberCount} members</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{group.category}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{group.description}</p>
                
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Group
                  </button>
                  {group.isMember ? (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-3 py-1 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (activeTab === 'my-groups' ? myGroups : discoverGroups).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'my-groups' ? 'No groups joined yet' : 'No groups available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'my-groups' 
                ? 'Join some groups to start connecting with professional communities.'
                : 'Check back later for new groups to join.'
              }
            </p>
            {activeTab === 'my-groups' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Discover Groups
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
