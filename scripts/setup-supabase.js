#!/usr/bin/env node

/**
 * Supabase setup verification script
 * This script helps verify that the Supabase database and storage are properly configured
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.PROJECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: PROJECT_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  try {
    // Check if pdfs table exists and is accessible
    const { data: pdfsData, error: pdfsError } = await supabase
      .from('pdfs')
      .select('count')
      .limit(1);
    
    if (pdfsError) {
      console.error('❌ PDFs table check failed:', pdfsError.message);
      return false;
    }
    
    console.log('✅ PDFs table is accessible');
    
    // Check if user_activity table exists and is accessible
    const { data: activityData, error: activityError } = await supabase
      .from('user_activity')
      .select('count')
      .limit(1);
    
    if (activityError) {
      console.error('❌ User activity table check failed:', activityError.message);
      return false;
    }
    
    console.log('✅ User activity table is accessible');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkStorage() {
  console.log('🔍 Checking storage bucket...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage check failed:', error.message);
      return false;
    }
    
    const pdfsBucket = data.find(bucket => bucket.name === 'pdfs');
    
    if (!pdfsBucket) {
      console.error('❌ PDFs bucket not found');
      console.log('📝 Please create a bucket named "pdfs" in your Supabase dashboard');
      return false;
    }
    
    console.log('✅ PDFs storage bucket exists');
    console.log(`   - Public: ${pdfsBucket.public}`);
    console.log(`   - Created: ${pdfsBucket.created_at}`);
    
    return true;
  } catch (error) {
    console.error('❌ Storage connection failed:', error.message);
    return false;
  }
}

async function checkFunction() {
  console.log('🔍 Checking database functions...');
  
  try {
    // Try to call the requesting_user_id function
    const { data, error } = await supabase.rpc('requesting_user_id');
    
    if (error && !error.message.includes('JWT')) {
      console.error('❌ Function check failed:', error.message);
      return false;
    }
    
    console.log('✅ requesting_user_id function exists');
    return true;
  } catch (error) {
    console.error('❌ Function check failed:', error.message);
    return false;
  }
}

function printSetupInstructions() {
  console.log('\n📋 Setup Instructions:');
  console.log('1. Run the SQL migration in supabase/migrations/001_initial_schema.sql');
  console.log('2. Run the storage policy SQL in supabase/storage/pdfs_bucket_policy.sql');
  console.log('3. Configure Clerk JWT template for Supabase integration');
  console.log('4. Ensure environment variables are properly set');
  console.log('\nSee supabase/README.md for detailed instructions.');
}

async function main() {
  console.log('🚀 Verifying Supabase setup...\n');
  
  const tableCheck = await checkTables();
  const storageCheck = await checkStorage();
  const functionCheck = await checkFunction();
  
  console.log('\n📊 Setup Status:');
  console.log(`Database Tables: ${tableCheck ? '✅' : '❌'}`);
  console.log(`Storage Bucket: ${storageCheck ? '✅' : '❌'}`);
  console.log(`Database Functions: ${functionCheck ? '✅' : '❌'}`);
  
  if (tableCheck && storageCheck && functionCheck) {
    console.log('\n🎉 Supabase setup is complete!');
    console.log('You can now proceed with implementing the API endpoints.');
  } else {
    console.log('\n⚠️  Setup incomplete. Please address the issues above.');
    printSetupInstructions();
    process.exit(1);
  }
}

main().catch(console.error);