var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');

//var points = {
  //               x: 1,y: 1
//                 x: 5,y: 2,
  //               x: 6,y: 9,
    //             x: 10,y: 12
  //          };
//var data = JSON.stringify(points);

// handle post request from tessel board
app.post('/gps', function(req, res){
    var data_all = '';
    req.on('data', function(data){
        data_all += data.toString();
    });
    req.on('end', function(){
        redis.lpush('gps', data_all );
    });

});


app.post('/accel', function(req, res){
    var data_all = '';
    req.on('data', function(data){
        data_all += data.toString();
    });
    req.on('end', function(){
        redis.lpush('accel', data_all );
    });

});

app.post('/cam', function(req, res){
    var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
    var f=fs.createWriteStream(name);
    req.on('data', function(data){
        f.write(data);
    });
    req.on('end', function(){
        redis.lpush('cam', [redis.llen('gps'), name] );
        f.end();
    });

});


// handle request from browserkk
app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('update', function(data){
  	console.log(data);
	io.emit('update', data);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});



