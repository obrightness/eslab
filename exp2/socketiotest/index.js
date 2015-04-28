var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
  res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/index.html');
});


app.get('/d3', function(req, res){
  res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/d3.v3.min.js');
});

app.get('/socket', function(req, res){
  res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/socket.io-1.2.0.js');
});

io.on('connection', function(socket){
  console.log('a user connected');

    var imgname = '/Users/ling/Documents/eslab/exp2/socketiotest/001.jpg';    
    fs.readFile(imgname, 'base64', function(err, img){
	if (err) throw err;
	socket.emit('image', {content: 'data:image/jpg;base64,'+img});

    });

  var a=100;
  setInterval(
    function(){  

	socket.emit('update', {data: [{'x':a, 'y':a}, {'x':0, 'y':0}] } );
	a+=10;

    }, 100)

  setInterval(
    function(){

	socket.emit('acc',{data_acc: [{'x':a, 'y':a}, {'x':0, 'y':0}] });
   	a+=10;

    }, 100)	
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});



