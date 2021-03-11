// This is an absolute minimal static webserver
// Sends CSP headers
// Used to serve a page that loads the built widget and check for CSP complaints

const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

const serverName = `http://localhost:${PORT}`;
const documentRoot = path.join(__dirname, '../..'); // Serve from the root(!) of the project

const determineContentType = pathName => { 
  const extension = Object.keys(mimeTypes).find( ext => pathName.endsWith(ext) );
  return mimeTypes[extension] || 'application/octet-stream';
};

const server = http.createServer( (req, res) => {
  let pathName = req.url === '/' ? '/test/csp-test/index.html' : new URL(req.url, serverName).pathname;
  const contentType = determineContentType(pathName);

  res.setHeader('content-type', contentType);
  res.setHeader('content-security-policy', `script-src ${serverName}`);
  fs.readFile(`${documentRoot}${pathName}`, (err, data) => {
    if (err) {
      console.log(err);
      res.writeHead(404);
      res.end(`Not Found: [${pathName}]`);
      return;
    }

    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`CSP test server running on ${serverName}`) );

