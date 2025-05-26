const fs = require('fs');

// Read the template HTML file
let html = fs.readFileSync('index.html', 'utf8');

// Get environment variables from Vercel
const apiKey = process.env.MULTISYNQ_API_KEY || '2zU3zTlT1sS9q0gtuny9l7uLlRi2GYsjibFLecKs40';
const appId = process.env.MULTISYNQ_APP_ID || 'io.multisynq.collaborative-canvas-app';

// Replace the hardcoded values with environment variables
html = html.replace(
    /apiKey: '[^']*'/,
    `apiKey: '${apiKey}'`
);

html = html.replace(
    /appId: '[^']*'/,
    `appId: '${appId}'`
);

// Write the processed HTML
fs.writeFileSync('index.html', html);

console.log('✅ Build completed with environment variables injected');
console.log(`📡 API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}`);
console.log(`🎮 App ID: ${appId}`); 