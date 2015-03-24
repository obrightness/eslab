var http = require('http');
var fs = require('fs');
var cookie = require('cookies');

// For using Redis with Node.js
// See https://github.com/mranney/node_redis
// Use `npm` command to install the package
// Like this: `npm install redis`
//
// See for what Redis can do
// http://redis.io/topics/data-types-intro
var redis = require('redis');
var redis_client = redis.createClient();
var redis_user = redis.createClient();
//redis.debug_mode = true;
redis_user.on('connect', function(){
    redis_user.set('admin', 'pwd');
    redis_user.set('Bob', 'pwd');
    redis_user.set('Alice', 'pwd');
    redis_user.set('Dan', 'pwd');

});



var getRequestHandler = function (req, res) {
    console.log('Got HTTP GET Request' + req.url);
    var type = Object.prototype.toString.call(req.url);
    console.log('url = ' + type);
    if( req.url === '/'){

        res.writeHeader(200, { 'Content-Type': 'text/html' });
        res.write(fs.readFileSync('client.html'));
        res.end();
    }else if ( req.url.lastIndexOf('/retrieve', 0) === 0 ) {
        console.log('retrieve!');
        var num = Number(req.url.substring(10));
        var type = Object.prototype.toString.call(num);
        console.log('num = ' + type);
        redis_client.lrange('all:comments', 0, num-1 , function(err, repl){
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

var postRequestHandler = function (req, res) {
  console.log('Got HTTP POST Request to ' + req.url);

  if (req.url === '/push') {
     
    console.log('push!');
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

  } else if(req.url === '/login' ){
      console.log('login!');

      var info, username, pwd;
      req.on('data', function(data){
        console.log(data);
        info = data.toString().split(';');
        console.log(info);
        username = info[0].toString().substring(9);
        pwd = info[1].toString().substring(5);
        console.log(info);
      });
      req.on('end', function(data){
          console.log(username + ' try to login');
          redis_user.get(username, function(err, reply){
              if( reply == null ){

                  console.log( username + ' not exist!!');
                  res.writeHeader(500, { 'Content-Type': 'text/plain' });
                  res.write('Internal Server Error');
                  res.end();
              }else{
                  if( reply == pwd ){
                      console.log( username + ' login successful with pwd: ' + pwd);
                      res.writeHeader(200, {  'Set-Cookie': 'login=yes;username=' + username , 'Content-Type': 'text/html'});
                      console.log('Cookie Set');
                      res.write('OK');
                      res.end();
                  }else{

                      console.log( 'password: ' + pwd + ' incorrect!');
                      res.writeHeader(500, { 'Content-Type': 'text/plain' });
                      res.write('Internal Server Error');
                      res.end();

                  }
              }
          });
      });
  }else{
    console.log('undefined ' + req.url);
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


