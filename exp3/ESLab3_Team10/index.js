var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// global

var humid = 0;
app.get('/humid', function(req, res){
    console.log("on data");
    humid = parseInt(req.query.data);
    res.end();
});





///////////////////////////// Web server/////////////////////
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
  //res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/index.html');
});


app.get('/d3', function(req, res){
    res.sendFile(path.join(__dirname, 'd3.v3.min.js'));
  //res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/d3.v3.min.js');
});

app.get('/gauge', function(req, res){
    res.sendFile(path.join(__dirname, 'gauge.js'));
  //res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/d3.v3.min.js');
});

app.get('/socket', function(req, res){
    res.sendFile(path.join(__dirname, 'socket.io-1.2.0.js'));
  //res.sendFile('/Users/ling/Documents/eslab/exp2/socketiotest/socket.io-1.2.0.js');
});
app.get('/img', function(req, res){
    var img_name = 'img0.jpg'; 
    res.sendFile(path.join(__dirname, img_name));
});

io.on('connection', function(socket){
  console.log('a user connected');

    //var imgname = '/Users/ling/Documents/eslab/exp2/socketiotest/001.jpg';    

 
  setInterval(
    function(){

        socket.emit('update', humid);

    }, 1000);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

