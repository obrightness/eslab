// led voltage: R, Y = 2.0V, G = 2.4V
// 0, 1, 2 = g, r, y
var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var up_key = gpio.analog[0];
var dn_key = gpio.analog[1];
var lf_key = gpio.analog[2];
var rt_key = gpio.analog[3];
var matrix = [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0 ,0], [0, 0, 0, 0]];
// game functions
function getCol(array ,col){
    var column = new Array();
    for (i = 0; i < 4; i++){
    	column.push(array[i][col]);
    }
    return column;
}

function update(dir, array){
    switch (dir) {
    	case 'left':
	    //console.log('answer '+ move(array[0]));
	    break;
	case 'right':
	    var arr_rev = array[0].reverse();
	    var x = move(arr_rev);
	    //console.log('answer '+ x.reverse());
	    break;
    	case 'up':
	    //console.log('answer '+ move(getCol(array, 1)));
	    break;
	case 'down':
	    var arr_rev = getCol(array, 0).reverse();
	    var x = move(arr_rev);
	    //console.log('answer '+ x.reverse());
	    break;
    }
}

function move(array){
    var arr_temp = new Array();
    for (i = 0; i < 4; i++){
	if (array[i] != 0){
	    arr_temp.push(array[i]);  
	}
    }
    //console.log('move ' + '[' + arr_temp + ']');
    return merge(arr_temp);
}

function merge(array){
    var arr_length = array.length;
    var arr_temp = new Array();
    for (i = 0; i < arr_length ; i++){
	if (array[i] != array[i+1] && i != arr_length){
	    arr_temp.push( array[i] );
	//不一樣的  非最後一個
	}
	else if ( i == arr_length && array[i] != array[i-1]){
	    arr_temp.push(array[i]);
	//最後一個
	}
	else if (array[i] == array[i+1] ){
	    arr_temp.push( array[i]+array[i+1]);
	    array.splice(i+1, 1);
	    arr_length = array.length;
	}
    }

    //console.log('merge '+ '[' + arr_temp + ']');
    return addzero(arr_temp);
}
//補0
function addzero(array){
    var arr_length = array.length;
    var arr_zero = [];
    for (i = 0; i < 4 - arr_length; i++){
	arr_zero.push(0);
    }
    //console.log(arr_zero);
    var arr_temp = array.concat(arr_zero);
    //console.log(arr_temp);
    return arr_temp;
}


// main function
var func = function(){
    ret = tessel.c_display(matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][3], matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][3], matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][3], matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]);
    if( up_key.read() > 0.5 ){
        console.log("up key pressed!");
        update('up', matrix);
    }
    if( dn_key.read() > 0.5 ){
        console.log("dn key pressed!");
        update('down', matrix);
    }
    if( lf_key.read() > 0.5 ){
        console.log("lf key pressed!");
        update('left', matrix);
    }
    if( rt_key.read() > 0.5 ){
        console.log("rt key pressed!");
        update('right', matrix);
    }
    
}
// main loop
setInterval(function(){func();}, 1);
