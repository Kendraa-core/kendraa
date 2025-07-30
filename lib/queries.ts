import { supabase } from './supabase';
import type { 
  Profile, 
  Post, 
  PostWithAuthor, 
  Connection, 
  ConnectionWithProfile,
  Experience,
  Education,
  PostLike,
  PostComment,
  CommentWithAuthor,
  Notification,
  Institution,
  Job,
  JobWithCompany,
  JobApplication,
  Event,
  EventWithOrganizer,
  EventAttendee
} from '@/types/database.types';

// Debug logging function
const debugLog = (operation: string, data?: unknown, error?: unknown) => {
  console.log(`[Queries] ${operation}`, { data, error });
};

// Profile queries
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    debugLog('Getting profile', { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      debugLog('Error fetching profile', { userId }, error);
      return null;
    }

    debugLog('Profile fetched successfully', { userId, profile: data });
    return data;
  } catch (error) {
    debugLog('Profile fetch exception', { userId }, error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    debugLog('Updating profile', { userId, updates });
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      debugLog('Error updating profile', { userId, updates }, error);
      return null;
    }

    debugLog('Profile updated successfully', { userId, profile: data });
    return data;
  } catch (error) {
    debugLog('Profile update exception', { userId, updates }, error);
    return null;
  }
}

export async function recordProfileView(profileId: string, viewerId?: string): Promise<void> {
  // Don't record if viewing own profile
  if (profileId === viewerId) return;

  try {
    debugLog('Recording profile view', { profileId, viewerId });
    
    const { error } = await supabase
      .from('profile_views')
      .insert([{ profile_id: profileId, viewer_id: viewerId }]);

    if (error) {
      debugLog('Error recording profile view', { profileId, viewerId }, error);
    } else {
      debugLog('Profile view recorded successfully', { profileId, viewerId });
    }
  } catch (error) {
    debugLog('Profile view exception', { profileId, viewerId }, error);
  }
}

// Post queries
export async function createPost(post: {
  content: string;
  author_id: string;
  author_type?: 'individual' | 'institution';
  image_url?: string;
  images?: string[];
  visibility: 'public' | 'connections' | 'private';
}): Promise<Post | null> {
  try {
    debugLog('Creating post', { post });
    
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        ...post,
        author_type: post.author_type || 'individual',
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error creating post', { post }, error);
      return null;
    }

    debugLog('Post created successfully', { post, result: data });
    return data;
  } catch (error) {
    debugLog('Post creation exception', { post }, error);
    return null;
  }
}

export async function getPosts(limit = 10, offset = 0): Promise<PostWithAuthor[]> {
  try {
    debugLog('Getting posts', { limit, offset });
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      debugLog('Error fetching posts', { limit, offset }, error);
      return [];
    }

    debugLog('Posts fetched successfully', { limit, offset, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Posts fetch exception', { limit, offset }, error);
    return [];
  }
}

export async function getPostsByAuthor(authorId: string, limit = 10): Promise<PostWithAuthor[]> {
  try {
    debugLog('Getting posts by author', { authorId, limit });
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      debugLog('Error fetching posts by author', { authorId, limit }, error);
      return [];
    }

    debugLog('Posts by author fetched successfully', { authorId, limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Posts by author fetch exception', { authorId, limit }, error);
    return [];
  }
}

export async function likePost(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Liking post', { postId, userId });
    
    const { error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId, user_type: 'individual' }]);

    if (error) {
      debugLog('Error liking post', { postId, userId }, error);
      return false;
    }

    // Update post likes count
    await supabase.rpc('increment_post_likes', { post_id: postId });

    debugLog('Post liked successfully', { postId, userId });
    return true;
  } catch (error) {
    debugLog('Post like exception', { postId, userId }, error);
    return false;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Unliking post', { postId, userId });
    
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      debugLog('Error unliking post', { postId, userId }, error);
      return false;
    }

    // Update post likes count
    await supabase.rpc('decrement_post_likes', { post_id: postId });

    debugLog('Post unliked successfully', { postId, userId });
    return true;
  } catch (error) {
    debugLog('Post unlike exception', { postId, userId }, error);
    return false;
  }
}

