var http = require('http');

var redis = require('redis');
var redis_client = redis.createClient();


var postRequestHandler = function (req, res) {
  console.log('Got HTTP POST Request to ' + req.url);

  if (req.url === '/test') {
     
    console.log('test');
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
          res.writeHeader(200, {'Content-Type': 'text/html'});
          res.write('OK');
          res.end();
        }
      });
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

server.listen(1234, '0.0.0.0');
console.log('Server waiting for connection at http://0.0.0.0:1234/');


