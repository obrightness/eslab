var arr = [ [2, 0, 2, 0], [2, 4, 2, 4], [2, 2, 0, 0], [4, 0, 0, 4] ];
console.log(arr);
//move([2,2,2,2]); move(arr[0]); move(arr[1]); move(arr[2]); move(arr[3]); move([2,2,4,2]);
function getCol(array ,col){
    var column = new Array();
    for (i = 0; i < 4; i++){
    	column.push(array[i][col]);
    }
    return column;
}

/*for(i = 0; i < 4; i++){
    var x = move(arr[i]);
    console.log(x);
}*/
update('up', arr);
function update(dir, array){
    switch (dir) {
    	case 'left':
	    console.log('answer '+ move(array[0]));
	    break;
	case 'right':
	    var arr_rev = array[0].reverse();
	    var x = move(arr_rev);
	    console.log('answer '+ x.reverse());
	    break;
    	case 'up':
	    console.log('answer '+ move(getCol(array, 1)));
	    break;
	case 'down':
	    var arr_rev = getCol(array, 0).reverse();
	    var x = move(arr_rev);
	    console.log('answer '+ x.reverse());
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
    console.log('move ' + '[' + arr_temp + ']');
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

    console.log('merge '+ '[' + arr_temp + ']');
    return addzero(arr_temp);
}
//補0
function addzero(array){
    var arr_length = array.length;
    var arr_zero = [];
    for (i = 0; i < 4 - arr_length; i++){
	arr_zero.push(0);
    }
    console.log(arr_zero);
    var arr_temp = array.concat(arr_zero);
    console.log(arr_temp);
    return arr_temp;
}