export async function getPostLikes(postId: string): Promise<PostLike[]> {
  try {
    debugLog('Getting post likes', { postId });
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId);

    if (error) {
      debugLog('Error fetching post likes', { postId }, error);
      return [];
    }

    debugLog('Post likes fetched successfully', { postId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Post likes fetch exception', { postId }, error);
    return [];
  }
}

export async function isPostLiked(postId: string, userId: string): Promise<boolean> {
  try {
    debugLog('Checking if post is liked', { postId, userId });
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      debugLog('Error checking if post is liked', { postId, userId }, error);
      return false;
    }

    const isLiked = !!data;
    debugLog('Post like status checked', { postId, userId, isLiked });
    return isLiked;
  } catch (error) {
    debugLog('Post like check exception', { postId, userId }, error);
    return false;
  }
}

// Comment queries
export async function createComment(comment: {
  post_id: string;
  author_id: string;
  author_type: 'individual' | 'institution';
  content: string;
  parent_id?: string;
}): Promise<PostComment | null> {
  try {
    debugLog('Creating comment', { comment });
    
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        ...comment,
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error creating comment', { comment }, error);
      return null;
    }

    // Update post comments count
    await supabase.rpc('increment_post_comments', { post_id: comment.post_id });

    debugLog('Comment created successfully', { comment, result: data });
    return data;
  } catch (error) {
    debugLog('Comment creation exception', { comment }, error);
    return null;
  }
}

export async function getPostComments(postId: string): Promise<CommentWithAuthor[]> {
  try {
    debugLog('Getting post comments', { postId });
    
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('post_id', postId)
      .is('parent_id', null) // Get top-level comments only for now
      .order('created_at', { ascending: false });

    if (error) {
      debugLog('Error fetching post comments', { postId }, error);
      return [];
    }

    debugLog('Post comments fetched successfully', { postId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Post comments fetch exception', { postId }, error);
    return [];
  }
}

// Connection queries
export async function sendConnectionRequest(requesterId: string, recipientId: string): Promise<boolean> {
  try {
    debugLog('Sending connection request', { requesterId, recipientId });
    
    const { error } = await supabase
      .from('connections')
      .insert([{ 
        requester_id: requesterId, 
        recipient_id: recipientId,
        status: 'pending'
      }]);

    if (error) {
      debugLog('Error sending connection request', { requesterId, recipientId }, error);
      return false;
    }

    debugLog('Connection request sent successfully', { requesterId, recipientId });
    return true;
  } catch (error) {
    debugLog('Connection request exception', { requesterId, recipientId }, error);
    return false;
  }
}

export async function acceptConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    debugLog('Accepting connection request', { connectionId });
    
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    if (error) {
      debugLog('Error accepting connection request', { connectionId }, error);
      return false;
    }

    debugLog('Connection request accepted successfully', { connectionId });
    return true;
  } catch (error) {
    debugLog('Connection accept exception', { connectionId }, error);
    return false;
  }
}

export async function rejectConnectionRequest(connectionId: string): Promise<boolean> {
  try {
    debugLog('Rejecting connection request', { connectionId });
    
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    if (error) {
      debugLog('Error rejecting connection request', { connectionId }, error);
      return false;
    }

    debugLog('Connection request rejected successfully', { connectionId });
    return true;
  } catch (error) {
    debugLog('Connection reject exception', { connectionId }, error);
    return false;
  }
}

