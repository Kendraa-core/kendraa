import { supabase } from './supabase';

export async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
    }
    
    // Test 2: Check if posts table exists
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    if (postsError) {
      console.log('❌ Posts table error:', postsError);
    } else {
      console.log('✅ Posts table accessible');
    }
    
    // Test 3: Try to get a specific profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'ce8707f0-b83d-4140-8f39-f56850d6e560')
      .maybeSingle();
    
    if (profileError) {
      console.log('❌ Profile fetch error:', profileError);
    } else if (profile) {
      console.log('✅ Profile found:', profile.full_name);
    } else {
      console.log('⚠️ Profile not found, but no error');
    }
    
    // Test 4: Try to get posts with proper join
    const { data: postsData, error: postsDataError } = await supabase
      .from('posts')
      .select('*')
      .limit(5);
    
    if (postsDataError) {
      console.log('❌ Posts query error:', postsDataError);
    } else {
      console.log('✅ Posts query successful, found:', postsData?.length || 0, 'posts');
      
      // If we have posts, try to get their authors
      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map(post => post.author_id))];
        const { data: authors, error: authorsError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, headline, email')
          .in('id', authorIds);
        
        if (authorsError) {
          console.log('❌ Authors query error:', authorsError);
        } else {
          console.log('✅ Authors query successful, found:', authors?.length || 0, 'authors');
        }
      }
    }
    
    console.log('🎯 Database test completed!');
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
  }
} 