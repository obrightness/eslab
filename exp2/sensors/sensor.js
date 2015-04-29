var tessel = require('tessel');
var bufferEqual = require('buffer-equal');


// Global Variables
var pack_size = 26; // this should match the size of tx
//
////////////////////
////     WIFI     //
////////////////////
//
//var http = require('http');
//
//var host = '220.134.54.147';
//var port = 3000;
//// send data through wifi
//// type = 'gps', 'accel'
//var sendWifi = function(data, type){
//    var opt = {
//        hostname: host,
//        port: port,
//        path: '/' + type,
//        method: 'POST'
//    };
//
//    var data_string = JSON.stringify(data);
//    console.log('sending gps data through wifi to ' + host);
//
//    request = http.request(opt, function (res) {
//        console.log('# statusCode', res.statusCode);
//        res.on('close', function(){
//            console.log('done');
//        });
//        request.on('error', function(e){
//            console.log('error!' + e.message)
//            console.log(e)
//        })
//        request.write(data);
//        request.end();
//    });
//};
//
///////////////////
////   NRF_RX    //
///////////////////
//
//// this part should be on the other tessel
//NRF = require('rf-nrf24');
pipes = [0x12345678, 0x12345679, 0x1234567A]; // gps, accel, cam
//
//
//var rx_nrf = NRF.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
//    .transmitPower('PA_MAX') // set the transmit power to max
//    .dataRate('1Mbps')
//    .crcBytes(2) // 2 byte CRC
//    .autoRetransmit({count:15, delay:4000})
//    .use(tessel.port['C']);
//
//rx_nrf._debug = false;
//var rx_nrf_handler = function(ready, name){
//    this.name = name;
//    this.ready = ready;
//    this.ident = new Buffer(this.size);
//    this.ident.fill(2);
//    this.end = new Buffer(this.size);
//    this.end.fill(3);
//    _this = this;
//    console.log('rx_nrf_handler ' + name + ' created');
//};
//
//// data will be sent when ready == 1
//// data should be a Buffer object
//// this is tx handler
//rx_nrf_handler.prototype = {
//    name: '',
//    pipe: '',
//    ready: 0,
//    size: pack_size,
//    data: '',
//    ident: '',
//    end: '',
//    state: 0, // 0: waiting, 1:pending
//    setPipe: function(pipe){
//        var tmp = pipe;
//        this.pipe = tmp;
//        this.setReady(1); 
//        console.log('nrf handler ' + this.name + ' ready.');
//    },
//    setReady: function(ready){
//        this.ready = ready;
//    },
//    handleData: function(data){
//        // copy data to buf
//        buf = new Buffer(data.length);
//        data.copy(buf);
//        // check indentify package
//        if( bufferEqual(data, this.ident) ){
//            // data start
//            console.log('start');
//            this.state = 1;
//            this.data = new Buffer(0);
//            return 0;
//        }
//        // check end package
//        if( bufferEqual(data, this.end) ){
//            if(this.state){
//                // data end
//                sendWifi(this.data, this.name);
//                this.state = 0;
//                console.log('end');
//            }
//            return 0;
//        }
//        
//        // append data
//        this.data = Buffer.concat([this.data, data]);
//        console.log('appended ' + this.data.toString());
//
//    }
//};
//var rx_nrf_gps      = new rx_nrf_handler(0, 'gps');
//var rx_nrf_accel    = new rx_nrf_handler(0, 'accel');
//var rx_nrf_cam      = new rx_nrf_handler(0, 'cam');
//
//rx_nrf.on('ready', function () {
//    console.log('rx_nrf ready');
//    pipe_gps   = rx_nrf.openPipe('rx', pipes[0], {size: pack_size});
//    pipe_accel = rx_nrf.openPipe('rx', pipes[1], {size: 26});
//    pipe_cam   = rx_nrf.openPipe('rx', pipes[2], {size: pack_size});
//    pipe_gps.on('ready', function(){
//        console.log('gps rx_nrf ready');
//        rx_nrf_gps.setPipe(pipe_gps);
//    });
//    pipe_cam.on('ready', function(){
//        console.log('cam rx_nrf ready');
//        rx_nrf_cam.setPipe(pipe_cam);
//    });  
//    pipe_gps.on('data', function(data){
//        console.log('gps on data');
//        rx_nrf_gps.handleData(data);
//    });
//    pipe_cam.on('data', function(data){
//        console.log('cam on data');
//        rx_nrf_cam.handleData(data);
//    });
//    pipe_accel.on('ready', function(){
//        console.log('accel rx_nrf ready');
//        rx_nrf_accel.setPipe(pipe_accel);
//    });
//    pipe_accel.on('data', function(data){
//        console.log('accel on data');
//        rx_nrf_accel.handleData(data);
//    });
//});
//

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
    size: pack_size,
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
        console.log('writing buf len');
        console.log(tmp.length);
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
        //console.log(this.name + ' sending data');
        var led2 = tessel.led[1].output(1);
        led2.toggle();
        setTimeout(function(){
            led2.toggle();
        }, 100);

        // send identifier
        identifier = new Buffer(this.size);
        identifier.fill(2);
        //console.log('sending identifier');
        this.writeChunk(identifier);
        //console.log('identifier done');

        _this = this;
        while(len > 0){
            var _pack = buf.slice(0, this.size);
            buf = buf.slice(this.size);
            //console.log(buf);
            //console.log(_pack);
            _this.writeChunk(_pack);
            len = buf.length;
            //console.log(len);
        }
        //console.log(_pack);
        // send end identifier
        identifier = new Buffer(this.size);
        identifier.fill(3);
        this.writeChunk(identifier);
        //console.log(this.name + ' data done');
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
gpsLib.debug = 0; // switch this to 1 for debug logs, 2 for printing out raw nmea messages
// Wait until the module is connected
gps.on('ready', function () {

    console.log('GPS module powered and ready. Waiting for satellites...');

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
//var pipes = [0xEF, 0xEE, 0xED]; // gps, accel, cam

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = false;
// handle nrf requests


nrf.on('ready', function () {
    console.log('nrf ready');
    pipe_gps = nrf.openPipe('tx', pipes[0], {autoAck: false});
    pipe_accel = nrf.openPipe('tx', pipes[1], {autoAck: false});
    pipe_cam = nrf.openPipe('tx', pipes[2], {autoAck: false});
    pipe_gps.on('ready', function(){
        console.log('gps nrf ready');
        nrf_gps.setPipe(pipe_gps);
    });
    pipe_accel.on('ready', function(){
        console.log('accel nrf ready');
        nrf_accel.setPipe(pipe_accel);
    });
    pipe_cam.on('ready', function(){
        console.log('cam nrf ready');
        nrf_cam.setPipe(pipe_cam);
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
// ACCELEROMETER //
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
        //console.log('buf ');
        //console.log(Buffer.byteLength(buf));
        nrf_accel.sendData(Buffer(JSON.stringify(data)));
    });

});

accel.on('error', function(err){
    console.log('Error:', err);
});

/// set output rate
accel.setOutputRate(1);

/////////////////  module end ///////////////////////////

// hold this process open
process.ref();

