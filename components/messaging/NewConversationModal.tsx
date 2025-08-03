'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserGroupIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { createConversation, getProfile } from '@/lib/queries';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: () => void;
}

export default function NewConversationModal({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) {
  const { user } = useAuth();
  const [conversationType, setConversationType] = useState<'direct' | 'group' | 'clinical'>('direct');
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);

  // Search for users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // This would need to be implemented in queries.ts
      // For now, we'll use a mock search
      const mockResults: Profile[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          full_name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          avatar_url: null,
          banner_url: null,
          headline: 'Cardiologist',
          bio: 'Experienced cardiologist with 15+ years of practice',
          location: 'New York, NY',
          website: null,
          phone: null,
          specialization: ['Cardiology', 'Interventional Cardiology'],
          is_premium: true,
          profile_views: 150,
          user_type: 'individual',
          profile_type: 'individual',
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          full_name: 'Dr. Michael Chen',
          email: 'michael.chen@clinic.com',
          avatar_url: null,
          banner_url: null,
          headline: 'Neurologist',
          bio: 'Specialist in neurological disorders and treatments',
          location: 'Los Angeles, CA',
          website: null,
          phone: null,
          specialization: ['Neurology', 'Epilepsy'],
          is_premium: true,
          profile_views: 120,
          user_type: 'individual',
          profile_type: 'individual',
        },
      ];

      setSearchResults(mockResults.filter(user => 
        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        user.headline?.toLowerCase().includes(query.toLowerCase())
      ));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreateConversation = async () => {
    if (!user?.id || selectedParticipants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    setLoading(true);
    try {
      const participants = [user.id, ...selectedParticipants];
      const conversation = await createConversation({
        title: title || undefined,
        conversation_type: conversationType,
        participants,
      });

      if (conversation) {
        toast.success('Conversation created successfully!');
        onConversationCreated();
        onClose();
        // Reset form
        setTitle('');
        setSelectedParticipants([]);
        setConversationType('direct');
      } else {
        toast.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getConversationTypeIcon = (type: 'direct' | 'group' | 'clinical') => {
    switch (type) {
      case 'clinical':
        return <ShieldCheckIcon className="w-5 h-5 text-green-600" />;
      case 'group':
        return <UserGroupIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getConversationTypeDescription = (type: 'direct' | 'group' | 'clinical') => {
    switch (type) {
      case 'clinical':
        return 'HIPAA-compliant clinical communication with enhanced security and audit trails';
      case 'group':
        return 'Group conversations for team collaboration and discussions';
      default:
        return 'Direct one-on-one messaging';
    }
  };

  return (
    <>
      {isOpen && (
        <div
          
          
          
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            
            
            
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New Conversation</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Conversation Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Conversation Type</h3>
                <div className="space-y-2">
                  {(['direct', 'group', 'clinical'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setConversationType(type)}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        conversationType === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getConversationTypeIcon(type)}
                        <div className="text-left">
                          <div className="font-medium text-gray-900 capitalize">
                            {type} Conversation
                          </div>
                          <div className="text-sm text-gray-500">
                            {getConversationTypeDescription(type)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title (for group and clinical conversations) */}
              {(conversationType === 'group' || conversationType === 'clinical') && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Conversation Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Enter ${conversationType} conversation title`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Participant Search */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Add Participants
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => toggleParticipant(user.id)}
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          selectedParticipants.includes(user.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium text-gray-900">
                              {user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.headline}
                            </div>
                          </div>
                          {selectedParticipants.includes(user.id) && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Participants */}
                {selectedParticipants.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Selected Participants ({selectedParticipants.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchResults
                        .filter(user => selectedParticipants.includes(user.id))
                        .map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{user.full_name}</span>
                            <button
                              onClick={() => toggleParticipant(user.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConversation}
                disabled={loading || selectedParticipants.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Conversation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 