const fs = require('fs');
const path = require('path');

// Read the game.js file
const gameJsPath = path.join(__dirname, 'game.js');
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// Replace placeholders with environment variables
gameJsContent = gameJsContent.replace('REPLACE_WITH_API_KEY', process.env.MULTISYNQ_API_KEY || 'your-api-key-here');
gameJsContent = gameJsContent.replace('REPLACE_WITH_SESSION_NAME', process.env.MULTISYNQ_SESSION_NAME || 'default-session');
gameJsContent = gameJsContent.replace('REPLACE_WITH_SESSION_PASSWORD', process.env.MULTISYNQ_SESSION_PASSWORD || 'default-password');
gameJsContent = gameJsContent.replace('REPLACE_WITH_APP_ID', process.env.MULTISYNQ_APP_ID || 'io.multisynq.multidoomv1-app');

// Write the updated content to a build directory or overwrite the original
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// Copy all files to dist and replace game.js with the processed version
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(buildDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(buildDir, 'styles.css'));
fs.writeFileSync(path.join(buildDir, 'game.js'), gameJsContent);

console.log('Build completed! Files are ready in the dist/ directory.'); 