var http = require('http');
var fs = require('fs');

// For using Redis with Node.js
// See https://github.com/mranney/node_redis
// Use `npm` command to install the package
// Like this: `npm install redis`
//
// See for what Redis can do
// http://redis.io/topics/data-types-intro
var redis = require('redis');
var redis_client = redis.createClient();


var getRequestHandler = function (req, res) {
  console.log('Got HTTP GET Request');
  res.writeHeader(200, { 'Content-Type': 'text/html' });
  res.write(fs.readFileSync('client.html'));
  res.end();
};

var postRequestHandler = function (req, res) {
  console.log('Got HTTP POST Request to ' + req.url);

  if (req.url === '/push') {

    var post_request_body = '';

    req.on('data', function (data) {
	console.log(data);
      post_request_body += data;
    });

    req.on('end', function (data) {
      redis_client.lpush('all:comments', post_request_body, function(err, repl){
        if (err) {
          res.writeHeader(500, { 'Content-Type': 'text/plain' });
          res.write('Internal Server Error');
          res.end();
        } else {
          res.writeHeader(200, { 'Content-Type': 'text/html' });
          res.write('OK');
          res.end();
        }
      });
    });

  } else if (req.url === '/retrieve') {

    redis_client.lrange('all:comments', 0, -1, function(err, repl){
      if (err) {
        console.log('Error when reading from Redis', err);
        res.writeHeader(500, { 'Content-Type': 'text/plain' });
        res.write('Internal Server Error');
        res.end();
      } else {
        res.writeHeader(200, { 'Content-Type': 'application/javascript' });
        res.write(JSON.stringify(repl));
        res.end();
      }
    });

  }
};

var server = http.createServer(function (req, res) {
  if (req.method === 'GET') {
    getRequestHandler(req, res);
  } else if (req.method === 'POST') {
    postRequestHandler(req, res);
  }
});

server.listen(1234, '127.0.0.1');
console.log('Server waiting for connection at http://127.0.0.1:1234/');
