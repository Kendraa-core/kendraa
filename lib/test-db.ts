import { getSupabase } from './queries';

export async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if profiles table exists
    const { data: profiles, error: profilesError } = await getSupabase()
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
    }
    
    // Test 2: Check if posts table exists
    const { data: posts, error: postsError } = await getSupabase()
      .from('posts')
      .select('count')
      .limit(1);
    
    if (postsError) {
      console.log('❌ Posts table error:', postsError);
    } else {
      console.log('✅ Posts table accessible');
    }
    
    // Test 3: Try to get a specific profile
    const { data: profile, error: profileError } = await getSupabase()
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
    const { data: postsData, error: postsDataError } = await getSupabase()
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
        const { data: authors, error: authorsError } = await getSupabase()
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

export async function createSamplePostsWithHashtags() {
  console.log('📝 Creating sample posts with hashtags...');
  
  try {
    // Get a sample user ID (you'll need to replace this with a real user ID)
    const { data: profiles, error: profilesError } = await getSupabase()
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError || !profiles || profiles.length === 0) {
      console.log('❌ No profiles found for creating sample posts');
      return;
    }
    
    const authorId = profiles[0].id;
    
    const samplePosts = [
      {
        author_id: authorId,
        content: "Just finished an amazing #healthcare conference! The insights on #telemedicine were incredible. #medicalinnovation #healthcaretech",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "Excited to share our latest research findings on #medicalresearch. The data shows promising results for #patientcare. #healthcare #research",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "The future of #telemedicine is here! Remote consultations are becoming the new normal. #healthcare #digitalhealth #innovation",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "Great discussion today about #medicalresearch and its impact on #patientcare. The healthcare industry is evolving rapidly! #healthcare #innovation",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "Attending the #healthcare summit next week. Looking forward to networking with other professionals in #telemedicine and #medicalinnovation.",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "Just published our findings on #medicalresearch. The results are promising for improving #patientcare outcomes. #healthcare #research",
        visibility: 'public'
      },
      {
        author_id: authorId,
        content: "The integration of AI in #healthcare is revolutionizing #patientcare. #medicalinnovation is key to the future of medicine. #healthcaretech",
        visibility: 'public'
      }
    ];
    
    for (const post of samplePosts) {
      const { error } = await getSupabase()
        .from('posts')
        .insert(post);
      
      if (error) {
        console.log('❌ Error creating sample post:', error);
      } else {
        console.log('✅ Sample post created successfully');
      }
    }
    
    console.log('🎯 Sample posts with hashtags created!');
    
  } catch (error) {
    console.error('💥 Error creating sample posts:', error);
  }
} 