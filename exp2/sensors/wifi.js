tessel = require('tessel');
bufferEqual = require('buffer-equal');


// Global Variables
var pack_size = 26; // this should match the size of tx

//////////////////
//     WIFI     //
//////////////////

var http = require('http');

var host = '220.134.54.147';
var port = 3000;
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
    console.log('sending ' + type + ' data through wifi to ' + host);

    request = http.request(opt, function (res) {
        console.log('# statusCode', res.statusCode);
        res.on('close', function(){
            console.log('done');
        });
        request.on('error', function(e){
            console.log('error!' + e.message)
            console.log(e)
        })
        request.write(data);
        request.end();
    });
};
/*
/////////////////
//   NRF_RX    //
/////////////////

// this part should be on the other tessel
NRF = require('rf-nrf24');
pipes = [0x12345678, 0x79, 0x7A]; // gps, accel, cam


var rx_nrf = NRF.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

rx_nrf._debug = false;
var rx_nrf_handler = function(ready, name){
    this.name = name;
    this.ready = ready;
    this.ident = new Buffer(this.size);
    this.ident.fill(2);
    this.end = new Buffer(this.size);
    this.end.fill(3);
    _this = this;
    console.log('rx_nrf_handler ' + name + ' created');
};

// data will be sent when ready == 1
// data should be a Buffer object
// this is tx handler
rx_nrf_handler.prototype = {
    pipe: '',
    ready: 0,
    size: pack_size,
    ident: '',
    end: '',
    state: 0, // 0: waiting, 1:pending
    setPipe: function(pipe){
        this.pipe = pipe;
        this.setReady(1); 
        console.log('nrf handler ' + this.name + ' ready.');
    },
    setReady: function(ready){
        this.ready = ready;
    },
    handleData: function(data){
        // copy data to buf
        buf = new Buffer(data.length);
        data.copy(buf);
        // check indentify package
        if( bufferEqual(data, this.ident) ){
            // data start
            console.log('start');
            this.state = 1;
            this.data = new Buffer(0);
            return 0;
        }
        // check end package
        if( bufferEqual(data, this.end) ){
            if(this.state){
                // data end
                sendWifi(this.data, this.name);
                this.state = 0;
                console.log('end');
            }
            return 0;
        }
        
        // append data
        if(this.state){
            this.data = Buffer.concat([this.data, data]);
            console.log('appended ' + this.data.toString());
        }

    }
};
var rx_nrf_gps      = new rx_nrf_handler(0, 'gps');
var rx_nrf_accel    = new rx_nrf_handler(0, 'accel');
var rx_nrf_cam      = new rx_nrf_handler(0, 'cam');

rx_nrf.on('ready', function () {
    console.log('rx_nrf ready');
    pipe_gps   = rx_nrf.openPipe('rx', pipes[0], {size: pack_size});
    console.log('pipe 1 opened');
    pipe_accel = rx_nrf.openPipe('rx', pipes[1], {size: 26});
    console.log('pipe 2 opened');
    pipe_cam   = rx_nrf.openPipe('rx', pipes[2], {size: pack_size});
    console.log('pipe 3 opened');
    pipe_gps.on('ready', function(){
        console.log('gps rx_nrf ready');
        rx_nrf_gps.setPipe(pipe_gps);
    });
    pipe_accel.on('ready', function(){
        console.log('accel rx_nrf ready');
        rx_nrf_accel.setPipe(pipe_accel);
    });
    pipe_cam.on('ready', function(){
        console.log('cam rx_nrf ready');
        rx_nrf_cam.setPipe(pipe_cam);
    });  
    pipe_gps.on('data', function(data){
        console.log('gps on data');
        rx_nrf_gps.handleData(data);
    });
    pipe_accel.on('data', function(data){
        console.log('accel on data');
        rx_nrf_accel.handleData(data);
    });
    pipe_cam.on('data', function(data){
        console.log('cam on data');
        rx_nrf_cam.handleData(data);
    });
});
*/
// hold this process open
process.ref();


