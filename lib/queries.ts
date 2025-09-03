import { supabase } from './supabase';
import toast from 'react-hot-toast';
import type { Profile, Post, PostComment,
  PostWithAuthor, CommentWithAuthor, Connection, Institution, Job, JobApplication, JobWithCompany,
  Event, EventAttendee, EventWithOrganizer, Experience, Education, Notification,
  ConnectionWithProfile, Follow, FollowWithProfile } from '@/types/database.types';

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
  FollowWithProfile
};

// No caching - direct database calls only

// Profile queries - No caching
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const { data, error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
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
        image_url: mediaUrl || null,
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

// Create new experience
export async function createExperience(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience> {
  try {
    const { data, error } = await getSupabase()
      .from('experiences')
      .insert([experience])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating experience:', error);
    throw error;
  }
}

// Update existing experience
export async function updateExperience(experienceId: string, updates: Partial<Experience>): Promise<Experience> {
  try {
    const { data, error } = await getSupabase()
      .from('experiences')
      .update(updates)
      .eq('id', experienceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating experience:', error);
    throw error;
  }
}

// Create new education
export async function createEducation(education: Omit<Education, 'id' | 'created_at' | 'updated_at'>): Promise<Education> {
  try {
    const { data, error } = await getSupabase()
      .from('education')
      .insert([education])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating education:', error);
    throw error;
  }
}

// Update existing education
export async function updateEducation(educationId: string, updates: Partial<Education>): Promise<Education> {
  try {
    const { data, error } = await getSupabase()
      .from('education')
      .update(updates)
      .eq('id', educationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating education:', error);
    throw error;
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
export async function likePost(postId: string, userId: string, reactionType: string = 'like'): Promise<boolean> {
  try {
    console.log('[Queries] Adding reaction to post:', postId, 'by user:', userId, 'reaction:', reactionType);
    
    // Check if already reacted
    const { data: existingReaction } = await getSupabase()
      .from('post_likes')
      .select('id, reaction_type')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existingReaction) {
      console.log('[Queries] User already reacted to this post');
      return false; // Prevent multiple reactions
    }
    
    // Add new reaction record
    const { error: reactionError } = await getSupabase()
      .from('post_likes')
      .insert({
        user_id: userId,
        post_id: postId,
        reaction_type: reactionType,
      });

    if (reactionError) {
      console.error('[Queries] Error adding reaction:', reactionError);
      throw reactionError;
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

    console.log('[Queries] Reaction added successfully');
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

export async function isPostLiked(userId: string, postId: string): Promise<string | null> {
  try {
    console.log('[Queries] Checking if post is reacted by user:', userId, 'post:', postId);
    
    const { data, error } = await getSupabase()
      .from('post_likes')
      .select('reaction_type')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .limit(1);

    if (error) {
      console.error('[Queries] Error checking reaction status:', error);
      return null;
    }
    
    const reactionType = data && data.length > 0 ? data[0].reaction_type : null;
    console.log('[Queries] Post reaction status checked:', reactionType);
    return reactionType;
  } catch (error) {
    console.error('[Queries] Error in isPostLiked:', error);
    return null;
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
            country: 'United States',
            website: null,
            phone: null,
            specialization: ['Cardiology'],
            is_premium: true,
            user_type: 'institution',
            profile_type: 'institution',
            institution_type: 'hospital',
            accreditations: ['JCAHO', 'AHA'],
            departments: ['Cardiology', 'Emergency Medicine'],
            onboarding_completed: true,
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
            country: 'United States',
            website: null,
            phone: null,
            specialization: ['Pediatrics', 'Nursing'],
            is_premium: true,
            user_type: 'institution',
            profile_type: 'institution',
            institution_type: 'hospital',
            accreditations: ['JCAHO', 'AAP'],
            departments: ['Pediatrics', 'Nursing'],
            onboarding_completed: true,
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







export async function searchUsers(query: string): Promise<Array<{
  id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  user_type: 'individual' | 'institution';
}>> {
  try {
    console.log('[Queries] Searching users with query:', query);
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('id, full_name, headline, bio, location, avatar_url, user_type')
      .or(`full_name.ilike.%${query}%,headline.ilike.%${query}%,bio.ilike.%${query}%`)
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

// Search jobs
export async function searchJobs(query: string): Promise<Array<{
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  created_at: string;
}>> {
  try {
    console.log('[Queries] Searching jobs with query:', query);
    
    const { data, error } = await getSupabase()
      .from('jobs')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,company.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[Queries] Error searching jobs:', error);
      return [];
    }

    console.log('[Queries] Search results:', data?.length || 0, 'jobs found');
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in searchJobs:', error);
    return [];
  }
}

// Search events
export async function searchEvents(query: string): Promise<Array<{
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  organizer_id: string;
  organizer_name: string;
  attendees_count: number;
  created_at: string;
}>> {
  try {
    console.log('[Queries] Searching events with query:', query);
    
    const { data, error } = await getSupabase()
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(full_name)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
      .order('date', { ascending: true })
      .limit(20);

    if (error) {
      console.error('[Queries] Error searching events:', error);
      return [];
    }

    // Transform the data to include organizer name
    const transformedData = data?.map(event => ({
      ...event,
      organizer_name: event.organizer?.full_name || 'Unknown Organizer'
    })) || [];

    console.log('[Queries] Search results:', transformedData.length, 'events found');
    return transformedData;
  } catch (error) {
    console.error('[Queries] Error in searchEvents:', error);
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
    
    if (savedError) {
      console.error('[Queries] Error fetching saved post IDs:', savedError);
      // If the table doesn't exist, return empty array instead of throwing
      if (savedError.code === '42P01') { // Table doesn't exist
        console.log('[Queries] saved_posts table does not exist yet');
        return [];
      }
      // Log other errors but don't throw
      console.error('[Queries] Saved posts error details:', {
        code: savedError.code,
        message: savedError.message,
        details: savedError.details,
        hint: savedError.hint
      });
      return [];
    }
    
    if (!savedPostIds || savedPostIds.length === 0) {
      console.log('[Queries] No saved posts found');
      return [];
    }
    
    console.log('[Queries] Found saved post IDs:', savedPostIds.length);
    
    // Extract post IDs
    const postIds = savedPostIds.map(item => item.post_id);
    console.log('[Queries] Post IDs to fetch:', postIds);
    
    // Get the actual posts without joins first
    const { data: posts, error: postsError } = await getSupabase()
      .from('posts')
      .select('*')
      .in('id', postIds)
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('[Queries] Error fetching posts:', postsError);
      console.error('[Queries] Posts error details:', {
        code: postsError.code,
        message: postsError.message,
        details: postsError.details,
        hint: postsError.hint
      });
      return [];
    }
    
    if (!posts || posts.length === 0) {
      console.log('[Queries] No posts found for saved post IDs');
      return [];
    }
    
    console.log('[Queries] Found posts:', posts.length);
    
    // Get author IDs for the posts
    const authorIds = [...new Set(posts.map(post => post.author_id))];
    console.log('[Queries] Author IDs to fetch:', authorIds);
    
    // Fetch authors separately
    const { data: authors, error: authorsError } = await getSupabase()
      .from('profiles')
      .select('id, full_name, avatar_url, headline, user_type')
      .in('id', authorIds);
    
    if (authorsError) {
      console.error('[Queries] Error fetching authors:', authorsError);
      console.error('[Queries] Authors error details:', {
        code: authorsError.code,
        message: authorsError.message,
        details: authorsError.details,
        hint: authorsError.hint
      });
    }
    
    console.log('[Queries] Found authors:', authors?.length || 0);
    
    // Create author lookup map
    const authorMap = new Map(authors?.map(author => [author.id, author]) || []);
    
    // Combine posts with author data
    const postsWithAuthors = posts.map(post => ({
      ...post,
      profiles: authorMap.get(post.author_id) || null
    }));
    
    console.log('[Queries] Saved posts fetched successfully:', postsWithAuthors.length);
    return postsWithAuthors;
  } catch (error) {
    console.error('[Queries] Error getting saved posts:', error);
    console.error('[Queries] Full error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

// Save a post for a user
export async function savePost(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Saving post:', postId, 'for user:', userId);
    
    const { error } = await getSupabase()
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) {
      console.error('[Queries] Error saving post:', error);
      // If the table doesn't exist, return false instead of throwing
      if (error.code === '42P01') { // Table doesn't exist
        console.log('[Queries] saved_posts table does not exist yet');
        return false;
      }
      return false;
    }
    
    console.log('[Queries] Post saved successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in savePost:', error);
    return false;
  }
}

// Unsave a post for a user
export async function unsavePost(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Unsaving post:', postId, 'for user:', userId);
    
    const { error } = await getSupabase()
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('[Queries] Error unsaving post:', error);
      // If the table doesn't exist, return false instead of throwing
      if (error.code === '42P01') { // Table doesn't exist
        console.log('[Queries] saved_posts table does not exist yet');
        return false;
      }
      return false;
    }
    
    console.log('[Queries] Post unsaved successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in unsavePost:', error);
    return false;
  }
}

// Check if a post is saved by a user
export async function isPostSaved(postId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Checking if post is saved:', postId, 'by user:', userId);
    
    const { data, error } = await getSupabase()
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .limit(1);

    if (error) {
      console.error('[Queries] Error checking saved status:', error);
      // If the table doesn't exist, return false instead of throwing
      if (error.code === '42P01') { // Table doesn't exist
        console.log('[Queries] saved_posts table does not exist yet');
        return false;
      }
      return false;
    }
    
    const isSaved = data && data.length > 0;
    console.log('[Queries] Post saved status checked:', isSaved);
    return isSaved;
  } catch (error) {
    console.error('[Queries] Error in isPostSaved:', error);
    return false;
  }
}

// Event functions
export async function getEvents(): Promise<Event[]> {
  try {
    console.log('[Queries] Getting events');
    
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Queries] Error fetching events:', error);
      console.error('[Queries] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }
    
    console.log('[Queries] Events fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in getEvents:', error);
    return [];
  }
}

export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
  try {
    console.log('[Queries] Getting events by organizer:', organizerId);
    
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('[Queries] Error fetching events by organizer:', error);
      console.error('[Queries] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }
    
    console.log('[Queries] Events by organizer fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in getEventsByOrganizer:', error);
    return [];
  }
}

// Helper function to get organizer profile for an event
export async function getEventOrganizer(organizerId: string): Promise<any> {
  try {
    console.log('[Queries] Getting organizer profile for:', organizerId);
    
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('id, full_name, avatar_url, user_type, headline')
      .eq('id', organizerId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors

    if (error) {
      console.error('[Queries] Error fetching organizer profile:', error);
      return null;
    }

    if (!data) {
      console.log('[Queries] Organizer profile not found, returning default');
      return {
        id: organizerId,
        full_name: 'Unknown Organizer',
        avatar_url: null,
        user_type: 'individual',
        headline: 'Healthcare Professional'
      };
    }

    console.log('[Queries] Organizer profile fetched successfully');
    return data;
  } catch (error) {
    console.error('[Queries] Error in getEventOrganizer:', error);
    return {
      id: organizerId,
      full_name: 'Unknown Organizer',
      avatar_url: null,
      user_type: 'individual',
      headline: 'Healthcare Professional'
    };
  }
}

export async function createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attendees_count'>): Promise<Event | null> {
  try {
    console.log('[Queries] Creating event:', eventData.title);
    
    const { data, error } = await getSupabase()
      .from('events')
      .insert({
        ...eventData,
        attendees_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[Queries] Error creating event:', error);
      throw error;
    }
    
    console.log('[Queries] Event created successfully');
    return data as Event;
  } catch (error) {
    console.error('[Queries] Error in createEvent:', error);
    throw error;
  }
}

export async function registerForEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Registering for event:', eventId, 'by user:', userId);
    
    // Check if already registered
    const { data: existingRegistration } = await getSupabase()
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('attendee_id', userId)
      .single();

    if (existingRegistration) {
      console.log('[Queries] User already registered for event');
      return false;
    }
    
    // Add registration
    const { error: registrationError } = await getSupabase()
      .from('event_attendees')
      .insert({
        event_id: eventId,
        attendee_id: userId,
        attendee_type: 'individual',
        status: 'registered',
        registration_date: new Date().toISOString(),
      });

    if (registrationError) {
      console.error('[Queries] Error registering for event:', registrationError);
      throw registrationError;
    }

    // Update event attendees count
    const { data: event } = await getSupabase()
      .from('events')
      .select('attendees_count')
      .eq('id', eventId)
      .single();

    if (event) {
      const { error: updateError } = await getSupabase()
        .from('events')
        .update({ attendees_count: (event.attendees_count || 0) + 1 })
        .eq('id', eventId);

      if (updateError) {
        console.error('[Queries] Error updating attendees count:', updateError);
      }
    }

    console.log('[Queries] Event registration successful');
    return true;
  } catch (error) {
    console.error('[Queries] Error in registerForEvent:', error);
    return false;
  }
}

export async function unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Unregistering from event:', eventId, 'by user:', userId);
    
    // Remove registration
    const { error: unregisterError } = await getSupabase()
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('attendee_id', userId);

    if (unregisterError) {
      console.error('[Queries] Error unregistering from event:', unregisterError);
      throw unregisterError;
    }

    // Update event attendees count
    const { data: event } = await getSupabase()
      .from('events')
      .select('attendees_count')
      .eq('id', eventId)
      .single();

    if (event) {
      const { error: updateError } = await getSupabase()
        .from('events')
        .update({ attendees_count: Math.max(0, (event.attendees_count || 0) - 1) })
        .eq('id', eventId);

      if (updateError) {
        console.error('[Queries] Error updating attendees count:', updateError);
      }
    }

    console.log('[Queries] Event unregistration successful');
    return true;
  } catch (error) {
    console.error('[Queries] Error in unregisterFromEvent:', error);
    return false;
  }
}

export async function isRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Checking if user is registered for event:', eventId, 'user:', userId);
    
    const { data, error } = await getSupabase()
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('attendee_id', userId)
      .limit(1);

    if (error) {
      console.error('[Queries] Error checking event registration:', error);
      return false;
    }
    
    const isRegistered = data && data.length > 0;
    console.log('[Queries] Event registration status checked:', isRegistered);
    return isRegistered;
  } catch (error) {
    console.error('[Queries] Error in isRegisteredForEvent:', error);
    return false;
  }
}

export async function getUserRegisteredEvents(userId: string): Promise<Event[]> {
  try {
    console.log('[Queries] Getting user registered events:', userId);
    
    const { data, error } = await getSupabase()
      .from('event_attendees')
      .select('event_id')
      .eq('attendee_id', userId)
      .eq('status', 'registered')
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('[Queries] Error fetching user registered events:', error);
      console.error('[Queries] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('[Queries] No registered events found for user');
      return [];
    }

    // Get the event IDs
    const eventIds = data.map(item => item.event_id);
    
    // Fetch the actual events
    const { data: events, error: eventsError } = await getSupabase()
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('start_date', { ascending: true });

    if (eventsError) {
      console.error('[Queries] Error fetching events for registered events:', eventsError);
      return [];
    }
    
    console.log('[Queries] User registered events fetched:', events?.length || 0);
    return events || [];
  } catch (error) {
    console.error('[Queries] Error in getUserRegisteredEvents:', error);
    return [];
  }
}

// Test function to create sample events
export async function createSampleEvents(userId: string): Promise<void> {
  try {
    console.log('[Queries] Creating sample events for user:', userId);
    
    const sampleEvents = [
      {
        title: 'Healthcare Innovation Summit 2024',
        description: 'Join us for a comprehensive discussion on the latest innovations in healthcare technology and patient care.',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
        location: 'San Francisco, CA',
        venue: 'Moscone Center',
        event_type: 'conference' as const,
        specializations: ['technology', 'innovation'],
        organizer_id: userId,
        organizer_type: 'individual' as const,
        max_attendees: 500,
        registration_fee: 299,
        currency: 'USD',
        status: 'upcoming' as const,
        is_virtual: false,
        meeting_link: null,
        banner_url: null,
        attendees_count: 0
      },
      {
        title: 'Medical AI Workshop',
        description: 'Hands-on workshop on implementing AI solutions in medical practice.',
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 6 hours later
        location: null,
        venue: null,
        event_type: 'workshop' as const,
        specializations: ['AI', 'technology'],
        organizer_id: userId,
        organizer_type: 'individual' as const,
        max_attendees: 50,
        registration_fee: 149,
        currency: 'USD',
        status: 'upcoming' as const,
        is_virtual: true,
        meeting_link: 'https://zoom.us/j/123456789',
        banner_url: null,
        attendees_count: 0
      },
      {
        title: 'Healthcare Networking Mixer',
        description: 'Connect with fellow healthcare professionals in a relaxed networking environment.',
        start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
        location: 'New York, NY',
        venue: 'The Grand Hyatt',
        event_type: 'networking' as const,
        specializations: ['networking', 'professional development'],
        organizer_id: userId,
        organizer_type: 'individual' as const,
        max_attendees: 200,
        registration_fee: 0,
        currency: null,
        status: 'upcoming' as const,
        is_virtual: false,
        meeting_link: null,
        banner_url: null,
        attendees_count: 0
      }
    ];

    for (const eventData of sampleEvents) {
      const { error } = await getSupabase()
        .from('events')
        .insert(eventData);

      if (error) {
        console.error('[Queries] Error creating sample event:', error);
      } else {
        console.log('[Queries] Sample event created successfully:', eventData.title);
      }
    }

    console.log('[Queries] Sample events creation completed');
  } catch (error) {
    console.error('[Queries] Error creating sample events:', error);
  }
}

// Get event by ID
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    console.log('[Queries] Getting event by ID:', eventId);
    
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('[Queries] Error fetching event by ID:', error);
      return null;
    }
    
    console.log('[Queries] Event fetched successfully');
    return data;
  } catch (error) {
    console.error('[Queries] Error in getEventById:', error);
    return null;
  }
}

