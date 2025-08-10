const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.code === 'PGRST116') {
        console.log('ℹ️  Table exists but no data found');
      } else if (error.code === 'PGRST114') {
        console.log('❌ Table does not exist - run the migration');
      } else if (error.code === 'PGRST301') {
        console.log('❌ Authentication error - check RLS policies');
      }
      
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Test table structure
    console.log('\n🔍 Testing table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (columnError) {
      console.error('❌ Error checking table structure:', columnError.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Table structure looks good');
      console.log('Available columns:', Object.keys(columns[0]));
    } else {
      console.log('ℹ️  Table exists but is empty');
    }
    
    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No authenticated user (this is normal for testing)');
    } else {
      console.log('✅ User authenticated:', user?.email);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection(); 