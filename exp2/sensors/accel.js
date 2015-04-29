//
var tessel = require('tessel');
var pipes = [0x12345678, 0x12345679]
var pack_size = 26;
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
        var tmp = new Buffer(chunk.length);
        chunk.copy(tmp);
        this.pipe.write(tmp);
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
        var identifier = new Buffer(this.size);
        identifier.fill(2);
        //console.log('sending identifier');
        this.writeChunk(identifier);
        //console.log('identifier done');
        identifier.fill(3);

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
        identifier.fill(1);
        this.pipe.write(identifier);
        //console.log(this.name + ' data done');

    }
};
/////////////////// end class///////////////////////

///////////////
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

var nrf_accel = new nrf_handler(0, 'accel');

nrf.on('ready', function () {
    console.log('nrf ready');
    pipe_accel = nrf.openPipe('tx', 0x12345678, {autoAck: false});
    
    pipe_accel.on('ready', function(){
        console.log('accel nrf ready');
        nrf_accel.setPipe(pipe_accel);
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

