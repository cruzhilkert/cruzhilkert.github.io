#!/usr/bin/env node
// Tiny zero-dependency static server for the Head On game.
// Run it, then open the printed http://localhost URL in your browser.
//
//   node server.js            # serves on http://localhost:3000
//   PORT=8080 node server.js  # pick a different port
//
// Why this exists: opening index.html directly (a file:// URL) breaks the
// ES-module <script type="module"> + THREE import in most browsers, which
// looks like the game "crashing" (black screen). Serving over http://localhost
// fixes that.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  // strip query string, default to index.html
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // resolve safely inside ROOT (block path-traversal)
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      // never cache during dev — guarantees a refresh always serves the latest
      // build (stops stale "X is not defined" errors after edits)
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('Head On dev server running:');
  console.log('  ➜  http://localhost:' + PORT + '/');
  console.log('Press Ctrl+C to stop.');
});
