var tessel = require('tessel');




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
var pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = false;

nrf.on('ready', function () {
    setTimeout(function(){
        nrf.printDetails();
    }, 5000);

    console.log('nrf ready');
    var tx = nrf.openPipe('tx', pipes[0], {autoAck: false}); // transmit address F0F0F0F0D2
    tx.on('ready', function () {
        setInterval(function () {
            var b = new Buffer(4); // set buff len of 8 for compat with maniac bug's RF24 lib
            b.fill(0);
            b.writeUInt32BE(1);
            console.log("Sending", 1);
            tx.write(b);
        }, 5e3); // transmit every 5 seconds
    });
});
    // hold this process open
process.ref();

/////////////////
//   NRF_TMP   //
/////////////////
NRF = require('rf-nrf24');
pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];
var nrf_ready = 0;

var nrf_rx = NRF.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['D']);

    nrf_rx._debug = false;

    nrf_rx.on('ready', function () {
        nrf_ready = 1;

       });

var sendGPSData = function(data){

    var rx = nrf_rx.openPipe('rx', pipes[0], {size: 4});  
    rx.on('data', function (d) {
        console.log("Got data:",  d);
        console.log('Sending to wifi...');
    });
    
};
// hold this process open
process.ref();

// paste this code to another file and run on another tessel

/////////////////
//     CAM     //
/////////////////
var camera = require('camera-vc0706').use(tessel.port['B']);

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

// Wait for the camera module to say it's ready
camera.on('ready', function() {
    notificationLED.high();
    // Take the picture
    camera.takePicture(function(err, image) {
        if (err) {
            console.log('error taking image', err);
        } else {
            notificationLED.low();
            // Name the image
            var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
            // Save the image
            console.log('Picture saving as', name, '...');
            process.sendfile(name, image);
            console.log('done.');
            // Turn the camera off to end the script
            camera.disable();
        }
    });
});

camera.on('error', function(err) {
    console.error(err);
});

//////////////////
// ACCLEROMETER //
//////////////////
var accel = require('accel-mma84').use(tessel.port['D']);

// Initialize the accelerometer.
accel.on('ready', function () {
    // Stream accelerometer data
    accel.on('data', function (xyz) {
        console.log('x:', xyz[0].toFixed(2),
            'y:', xyz[1].toFixed(2),
            'z:', xyz[2].toFixed(2));
    });

});

accel.on('error', function(err){
    console.log('Error:', err);
});

/// set output rate
accel.setOutputRate(2);


//////////////////
// ACCLEROMETER //
//////////////////
