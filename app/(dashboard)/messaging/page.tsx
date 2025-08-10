'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversations, createConversation, sendMessage, getConversationMessages, markMessageAsRead } from '@/lib/queries';
import type { ConversationWithParticipants, MessageWithSender } from '@/types/database.types';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import NewConversationModal from '@/components/messaging/NewConversationModal';
import StartConversationModal from '@/components/messaging/StartConversationModal';
import type { ConversationParticipant, Profile, Institution } from '@/types/database.types';
import { useSearchParams } from 'next/navigation';

export default function MessagingPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showStartConversationModal, setShowStartConversationModal] = useState(false);

  // Check for conversation parameter in URL
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversationId);
      }
    }
  }, [searchParams, conversations]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getUserConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data.reverse()); // Show oldest first
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id || !profile) return;
    
    setSending(true);
    try {
      const message = await sendMessage({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: profile.profile_type,
        content: newMessage.trim(),
        encryption_level: 'hipaa', // HIPAA-compliant by default
        retention_policy: 'clinical',
      });
      
      if (message) {
        setNewMessage('');
        // Refresh messages
        await fetchMessages(selectedConversation.id);
        // Update conversation list
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Mark message as read
  const handleMarkAsRead = async (messageId: string) => {
    if (!user?.id) return;
    await markMessageAsRead(messageId, user.id);
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation: ConversationWithParticipants) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return conv.title?.toLowerCase().includes(query) ||
           conv.participants?.some((p: ConversationParticipant & { user?: Profile | Institution }) => 
             p.user && ('full_name' in p.user ? p.user.full_name?.toLowerCase().includes(query) : p.user.name?.toLowerCase().includes(query))
           );
  });

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      // Mark messages as read when conversation is selected
      messages.forEach(message => {
        if (!message.read_by?.includes(user?.id || '')) {
          handleMarkAsRead(message.id);
        }
      });
    }
  }, [selectedConversation, messages, user?.id, handleMarkAsRead]);

  const getConversationTitle = (conversation: ConversationWithParticipants) => {
    if (conversation.title) return conversation.title;
    
    const otherParticipants = conversation.participants?.filter((p: ConversationParticipant & { user?: Profile | Institution }) => p.user_id !== user?.id) || [];
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      const user = participant.user;
      if (user) {
        return 'full_name' in user ? user.full_name : user.name || 'Unknown User';
      }
      return 'Unknown User';
    }
    
    return `${otherParticipants.length} participants`;
  };

  const getConversationIcon = (conversation: ConversationWithParticipants) => {
    if (conversation.conversation_type === 'clinical') {
      return <ShieldCheckIcon className="w-5 h-5 text-green-600" />;
    }
    if (conversation.conversation_type === 'group') {
      return <UserGroupIcon className="w-5 h-5 text-blue-600" />;
    }
    return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleConversationCreated = async () => {
    await fetchConversations();
  };

  const handleConversationStarted = async (conversationId: string) => {
    // Find the conversation in the list or fetch it
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      await fetchMessages(conversationId);
    } else {
      // Refresh conversations to get the new one
      await fetchConversations();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-screen flex">
        {/* Sidebar - Conversations List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowStartConversationModal(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Start conversation with connections"
                >
                  <UserGroupIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowNewConversationModal(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Create new conversation"
                >
                  <PlusIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Search */}
            <div className="mt-4 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a conversation to begin messaging</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowStartConversationModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Message Connections
                  </button>
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Create New Conversation
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getConversationIcon(conversation)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          {conversation.last_message && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message.content}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {conversation.conversation_type === 'clinical' && (
                            <ShieldCheckIcon className="w-3 h-3 text-green-600" />
                          )}
                          {conversation.unread_count > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getConversationIcon(selectedConversation)}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {getConversationTitle(selectedConversation)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participants?.length || 0} participants
                        {selectedConversation.conversation_type === 'clinical' && ' • HIPAA Compliant'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs opacity-75">
                              {'full_name' in message.sender ? message.sender.full_name : message.sender.name || 'Unknown'}
                            </span>
                            <span className="text-xs opacity-75">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {message.encryption_level === 'hipaa' && (
                              <ShieldCheckIcon className="w-3 h-3" />
                            )}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.read_by?.includes(user?.id || '') && (
                            <div className="flex justify-end mt-1">
                              <CheckIcon className="w-3 h-3 opacity-75" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>HIPAA Compliant • End-to-end encrypted</span>
                  <span>{newMessage.length}/1000</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 mb-4">Choose a conversation from the sidebar to start messaging</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowStartConversationModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Message Connections
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
      
      <StartConversationModal
        isOpen={showStartConversationModal}
        onClose={() => setShowStartConversationModal(false)}
        onConversationStarted={handleConversationStarted}
      />
    </div>
  );
} 