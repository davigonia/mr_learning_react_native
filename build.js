const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}Starting build process for Mr. Learning React Native Web...${colors.reset}`);

try {
  // Step 1: Clean previous build
  console.log(`${colors.yellow}Cleaning previous build...${colors.reset}`);
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
  }
  
  // Step 2: Install dependencies
  console.log(`${colors.yellow}Installing dependencies...${colors.reset}`);
  execSync('npm install', { stdio: 'inherit' });
  
  // Step 3: Run webpack build
  console.log(`${colors.yellow}Building application...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 4: Copy deployment files
  console.log(`${colors.yellow}Copying deployment files...${colors.reset}`);
  fs.copyFileSync(
    path.join(__dirname, 'netlify.toml'),
    path.join(__dirname, 'dist', 'netlify.toml')
  );
  
  console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`${colors.blue}The build output is in the 'dist' directory.${colors.reset}`);
  console.log(`${colors.blue}You can now deploy this directory to Netlify or any other static hosting service.${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
}
