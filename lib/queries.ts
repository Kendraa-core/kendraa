import { supabase } from './supabase';
import toast from 'react-hot-toast';
import type { Profile, Post, PostComment,
  PostWithAuthor, CommentWithAuthor, Connection, Institution, Job, JobApplication, JobWithCompany,
  Event, EventAttendee, EventWithOrganizer, Experience, Education, Notification,
  ConnectionWithProfile, Follow, FollowWithProfile, Conversation, ConversationWithParticipants,
  Message, MessageWithSender, MessageReaction, ClinicalNote, MessagingSettings,
  ConversationParticipant } from '@/types/database.types';

// Helper function to get Supabase client with null check
export const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client is not available. Please check your configuration.');
  }
  return supabase;
};

// Re-export types for convenience
export type { 
  EventWithOrganizer, 
  Institution, 
  JobWithCompany, 
  Profile,
  Experience,
  Education,
  PostWithAuthor,
  ConnectionWithProfile,
  Follow,
  FollowWithProfile,
  Conversation,
  ConversationWithParticipants,
  Message,
  MessageWithSender,
  MessageReaction,
  ClinicalNote,
  MessagingSettings
};

// No caching - direct database calls only

// Profile queries - No caching
export async function getProfile(userId: string): Promise<Profile> {
  try {
    console.log('[Queries] Getting profile for user:', userId);
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Queries] Error fetching profile:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Profile not found');
    }

    console.log('[Queries] Profile fetched successfully');
    return data as Profile;
  } catch (error) {
    console.error('[Queries] Error in getProfile:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    console.log('[Queries] Updating profile', { userId, updates });
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Queries] Error updating profile', error);
      throw error;
    }
    
    console.log('[Queries] Profile updated successfully', data);
    return data;
  } catch (error) {
    console.error('[Queries] Error updating profile', error);
    return null;
  }
}

export async function ensureProfileExists(
  userId: string,
  email: string,
  fullName: string,
  profileType: 'individual' | 'institution'
): Promise<Profile> {
  try {
    console.log('[Queries] Ensuring profile exists for user:', userId);
    
    // Check if Supabase is available
    if (!supabase) {
      console.error('[Queries] Supabase client is not available');
      throw new Error('Database connection not available');
    }

    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new users
      console.error('[Queries] Error fetching existing profile:', fetchError);
      throw new Error(`Failed to check existing profile: ${fetchError.message}`);
    }

    if (existingProfile) {
      console.log('[Queries] Profile already exists, returning existing profile');
      return existingProfile as Profile;
    }

    // Profile doesn't exist, create it with retry logic
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Queries] Creating profile (attempt ${attempt}/${maxRetries})`);
        
        const { data, error } = await getSupabase()
          .from('profiles')
          .insert({
            id: userId,
            email,
            full_name: fullName,
            user_type: profileType,
            profile_type: profileType,
            headline: '',
            bio: '',
            location: '',
            avatar_url: '',
            banner_url: '',
            website: '',
            phone: '',
            specialization: [],
            is_premium: false,
    
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          // Handle specific error types
          if (error.code === '23505') {
            // Unique constraint violation - profile was created by another process
            console.log('[Queries] Profile already exists (race condition), fetching it');
            const { data: raceProfile, error: raceError } = await getSupabase()
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (raceError) {
              throw new Error(`Failed to fetch profile after race condition: ${raceError.message}`);
            }
            
            console.log('[Queries] Successfully retrieved profile after race condition');
            return raceProfile as Profile;
          } else if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('401')) {
            throw new Error('Authentication error. Please check your Supabase credentials and database permissions.');
          } else if (error.code === 'PGRST114') {
            throw new Error('Database table not found. Please run the database migrations.');
          } else if (error.code === 'PGRST116') {
            // No rows returned - this shouldn't happen with insert
            throw new Error('Profile creation failed - no data returned');
          } else {
            throw error;
          }
        }

        if (!data) {
          throw new Error('Profile creation failed - no data returned');
        }

        console.log('[Queries] Profile created successfully');
        return data as Profile;
      } catch (error: any) {
        lastError = error;
        console.error(`[Queries] Profile creation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`[Queries] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error('[Queries] All profile creation attempts failed');
    throw new Error(`Failed to create profile after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  } catch (error) {
    console.error('[Queries] Error in ensureProfileExists:', error);
    throw error;
  }
}

// Post queries
export async function getPosts(limit = 10, offset = 0): Promise<Post[]> {
  try {
    console.log('[Queries] Getting posts');
    
    // First get posts without joins to avoid complex query issues
    const { data: posts, error } = await getSupabase()
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Queries] Error fetching posts:', error);
      return [];
    }
    
    if (!posts || posts.length === 0) {
      console.log('[Queries] No posts found');
      return [];
    }
    
    // Get author IDs for the posts
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    
    // Fetch authors separately
    const { data: authors, error: authorsError } = await getSupabase()
      .from('profiles')
      .select('id, full_name, avatar_url, headline, user_type')
      .in('id', authorIds);
    
    if (authorsError) {
      console.error('[Queries] Error fetching authors:', authorsError);
    }
    
    // Create author lookup map
    const authorMap = new Map(authors?.map(author => [author.id, author]) || []);
    
    // Combine posts with author data
    const postsWithAuthors = posts.map(post => ({
      ...post,
      profiles: authorMap.get(post.author_id) || null
    }));

    console.log('[Queries] Posts fetched successfully:', postsWithAuthors.length);
    return postsWithAuthors;
  } catch (error) {
    console.error('[Queries] Error in getPosts:', error);
    return [];
  }
}

export async function getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
  try {
    console.log('Getting posts by author', { authorId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty posts');
      return [];
    }
    
    // Get posts without join first
    const { data: posts, error: postsError } = await getSupabase()
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.log('Error fetching posts by author', postsError);
      return [];
    }
    
    if (!posts || posts.length === 0) {
      console.log('No posts found for author');
      return [];
    }
    
    // Fetch author separately
    const { data: author, error: authorError } = await getSupabase()
      .from('profiles')
      .select('id, full_name, avatar_url, headline, email')
      .eq('id', authorId)
      .single();
    
    if (authorError) {
      console.log('Error fetching author', authorError);
      // Return posts without author info
      return posts.map(post => ({
        ...post,
        author: {
          id: post.author_id,
          full_name: 'Unknown User',
          avatar_url: '',
          headline: '',
          email: ''
        }
      }));
    }
    
    // Combine posts with author
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author: author || {
        id: post.author_id,
        full_name: 'Unknown User',
        avatar_url: '',
        headline: '',
        email: ''
      }
    }));
    
    console.log('Posts by author fetched successfully', postsWithAuthor);
    return postsWithAuthor;
  } catch (error) {
    console.log('Error fetching posts by author', error);
    return [];
  }
}