export async function getConnectionRequests(userId: string): Promise<ConnectionWithProfile[]> {
  try {
    debugLog('Getting connection requests', { userId });
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      debugLog('Error fetching connection requests', { userId }, error);
      return [];
    }

    debugLog('Connection requests fetched successfully', { userId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Connection requests fetch exception', { userId }, error);
    return [];
  }
}

export async function getConnections(userId: string): Promise<Profile[]> {
  try {
    debugLog('Getting connections', { userId });
    
    const { data, error } = await supabase
      .from('connections')
      .select(`
        requester_id,
        recipient_id,
        requester:profiles!connections_requester_id_fkey(*),
        recipient:profiles!connections_recipient_id_fkey(*)
      `)
      .or(`requester_id.eq.${userId}::uuid,recipient_id.eq.${userId}::uuid`)
      .eq('status', 'accepted');

    if (error) {
      debugLog('Error fetching connections', { userId }, error);
      return [];
    }

    // Return the profiles that are not the current user
    const connections: Profile[] = [];
    
    if (data) {
      for (const conn of data) {
        const profile = conn.requester_id === userId ? conn.recipient : conn.requester;
        if (profile && typeof profile === 'object' && 'id' in profile) {
          connections.push(profile as unknown as Profile);
        }
      }
    }

    debugLog('Connections fetched successfully', { userId, count: connections.length });
    return connections;
  } catch (error) {
    debugLog('Connections fetch exception', { userId }, error);
    return [];
  }
}

export async function getConnectionStatus(userId: string, targetUserId: string): Promise<'none' | 'pending' | 'connected'> {
  try {
    debugLog('Getting connection status', { userId, targetUserId });
    
    const { data, error } = await supabase
      .from('connections')
      .select('status')
      .or(`and(requester_id.eq.${userId}::uuid,recipient_id.eq.${targetUserId}::uuid),and(requester_id.eq.${targetUserId}::uuid,recipient_id.eq.${userId}::uuid)`)
      .single();

    if (error && error.code !== 'PGRST116') {
      debugLog('Error checking connection status', { userId, targetUserId }, error);
      return 'none';
    }

    if (!data) {
      debugLog('No connection found', { userId, targetUserId });
      return 'none';
    }
    
    const status = data.status === 'accepted' ? 'connected' : 'pending';
    debugLog('Connection status checked', { userId, targetUserId, status });
    return status;
  } catch (error) {
    debugLog('Connection status check exception', { userId, targetUserId }, error);
    return 'none';
  }
}

export async function getSuggestedConnections(userId: string, limit = 10): Promise<Profile[]> {
  try {
    debugLog('Getting suggested connections', { userId, limit });
    
    // Get people who are not already connected
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .limit(limit);

    if (error) {
      debugLog('Error fetching suggested connections', { userId, limit }, error);
      return [];
    }

    // Filter out existing connections (this should be done in the query for better performance)
    debugLog('Suggested connections fetched successfully', { userId, limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Suggested connections fetch exception', { userId, limit }, error);
    return [];
  }
}

// Experience queries
export async function getExperiences(profileId: string): Promise<Experience[]> {
  try {
    debugLog('Getting experiences', { profileId });
    
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) {
      debugLog('Error fetching experiences', { profileId }, error);
      return [];
    }

    debugLog('Experiences fetched successfully', { profileId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Experiences fetch exception', { profileId }, error);
    return [];
  }
}

export async function addExperience(experience: Omit<Experience, 'id' | 'created_at' | 'updated_at'>): Promise<Experience | null> {
  try {
    debugLog('Adding experience', { experience });
    
    const { data, error } = await supabase
      .from('experiences')
      .insert([experience])
      .select()
      .single();

    if (error) {
      debugLog('Error adding experience', { experience }, error);
      return null;
    }

    debugLog('Experience added successfully', { experience, result: data });
    return data;
  } catch (error) {
    debugLog('Experience add exception', { experience }, error);
    return null;
  }
}

// Education queries
export async function getEducation(profileId: string): Promise<Education[]> {
  try {
    debugLog('Getting education', { profileId });
    
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) {
      debugLog('Error fetching education', { profileId }, error);
      return [];
    }

    debugLog('Education fetched successfully', { profileId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Education fetch exception', { profileId }, error);
    return [];
  }
}

export async function addEducation(education: Omit<Education, 'id' | 'created_at' | 'updated_at'>): Promise<Education | null> {
  try {
    debugLog('Adding education', { education });
    
    const { data, error } = await supabase
      .from('education')
      .insert([education])
      .select()
      .single();

    if (error) {
      debugLog('Error adding education', { education }, error);
      return null;
    }

    debugLog('Education added successfully', { education, result: data });
    return data;
  } catch (error) {
    debugLog('Education add exception', { education }, error);
    return null;
  }
}

// Institution queries
export async function createInstitution(institution: Omit<Institution, 'id' | 'created_at' | 'updated_at'>): Promise<Institution | null> {
  try {
    debugLog('Creating institution', { institution });
    
    const { data, error } = await supabase
      .from('institutions')
      .insert([{
        ...institution,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error creating institution', { institution }, error);
      return null;
    }

    debugLog('Institution created successfully', { institution, result: data });
    return data;
  } catch (error) {
    debugLog('Institution creation exception', { institution }, error);
    return null;
  }
}

export async function getInstitutions(limit = 20): Promise<Institution[]> {
  try {
    debugLog('Getting institutions', { limit });
    
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      debugLog('Error fetching institutions', { limit }, error);
      return [];
    }

    debugLog('Institutions fetched successfully', { limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Institutions fetch exception', { limit }, error);
    return [];
  }
}

// Job queries
export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'applications_count'>): Promise<Job | null> {
  try {
    debugLog('Creating job', { job });
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        ...job,
        applications_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error creating job', { job }, error);
      return null;
    }

    debugLog('Job created successfully', { job, result: data });
    return data;
  } catch (error) {
    debugLog('Job creation exception', { job }, error);
    return null;
  }
}

export async function getJobs(limit = 20): Promise<JobWithCompany[]> {
  try {
    debugLog('Getting jobs', { limit });
    
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        company:institutions(*),
        posted_by_user:profiles(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      debugLog('Error fetching jobs', { limit }, error);
      return [];
    }

    debugLog('Jobs fetched successfully', { limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Jobs fetch exception', { limit }, error);
    return [];
  }
}

export async function applyToJob(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication | null> {
  try {
    debugLog('Applying to job', { application });
    
    const { data, error } = await supabase
      .from('job_applications')
      .insert([{
        ...application,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error applying to job', { application }, error);
      return null;
    }

    // Update job applications count
    await supabase.rpc('increment_job_applications', { job_id: application.job_id });

    debugLog('Job application created successfully', { application, result: data });
    return data;
  } catch (error) {
    debugLog('Job application exception', { application }, error);
    return null;
  }
}

// Event queries
export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'attendees_count'>): Promise<Event | null> {
  try {
    debugLog('Creating event', { event });
    
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...event,
        attendees_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      debugLog('Error creating event', { event }, error);
      return null;
    }

    debugLog('Event created successfully', { event, result: data });
    return data;
  } catch (error) {
    debugLog('Event creation exception', { event }, error);
    return null;
  }
}

export async function getEvents(limit = 20): Promise<EventWithOrganizer[]> {
  try {
    debugLog('Getting events', { limit });
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles(*)
      `)
      .in('status', ['upcoming', 'ongoing'])
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) {
      debugLog('Error fetching events', { limit }, error);
      return [];
    }

    debugLog('Events fetched successfully', { limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Events fetch exception', { limit }, error);
    return [];
  }
}

export async function registerForEvent(eventId: string, attendeeId: string, attendeeType: 'individual' | 'institution' = 'individual'): Promise<boolean> {
  try {
    debugLog('Registering for event', { eventId, attendeeId, attendeeType });
    
    const { error } = await supabase
      .from('event_attendees')
      .insert([{
        event_id: eventId,
        attendee_id: attendeeId,
        attendee_type: attendeeType,
        status: 'registered',
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      debugLog('Error registering for event', { eventId, attendeeId }, error);
      return false;
    }

    // Update event attendees count
    await supabase.rpc('increment_event_attendees', { event_id: eventId });

    debugLog('Event registration successful', { eventId, attendeeId });
    return true;
  } catch (error) {
    debugLog('Event registration exception', { eventId, attendeeId }, error);
    return false;
  }
}

// Notification queries
export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  try {
    debugLog('Getting notifications', { userId, limit });
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      debugLog('Error fetching notifications', { userId, limit }, error);
      return [];
    }

    debugLog('Notifications fetched successfully', { userId, limit, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    debugLog('Notifications fetch exception', { userId, limit }, error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    debugLog('Marking notification as read', { notificationId });
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      debugLog('Error marking notification as read', { notificationId }, error);
      return false;
    }

    debugLog('Notification marked as read successfully', { notificationId });
    return true;
  } catch (error) {
    debugLog('Notification mark read exception', { notificationId }, error);
    return false;
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
  try {
    debugLog('Creating notification', { notification });
    
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) {
      debugLog('Error creating notification', { notification }, error);
      return false;
    }

    debugLog('Notification created successfully', { notification });
    return true;
  } catch (error) {
    debugLog('Notification creation exception', { notification }, error);
    return false;
  }
}

// Export all types for easy importing
export type {
  Profile,
  Institution,
  Post,
  PostWithAuthor,
  PostComment,
  CommentWithAuthor,
  Connection,
  ConnectionWithProfile,
  Job,
  JobWithCompany,
  JobApplication,
  Event,
  EventWithOrganizer,
  EventAttendee,
  Experience,
  Education,
  Notification,
}; 