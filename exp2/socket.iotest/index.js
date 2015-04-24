var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//var points = {
  //               x: 1,y: 1
//                 x: 5,y: 2,
  //               x: 6,y: 9,
    //             x: 10,y: 12
  //          };
//var data = JSON.stringify(points);

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



