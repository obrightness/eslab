var tessel = require('tessel');

/////////////////////
//      Classes  ////
/////////////////////

var nrf_handler = function(ready, name){
    this.name = name;
    this.ready = ready;
    _this = this;
    console.log('nrf_handler ' + name + ' created');
};
// data will be sent when ready == 1
// data should be a Buffer object
// this is tx handler
nrf_handler.prototype = {
    pipe: '',
    ready: 0,
    size: 26,
    setPipe: function(pipe){
        this.pipe = pipe;
        console.log('nrf handler ' + this.name + ' ready.');
        this.ready = 1;
    },
    setReady: function(ready){
        this.ready = ready;
    },
    writeChunk: function(chunk){
        _this = this;
        var tmp = new Buffer(chunk.length);
        chunk.copy(tmp);
        _this.pipe.write(tmp);
        //return function(){
        //    _this.pipe.write(tmp);
        //}
    },    
    sendData: function(data){
        if(this.ready != 1){
            console.log(this.name+' not ready');
            return 1;
        }
        // check empty buffer
        if(data.length == 0){
            console.log(this.name + ' empty data !');
            return 1;
        }
        console.log(this.name + ' try to send:' + data.toString());
        // copy data to buf
        // buf.copy(new_buf) does not make new_buf shrink
        len = data.length; 
        var buf = new Buffer((this.size)*(Math.ceil(len/this.size)));
        buf.fill(0);
        data.copy(buf);
        // now buf size is multiple of this.size with 0 append at end

        // send data
        console.log(this.name + ' sending data');

        // send identifier
        identifier = new Buffer(this.size);
        identifier.fill(2);
        console.log('sending identifier');
        this.writeChunk(identifier);
        console.log('identifier done');
        identifier.fill(3);

        _this = this;
        while(len > 0){
            var _pack = buf.slice(0, this.size);
            buf = buf.slice(this.size);
            console.log(buf);
            console.log(_pack);
            _this.writeChunk(_pack);
            len = buf.length;
            console.log(len);
        }
        console.log(_pack);
        // send end identifier
        identifier = new Buffer(this.size);
        identifier.fill(1);
        this.pipe.write(identifier);
        console.log(this.name + ' data done');
    }
};
/////////////////// end class///////////////////////

// Global Variables
var nrf_gps     = new nrf_handler(0, 'gps');
var nrf_accel   = new nrf_handler(0, 'accel');
var nrf_cam     = new nrf_handler(0, 'cam');

/////////////////
//     GPS     //
/////////////////
var gpsLib = require('gps-a2235h');
// we use Port C because it is port most isolated from RF noise
var gps = gpsLib.use(tessel.port['C']); 
console.log('GPS module powered and ready. Waiting for satellites...');
gpsLib.debug = 0; // switch this to 1 for debug logs, 2 for printing out raw nmea messages
// Wait until the module is connected
gps.on('ready', function () {


    // Emit coordinates when we get a coordinate fix
    gps.on('coordinates', function (coords) {
        console.log('Lat:', coords.lat, '\tLon:', coords.lon, '\tTimestamp:', coords.timestamp);
        var data = {
            'Lat' : coords.lat,
            'Lon' : coords.lon
        };
        nrf_gps.sendData(Buffer(JSON.stringify(data)));
    });

    gps.on('dropped', function(){
        // we dropped the gps signal
        console.log("gps signal dropped");
    });
});

gps.on('error', function(err){
    console.log("got this error", err);
});


/////////////////
//     NRF     //
/////////////////
var NRF24 = require('rf-nrf24');
var pipes = [0xEF, 0xEE, 0xED]; // gps, accel, cam

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = true;
// handle nrf requests


nrf.on('ready', function () {
    console.log('nrf ready');
    pipe_gps = nrf.openPipe('tx', pipes[0], {autoAck: true});
    pipe_accel = nrf.openPipe('tx', pipes[1], {autoAck: true});
    pipe_cam = nrf.openPipe('tx', pipes[2], {autoAck: true});
    pipe_gps.on('ready', function(){
        console.log('gps nrf ready');
        nrf_gps.setPipe(pipe_gps);
    });
    pipe_accel.on('ready', function(){
        console.log('accel nrf ready');
        nrf_accel.setPipe(pipe_gps);
    });
    pipe_cam.on('ready', function(){
        console.log('cam nrf ready');
        nrf_cam.setPipe(pipe_gps);
    });
});



/////////////////
//     CAM     //
/////////////////
var camera = require('camera-vc0706').use(tessel.port['B']);

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

// Wait for the camera module to say it's ready
camera.on('ready', function() {
    notificationLED.high();
    console.log('Cam Ready');
    // Take the picture
});

camera.on('error', function(err) {
    console.error(err);
});

// Take Picture when button is pressed
tessel.button.on('press', function(time){
    camera.takePicture(function(err, image) {
        if (err) {
            console.log('error taking image', err);
        } else {
            notificationLED.low();
            // Send the image
            console.log('Picture taken!');
            nrf_cam.sendData(image);
            console.log('Picture done.');
        }
    });
});

//////////////////
// ACCLEROMETER //
//////////////////
var accel = require('accel-mma84').use(tessel.port['D']);

// Initialize the accelerometer.
accel.on('ready', function () {
    console.log('Accelerometer ready');
    // Stream accelerometer data
    accel.on('data', function (xyz) {
        var data = {
            'x': xyz[0].toFixed(2),
            'y': xyz[1].toFixed(2),
        };
        var buf = JSON.stringify(data);
        console.log('buf ');
        console.log(Buffer.byteLength(buf));
        nrf_accel.sendData(Buffer(JSON.stringify(data)));
    });

});

accel.on('error', function(err){
    console.log('Error:', err);
});

/// set output rate
accel.setOutputRate(2);

/////////////////  module end ///////////////////////////

// hold this process open
process.ref();

