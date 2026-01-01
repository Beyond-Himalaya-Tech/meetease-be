const fs = require('fs');
const path = require('path');

const stage = process.argv[2] || 'dev';

// Read dev.env and convert to .env.{stage} format
const devEnvPath = path.join(__dirname, '..', 'dev.env');
const envDevPath = path.join(__dirname, '..', `.env.${stage}`);

if (!fs.existsSync(devEnvPath)) {
  console.error(`Error: ${devEnvPath} not found`);
  process.exit(1);
}

// Read dev.env
let envContent = fs.readFileSync(devEnvPath, 'utf8');

// Process the content: remove quotes, filter out local Docker variables
const processedLines = envContent.split('\n')
  .map(line => line.trim())
  .filter(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return false;
    // Skip local Docker variables (not needed for Lambda)
    if (line.startsWith('PORT=') || 
        line.startsWith('DB_PORT=') || 
        line.startsWith('POSTGRES_')) return false;
    return true;
  })
  .map(line => {
    // Remove quotes from values (handles both "value" and 'value')
    return line.replace(/^([^=]+)="([^"]*)"$/, '$1=$2')
               .replace(/^([^=]+)='([^']*)'$/, '$1=$2');
  })
  .join('\n');

// Write .env.dev
fs.writeFileSync(envDevPath, processedLines);

console.log(`✅ Created ${envDevPath} from dev.env`);
console.log(`   Stage: ${stage}`);
console.log('');
console.log('You can now run:');
console.log(`   npx serverless offline --stage ${stage}`);
console.log(`   or`);
console.log(`   npm run serverless:offline`);