// Get event registrations for organizers
export async function getEventRegistrations(eventId: string): Promise<any[]> {
  try {
    console.log('[Queries] Getting event registrations:', eventId);
    
    // First, get the registration records
    const { data: registrations, error: registrationsError } = await getSupabase()
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .order('registration_date', { ascending: false });

    if (registrationsError) {
      console.error('[Queries] Error fetching event registrations:', registrationsError);
      return [];
    }

    if (!registrations || registrations.length === 0) {
      console.log('[Queries] No registrations found for event');
      return [];
    }

    // Get attendee IDs
    const attendeeIds = registrations.map(reg => reg.attendee_id);

    // Fetch attendee profiles separately
    const { data: attendees, error: attendeesError } = await getSupabase()
      .from('profiles')
      .select('id, full_name, avatar_url, user_type, headline')
      .in('id', attendeeIds);

    if (attendeesError) {
      console.error('[Queries] Error fetching attendee profiles:', attendeesError);
      return [];
    }

    // Create a map of attendee profiles
    const attendeeMap = new Map();
    if (attendees) {
      attendees.forEach(attendee => {
        attendeeMap.set(attendee.id, attendee);
      });
    }

    // Combine registration data with attendee profiles
    const registrationsWithProfiles = registrations.map(registration => ({
      ...registration,
      attendee: attendeeMap.get(registration.attendee_id) || {
        id: registration.attendee_id,
        full_name: 'Unknown User',
        avatar_url: null,
        user_type: 'individual',
        headline: 'Healthcare Professional'
      }
    }));

    console.log('[Queries] Event registrations fetched successfully:', registrationsWithProfiles.length);
    return registrationsWithProfiles;
  } catch (error) {
    console.error('[Queries] Error in getEventRegistrations:', error);
    return [];
  }
}