export async function createPost(
  authorId: string,
  content: string,
  mediaUrl?: string
): Promise<Post | null> {
  try {
    console.log('[Queries] Creating post for user:', authorId);
    
    const { data, error } = await getSupabase()
      .from('posts')
      .insert({
        author_id: authorId,
        content,
        media_url: mediaUrl,
        likes_count: 0,
        comments_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[Queries] Error creating post:', error);
      throw error;
    }
    
    console.log('[Queries] Post created successfully');
    return data as Post;
  } catch (error) {
    console.error('[Queries] Error in createPost:', error);
    throw error;
  }
}

// Connection queries
export async function getConnections(userId: string): Promise<Profile[]> {
  try {
    console.log('Getting connections', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty connections');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('connections')
      .select(`
        requester_id,
        recipient_id,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.log('Error fetching connections', error);
      return [];
    }

    if (!data) return [];

    // Extract connected profiles
    const connections: Profile[] = [];
    for (const connection of data) {
      if (connection.requester_id === userId && connection.recipient) {
        connections.push(connection.recipient as unknown as Profile);
      } else if (connection.recipient_id === userId && connection.requester) {
        connections.push(connection.requester as unknown as Profile);
      }
    }
    
    console.log('Connections fetched successfully', connections);
    return connections;
  } catch (error) {
    console.log('Error fetching connections', error);
    return [];
  }
}

export async function getConnectionStatus(userId: string, targetUserId: string): Promise<string | null> {
  try {
    console.log('Getting connection status', { userId, targetUserId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning null connection status');
      return null;
    }
    
    // Use a simpler approach to avoid complex OR queries
    const { data: data1, error: error1 } = await getSupabase()
      .from('connections')
      .select('status')
      .eq('requester_id', userId)
      .eq('recipient_id', targetUserId)
      .single();

    if (data1) {
      console.log('Connection status fetched', data1.status);
      return data1.status;
    }

    const { data: data2, error: error2 } = await getSupabase()
      .from('connections')
      .select('status')
      .eq('requester_id', targetUserId)
      .eq('recipient_id', userId)
      .single();

    if (data2) {
      console.log('Connection status fetched', data2.status);
      return data2.status;
    }

    console.log('Connection status fetched', null);
    return null;
  } catch (error) {
    console.log('Error fetching connection status', error);
    return null;
  }
}

export async function sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection | null> {
  try {
    console.log('Sending connection request', { requesterId, recipientId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot send connection request');
      return null;
    }
    
    // Get requester profile for notification
    const requesterProfile = await getProfile(requesterId);
    
    const { data, error } = await getSupabase()
      .from('connections')
      .insert({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create notification for recipient
    if (data && requesterProfile) {
      await createNotification({
        user_id: recipientId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${requesterProfile.full_name || 'Someone'} wants to connect with you`,
        read: false,
        data: { profileId: requesterId },
        action_url: null,
      });
    }
    
    console.log('Connection request sent successfully', data);
    return data;
  } catch (error) {
    console.log('Error sending connection request', error);
    return null;
  }
}

