'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getConnections, getOrCreateConversation } from '@/lib/queries';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/database.types';
import toast from 'react-hot-toast';

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conversationId: string) => void;
}

export default function StartConversationModal({ isOpen, onClose, onConversationStarted }: StartConversationModalProps) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's connections
  const fetchConnections = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getConnections(user.id);
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen, user?.id]);

  const handleStartConversation = async (connectionId: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const conversation = await getOrCreateConversation(user.id, connectionId);
      
      if (conversation) {
        toast.success('Conversation started!');
        onConversationStarted(conversation.id);
        onClose();
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const filteredConnections = connections.filter(connection => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return connection.full_name?.toLowerCase().includes(query) ||
           connection.headline?.toLowerCase().includes(query);
  });

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
              <h2 className="text-xl font-semibold text-gray-900">Start Conversation</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search connections..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Connections List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading connections...</p>
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No connections found</p>
                    <p className="text-sm text-gray-400">Connect with other professionals to start messaging</p>
                  </div>
                ) : (
                  filteredConnections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleStartConversation(connection.id)}
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {connection.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {connection.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {connection.headline || 'Healthcare Professional'}
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 