// Get user's groups count
export async function getUserGroupsCount(userId: string): Promise<number> {
  try {
    console.log('[Queries] Getting user groups count:', userId);
    
    // For now, return 0 as groups table doesn't exist yet
    // This can be updated when groups functionality is implemented
    return 0;
  } catch (error) {
    console.error('[Queries] Error getting user groups count:', error);
    return 0;
  }
}

// Get user's pages count
export async function getUserPagesCount(userId: string): Promise<number> {
  try {
    console.log('[Queries] Getting user pages count:', userId);
    
    // For now, return 0 as pages table doesn't exist yet
    // This can be updated when pages functionality is implemented
    return 0;
  } catch (error) {
    console.error('[Queries] Error getting user pages count:', error);
    return 0;
  }
}

// Get user's newsletters count
export async function getUserNewslettersCount(userId: string): Promise<number> {
  try {
    console.log('[Queries] Getting user newsletters count:', userId);
    
    // For now, return 0 as newsletters table doesn't exist yet
    // This can be updated when newsletters functionality is implemented
    return 0;
  } catch (error) {
    console.error('[Queries] Error getting user newsletters count:', error);
    return 0;
  }
}

// Get user's events count
export async function getUserEventsCount(userId: string): Promise<number> {
  try {
    console.log('[Queries] Getting user events count:', userId);
    
    const { data, error } = await getSupabase()
      .from('events')
      .select('id')
      .eq('organizer_id', userId);

    if (error) {
      console.error('[Queries] Error getting user events count:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('[Queries] Error getting user events count:', error);
    return 0;
  }
}

// Create test registrations for an event
export async function createTestRegistrations(eventId: string): Promise<void> {
  try {
    console.log('[Queries] Creating test registrations for event:', eventId);

    // Get some existing users to register for the event
    const { data: users } = await getSupabase()
      .from('profiles')
      .select('id')
      .limit(3);

    if (!users || users.length === 0) {
      console.log('[Queries] No users found to create test registrations');
      return;
    }

    const testRegistrations = users.map(user => ({
      event_id: eventId,
      attendee_id: user.id,
      attendee_type: 'individual',
      status: 'registered',
      registration_date: new Date().toISOString()
    }));

    for (const registration of testRegistrations) {
      const { error } = await getSupabase()
        .from('event_attendees')
        .insert(registration);

      if (error) {
        console.error('[Queries] Error creating test registration:', error);
      } else {
        console.log('[Queries] Test registration created successfully for user:', registration.attendee_id);
      }
    }

    console.log('[Queries] Test registrations creation completed');
  } catch (error) {
    console.error('[Queries] Error creating test registrations:', error);
  }
}

// Comment reaction functions
export async function likeComment(commentId: string, userId: string, reactionType: string = 'like'): Promise<boolean> {
  try {
    console.log('[Queries] Adding reaction to comment:', commentId, 'by user:', userId, 'reaction:', reactionType);
    
    // Check if already reacted
    const { data: existingReaction, error: checkError } = await getSupabase()
      .from('comment_likes')
      .select('id, reaction_type')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .single();

    // Handle case where table doesn't exist yet
    if (checkError && checkError.code === '42P01') {
      console.log('[Queries] Comment likes table does not exist yet');
      return false;
    }

    if (existingReaction) {
      console.log('[Queries] User already reacted to comment, updating reaction');
      
      // Update existing reaction
      const { error: updateError } = await getSupabase()
        .from('comment_likes')
        .update({ 
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        })
        .eq('id', existingReaction.id);

      if (updateError) {
        console.error('[Queries] Error updating comment reaction:', updateError);
        return false;
      }
    } else {
      console.log('[Queries] Creating new comment reaction');
      
      // Create new reaction
      const { error: insertError } = await getSupabase()
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reaction_type: reactionType
        });

      if (insertError) {
        console.error('[Queries] Error creating comment reaction:', insertError);
        return false;
      }
    }

    console.log('[Queries] Comment reaction added successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in likeComment:', error);
    return false;
  }
}

