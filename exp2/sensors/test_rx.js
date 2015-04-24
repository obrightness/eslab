var tessel = require('tessel'),
    NRF24 = require('rf-nrf24'),
    pipes = [0xEF, 0xEE],
    role = 'pong'; // swap this to pong if you want to wait for receive

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

        if (role === 'ping') {
            console.log("PING out");

            var tx = nrf.openPipe('tx', pipes[0], {autoAck: false}), // transmit address F0F0F0F0D2
        rx = nrf.openPipe('rx', pipes[1], {size: 4}); // receive address F0F0F0F0D2
    tx.on('ready', function () {
        var n = 0;
        setInterval(function () {
            var b = new Buffer(4); // set buff len of 8 for compat with maniac bug's RF24 lib
            b.fill(0);
            b.writeUInt32BE(n++);
            console.log("Sending", n);
            tx.write(b);
        }, 5e3); // transmit every 5 seconds
    });
    rx.on('data', function (d) {
        console.log("Got response back:", d);
    });
        } else {
            var led2 = tessel.led[1].output(1);
            console.log("PONG back");
            var rx = nrf.openPipe('rx', pipes[1], {autoAck: true});  
            tx = nrf.openPipe('tx', pipes[0], {autoAck: true}); 
            rx.on('data', function (d) {
                led2.toggle();
                setTimeout(function(){
                    led2.toggle();
                }, 100);
                console.log("Got data, will respond", d.toString());
            });
            tx.on('error', function (e) {
                console.warn("Error sending reply.", e);
            });
        }
    });

// hold this process open
// process.ref();