// Missing connection functions
export async function getSuggestedConnections(userId: string, limit = 10): Promise<Profile[]> {
  try {
    console.log('Getting suggested connections', { userId, limit });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty suggested connections');
      return [];
    }
    
    // Get existing connections to exclude them from suggestions
    const { data: existingConnections } = await getSupabase()
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    const connectedUserIds = existingConnections?.map(conn => 
      conn.requester_id === userId ? conn.recipient_id : conn.requester_id
    ) || [];
    
    // Get pending connection requests to exclude them
    const { data: pendingRequests } = await getSupabase()
      .from('connections')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'pending');
    
    const pendingUserIds = pendingRequests?.map(conn => 
      conn.requester_id === userId ? conn.recipient_id : conn.requester_id
    ) || [];
    
    // Combine all users to exclude
    const excludeUserIds = [userId, ...connectedUserIds, ...pendingUserIds];
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeUserIds.join(',')})`)
      .limit(limit);

    if (error) {
      console.log('Error fetching suggested connections', error);
      return [];
    }
    
    console.log('Suggested connections fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching suggested connections', error);
    return [];
  }
}

export async function getConnectionRequests(userId: string): Promise<ConnectionWithProfile[]> {
  try {
    console.log('Getting connection requests', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty connection requests');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Connection requests fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching connection requests', error);
    return [];
  }
}

export async function acceptConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    console.log('Accepting connection request', { connectionId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot accept connection request');
      return false;
    }
    
    // First, get the connection details to know who to notify
    const { data: connection, error: fetchError } = await getSupabase()
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (fetchError) throw fetchError;
    
    // Update the connection status
    const { error } = await getSupabase()
      .from('connections')
      .update({ 
        status: 'accepted', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', connectionId);

    if (error) throw error;
    
    // Create notification for the requester
    if (connection) {
      const accepterProfile = await getProfile(connection.recipient_id);
      if (accepterProfile) {
        await createNotification({
          user_id: connection.requester_id,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: `${accepterProfile.full_name || 'Someone'} accepted your connection request`,
          read: false,
          data: { profileId: connection.recipient_id },
          action_url: null,
        });
      }
    }
    
    console.log('Connection request accepted successfully');
    return true;
  } catch (error) {
    console.log('Error accepting connection request', error);
    return false;
  }
}

export async function rejectConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    console.log('Rejecting connection request', { connectionId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot reject connection request');
      return false;
    }
    
    const { error } = await getSupabase()
      .from('connections')
      .update({ 
        status: 'rejected', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', connectionId);

    if (error) throw error;
    
    console.log('Connection request rejected successfully');
    return true;
  } catch (error) {
    console.log('Error rejecting connection request', error);
    return false;
  }
}

// Experience queries
export async function getExperiences(profileId: string): Promise<Experience[]> {
  try {
    console.log('Getting experiences', { profileId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty experiences');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('experiences')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    console.log('Experiences fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching experiences', error);
    return [];
  }
}

// Education queries
export async function getEducation(profileId: string): Promise<Education[]> {
  try {
    console.log('Getting education', { profileId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty education');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('education')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    
    console.log('Education fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching education', error);
    return [];
  }
}

// Notifications - returning mock data for now
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    console.log('Getting notifications', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning mock notifications');
      return [
        {
          id: '1',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          user_id: userId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: 'Dr. Sarah Johnson wants to connect with you',
          read: false,
          data: { profileId: 'user-1' },
          action_url: null,
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          user_id: userId,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: 'Dr. Michael Chen accepted your connection request',
          read: true,
          data: { profileId: 'user-2' },
          action_url: null,
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          user_id: userId,
          type: 'post_like',
          title: 'Post Liked',
          message: 'Dr. Emily Rodriguez liked your post about healthcare innovation',
          read: true,
          data: { postId: 'post-1' },
          action_url: null,
        },
      ];
    }
    
    // Try to get notifications from database
    const { data, error } = await getSupabase()
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId) // Use recipient_id instead of user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching notifications from database, returning mock data', error);
      // If table doesn't exist or other error, return mock data
      return [
        {
          id: '1',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user_id: userId,
          type: 'connection_request',
          title: 'New Connection Request',
          message: 'Dr. Sarah Johnson wants to connect with you',
          read: false,
          data: { profileId: 'user-1' },
          action_url: null,
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user_id: userId,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: 'Dr. Michael Chen accepted your connection request',
          read: true,
          data: { profileId: 'user-2' },
          action_url: null,
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user_id: userId,
          type: 'post_like',
          title: 'Post Liked',
          message: 'Dr. Emily Rodriguez liked your post about healthcare innovation',
          read: true,
          data: { postId: 'post-1' },
          action_url: null,
        },
      ];
    }
    
    console.log('Notifications fetched successfully', data);
    // Transform the data to match our interface
    return (data || []).map(notification => ({
      id: notification.id,
      created_at: notification.created_at,
      user_id: notification.recipient_id, // Map recipient_id back to user_id
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      data: notification.data,
      action_url: null, // Add this field as it's not in the database
    }));
  } catch (error) {
    console.log('Error fetching notifications', error);
    // Return mock data on any error
    return [
      {
        id: '1',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: 'Dr. Sarah Johnson wants to connect with you',
        read: false,
        data: { profileId: 'user-1' },
        action_url: null,
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: 'Dr. Michael Chen accepted your connection request',
        read: true,
        data: { profileId: 'user-2' },
        action_url: null,
      },
      {
        id: '3',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user_id: userId,
        type: 'post_like',
        title: 'Post Liked',
        message: 'Dr. Emily Rodriguez liked your post about healthcare innovation',
        read: true,
        data: { postId: 'post-1' },
        action_url: null,
      },
    ];
  }
}

// Create notification function
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
  try {
    console.log('Creating notification', notification);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create notification');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('notifications')
      .insert({
        recipient_id: notification.user_id, // Map user_id to recipient_id for database
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        data: notification.data,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Notification created successfully', data);
    return data;
  } catch (error) {
    console.log('Error creating notification', error);
    return null;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    console.log('Marking notification as read', { notificationId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot mark notification as read');
      return false;
    }
    
    const { error } = await getSupabase()
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    
    console.log('Notification marked as read successfully');
    return true;
  } catch (error) {
    console.log('Error marking notification as read', error);
    return false;
  }
}

// Profile view recording functionality removed

// Comment functions
export async function createComment(comment: {
  content: string;
  post_id: string;
  author_id: string;
}): Promise<PostComment | null> {
  try {
    console.log('[Queries] Creating comment:', comment);
    
    // First check if the table exists
    const tableExists = await ensurePostCommentsTable();
    if (!tableExists) {
      console.log('[Queries] Post comments table does not exist, cannot create comment');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('post_comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Queries] Error creating comment:', error);
      throw error;
    }
    
    // Update post comments count
    const { data: post } = await getSupabase()
      .from('posts')
      .select('comments_count')
      .eq('id', comment.post_id)
      .single();

    if (post) {
      const { error: updateError } = await getSupabase()
        .from('posts')
        .update({ comments_count: (post.comments_count || 0) + 1 })
        .eq('id', comment.post_id);

      if (updateError) {
        console.error('[Queries] Error updating comments count:', updateError);
      }
    }
    
    console.log('[Queries] Comment created successfully:', data);
    return data;
  } catch (error) {
    console.error('[Queries] Error in createComment:', error);
    return null;
  }
}

export async function getPostComments(postId: string, limit?: number): Promise<CommentWithAuthor[]> {
  try {
    console.log('[Queries] Getting comments for post:', postId);
    
    // Try to fetch comments with author data
    let query = getSupabase()
      .from('post_comments')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, headline, user_type)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('[Queries] Error fetching comments with author data:', error);
      
      // If the join fails, try fetching comments without author data
      console.log('[Queries] Trying to fetch comments without author data');
      let fallbackQuery = getSupabase()
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      // Apply limit if specified
      if (limit) {
        fallbackQuery = fallbackQuery.limit(limit);
      }
      
      const { data: commentsOnly, error: commentsError } = await fallbackQuery;
      
      if (commentsError) {
        console.error('[Queries] Error fetching comments without author data:', commentsError);
        return [];
      }
      
      // If we got comments without author data, fetch authors separately
      if (commentsOnly && commentsOnly.length > 0) {
        const authorIds = [...new Set(commentsOnly.map(comment => comment.author_id))];
        console.log('[Queries] Fetching authors for comment IDs:', authorIds);
        
        const { data: authors, error: authorsError } = await getSupabase()
          .from('profiles')
          .select('id, full_name, avatar_url, headline, user_type')
          .in('id', authorIds);
        
        if (authorsError) {
          console.error('[Queries] Error fetching authors:', authorsError);
        }
        
        // Create author lookup map
        const authorMap = new Map(authors?.map(author => [author.id, author]) || []);
        
        // Combine comments with author data
        const commentsWithAuthors = commentsOnly.map(comment => ({
          ...comment,
          author: authorMap.get(comment.author_id) || null
        }));
        
        console.log('[Queries] Comments fetched successfully with separate author lookup:', commentsWithAuthors.length);
        return commentsWithAuthors;
      }
      
      console.log('[Queries] No comments found for post:', postId);
      return [];
    }
    
    console.log('[Queries] Comments fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in getPostComments:', error);
    return [];
  }
}

// Like functions
export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Liking post:', postId, 'by user:', userId);
    
    // Check if already liked
    const { data: existingLike } = await getSupabase()
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      console.log('[Queries] Post already liked');
      return false;
    }
    
    // Add like record
    const { error: likeError } = await getSupabase()
      .from('post_likes')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (likeError) {
      console.error('[Queries] Error adding like:', likeError);
      throw likeError;
    }

    // Update post likes count
    const { data: post } = await getSupabase()
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (post) {
      const { error: updateError } = await getSupabase()
        .from('posts')
        .update({ likes_count: (post.likes_count || 0) + 1 })
        .eq('id', postId);

      if (updateError) {
        console.error('[Queries] Error updating likes count:', updateError);
      }
    }

    console.log('[Queries] Post liked successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in likePost:', error);
    return false;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Unliking post:', postId, 'by user:', userId);
    
    // Remove like record
    const { error: unlikeError } = await getSupabase()
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (unlikeError) {
      console.error('[Queries] Error removing like:', unlikeError);
      throw unlikeError;
    }

    // Update post likes count
    const { data: post } = await getSupabase()
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    if (post) {
      const newCount = Math.max(0, (post.likes_count || 0) - 1);
      const { error: updateError } = await getSupabase()
        .from('posts')
        .update({ likes_count: newCount })
        .eq('id', postId);

      if (updateError) {
        console.error('[Queries] Error updating likes count:', updateError);
      }
    }

    console.log('[Queries] Post unliked successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in unlikePost:', error);
    return false;
  }
}

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  try {
    console.log('[Queries] Checking if post is liked by user:', userId, 'post:', postId);
    
    const { data, error } = await getSupabase()
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .limit(1);

    if (error) {
      console.error('[Queries] Error checking like status:', error);
      return false;
    }
    
    const isLiked = data && data.length > 0;
    console.log('[Queries] Post like status checked:', isLiked);
    return isLiked;
  } catch (error) {
    console.error('[Queries] Error in isPostLiked:', error);
    return false;
  }
}

// Institution functions
export async function createInstitution(institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>): Promise<Institution | null> {
  try {
    console.log('Creating institution', institution);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create institution');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('institutions')
      .insert({
        ...institution,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Institution created successfully', data);
    return data;
  } catch (error) {
    console.log('Error creating institution', error);
    return null;
  }
}

export async function getInstitutions(): Promise<Institution[]> {
  try {
    console.log('Getting institutions');
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty institutions');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Institutions fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching institutions', error);
    return [];
  }
}

// Get institution by admin user ID
export async function getInstitutionByAdminId(adminUserId: string): Promise<Institution | null> {
  try {
    console.log('Getting institution by admin user ID', { adminUserId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot get institution');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('institutions')
      .select('*')
      .eq('admin_user_id', adminUserId)
      .single();

    if (error) {
      console.log('Error fetching institution by admin user ID', error);
      return null;
    }
    
    console.log('Institution fetched successfully', data);
    return data;
  } catch (error) {
    console.log('Error fetching institution by admin user ID', error);
    return null;
  }
}

// Create institution for a user if it doesn't exist
export async function ensureInstitutionExists(userId: string, profile: Profile): Promise<Institution | null> {
  try {
    console.log('Ensuring institution exists for user', { userId });
    
    // First check if institution already exists
    const existingInstitution = await getInstitutionByAdminId(userId);
    if (existingInstitution) {
      console.log('Institution already exists', existingInstitution);
      return existingInstitution;
    }
    
    // Map profile institution_type to institution type
    const mapInstitutionType = (profileType: string | undefined): Institution['type'] => {
      switch (profileType) {
        case 'hospital':
        case 'clinic':
        case 'research_center':
        case 'pharmaceutical':
        case 'other':
          return profileType as Institution['type'];
        case 'medical_college':
          return 'university';
        default:
          return 'hospital';
      }
    };
    
    // Create new institution
    const institutionData = {
      name: profile.full_name || 'Healthcare Institution',
      type: mapInstitutionType(profile.institution_type),
      description: profile.bio || 'Healthcare institution',
      location: profile.location || null,
      website: profile.website || null,
      phone: profile.phone || null,
      email: profile.email,
      logo_url: profile.avatar_url || null,
      banner_url: profile.banner_url || null,
      specialties: profile.specialization || null,
      license_number: null,
      accreditation: profile.accreditations || null,
      established_year: null,
      size: 'medium' as const,
      verified: false,
      admin_user_id: userId,
    };
    
    const result = await createInstitution(institutionData);
    console.log('Institution created successfully', result);
    return result;
  } catch (error) {
    console.log('Error ensuring institution exists', error);
    return null;
  }
}

// Job functions
export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> {
  try {
    console.log('Creating job', job);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create job');
      toast.error('Job creation is not available yet. Please try again later.');
      return null;
    }
    
    // Check if jobs table exists by trying to query it
    try {
      const { error: tableCheckError } = await getSupabase()
        .from('jobs')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.log('Jobs table does not exist, cannot create job');
        toast.error('Job creation feature is not available yet. Please try again later.');
        return null;
      }
    } catch (tableError) {
      console.log('Error checking jobs table existence', tableError);
      toast.error('Job creation feature is not available yet. Please try again later.');
      return null;
    }
    
    // Validate required fields
    if (!job.title || !job.description || !job.company_id || !job.posted_by) {
      console.log('Missing required fields for job creation');
      toast.error('Please fill in all required fields.');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('jobs')
      .insert({
        ...job,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        applications_count: 0, // Set default value
      })
      .select()
      .single();

    if (error) {
      console.log('Error creating job', error);
      
      // Handle specific error cases
      if (error.code === '409') {
        toast.error('A job with similar details already exists.');
      } else if (error.code === '23503') {
        toast.error('Invalid company or user reference. Please check your profile.');
      } else {
        toast.error('Failed to create job. Please try again.');
      }
      
      return null;
    }
    
    console.log('Job created successfully', data);
    toast.success('Job created successfully!');
    return data;
  } catch (error) {
    console.log('Error creating job', error);
    toast.error('Failed to create job. Please try again.');
    return null;
  }
}

export async function getJobs(): Promise<JobWithCompany[]> {
  try {
    console.log('Getting jobs');
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning mock jobs');
      // Return mock data for testing
      return [
        {
          id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: 'Senior Cardiologist',
          description: 'We are seeking a highly qualified cardiologist to join our team. The ideal candidate will have extensive experience in interventional cardiology and a passion for patient care.',
          requirements: ['Board certified in Cardiology', '5+ years experience', 'Interventional cardiology skills'],
          salary_min: 250000,
          salary_max: 350000,
          currency: 'USD',
          location: 'New York, NY',
          job_type: 'full_time',
          experience_level: 'senior',
          specializations: ['Cardiology'],
          company_id: 'inst-1',
          posted_by: 'user-1',
          status: 'active',
          application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          applications_count: 12,
          company: {
            id: 'inst-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: 'Mount Sinai Hospital',
            type: 'hospital',
            description: 'Leading healthcare institution in New York',
            location: 'New York, NY',
            website: 'https://mountsinai.org',
            phone: '+1-212-241-6500',
            email: 'hr@mountsinai.org',
            logo_url: null,
            banner_url: null,
            specialties: ['Cardiology', 'Neurology', 'Oncology'],
            license_number: 'NY123456',
            accreditation: ['JCAHO', 'AHA'],
            established_year: 1852,
            size: 'large',
            verified: true,
            admin_user_id: 'user-1',
          },
          posted_by_user: {
            id: 'user-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@mountsinai.org',
            avatar_url: null,
            banner_url: null,
            headline: 'Chief of Cardiology',
            bio: 'Experienced cardiologist with over 15 years in the field.',
            location: 'New York, NY',
            website: null,
            phone: null,
            specialization: ['Cardiology'],
            is_premium: true,
            user_type: 'institution',
            profile_type: 'institution',
            institution_type: 'hospital',
            accreditations: ['JCAHO', 'AHA'],
            departments: ['Cardiology', 'Emergency Medicine'],
            contact_info: {
              address: '1 Gustave L. Levy Place, New York, NY 10029',
              phone: '+1-212-241-6500',
              email: 'hr@mountsinai.org',
              website: 'https://mountsinai.org',
            },
          },
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: 'Pediatric Nurse Practitioner',
          description: 'Join our pediatric team to provide comprehensive care to children and adolescents. Experience in primary care pediatrics required.',
          requirements: ['NP license', 'Pediatric certification', '2+ years experience'],
          salary_min: 80000,
          salary_max: 120000,
          currency: 'USD',
          location: 'Los Angeles, CA',
          job_type: 'full_time',
          experience_level: 'mid',
          specializations: ['Pediatrics', 'Nursing'],
          company_id: 'inst-2',
          posted_by: 'user-2',
          status: 'active',
          application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          applications_count: 8,
          company: {
            id: 'inst-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: 'Children\'s Hospital Los Angeles',
            type: 'hospital',
            description: 'Premier pediatric hospital in Southern California',
            location: 'Los Angeles, CA',
            website: 'https://chla.org',
            phone: '+1-323-660-2450',
            email: 'hr@chla.org',
            logo_url: null,
            banner_url: null,
            specialties: ['Pediatrics', 'Emergency Medicine'],
            license_number: 'CA789012',
            accreditation: ['JCAHO', 'AAP'],
            established_year: 1901,
            size: 'large',
            verified: true,
            admin_user_id: 'user-2',
          },
          posted_by_user: {
            id: 'user-2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            full_name: 'Dr. Michael Chen',
            email: 'michael.chen@chla.org',
            avatar_url: null,
            banner_url: null,
            headline: 'Director of Nursing',
            bio: 'Experienced healthcare administrator with focus on pediatric care.',
            location: 'Los Angeles, CA',
            website: null,
            phone: null,
            specialization: ['Pediatrics', 'Nursing'],
            is_premium: true,
            user_type: 'institution',
            profile_type: 'institution',
            institution_type: 'hospital',
            accreditations: ['JCAHO', 'AAP'],
            departments: ['Pediatrics', 'Nursing'],
            contact_info: {
              address: '4650 Sunset Blvd, Los Angeles, CA 90027',
              phone: '+1-323-660-2450',
              email: 'hr@chla.org',
              website: 'https://chla.org',
            },
          },
        },
      ];
    }
    
    const { data, error } = await getSupabase()
      .from('jobs')
      .select(`
        *,
        company:institutions!jobs_company_id_fkey(*),
        posted_by_user:profiles!jobs_posted_by_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Jobs fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching jobs', error);
    return [];
  }
}