export async function unlikeComment(commentId: string, userId: string): Promise<boolean> {
  try {
    console.log('[Queries] Removing reaction from comment:', commentId, 'by user:', userId);
    
    // Delete the reaction
    const { error: deleteError } = await getSupabase()
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (deleteError) {
      // Handle case where table doesn't exist yet
      if (deleteError.code === '42P01') {
        console.log('[Queries] Comment likes table does not exist yet');
        return false;
      }
      console.error('[Queries] Error removing comment reaction:', deleteError);
      return false;
    }

    console.log('[Queries] Comment reaction removed successfully');
    return true;
  } catch (error) {
    console.error('[Queries] Error in unlikeComment:', error);
    return false;
  }
}

export async function isCommentLiked(commentId: string, userId: string): Promise<string | null> {
  try {
    console.log('[Queries] Checking if comment is liked by user:', commentId, userId);
    
    const { data, error } = await getSupabase()
      .from('comment_likes')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[Queries] User has not reacted to comment');
        return null;
      }
      // Handle case where table doesn't exist yet
      if (error.code === '42P01') {
        console.log('[Queries] Comment likes table does not exist yet');
        return null;
      }
      console.error('[Queries] Error checking comment reaction:', error);
      return null;
    }

    console.log('[Queries] User reaction found:', data.reaction_type);
    return data.reaction_type;
  } catch (error) {
    console.error('[Queries] Error in isCommentLiked:', error);
    return null;
  }
}

