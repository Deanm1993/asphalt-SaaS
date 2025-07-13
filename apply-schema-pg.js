/**
 * Viable SaaS - Database Schema Application Script
 * 
 * This script applies the database schema to Supabase PostgreSQL
 * while forcing IPv4 connections to avoid ENETUNREACH errors.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

// Force IPv4 connections to avoid ENETUNREACH errors with IPv6
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  // Force IPv4 by setting family to 4
  if (typeof options === 'function') {
    callback = options;
    options = { family: 4 };
  } else {
    options = options || {};
    options.family = 4;
  }
  originalLookup(hostname, options, callback);
};

// Extract connection info from Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl ? supabaseUrl.match(/https:\/\/([^.]+)/)[1] : null;

if (!projectRef) {
  console.error('Invalid or missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Configure PostgreSQL connection
const pool = new Pool({
  host: `db.${projectRef}.supabase.co`,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_SERVICE_ROLE_KEY,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function applySchema() {
  const client = await pool.connect();
  try {
    // Read the SQL file
    const schemaPath = path.join(__dirname, '..', 'db', 'migrations', '01_initial_schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema file not found at: ${schemaPath}`);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    console.log(`Schema file loaded: ${sqlContent.length} bytes`);
    
    // Begin transaction
    console.log('Beginning transaction...');
    await client.query('BEGIN');
    
    // First, ensure the auth.users record exists before it's referenced
    console.log('Creating bootstrap auth.users record...');
    try {
      await client.query(`
        INSERT INTO auth.users (id, email, created_at, updated_at)
        VALUES (
          '00000000-0000-0000-0000-000000000001',
          'admin@viable-saas.com.au',
          NOW(),
          NOW()
        ) ON CONFLICT (id) DO NOTHING;
      `);
    } catch (error) {
      console.warn('Warning: Could not create bootstrap auth.users record:', error.message);
      console.warn('This is OK if the record already exists or will be created by the schema.');
    }
    
    // Split the SQL into statements
    const sqlStatements = sqlContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/--.*$/gm, '') // Remove -- comments
      .split(';')
      .filter(stmt => stmt.trim()); // Remove empty statements
    
    console.log(`Found ${sqlStatements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    for (let i = 0; i < sqlStatements.length; i++) {
      const stmt = sqlStatements[i];
      if (!stmt.trim()) continue;
      
      try {
        await client.query(stmt + ';');
        successCount++;
        
        // Log progress every 10 statements
        if (i % 10 === 0 || i === sqlStatements.length - 1) {
          console.log(`Progress: ${i + 1}/${sqlStatements.length} statements executed`);
        }
      } catch (err) {
        console.error(`\nError executing statement ${i + 1}:`, err.message);
        console.error('Statement:', stmt.trim().substring(0, 150) + '...');
        throw err;
      }
    }
    
    // Commit transaction
    console.log('Committing transaction...');
    await client.query('COMMIT');
    
    console.log(`\nSchema applied successfully! Executed ${successCount}/${sqlStatements.length} statements.`);
  } catch (error) {
    // Rollback on error
    console.error('\nError applying schema:', error.message);
    console.error('Rolling back transaction...');
    await client.query('ROLLBACK');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the schema application
console.log('Starting schema application...');
console.log(`Connecting to Supabase PostgreSQL at db.${projectRef}.supabase.co`);
console.log('Using IPv4 forced connections to avoid ENETUNREACH errors');

applySchema()
  .then(() => {
    console.log('Schema application completed successfully!');
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
