var http = require('http');

var statusCode = 200;
var count = 1;

var opt = {
    hostname: '192.168.2.105',
    port: '1234',
    path: '/test',
    method: 'POST'
}
var data = {
    item1: '1',
    item2: '2'
}
setImmediate(function start () {
  console.log('http request #' + (count++))
  request = http.request(opt, function (res) {
      console.log('# statusCode', res.statusCode);
  });

  request.write(data);
  request.end();
});
