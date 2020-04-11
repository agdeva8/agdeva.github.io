var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


var nRows = 6
var nCols = 7

var startGrid_x = 100
var startGrid_y = 100 
var cell_width = 60
var cell_height = 60

var currMouse_x;
var currMouse_y;

var bgColor = "grey"
var diskRadius = cell_width / 2 - 8;

var diskColor = {
  '1': "yellow",
  '-1': "red"
};

ctx.fillStyle = bgColor; 
ctx.fillRect(0, 0, canvas.width, canvas.height);

class State {
  constructor() {
    this.board = new Array(nRows);
    
    for (var i = 0; i < this.board.length; this.board++) {
      this.board[i] = new Array(nCols);
    }

    this.player = 1;
  }
}


var currState = new State();

function RCFromXY(x, y) {
    var col = Math.floor((x - startGrid_x) / cell_width);
    var row = Math.floor((y - startGrid_y) / cell_height);
    
    return [row, col];
}

function XYFromRC(row, col) {
  var x = startGrid_x + col * cell_width
  var y = startGrid_y + row * cell_height  
  return [x, y];
}

function centerFromRC(row, col) {
  var x, y;
  [x, y] = XYFromRC(row, col); 
  x += cell_width / 2;
  y += cell_height / 2;
  return [x, y];
}

function isValidRC(row, col) {
  return ((row >= 0 && row < nRows) && (col >= 0 && col < nCols));
}

function createCell(row, col) {
  var x, y;
  [x, y] = XYFromRC(row, col)
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "black";
  ctx.rect(x, y, cell_width, cell_height); 
  ctx.stroke();
  ctx.fillStyle = "blue"
  ctx.fill();
  ctx.closePath();
}

function createDisk(row, col, color) {
  const [x, y] = centerFromRC(row, col)

  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "black";
  ctx.arc(x, y, diskRadius, 0, Math.PI*2) 
  // ctx.stroke()
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function emptyDisk(row, col) {
  createDisk(row, col, bgColor);
}

function fillDisk(row, col, state) {
  var color = diskColor[state.player];
  createDisk(row, col, color);
}

function createGrid() {
  for (var row = 0; row < nRows; row++) {
    for (var col = 0; col < nCols; col++) {
      createCell(row, col);
      emptyDisk(row, col)
    }
  }
}

// emptyDisk(startGrid_x, startGrid_y)
// createCell(startGrid_x, startGrid_y)
createGrid()
// fillDisk(1, 2, currState);
// createDisk(1, 2, currState);


// Mouse Move Handler
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > 0 && relativeX < canvas.width) {
    currMouse_x = relativeX;
  }

  var relativeY = e.clientY - canvas.offsetTop;
  if(relativeY > 0 && relativeY < canvas.height) {
    currMouse_y = relativeY;
  }
}

function statusBarUpdate(col, state) {
  var x, y;

  x = startGrid_x;
  y = startGrid_y - 40
  var width = cell_width * nCols;
  var height = 25

  ctx.clearRect(x, y, width, height)
  ctx.fillRect(x, y, width, height)

  if (!isValidRC(0, col)) {
    return 
  }

  // ctx.beginPath();
  // ctx.lineWidth = "2";
  // ctx.strokeStyle = "black";
  // ctx.rect(x, y, width, height); 
  // ctx.stroke();
  // ctx.closePath();
  
  [x, y] = centerFromRC(0, col);
  y = startGrid_y - 25 
  // the triangle
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 5);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 4, y - 5);
  ctx.closePath();

  ctx.lineWidth = 10;
  ctx.strokeStyle = diskColor[state.player];
  ctx.stroke();

  // ctx.fillStyle = diskColor[state.player];
  // ctx.fill();

}

function draw() {
  var currRow, currCol;
  [currRow, currCol] = RCFromXY(currMouse_x, currMouse_y);
  
  if (isValidRC(currRow, currCol)) {
    console.log("curr Row is " + currRow + " and Col is " + currCol); 
  }
  
  statusBarUpdate(currCol, currState)

  // ctx.clearRect(0, 0, canvas.width, canvas.height)
  // ctx.beginPath();
  // createCell(x, y)
  // ctx.arc(x, y, 10, 0, Math.PI*2);
  // ctx.fillStyle = "#0095DD";
  // ctx.fill();
  // ctx.closePath();
  // x += dx
  // y += dy
 }
setInterval(draw, 10);
