/**
 * Create Storage Buckets Script
 * Run this to create the required storage buckets in Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const buckets = [
  {
    name: 'scrapes',
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['application/json']
  },
  {
    name: 'exports',
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  {
    name: 'backups',
    public: false,
    fileSizeLimit: 52428800 // 50MB
  }
];

async function createBuckets() {
  console.log('📦 Creating Supabase Storage Buckets...\n');

  // List existing buckets
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    process.exit(1);
  }

  const existingNames = existingBuckets?.map(b => b.name) || [];

  for (const bucket of buckets) {
    if (existingNames.includes(bucket.name)) {
      console.log(`✅ Bucket "${bucket.name}" already exists`);
      continue;
    }

    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Error creating bucket "${bucket.name}":`, error.message);
      } else {
        console.log(`✅ Created bucket "${bucket.name}"`);
      }
    } catch (error) {
      console.error(`❌ Error creating bucket "${bucket.name}":`, error.message);
    }
  }

  console.log('\n✨ Bucket setup complete!\n');
}

createBuckets().catch(console.error);


