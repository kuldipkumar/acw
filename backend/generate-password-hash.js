#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Usage: node generate-password-hash.js [password]
 * 
 * Generates a bcrypt hash for the admin password.
 * Add the generated hash to your .env file as ADMIN_PASSWORD_HASH
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Error: Password is required');
  console.log('\nUsage: node generate-password-hash.js [password]');
  console.log('Example: node generate-password-hash.js mySecurePassword123');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('Warning: Password is less than 8 characters. Consider using a stronger password.');
}

// Generate hash with salt rounds of 10
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n✅ Password hash generated successfully!\n');
console.log('Add this to your .env file:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
console.log('⚠️  Keep this hash secure and never commit it to version control!');
