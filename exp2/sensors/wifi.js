tessel = require('tessel');
bufferEqual = require('buffer-equal');


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
        });
        request.on('error', function(e){
            console.log('error!' + e.message)
            console.log(e)
        })
        request.write(data);
        request.end();
    });
};

/////////////////
//   NRF_TMP   //
/////////////////

// this part should be on the other tessel
NRF = require('rf-nrf24');
pipes = [0xEF, 0xEE, 0xED]; // gps, accel, cam


var rx_nrf = NRF.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    .autoRetransmit({count:15, delay:4000})
    .use(tessel.port['D']);

rx_nrf._debug = false;

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
            console.log(this.name + ' get data');
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
var nrf_gps      = new nrf_handler(0, 'gps');
var nrf_accel    = new nrf_handler(0, 'accel');
var nrf_cam      = new nrf_handler(0, 'cam');

rx_nrf.on('ready', function () {
    console.log('nrf ready');
    pipe_gps = rx_nrf.openPipe('rx', pipes[0], {autoAck: true});
    pipe_accel = rx_nrf.openPipe('rx', pipes[1], {autoAck: true});
    pipe_cam = rx_nrf.openPipe('rx', pipes[2], {autoAck: true});
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

// hold this process open
process.ref();


