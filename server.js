#!/usr/bin/env node

/**
 * Simple HTTP server that injects .env variables into HTML
 * Usage: node server.js [port]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.argv[2] || 8080;
const envPath = path.join(__dirname, '.env');

/**
 * Read .env file and extract GREEN_API_URL
 */
function loadEnvConfig() {
    let greenApiUrl = 'https://api.green-api.com';
    
    try {
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const [key, ...valueParts] = trimmedLine.split('=');
                    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    
                    if (key === 'GREEN_API_URL') {
                        greenApiUrl = value || greenApiUrl;
                    }
                }
            }
        }
    } catch (error) {
        console.log(`⚠️  Could not read .env file: ${error.message}`);
    }
    
    return greenApiUrl;
}

/**
 * Inject environment variables into HTML
 */
function injectEnvIntoHTML(htmlContent, greenApiUrl) {
    // Inject script before closing </head> or before app.js
    const injectionScript = `
    <script>
        // Environment variables from .env
        window.ENV_GREEN_API_URL = '${greenApiUrl}';
    </script>`;
    
    // Insert before app.js
    if (htmlContent.includes('<script src="js/app.js"></script>')) {
        return htmlContent.replace(
            '<script src="js/app.js"></script>',
            injectionScript + '\n    <script src="js/app.js"></script>'
        );
    } else {
        // Insert before closing </body>
        return htmlContent.replace('</body>', injectionScript + '\n</body>');
    }
}

/**
 * Get MIME type for file extension
 */
function getMimeType(ext) {
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
    // Load env config on each request (in case .env changes)
    const greenApiUrl = loadEnvConfig();
    
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        let content = data;
        let contentType = getMimeType(ext);
        
        // Inject env variables into HTML files
        if (ext === '.html') {
            content = injectEnvIntoHTML(data.toString(), greenApiUrl);
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    const greenApiUrl = loadEnvConfig();
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log(`📖 GREEN_API_URL from .env: ${greenApiUrl}`);
    console.log(`\nPress Ctrl+C to stop`);
});
