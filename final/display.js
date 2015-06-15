// led voltage: R, Y = 2.0V, G = 2.4V
var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var portA = tessel.port['A'];
var portB = tessel.port['B'];
var portC = tessel.port['C'];
var portD = tessel.port['D'];
var matrix = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [1, 1, 1, 1]]; 

var func = function(){
    ret = tessel.c_display(matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][3], matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][3], matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][3], matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]);
 //   console.log(ret);
   // func();
}

setInterval(function(){func();}, 1);
//setInterval(func(), 100);
//func();
