var tessel = require('tessel');
var climatelib = require('climate-si7020');
var http = require('http');

var climate = climatelib.use(tessel.port['A']);
var relayReady = 0;


climate.on('ready', function () {
  console.log('Connected to si7020');

  // Loop forever
  setImmediate(function loop () {
      climate.readHumidity(function (err, humid) {
          sendWifi(humid.toFixed(2));
          console.log('Humidity: ', humid.toFixed(4) + '%RH');
          if(humid < 73){
              console.log(relayReady);	
              if(relayReady == 1){	
                  relay.turnOn(1, function toggleOnResult(err) {
                      if (err) console.log("Err toggling 1", err);
                  }); 
              }
          }
          else {
              if(relayReady == 1){
                  relay.turnOff(1, function toggleOffResult(err){});
              }
          }
      setTimeout(loop, 1000);
      });
  });
});


climate.on('error', function(err) {
  console.log('error connecting module', err);
});



var relaylib = require('relay-mono');
var relay = relaylib.use(tessel.port['C']);  

// Wait for the module to connect
relay.on('ready', function relaReady () {
  console.log('Ready! Toggling relays...');
  relayReady = 1;
});
// WIFI

function sendWifi(data){
    console.log("sending");
    http.get("http://220.134.54.147:3000/humid?data=" + data.toString(), function(res){
        console.log("Send!" + data);
        res.on('data', function(){
            console.log('on data');
        });
        res.on('end', function(){
            console.log('edn');
        });
    })
};