export async function applyToJob(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication | null> {
  try {
    console.log('Applying to job', application);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot apply to job');
      return null;
    }
    
    // First, create the job application
    const { data: jobApplication, error: applicationError } = await getSupabase()
      .from('job_applications')
      .insert({
        ...application,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (applicationError) {
      // Handle duplicate application error
      if (applicationError.code === '23505' && applicationError.message?.includes('job_applications_job_id_applicant_id_key')) {
        console.log('User has already applied to this job');
        throw new Error('You have already applied to this job');
      }
      throw applicationError;
    }
    
    console.log('Job application submitted successfully', jobApplication);

    // Get job details to create notifications
    const { data: job, error: jobError } = await getSupabase()
      .from('jobs')
      .select('*, company:institutions(*)')
      .eq('id', application.job_id)
      .single();

    if (jobError) {
      console.log('Error fetching job details for notification', jobError);
    } else {
      // Create notification for the job poster (institution)
      if (job.posted_by) {
        await createNotification({
          user_id: job.posted_by,
          type: 'job_application',
          title: 'New Job Application',
          message: `A new application has been submitted for the position "${job.title}"`,
          read: false,
          data: {
            jobId: job.id,
            jobTitle: job.title,
            applicantId: application.applicant_id,
            applicationId: jobApplication.id,
            companyName: job.company?.name || 'Unknown Company'
          },
          action_url: `/jobs/${job.id}/applications`
        });
      }

      // Create notification for the applicant (confirmation)
      await createNotification({
        user_id: application.applicant_id,
        type: 'job_application',
        title: 'Application Submitted',
        message: `Your application for "${job.title}" at ${job.company?.name || 'Unknown Company'} has been submitted successfully.`,
        read: false,
        data: {
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.company?.name || 'Unknown Company',
          applicationId: jobApplication.id
        },
        action_url: `/jobs/${job.id}`
      });
    }

    return jobApplication;
  } catch (error) {
    console.log('Error applying to job', error);
    throw error; // Re-throw to handle in the UI
  }
}

// Event functions
export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
  try {
    console.log('Creating event', event);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create event');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('events')
      .insert({
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Event created successfully', data);
    return data;
  } catch (error) {
    console.log('Error creating event', error);
    return null;
  }
}

export async function getEvents(): Promise<EventWithOrganizer[]> {
  try {
    console.log('Getting events');
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty events');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('events')
      .select(`
        *,
        organizer:profiles(*)
      `)
      .order('start_date', { ascending: true });

    if (error) throw error;
    
    console.log('Events fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching events', error);
    return [];
  }
}

export async function registerForEvent(registration: Omit<EventAttendee, 'id' | 'created_at'>): Promise<EventAttendee | null> {
  try {
    console.log('Registering for event', registration);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot register for event');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('event_attendees')
      .insert({
        ...registration,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Event registration successful', data);
    return data;
  } catch (error) {
    console.log('Error registering for event', error);
    return null;
  }
} 

// Follow system functions
export async function followUser(followerId: string, followingId: string, followerType: 'individual' | 'institution', followingType: 'individual' | 'institution'): Promise<Follow | null> {
  try {
    console.log('Following user', { followerId, followingId, followerType, followingType });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot follow user');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        follower_type: followerType,
        following_type: followingType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('User followed successfully', data);
    return data;
  } catch (error) {
    console.log('Error following user', error);
    return null;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log('Unfollowing user', { followerId, followingId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot unfollow user');
      return false;
    }
    
    const { error } = await getSupabase()
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    
    console.log('User unfollowed successfully');
    return true;
  } catch (error) {
    console.log('Error unfollowing user', error);
    return false;
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log('Checking if following', { followerId, followingId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning false for follow status');
      return false;
    }
    
    const { data, error } = await getSupabase()
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    const following = !!data;
    console.log('Follow status checked', following);
    return following;
  } catch (error) {
    console.log('Error checking follow status', error);
    return false;
  }
}

export async function getFollowers(userId: string): Promise<FollowWithProfile[]> {
  try {
    console.log('Getting followers', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty followers');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('follows')
      .select(`
        *,
        follower:profiles(*)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Followers fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching followers', error);
    return [];
  }
}

export async function getFollowing(userId: string): Promise<FollowWithProfile[]> {
  try {
    console.log('Getting following', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty following');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('follows')
      .select(`
        *,
        following:profiles(*)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Following fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching following', error);
    return [];
  }
}

export async function getSuggestedInstitutions(userId: string, limit: number = 10): Promise<Profile[]> {
  try {
    console.log('Getting suggested institutions', { userId, limit });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty suggestions');
      return [];
    }
    
    // Get institutions that the user is not already following
    const { data: following } = await getSupabase()
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    const followingIds = following?.map(f => f.following_id) || [];
    
    let query = getSupabase()
      .from('profiles')
      .select('*')
      .eq('profile_type', 'institution')
      .limit(limit);
    
    if (followingIds.length > 0) {
      query = query.not('id', 'in', `(${followingIds.join(',')})`);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    console.log('Suggested institutions fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching suggested institutions', error);
    return [];
  }
}

// Function to ensure post_comments table exists
export async function ensurePostCommentsTable(): Promise<boolean> {
  try {
    console.log('[Queries] Checking if post_comments table exists');
    
    // Check if post_comments table exists by trying to select from it
    const { error: tableCheckError } = await getSupabase()
      .from('post_comments')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.log('[Queries] Post_comments table does not exist:', tableCheckError);
      return false;
    }
    
    console.log('[Queries] Post_comments table exists');
    return true;
  } catch (error) {
    console.error('[Queries] Error checking post_comments table existence:', error);
    return false;
  }
}

// HIPAA-Compliant Messaging Functions

// Simple messaging system that works with existing database
export async function createDirectConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
  try {
    console.log('Creating direct conversation', { user1Id, user2Id });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create conversation');
      return null;
    }
    
    // Check if conversation already exists
    const { data: existingConversations, error: checkError } = await getSupabase()
      .from('conversations')
      .select('*')
      .eq('conversation_type', 'direct');
    
    if (checkError) {
      console.log('Error checking existing conversations', checkError);
      return null;
    }
    
    // Check if a conversation between these users already exists
    const existingConversation = existingConversations?.find(conv => {
      // This is a simplified check - in a real implementation, you'd check participants
      return conv.title === `${user1Id}-${user2Id}` || conv.title === `${user2Id}-${user1Id}`;
    });
    
    if (existingConversation) {
      console.log('Conversation already exists', existingConversation);
      return existingConversation;
    }
    
    // Create new conversation
    const { data: convData, error: convError } = await getSupabase()
      .from('conversations')
      .insert({
        title: `${user1Id}-${user2Id}`,
        conversation_type: 'direct',
        participants_count: 2,
      })
      .select()
      .single();

    if (convError) {
      console.log('Error creating conversation', convError);
      return null;
    }
    
    // Add participants
    const participantData = [
      {
        conversation_id: convData.id,
        user_id: user1Id,
        user_type: 'individual',
        role: 'participant',
      },
      {
        conversation_id: convData.id,
        user_id: user2Id,
        user_type: 'individual',
        role: 'participant',
      },
    ];
    
    const { error: partError } = await getSupabase()
      .from('conversation_participants')
      .insert(participantData);

    if (partError) {
      console.log('Error adding participants', partError);
      // Delete the conversation if we can't add participants
      await getSupabase().from('conversations').delete().eq('id', convData.id);
      return null;
    }
    
    console.log('Direct conversation created successfully', convData);
    return convData;
  } catch (error) {
    console.log('Error creating direct conversation', error);
    return null;
  }
}

// Get or create conversation between two users
export async function getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
  try {
    console.log('Getting or creating conversation', { user1Id, user2Id });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot get/create conversation');
      return null;
    }
    
    // First try to find existing conversation using a simpler approach
    const { data: conversations, error: fetchError } = await getSupabase()
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(user_id)
      `)
      .eq('conversation_type', 'direct');

    if (fetchError) {
      console.log('Error fetching conversations', fetchError);
      return null;
    }
    
    // Find conversation with both users
    const existingConversation = conversations?.find(conv => {
      const participantIds = conv.participants?.map((p: { user_id: string }) => p.user_id) || [];
      return participantIds.includes(user1Id) && participantIds.includes(user2Id);
    });
    
    if (existingConversation) {
      console.log('Found existing conversation', existingConversation);
      return existingConversation;
    }
    
    // Create new conversation
    return await createDirectConversation(user1Id, user2Id);
  } catch (error) {
    console.log('Error getting or creating conversation', error);
    return null;
  }
}

// Get user's conversations with proper error handling
export async function getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
  try {
    console.log('Getting user conversations', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty conversations');
      return [];
    }
    
    // Use a simpler approach to avoid RLS recursion
    const { data, error } = await getSupabase()
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          user:profiles(*)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.log('Error fetching conversations', error);
      return [];
    }
    
    // Filter conversations where user is a participant
    const userConversations = (data || []).filter(conv => 
      conv.participants?.some((p: any) => p.user_id === userId)
    );
    
    // Add unread count and other metadata
    const conversationsWithMetadata = userConversations.map(conv => ({
      ...conv,
      unread_count: 0, // Simplified for now
    }));
    
    console.log('User conversations fetched successfully', conversationsWithMetadata);
    return conversationsWithMetadata;
  } catch (error) {
    console.log('Error fetching user conversations', error);
    return [];
  }
}

// Create a new conversation
export async function createConversation(conversation: {
  title?: string;
  conversation_type: 'direct' | 'group' | 'clinical';
  participants: string[]; // Array of user IDs
}): Promise<Conversation | null> {
  try {
    console.log('Creating conversation', conversation);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create conversation');
      return null;
    }
    
    // Create conversation
    const { data: convData, error: convError } = await getSupabase()
      .from('conversations')
      .insert({
        title: conversation.title,
        conversation_type: conversation.conversation_type,
        participants_count: conversation.participants.length,
      })
      .select()
      .single();

    if (convError) throw convError;
    
    // Add participants
    const participantData = conversation.participants.map(userId => ({
      conversation_id: convData.id,
      user_id: userId,
    }));
    
    const { error: partError } = await getSupabase()
      .from('conversation_participants')
      .insert(participantData);

    if (partError) throw partError;
    
    console.log('Conversation created successfully', convData);
    return convData;
  } catch (error) {
    console.log('Error creating conversation', error);
    return null;
  }
}

// Send a message
export async function sendMessage(message: {
  conversation_id: string;
  sender_id: string;
  sender_type: 'individual' | 'institution';
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'system' | 'clinical_note';
  encryption_level?: 'standard' | 'hipaa' | 'encrypted';
  retention_policy?: 'standard' | 'clinical' | 'permanent';
}): Promise<Message | null> {
  try {
    console.log('Sending message', message);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot send message');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('messages')
      .insert({
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        sender_type: message.sender_type,
        content: message.content,
        message_type: message.message_type || 'text',
        encryption_level: message.encryption_level || 'standard',
        retention_policy: message.retention_policy || 'standard',
        is_read: false,
        audit_trail: {
          created_by: message.sender_id,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update conversation's updated_at
    await getSupabase()
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', message.conversation_id);
    
    console.log('Message sent successfully', data);
    return data;
  } catch (error) {
    console.log('Error sending message', error);
    return null;
  }
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<MessageWithSender[]> {
  try {
    console.log('Getting conversation messages', { conversationId, limit, offset });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty messages');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    console.log('Conversation messages fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching conversation messages', error);
    return [];
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string, userId: string): Promise<boolean> {
  try {
    console.log('Marking message as read', { messageId, userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot mark message as read');
      return false;
    }
    
    // Update message to mark as read using is_read boolean field
    const { error: updateError } = await getSupabase()
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (updateError) throw updateError;
    
    console.log('Message marked as read successfully');
    return true;
  } catch (error) {
    console.log('Error marking message as read', error);
    return false;
  }
}

// Add reaction to message
export async function addMessageReaction(reaction: {
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'clinical_important';
  emoji: string;
}): Promise<MessageReaction | null> {
  try {
    console.log('Adding message reaction', reaction);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot add reaction');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('message_reactions')
      .insert({
        message_id: reaction.message_id,
        user_id: reaction.user_id,
        reaction_type: reaction.reaction_type,
        emoji: reaction.emoji,
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Message reaction added successfully', data);
    return data;
  } catch (error) {
    console.log('Error adding message reaction', error);
    return null;
  }
}

// Create clinical note
export async function createClinicalNote(note: {
  message_id: string;
  patient_id?: string;
  clinical_context: string;
  diagnosis_codes?: string[];
  treatment_notes?: string;
  medication_notes?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  urgency_level?: 'routine' | 'urgent' | 'emergency';
  confidentiality_level?: 'standard' | 'restricted' | 'highly_confidential';
}): Promise<ClinicalNote | null> {
  try {
    console.log('Creating clinical note', note);
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot create clinical note');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('clinical_notes')
      .insert({
        message_id: note.message_id,
        patient_id: note.patient_id,
        clinical_context: note.clinical_context,
        diagnosis_codes: note.diagnosis_codes || [],
        treatment_notes: note.treatment_notes,
        medication_notes: note.medication_notes,
        follow_up_required: note.follow_up_required || false,
        follow_up_date: note.follow_up_date,
        urgency_level: note.urgency_level || 'routine',
        confidentiality_level: note.confidentiality_level || 'standard',
        audit_trail: {
          created_by: 'system', // Should be actual user ID
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Clinical note created successfully', data);
    return data;
  } catch (error) {
    console.log('Error creating clinical note', error);
    return null;
  }
}

// Get messaging settings
export async function getMessagingSettings(userId: string): Promise<MessagingSettings | null> {
  try {
    console.log('Getting messaging settings', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning default settings');
      return {
        id: 'default',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notifications_enabled: true,
        sound_enabled: true,
        read_receipts_enabled: true,
        typing_indicators_enabled: true,
        auto_archive_days: 30,
        message_retention_days: 365,
        encryption_preference: 'standard',
        clinical_messaging_enabled: false,
        audit_logging_enabled: true,
        hipaa_compliance_enabled: true,
      };
    }
    
    const { data, error } = await getSupabase()
      .from('messaging_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create default settings if none exist
      const defaultSettings = {
        user_id: userId,
        notifications_enabled: true,
        sound_enabled: true,
        read_receipts_enabled: true,
        typing_indicators_enabled: true,
        auto_archive_days: 30,
        message_retention_days: 365,
        encryption_preference: 'standard' as const,
        clinical_messaging_enabled: false,
        audit_logging_enabled: true,
        hipaa_compliance_enabled: true,
      };
      
      const { data: newSettings, error: createError } = await getSupabase()
        .from('messaging_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (createError) throw createError;
      return newSettings;
    }
    
    console.log('Messaging settings fetched successfully', data);
    return data;
  } catch (error) {
    console.log('Error fetching messaging settings', error);
    return null;
  }
}

// Update messaging settings
export async function updateMessagingSettings(userId: string, settings: Partial<MessagingSettings>): Promise<MessagingSettings | null> {
  try {
    console.log('Updating messaging settings', { userId, settings });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot update settings');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('messaging_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Messaging settings updated successfully', data);
    return data;
  } catch (error) {
    console.log('Error updating messaging settings', error);
    return null;
  }
} 

// Update job application status
export async function updateJobApplicationStatus(
  applicationId: string, 
  status: JobApplication['status'], 
  reviewedBy: string,
  notes?: string
): Promise<boolean> {
  try {
    console.log('Updating job application status', { applicationId, status, reviewedBy });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot update job application');
      return false;
    }
    
    // Update the application status
    const { data: application, error: updateError } = await getSupabase()
      .from('job_applications')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select('*, job:jobs(*)')
      .single();

    if (updateError) throw updateError;
    
    console.log('Job application status updated successfully', application);

    // Create notification for the applicant
    if (application) {
      const statusMessages = {
        'pending': 'Your application has been submitted and is pending review',
        'reviewed': 'Your application is being reviewed',
        'interview': 'You have been selected for an interview!',
        'accepted': 'Congratulations! Your application has been accepted!',
        'rejected': 'Your application was not selected for this position'
      };

      const message = statusMessages[status] || `Your application status has been updated to ${status}`;
      
      await createNotification({
        user_id: application.applicant_id,
        type: 'job_application',
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `${message} for "${application.job?.title}"`,
        read: false,
        data: {
          jobId: application.job_id,
          jobTitle: application.job?.title,
          applicationId: application.id,
          status,
          reviewedBy
        },
        action_url: `/jobs/${application.job_id}`
      });
    }

    return true;
  } catch (error) {
    console.log('Error updating job application status', error);
    return false;
  }
}

// Get job applications for a specific job (for institutions)
export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  try {
    console.log('Getting job applications', { jobId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty applications');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('job_applications')
      .select('*, applicant:profiles!job_applications_applicant_id_fkey(*)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    console.log('Job applications fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching job applications', error);
    return [];
  }
}

// Get applications submitted by a user
export async function getUserApplications(userId: string): Promise<(JobApplication & { job?: { id: string; title: string; company?: { name: string } } })[]> {
  try {
    console.log('Getting user applications', { userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty applications');
      return [];
    }
    
    const { data, error } = await getSupabase()
      .from('job_applications')
      .select('*, job:jobs(id, title, company:institutions(name))')
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching applications, returning mock data:', error);
      // Return mock data for testing
      return [
        {
          id: 'mock-app-1',
          job_id: '1',
          applicant_id: userId,
          status: 'pending',
          cover_letter: 'I am very interested in this position and believe my skills would be a great fit.',
          resume_url: null,
          reviewed_by: null,
          reviewed_at: null,
          notes: null,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          job: {
            id: '1',
            title: 'Cardiologist',
            company: {
              name: 'Mount Sinai Hospital'
            }
          }
        },
        {
          id: 'mock-app-2',
          job_id: '2',
          applicant_id: userId,
          status: 'reviewed',
          cover_letter: 'I have extensive experience in pediatric care and would love to join your team.',
          resume_url: null,
          reviewed_by: 'mock-reviewer',
          reviewed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Strong candidate with relevant experience',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          job: {
            id: '2',
            title: 'Pediatric Nurse Practitioner',
            company: {
              name: 'Children\'s Hospital Los Angeles'
            }
          }
        }
      ];
    }
    
    console.log('User applications fetched successfully', data);
    return data || [];
  } catch (error) {
    console.log('Error fetching user applications', error);
    return [];
  }
}

// Check if user has applied to a specific job
export async function hasAppliedToJob(userId: string, jobId: string): Promise<boolean> {
  try {
    console.log('Checking if user has applied to job', { userId, jobId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning false for application status');
      return false;
    }
    
    const { data, error } = await getSupabase()
      .from('job_applications')
      .select('id')
      .eq('applicant_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      console.log('Error checking application status', error);
      return false;
    }
    
    console.log('Application status checked', data);
    return !!data; // Return true if application exists, false otherwise
  } catch (error) {
    console.log('Error checking application status', error);
    return false;
  }
}

// Extract hashtags from text content
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

// Get trending topics based on hashtags in posts
export async function getTrendingTopics(limit: number = 5): Promise<Array<{ hashtag: string; count: number }>> {
  try {
    console.log('Getting trending topics');
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, returning empty trending topics');
      return [];
    }
    
    // Get all posts with content
    const { data: posts, error } = await getSupabase()
      .from('posts')
      .select('content')
      .not('content', 'is', null);
    
    if (error) {
      console.log('Error fetching posts for trending topics', error);
      return [];
    }
    
    if (!posts || posts.length === 0) {
      console.log('No posts found for trending topics');
      return [];
    }
    
    // Extract hashtags from all posts
    const hashtagCounts: Record<string, number> = {};
    
    posts.forEach(post => {
      if (post.content) {
        const hashtags = extractHashtags(post.content);
        hashtags.forEach(hashtag => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
      }
    });
    
    // Convert to array and sort by count
    const trendingTopics = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    console.log('Trending topics calculated', { count: trendingTopics.length, topics: trendingTopics });
    return trendingTopics;
    
  } catch (error) {
    console.log('Error getting trending topics', error);
    return [];
  }
}



export async function searchUsers(query: string): Promise<Array<{
  id: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
  user_type: 'individual' | 'institution';
}>> {
  try {
    console.log('[Queries] Searching users with query:', query);
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('id, full_name, headline, avatar_url, user_type')
      .or(`full_name.ilike.%${query}%,headline.ilike.%${query}%`)
      .not('full_name', 'is', null)
      .limit(10);

    if (error) {
      console.error('[Queries] Error searching users:', error);
      return [];
    }

    console.log('[Queries] Search results:', data?.length || 0, 'users found');
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in searchUsers:', error);
    return [];
  }
}

// Calculate mutual connections between two users
export async function getMutualConnections(userId1: string, userId2: string): Promise<number> {
  try {
    console.log('[Queries] Getting mutual connections between:', userId1, userId2);
    
    // Get connections for both users
    const [user1Connections, user2Connections] = await Promise.all([
      getConnections(userId1),
      getConnections(userId2)
    ]);
    
    // Get IDs of connected users for both users
    const user1ConnectedIds = new Set(user1Connections.map(conn => conn.id));
    const user2ConnectedIds = new Set(user2Connections.map(conn => conn.id));
    
    // Find intersection (mutual connections)
    const mutualConnections = [...user1ConnectedIds].filter(id => user2ConnectedIds.has(id));
    
    console.log('[Queries] Mutual connections found:', mutualConnections.length);
    return mutualConnections.length;
  } catch (error) {
    console.error('[Queries] Error calculating mutual connections:', error);
    return 0;
  }
}

// Get connection count for a user
export async function getConnectionCount(userId: string): Promise<number> {
  try {
    console.log('[Queries] Getting connection count for user:', userId);
    
    const connections = await getConnections(userId);
    const count = connections.length;
    
    console.log('[Queries] Connection count:', count);
    return count;
  } catch (error) {
    console.error('[Queries] Error getting connection count:', error);
    return 0;
  }
}

// Profile views count functionality removed

// Get suggested connections with mutual connection counts
export async function getSuggestedConnectionsWithMutualCounts(userId: string, limit = 10): Promise<Array<Profile & { mutual_connections: number }>> {
  try {
    console.log('[Queries] Getting suggested connections with mutual counts for user:', userId);
    
    const suggestions = await getSuggestedConnections(userId, limit);
    
    // Calculate mutual connections for each suggestion
    const suggestionsWithMutualCounts = await Promise.all(
      suggestions.map(async (profile) => {
        const mutualCount = await getMutualConnections(userId, profile.id);
        return {
          ...profile,
          mutual_connections: mutualCount
        };
      })
    );
    
    console.log('[Queries] Suggested connections with mutual counts fetched:', suggestionsWithMutualCounts.length);
    return suggestionsWithMutualCounts;
  } catch (error) {
    console.error('[Queries] Error getting suggested connections with mutual counts:', error);
    return [];
  }
} 

// Profile views functionality completely removed

export async function getConnectionStats(userId: string) {
  try {
    console.log('[Queries] Getting connection stats for user:', userId);
    
    // Get accepted connections
    const { data: connections, error } = await getSupabase()
      .from('connections')
      .select('id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (error) throw error;
    
    return {
      connections: connections?.length || 0,
    };
  } catch (error) {
    console.error('[Queries] Error getting connection stats:', error);
    return { connections: 0 };
  }
}

export async function getPostStats(userId: string) {
  try {
    console.log('[Queries] Getting post stats for user:', userId);
    
    // Get posts count
    const { data: posts, error: postsError } = await getSupabase()
      .from('posts')
      .select('id')
      .eq('author_id', userId);
    
    if (postsError) throw postsError;
    
    // Get comments count
    const { data: comments, error: commentsError } = await getSupabase()
      .from('post_comments')
      .select('id')
      .eq('author_id', userId);
    
    if (commentsError) throw commentsError;
    
    // Get likes count (posts liked by user)
    const { data: likes, error: likesError } = await getSupabase()
      .from('post_likes')
      .select('id')
      .eq('user_id', userId);
    
    if (likesError) throw likesError;
    
    return {
      posts: posts?.length || 0,
      comments: comments?.length || 0,
      likes: likes?.length || 0,
    };
  } catch (error) {
    console.error('[Queries] Error getting post stats:', error);
    return { posts: 0, comments: 0, likes: 0 };
  }
}

// Get saved posts for a user
export async function getSavedPosts(userId: string): Promise<Post[]> {
  try {
    console.log('[Queries] Getting saved posts for user:', userId);
    
    // First, get the saved post IDs
    const { data: savedPostIds, error: savedError } = await getSupabase()
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (savedError) throw savedError;
    
    if (!savedPostIds || savedPostIds.length === 0) {
      console.log('[Queries] No saved posts found');
      return [];
    }
    
    // Extract post IDs
    const postIds = savedPostIds.map(item => item.post_id);
    
    // Get the actual posts with author profiles
    const { data: posts, error: postsError } = await getSupabase()
      .from('posts')
      .select(`
        id,
        content,
        image_url,
        author_id,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          headline,
          avatar_url,
          user_type
        )
      `)
      .in('id', postIds)
      .order('created_at', { ascending: false });
    
    if (postsError) throw postsError;
    
    console.log('[Queries] Saved posts fetched:', posts?.length || 0);
    return posts as any || [];
  } catch (error) {
    console.error('[Queries] Error getting saved posts:', error);
    return [];
  }
}

// Add reaction to post (supports all reaction types)
export async function addPostReaction(postId: string, userId: string, reactionType: string): Promise<boolean> {
  try {
    console.log('Adding post reaction', { postId, userId, reactionType });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot add reaction');
      return false;
    }
    
    // First check if user already has a reaction on this post
    const { data: existingReaction, error: checkError } = await getSupabase()
      .from('post_likes')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.log('Error checking existing reaction', checkError);
      return false;
    }

    if (existingReaction) {
      // Update existing reaction
      const { error: updateError } = await getSupabase()
        .from('post_likes')
        .update({ 
          reaction_type: reactionType,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id);

      if (updateError) {
        console.log('Error updating reaction', updateError);
        return false;
      }
    } else {
      // Create new reaction
      const { error: insertError } = await getSupabase()
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType,
        });

      if (insertError) {
        console.log('Error inserting reaction', insertError);
        return false;
      }
    }
    
    console.log('Post reaction added successfully');
    return true;
  } catch (error) {
    console.log('Error adding post reaction', error);
    return false;
  }
}

// Remove reaction from post
export async function removePostReaction(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('Removing post reaction', { postId, userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot remove reaction');
      return false;
    }
    
    const { error } = await getSupabase()
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      console.log('Error removing reaction', error);
      return false;
    }
    
    console.log('Post reaction removed successfully');
    return true;
  } catch (error) {
    console.log('Error removing post reaction', error);
    return false;
  }
}

// Get user's reaction on a post
export async function getUserPostReaction(postId: string, userId: string): Promise<string | null> {
  try {
    console.log('Getting user post reaction', { postId, userId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot get reaction');
      return null;
    }
    
    const { data, error } = await getSupabase()
      .from('post_likes')
      .select('reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.log('Error getting user reaction', error);
      return null;
    }
    
    console.log('User reaction fetched successfully', data?.reaction_type);
    return data?.reaction_type || null;
  } catch (error) {
    console.log('Error getting user post reaction', error);
    return null;
  }
}

// Get reaction counts for a post
export async function getPostReactionCounts(postId: string): Promise<Record<string, number>> {
  try {
    console.log('Getting post reaction counts', { postId });
    
    const schemaExists = await true;
    if (!schemaExists) {
      console.log('Database schema not found, cannot get reaction counts');
      return {};
    }
    
    const { data, error } = await getSupabase()
      .from('post_likes')
      .select('reaction_type')
      .eq('post_id', postId);

    if (error) {
      console.log('Error getting reaction counts', error);
      return {};
    }
    
    // Count reactions by type
    const counts: Record<string, number> = {};
    data?.forEach(reaction => {
      const type = reaction.reaction_type || 'like';
      counts[type] = (counts[type] || 0) + 1;
    });
    
    console.log('Reaction counts fetched successfully', counts);
    return counts;
  } catch (error) {
    console.log('Error getting post reaction counts', error);
    return {};
  }
}