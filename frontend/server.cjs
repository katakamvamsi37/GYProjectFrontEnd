const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const distPath = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 10000;

const backendUrl =
  process.env.BACKEND_URL ||
  'http://gyproject-env-1.eba-h3s8e4pe.us-east-1.elasticbeanstalk.com';

const backend = new URL(backendUrl);

const mimeTypes = {
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/**
 * Forward /api requests from the Render frontend server
 * to the AWS Elastic Beanstalk Django backend.
 *
 * Browser:
 * https://gy-project-frontend.onrender.com/api/...
 *
 * Render server:
 * http://gyproject-env-1...elasticbeanstalk.com/api/...
 */
function proxyToBackend(request, response) {
  const headers = {
    ...request.headers,

    // Django must receive the AWS hostname instead of the Render hostname.
    host: backend.hostname,

    // The original browser connection to Render is HTTPS.
    // Django is configured to trust this proxy header.
    'x-forwarded-proto': 'https',

    'x-forwarded-host': request.headers.host || '',
  };

  const proxyRequest = http.request(
    {
      hostname: backend.hostname,
      port: backend.port || 80,
      method: request.method,
      path: request.url,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(
        proxyResponse.statusCode || 500,
        proxyResponse.headers,
      );

      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on('error', (error) => {
    console.error('AWS backend proxy error:', error.message);

    if (!response.headersSent) {
      response.writeHead(502, {
        'Content-Type': 'application/json',
      });
    }

    response.end(
      JSON.stringify({
        detail: 'Unable to reach the backend server.',
      }),
    );
  });

  request.pipe(proxyRequest);
}

const server = http.createServer((request, response) => {
  /*
   * API requests
   *
   * Example:
   * /api/auth/login/
   *
   * These must go to AWS instead of React.
   */
  if (request.url === '/api' || request.url.startsWith('/api/')) {
    proxyToBackend(request, response);
    return;
  }

  /*
   * React application/static files
   */
  const requestedPath = decodeURIComponent(
    request.url.split('?')[0],
  );

  const relativePath =
    requestedPath === '/'
      ? 'index.html'
      : requestedPath.slice(1);

  const filePath = path.resolve(
    distPath,
    relativePath,
  );

  const isInsideDist =
    filePath === distPath ||
    filePath.startsWith(`${distPath}${path.sep}`);

  const targetPath =
    isInsideDist &&
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isFile()
      ? filePath
      : path.join(distPath, 'index.html');

  fs.readFile(targetPath, (error, content) => {
    if (error) {
      console.error('Static file error:', error.message);

      response.writeHead(500, {
        'Content-Type': 'text/plain',
      });

      response.end(
        'Unable to load the application.',
      );

      return;
    }

    const contentType =
      mimeTypes[path.extname(targetPath).toLowerCase()] ||
      'application/octet-stream';

    response.writeHead(200, {
      'Content-Type': contentType,
    });

    response.end(content);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(
    `Frontend server listening on port ${port}`,
  );

  console.log(
    `API proxy target: ${backend.origin}`,
  );
});
