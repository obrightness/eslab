var tessel = require('tessel'),
    NRF24 = require('rf-nrf24'),
    pipes = [0xEF, 0xEE],
    role = 'pong'; // swap this to pong if you want to wait for receive
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
    pack: null,
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

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
.autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = false;

nrf.on('ready', function () {
    var led2 = tessel.led[1].output(1);
    console.log("PONG back");
    var rx = nrf.openPipe('rx', pipes[1], {size:26});  
    rx.on('data', function (d) {
        led2.toggle();
        setTimeout(function(){
            led2.toggle();
        }, 100);
        console.log("Got data, will respond", d);
    });
});

var nrf_handler_tx = new nrf_handler(0, 'tx');
var nrf_tx = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
.autoRetransmit({count:15, delay:4000})
    .use(tessel.port['C']);

    nrf_tx._debug = false;


    console.log("PING out");

nrf_tx.on('ready', function () {
    var tx = nrf_tx.openPipe('tx', pipes[1], {autoAck: false}); // transmit address F0F0F0F0D2
    tx.on('ready', function () {
        var led1 = tessel.led[0].output(1);
        nrf_handler_tx.setPipe(tx);
        data = new Buffer('{"x":1, "y":2}');
        nrf_handler_tx.sendData(data);
        nrf_handler_tx.sendData(data);
        nrf_handler_tx.sendData(data);
        nrf_handler_tx.sendData(data);
    });
    
});
// hold this process open
// process.ref();
// hold this process open
// process.ref();
