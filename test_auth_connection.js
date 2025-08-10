const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection and Authentication...\n');

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables not found!');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

async function testConnection() {
  try {
    console.log('\n🔗 Testing basic connection...');
    
    // Test basic connection by trying to access a public table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function testAuthentication() {
  try {
    console.log('\n🔐 Testing authentication...');
    
    // Test with a test user (you can replace with actual credentials)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ Authentication system working (expected error for invalid credentials)');
        return true;
      } else {
        console.error('❌ Authentication error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return false;
  }
}

async function testProfileAccess() {
  try {
    console.log('\n👤 Testing profile access...');
    
    // Try to access profiles table (should work for public read)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(5);
    
    if (error) {
      console.error('❌ Profile access failed:', error.message);
      return false;
    }
    
    console.log('✅ Profile access successful');
    console.log(`Found ${data.length} profiles`);
    return true;
  } catch (error) {
    console.error('❌ Profile access error:', error.message);
    return false;
  }
}

async function testRLSPolicies() {
  try {
    console.log('\n🛡️ Testing RLS policies...');
    
    // Test that we can't insert without authentication
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        full_name: 'Test User',
        email: 'test@example.com'
      })
      .select();
    
    if (error) {
      if (error.message.includes('new row violates row-level security policy')) {
        console.log('✅ RLS policies working (blocked unauthorized insert)');
        return true;
      } else {
        console.error('❌ RLS test failed:', error.message);
        return false;
      }
    }
    
    console.log('⚠️ RLS policies may not be working correctly');
    return false;
  } catch (error) {
    console.error('❌ RLS test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting database tests...\n');
  
  const tests = [
    { name: 'Connection', fn: testConnection },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Profile Access', fn: testProfileAccess },
    { name: 'RLS Policies', fn: testRLSPolicies }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} test failed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results:');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\n${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your database is working correctly.');
    console.log('\nNext steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Try signing up or signing in');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your database configuration.');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you ran the fix_database_issues.sql script');
    console.log('2. Check your Supabase project settings');
    console.log('3. Verify your environment variables');
  }
}

// Run the tests
runTests().catch(console.error); 