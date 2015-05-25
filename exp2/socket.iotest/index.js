var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var client = redis.createClient();

//var points = {
  //               x: 1,y: 1
//                 x: 5,y: 2,
  //               x: 6,y: 9,
    //             x: 10,y: 12
  //          };
//var data = JSON.stringify(points);

// truncate padding zeros
var handleData = function(data){
    var idx = data.length-1;
    while(data[idx]==0){
        idx--;
    }
    return data.slice(0, idx+1);
}
function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object", 
        // so we must check for that, too.
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }

    return false;
};
// handle post request from tessel board
app.post('/gps', function(req, res){
    var data_all = '';
    req.on('data', function(data){
        data_all += data.toString();
    });
    req.on('end', function(){
        client.lpush('gps', data_all );
    });

});

//app.post('/accel', function(req, res){
//    req.on('data', function(data){
//        console.log('get data :');
//        console.log(data);
//    });
//    req.on('end', function(){
//        console.log('data end');
//        res.send('ok!');
//        res.end();
//    });
//});

app.post('/accel', function(req, res){
    var data_all = new Buffer(0);
    req.on('data', function(data){
        data_all = Buffer.concat([data_all, data]);
    });
    req.on('end', function(){
        console.log(data_all);
        data_all = handleData(data_all);
        console.log(data_all);
        var json = tryParseJSON(data_all.toString());
        if( json == false ){
            return;
        }
        client.lpush('accel', json);
        res.send('ok');
        res.end();
    });

});

app.post('/cam', function(req, res){
    var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
    var f=fs.createWriteStream(name);
    req.on('data', function(data){
        f.write(data);
    });
    req.on('end', function(){
        client.lpush('cam', [client.llen('gps'), name] );
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



