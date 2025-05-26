const fs = require('fs');
const path = require('path');

console.log('🔧 Starting build process...');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('📄 Loading .env file...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key]) {
            process.env[key] = value.trim();
        }
    });
} else {
    console.log('⚠️  No .env file found, using system environment variables');
}

// Check environment variables (without logging sensitive data)
console.log('📋 Checking environment variables...');
const hasApiKey = !!process.env.MULTISYNQ_API_KEY;
const hasAppId = !!process.env.MULTISYNQ_APP_ID;
const hasSessionName = !!process.env.MULTISYNQ_SESSION_NAME;
const hasSessionPassword = !!process.env.MULTISYNQ_SESSION_PASSWORD;

console.log('  MULTISYNQ_API_KEY:', hasApiKey ? '✅ SET' : '❌ NOT SET');
console.log('  MULTISYNQ_APP_ID:', hasAppId ? '✅ SET' : '❌ NOT SET');
console.log('  MULTISYNQ_SESSION_NAME:', hasSessionName ? '✅ SET' : '❌ NOT SET');
console.log('  MULTISYNQ_SESSION_PASSWORD:', hasSessionPassword ? '✅ SET' : '❌ NOT SET');

// Read the game.js file
const gameJsPath = path.join(__dirname, 'game.js');
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// Replace placeholders with environment variables
const apiKey = process.env.MULTISYNQ_API_KEY || 'your-api-key-here';
const appId = process.env.MULTISYNQ_APP_ID || 'io.multisynq.multidoomv1-app';
const sessionName = process.env.MULTISYNQ_SESSION_NAME || 'default-session';
const sessionPassword = process.env.MULTISYNQ_SESSION_PASSWORD || 'default-password';

gameJsContent = gameJsContent.replace('REPLACE_WITH_API_KEY', apiKey);
gameJsContent = gameJsContent.replace('REPLACE_WITH_APP_ID', appId);
gameJsContent = gameJsContent.replace('REPLACE_WITH_SESSION_NAME', sessionName);
gameJsContent = gameJsContent.replace('REPLACE_WITH_SESSION_PASSWORD', sessionPassword);

// Verify replacements worked
console.log('🔍 Checking replacements...');
if (gameJsContent.includes('REPLACE_WITH_')) {
    console.error('❌ Some placeholders were not replaced!');
    if (gameJsContent.includes('REPLACE_WITH_API_KEY')) console.error('  - API_KEY not replaced');
    if (gameJsContent.includes('REPLACE_WITH_APP_ID')) console.error('  - APP_ID not replaced');
    if (gameJsContent.includes('REPLACE_WITH_SESSION_NAME')) console.error('  - SESSION_NAME not replaced');
    if (gameJsContent.includes('REPLACE_WITH_SESSION_PASSWORD')) console.error('  - SESSION_PASSWORD not replaced');
    process.exit(1);
} else {
    console.log('✅ All placeholders replaced successfully');
}

// Write the updated content to a build directory
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
    console.log('📁 Created dist/ directory');
}

// Copy all files to dist and replace game.js with the processed version
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(buildDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(buildDir, 'styles.css'));
// Copy the image file too
if (fs.existsSync(path.join(__dirname, 'johnwrichkid.jpg'))) {
    fs.copyFileSync(path.join(__dirname, 'johnwrichkid.jpg'), path.join(buildDir, 'johnwrichkid.jpg'));
    console.log('🖼️  Copied johnwrichkid.jpg');
}
fs.writeFileSync(path.join(buildDir, 'game.js'), gameJsContent);

console.log('🎉 Build completed! Files are ready in the dist/ directory.');
console.log('📦 Generated files:');
console.log('  - dist/index.html');
console.log('  - dist/styles.css');
console.log('  - dist/game.js (with environment variables)');
if (fs.existsSync(path.join(buildDir, 'johnwrichkid.jpg'))) {
    console.log('  - dist/johnwrichkid.jpg');
} 