const { test } = require('@ud-viz/utils_node');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer(function (req, res) {
  console.log(req.url);
  if (req.url === '/favicon.ico') {
    res.end('okay');
  } else {
    const filePath = req.url;
    if (fs.existsSync(filePath)) {
      res.end(fs.readFileSync(filePath));
    } else {
      res.statusCode(404);
      res.end();
    }
  }
});

const port = 8000;
const host = 'localhost';

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

test.html(path.resolve(__dirname, './assets/'), port).then(() => {
  server.close();
  process.exit(0);
});
