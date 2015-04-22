var tessel = require('tessel');

// Global Variables
var nrf_gps     = new nrfHandler(0, 'gps');
var nrf_accel   = new nrfHandler(0, 'accel');
var nrf_cam     = new nrfHandler(0, 'cam');

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
var pipes = [0xF0F0F0F0E1, 0xF0F0F0F0E2, 0xF0F0F0F0E3]; // gps, accel, cam

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = false;
// handle nrf requests
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
    size: 32,
    setPipe: function(pipe){
        this.pipe = pipe;
        pipe.on('ready', function(){
            _this.setReady(1); 
            console.log('nrf handler ' + this.name + ' ready.');
        });
    },
    setReady: function(ready){
        this.ready = ready;
    },
    sendData: function(data){
        if(this.rea)y != 1){)
            return 1;
        }
        // copy data to buf
        data.copy(buf)
        // Make buf size be multiple of size
        len = data.length;
        div = Math.floor(len/size);
        block = new Buffer(len-div*size);
        buf = Buffer.concat([buf, block]);
        // send data
        console.log(this.name + ' sending data');

        // send identifier
        identifier = new Buffer(size);
        identifier.fill(0);
        this.pipe.write(identifier);
        while(len != 0){
            pack = buf.slice(0, size);
            buf = buf.slice(size);
            this.pipe.write(pack);
            len = buf.length;
        }
        // send end identifier
        identifier = new Buffer(size);
        identifier.fill(1);
        this.pipe.write(identifier);
    },

};

nrf.on('ready', function () {
    console.log('nrf ready');
    nrf_gps.setPipe(nrf.openPipe('tx', pipes[0], {autoAck: false}));
    nrf_accel.setPipe(nrf.openPipe('tx', pipes[1], {autoAck: false}));
    nrf_cam.setPipe(nrf.openPipe('tx', pipes[2], {autoAck: false}));
});



/////////////////
//     CAM     //
/////////////////
var camera = require('camera-vc0706').use(tessel.port['B']);

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

// Wait for the camera module to say it's ready
camera.on('ready', function() {
    notificationLED.high();
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
    // Stream accelerometer data
    accel.on('data', function (xyz) {
        var data = {
            'x:', xyz[0].toFixed(2),
            'y:', xyz[1].toFixed(2),
            'z:', xyz[2].toFixed(2))
        };
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


////////////////// for other tessel board ////////////////////

// tessel = require('tessel');

// Global Variables
var pack_size = 32; // this should match the size of tx

//////////////////
//     WIFI     //
//////////////////

var http = require('http');

var host = '192.168.2.106';
var port = 1234;
// send data through wifi
// type = 'gps', 'accel'
var sendWifi = function(data, type){
    var opt = {
        hostname: host,
        port: port,
        path: '/' + type,
        method: 'POST'
    };

    var data_string = JSON.stringify(data);
    console.log('sending gps data through wifi to ' + host);

    request = http.request(opt, function (res) {
        console.log('# statusCode', res.statusCode);
        res.on('close', function(){
            console.log('done');
        )};
        request.on('error', function(e){
            console.log('error!' + e.message)
            console.log(e)
        })
        request.write(data);
        request.end();
    };
};

/////////////////
//   NRF_TMP   //
/////////////////

// this part should be on the other tessel
NRF = require('rf-nrf24');
pipes = [0xF0F0F0F0E1, 0xF0F0F0F0E2, 0xF0F0F0F0E3]; // gps, accel, cam

var rx_nrf_gps      = new nrf_handler(0, 'gps');
var rx_nrf_accel    = new nrf_handler(0, 'accel');
var rx_nrf_cam      = new nrf_handler(0, 'cam');

var nrf_rx = NRF.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['D']);

nrf_rx._debug = false;

var nrf_handler = function(ready, name){
    this.name = name;
    this.ready = ready;
    this.ident = new Buffer(this.size);
    this.ident.fill(0);
    this.end = new Buffer(this.size);
    this.end.fill(1);
    _this = this;
    console.log('rx_nrf_handler ' + name + ' created');
};

// data will be sent when ready == 1
// data should be a Buffer object
// this is tx handler
nrf_handler.prototype = {
    name: '',
    pipe: '',
    ready: 0,
    size: pack_size,
    data: '',
    ident: '',
    end: '',
    setPipe: function(pipe){
        this.pipe = pipe;
        pipe.on('ready', function(){
            _this.setReady(1); 
            console.log('nrf handler ' + this.name + ' ready.');
        });
        pipe.on('data', function(data){
            this.handleData(data);
        });
    },
    setReady: function(ready){
        this.ready = ready;
    },
    handleData: function(data){
        // copy data to buf
        data.copy(buf)
        // check indentify package
        if( bufferEqual(data, ident) ){
            // data start
            this.data = new Buffer();
            return 0;
        }
        // check end package
        if( bufferEqual(data, end) ){
            // data end
            sendWifi(this.data, this.name);
        
        // append data
        this.data = Buffer.concat(this.data, data);

        }
    }
};

nrf_rx.on('ready', function () {
    console.log('nrf ready');
    nrf_gps.setPipe(nrf.openPipe('tx', pipes[0], {autoAck: false}));
    nrf_accel.setPipe(nrf.openPipe('tx', pipes[1], {autoAck: false}));
    nrf_cam.setPipe(nrf.openPipe('tx', pipes[2], {autoAck: false}));
});

// hold this process open
process.ref();


