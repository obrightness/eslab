var tessel = require('tessel'),
    NRF24 = require('rf-nrf24'),
    pipes = [0xEF, 0xEE],
    role = 'pong'; // swap this to pong if you want to wait for receive

var bufferEqual = require('buffer-equal');
var pack_size = 26;
var nrf_handler = function(ready, name){
    this.name = name;
    this.ready = ready;
    this.ident = new Buffer(this.size);
    this.ident.fill(2);
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
        this.data = Buffer.concat([this.data, data]);
        console.log('appended ' + this.data.toString());

    }
};
var sendWifi = function(data, name){
    console.log(name + ' try to send :');
    console.log(data);
}
var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
.autoRetransmit({count:15, delay:4000})
    .use(tessel.port['A']);

nrf._debug = false;

var nrf_handler_rx = new nrf_handler(0, 'rx');

nrf.on('ready', function () {
    var led2 = tessel.led[1].output(1);
    console.log("PONG back");
    var rx = nrf.openPipe('rx', pipes[1], {size:26});  
    rx.on('ready', function(){
        nrf_handler_rx.setPipe(rx);
    })
    rx.on('data', function (d) {
        led2.toggle();
        setTimeout(function(){
            led2.toggle();
        }, 100);
        console.log('data coming ');
        console.log(Buffer.isBuffer(d));
        nrf_handler_rx.handleData(d);
    });
});

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
        setInterval(function(){
        var pre = new Buffer(26);
        pre.fill(2);
        tx.write(pre);
        data = new Buffer(26);
        data.fill(0);
        data.write('{"x":1, "y":2}');
        tx.write(data);
        var end = new Buffer(26);
        end.fill(1);
        tx.write(end);
        }, 1000);
    });
    
});
// hold this process open
// process.ref();
// hold this process open
// process.ref();
