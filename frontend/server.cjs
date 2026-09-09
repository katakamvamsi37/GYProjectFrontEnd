const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const distPath = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 10000;
const mimeTypes = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const server = http.createServer((request, response) => {
  const requestedPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = path.resolve(distPath, relativePath);
  const isInsideDist = filePath === distPath || filePath.startsWith(`${distPath}${path.sep}`);
  const targetPath = isInsideDist && fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(distPath, 'index.html');

  fs.readFile(targetPath, (error, content) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Unable to load the application.');
      return;
    }
    const contentType = mimeTypes[path.extname(targetPath)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${port}`);
});
