// Simple example of how to set up the environment
// Copy this file to .env and fill in your actual values

require('dotenv').config();

const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];

const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.log('Missing environment variables:');
  missing.forEach(v => console.log(`  - ${v}`));
  console.log('\nPlease check your .env file');
}
