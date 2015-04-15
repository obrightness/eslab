var http = require('http');

var statusCode = 200;
var count = 1;

var opt = {
    hostname: '192.168.2.106',
    port: 1234,
    path: '/test',
    method: 'POST'
};
var data = JSON.stringify({
    'item1' : '1',
    'item2' : '2'
});
setImmediate(function start () {
  console.log('http request #' + (count++))
  request = http.request(opt, function (res) {
      console.log('# statusCode', res.statusCode);
      res.on('close', function(){
        console.log('done');
        setImmediate(start)});
  });

  request.on('error', function(e){
    console.log('error!' + e.message)
    console.log(e)
  })
  request.write(data);
  request.end();
});

