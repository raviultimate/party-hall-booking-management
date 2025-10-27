/**
 * Script to generate a secure random string for NEXTAUTH_SECRET
 * Run with: node scripts/generate-secret.js
 */

const crypto = require('crypto');

// Generate a random string of 32 bytes and encode it as base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('Generated NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nAdd this to your .env.local file or Vercel environment variables.');