// Create nested comment (reply to comment)
export async function createReply(parentCommentId: string, content: string, authorId: string): Promise<any> {
  try {
    console.log('[Queries] Creating reply to comment:', parentCommentId);
    
    // Get the parent comment to get the post_id
    const { data: parentComment, error: parentError } = await getSupabase()
      .from('post_comments')
      .select('post_id, author_type')
      .eq('id', parentCommentId)
      .single();

    if (parentError || !parentComment) {
      console.error('[Queries] Error fetching parent comment:', parentError);
      return null;
    }

    // Create the reply
    const { data: reply, error: insertError } = await getSupabase()
      .from('post_comments')
      .insert({
        post_id: parentComment.post_id,
        author_id: authorId,
        author_type: 'individual', // Default to individual for now
        content: content,
        parent_id: parentCommentId,
        likes_count: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Queries] Error creating reply:', insertError);
      return null;
    }

    console.log('[Queries] Reply created successfully:', reply.id);
    return reply;
  } catch (error) {
    console.error('[Queries] Error in createReply:', error);
    return null;
  }
}

// Get nested comments (replies)
export async function getCommentReplies(commentId: string): Promise<CommentWithAuthor[]> {
  try {
    console.log('[Queries] Getting replies for comment:', commentId);
    
    const { data, error } = await getSupabase()
      .from('post_comments')
      .select(`
        *,
        author:profiles(id, full_name, avatar_url, headline, user_type)
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Queries] Error fetching comment replies:', error);
      return [];
    }

    console.log('[Queries] Comment replies fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[Queries] Error in getCommentReplies:', error);
    return [];
  }
}

// Institution Profile Queries
export async function createInstitutionProfile(institutionData: any) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('institutions')
    .insert(institutionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating institution profile:', error);
    throw error;
  }

  return data;
}

export async function getInstitutionProfile(institutionId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', institutionId)
    .single();

  if (error) {
    console.error('Error fetching institution profile:', error);
    return null;
  }

  return data;
}

export async function getInstitutionByAdmin(adminUserId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('admin_user_id', adminUserId)
    .single();

  if (error) {
    console.error('Error fetching institution by admin:', error);
    return null;
  }

  return data;
}

export async function updateInstitutionProfile(institutionId: string, updates: any) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('institutions')
    .update(updates)
    .eq('id', institutionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating institution profile:', error);
    throw error;
  }

  return data;
}

export async function getAllInstitutions() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching institutions:', error);
    return [];
  }

  return data || [];
}

export async function searchInstitutions(query: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching institutions:', error);
    return [];
  }

  return data || [];
}

// Institution Projects
export async function createInstitutionProject(projectData: any) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('institution_projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    console.error('Error creating institution project:', error);
    throw error;
  }

  return data;
}

export async function getInstitutionProjects(institutionId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('institution_projects')
    .select('*')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching institution projects:', error);
    return [];
  }

  return data || [];
}

// Institution Talent Requirements
export async function createTalentRequirement(requirementData: any) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('talent_requirements')
    .insert(requirementData)
    .select()
    .single();

  if (error) {
    console.error('Error creating talent requirement:', error);
    throw error;
  }

  return data;
}

export async function getTalentRequirements(institutionId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('talent_requirements')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching talent requirements:', error);
    return [];
  }

  return data || [];
}

// Institution Promotions
export async function createInstitutionPromotion(promotionData: any) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('institution_promotions')
    .insert(promotionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating institution promotion:', error);
    throw error;
  }

  return data;
}

export async function getInstitutionPromotions(institutionId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('institution_promotions')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching institution promotions:', error);
    return [];
  }

  return data || [];
}

// User Experience and Education Functions
export async function getUserExperiences(userId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('profile_id', userId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching user experiences:', error);
    return [];
  }

  return data || [];
}

export async function getUserEducations(userId: string) {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('profile_id', userId)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching user educations:', error);
    return [];
  }

  return data || [];
}

export async function isCurrentStudent(userId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  // Check if user has any current education entries
  const { data, error } = await supabase
    .from('education')
    .select('current')
    .eq('profile_id', userId)
    .eq('current', true)
    .limit(1);

  if (error) {
    console.error('Error checking if user is current student:', error);
    return false;
  }

  return data && data.length > 0;
}

