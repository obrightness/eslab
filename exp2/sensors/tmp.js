rx_nrf.on('ready', function () {
    console.log('rx_nrf ready');
    pipe_tmp_rx = rx_nrf.openPipe('rx', pipes[0], {size: 26});
    pipe_accel_rx = rx_nrf.openPipe('rx', pipes[1], {size: 26});
    pipe_accel_rx.on('ready', function(){
        console.log('accel rx_nrf ready');
        rx_nrf_accel.setPipe(pipe_accel_rx);
    });
    pipe_accel_rx.on('data', function(data){
        console.log('accel on data');
        rx_nrf_accel.handleData(data);
    });
});


