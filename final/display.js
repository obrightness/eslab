// led voltage: R, Y = 2.0V, G = 2.4V
var tessel = require('tessel');
var gpio = tessel.port['GPIO'];
var portA = tessel.port['A'];
var portB = tessel.port['B'];
var portC = tessel.port['C'];
var portD = tessel.port['D'];
// assign pins
// pinRows = [row0, row2, row2, row3]
// pinCols = [[g, r, y], [g, r, y], ...]
var pinRows = [ gpio.pin['G1'], gpio.pin['G2'], gpio.pin['G3'], gpio.pin['G4'] ];
var pinCols = [ [portA.pin['G1'], portA.pin['G2'], portA.pin['G3']],  
                [portB.pin['G1'], portB.pin['G2'], portB.pin['G3']],
                [portC.pin['G1'], portC.pin['G2'], portC.pin['G3']], 
                [portD.pin['G1'], portD.pin['G2'], portD.pin['G3']], ];

//console.log(pinRows);


var show1 = function(){
        pinRows[0].output(0);
        pinRows[1].output(1);
        pinRows[2].output(1);
        pinRows[3].output(1);
        pinCols[0][matrix[0][0]].output(1);
        pinCols[0][(matrix[0][0]+1)%3].output(0);
        pinCols[0][(matrix[0][0]+2)%3].output(0);
        pinCols[1][matrix[0][1]].output(1);
        pinCols[1][(matrix[0][1]+1)%3].output(0);
        pinCols[1][(matrix[0][1]+2)%3].output(0);
        pinCols[2][matrix[0][2]].output(1);
        pinCols[2][(matrix[0][2]+1)%3].output(0);
        pinCols[2][(matrix[0][2]+2)%3].output(0);
        pinCols[3][matrix[0][3]].output(1);
        pinCols[3][(matrix[0][3]+1)%3].output(0);
        pinCols[3][(matrix[0][3]+2)%3].output(0);
        pinRows[0].output(1);
        pinCols[0][matrix[0][0]].output(0);
        pinCols[1][matrix[0][0]].output(0);
        pinCols[2][matrix[0][0]].output(0);
        pinCols[3][matrix[0][0]].output(0);
        console.log("1");
        show2();
};
var show2 = function(){
        pinRows[0].output(1);
        pinRows[1].output(0);
        pinRows[2].output(1);
        pinRows[3].output(1);
        pinCols[0][matrix[1][0]].output(1);
        pinCols[0][(matrix[1][0]+1)%3].output(0);
        pinCols[0][(matrix[1][0]+2)%3].output(0);
        pinCols[1][matrix[1][1]].output(1);
        pinCols[1][(matrix[1][1]+1)%3].output(0);
        pinCols[1][(matrix[1][1]+2)%3].output(0);
        pinCols[2][matrix[1][2]].output(1);
        pinCols[2][(matrix[1][2]+1)%3].output(0);
        pinCols[2][(matrix[1][2]+2)%3].output(0);
        pinCols[3][matrix[1][3]].output(1);
        pinCols[3][(matrix[1][3]+1)%3].output(0);
        pinCols[3][(matrix[1][3]+2)%3].output(0);
        pinRows[1].output(1);
        pinCols[0][matrix[1][0]].output(0);
        pinCols[1][matrix[1][0]].output(0);
        pinCols[2][matrix[1][0]].output(0);
        pinCols[3][matrix[1][0]].output(0);
        console.log("2");
        show3();
};
var show3 = function(){
        pinRows[0].output(1);
        pinRows[1].output(1);
        pinRows[2].output(0);
        pinRows[3].output(1);
        pinCols[0][matrix[2][0]].output(1);
        pinCols[0][(matrix[2][0]+1)%3].output(0);
        pinCols[0][(matrix[2][0]+2)%3].output(0);
        pinCols[1][matrix[2][1]].output(1);
        pinCols[1][(matrix[2][1]+1)%3].output(0);
        pinCols[1][(matrix[2][1]+2)%3].output(0);
        pinCols[2][matrix[2][2]].output(1);
        pinCols[2][(matrix[2][2]+1)%3].output(0);
        pinCols[2][(matrix[2][2]+2)%3].output(0);
        pinCols[3][matrix[2][3]].output(1);
        pinCols[3][(matrix[2][3]+1)%3].output(0);
        pinCols[3][(matrix[2][3]+2)%3].output(0);
        pinRows[2].output(1);
        pinCols[0][matrix[2][0]].output(0);
        pinCols[1][matrix[2][0]].output(0);
        pinCols[2][matrix[2][0]].output(0);
        pinCols[3][matrix[2][0]].output(0);
        console.log("3");
        show4(); 
};
var show4 = function(){
        pinRows[0].output(1);
        pinRows[1].output(1);
        pinRows[2].output(1);
        pinRows[3].output(0);
        pinCols[0][matrix[3][0]].output(1);
        pinCols[0][(matrix[3][0]+1)%3].output(0);
        pinCols[0][(matrix[3][0]+2)%3].output(0);
        pinCols[1][matrix[3][1]].output(1);
        pinCols[1][(matrix[3][1]+1)%3].output(0);
        pinCols[1][(matrix[3][1]+2)%3].output(0);
        pinCols[2][matrix[3][2]].output(1);
        pinCols[2][(matrix[3][2]+1)%3].output(0);
        pinCols[2][(matrix[3][2]+2)%3].output(0);
        pinCols[3][matrix[3][3]].output(1);
        pinCols[3][(matrix[3][3]+1)%3].output(0);
        pinCols[3][(matrix[3][3]+2)%3].output(0);
        pinRows[3].output(1);
        pinCols[0][matrix[3][0]].output(0);
        pinCols[1][matrix[3][0]].output(0);
        pinCols[2][matrix[3][0]].output(0);
        pinCols[3][matrix[3][0]].output(0);
        console.log("4");
        show1();
}

var matrix = [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [1, 1, 1, 1]]; 

show1();
