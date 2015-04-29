var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var redis = require('redis');
var client = redis.createClient();
var path = require('path');
// global
var data = '';
var gps_data = {"Lat":25.017, "Lng":121.544};

///////////////////////////// Data Retrieve//////////////////


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
// emit corresponded event
function emitEvent(ev){
    if(ev === 'acc'){
        client.lrange('acc', -20, -1, function(err, repl){
            var list = [];
            console.log(repl);
            for(var i=0; i<repl.length; ++i){
                console.log(JSON.stringify(JSON.parse(repl[i])));
                list.push(JSON.parse(repl[i]));
            }
            data = {"data":repl};
        });
    }
}

setImmediate(function(){
    emitEvent('acc');

});

// handle post request from tessel board
app.post('/gps', function(req, res){
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
            res.end();
            return;
        }
        gps_data = json;
        res.send('ok');
        res.end();
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
            res.end();
            return;
        }
        client.lpush('acc', JSON.stringify(json));
        res.send('ok');
        res.end();
        emitEvent('acc');
    });

});

app.post('/cam', function(req, res){
    //var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
    var name = 'img0.jpg'
    var f=fs.createWriteStream(name);
    req.on('data', function(data){
        f.write(data);
    });
    req.on('end', function(){
        //client.lpush('cam', [client.llen('gps'), name] );
        f.end();
        emitEvent('cam');
    });

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
        if(data.length == 0){
            return;
        }
	    socket.emit('acc', data );

    }, 1000)

  setInterval(
    function(){
        if(gps_data.length == 0){
            return;
        }

        socket.emit('update', gps_data);

    }, 1000);
  setInterval(function(){

    var imgname = path.join(__dirname, 'img0.jpg');
    fs.readFile(imgname, 'base64', function(err, img){
	    if (err) return;
        socket.emit('image', {content: 'data:image/jpg;base64'+img});
    });
  }, 5000);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

