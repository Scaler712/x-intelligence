/**
 * Supabase Setup Script
 * 
 * This script helps set up your Supabase database and storage buckets.
 * Run with: node server/scripts/setupSupabase.js
 * 
 * You'll be prompted for your Supabase credentials, or set them as environment variables.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSupabase() {
  console.log('🚀 Supabase Setup Script\n');

  // Get credentials
  let supabaseUrl = process.env.SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    supabaseUrl = await question('Enter your Supabase Project URL (https://xxxxx.supabase.co): ');
  }

  if (!supabaseServiceKey) {
    supabaseServiceKey = await question('Enter your Supabase Service Role Key (from Project Settings > API): ');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('\n📋 Setting up database...\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute migration
    console.log('Running database migration...');
    const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (migrationError) {
      // RPC might not exist, try direct query (this might not work, so we'll suggest manual execution)
      console.log('⚠️  Could not run migration automatically.');
      console.log('📝 Please run the migration manually in Supabase SQL Editor:');
      console.log(`   File: ${migrationPath}\n`);
      console.log('   Or copy and paste the SQL from the migration file into the SQL Editor.\n');
    } else {
      console.log('✅ Database migration completed!\n');
    }
  } catch (error) {
    console.log('⚠️  Could not run migration automatically.');
    console.log('📝 Please run the migration manually in Supabase SQL Editor:');
    console.log(`   File: ${migrationPath}\n`);
  }

  // Setup storage buckets
  console.log('📦 Setting up storage buckets...\n');

  const buckets = [
    { name: 'scrapes', public: false },
    { name: 'exports', public: false },
    { name: 'backups', public: false },
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      const exists = existingBuckets?.some(b => b.name === bucket.name);

      if (exists) {
        console.log(`✅ Bucket "${bucket.name}" already exists`);
      } else {
        // Create bucket
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'application/json',
            'text/csv',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ]
        });

        if (error) {
          console.log(`⚠️  Could not create bucket "${bucket.name}": ${error.message}`);
          console.log(`   Please create it manually in Supabase Dashboard > Storage`);
        } else {
          console.log(`✅ Created bucket "${bucket.name}"`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error setting up bucket "${bucket.name}": ${error.message}`);
      console.log(`   Please create it manually in Supabase Dashboard > Storage`);
    }
  }

  console.log('\n✨ Setup complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. If migration wasn\'t run automatically, run it in Supabase SQL Editor');
  console.log('   2. Create any missing storage buckets in Supabase Dashboard');
  console.log('   3. Add your Supabase credentials to .env file:\n');
  console.log(`   SUPABASE_URL=${supabaseUrl}`);
  console.log(`   SUPABASE_SERVICE_KEY=${supabaseServiceKey.substring(0, 20)}...`);
  console.log('   SUPABASE_ANON_KEY=<your_anon_key_from_dashboard>\n');
  console.log('   4. Update client/.env with:\n');
  console.log(`   VITE_SUPABASE_URL=${supabaseUrl}`);
  console.log('   VITE_SUPABASE_ANON_KEY=<your_anon_key_from_dashboard>\n');

  rl.close();
}

setupSupabase().catch(console.error);


