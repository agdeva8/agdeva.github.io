var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


var nRows = 6
var nCols = 7

var startGrid_x = 100
var startGrid_y = 100 
var cell_width = 120
var cell_height = 120

var currMouse_x;
var currMouse_y;
var mouseClickOn;

var bgColor = "grey"
var diskRadius = cell_width / 2 - 0.15 * cell_width;

var d_isCheckMate = false;

var diskColor = {
  '1': "yellow",
  '-1': "red"
};

ctx.fillStyle = bgColor; 
ctx.fillRect(0, 0, canvas.width, canvas.height);

class State {
  constructor() {
    this.board = new Array(nRows);
    
    for (var i = 0; i < this.board.length; i++) {
      this.board[i] = new Array(nCols);
    }
    
    for (i = 0; i < nRows; i++) {
      for (var j = 0; j < nCols; j++) {
          this.board[i][j] = 0;
        }
    }

    this.nRows = nRows;
    this.nCols = nCols;
    
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

function createDiskFromXY(x, y, color) {
  ctx.beginPath();
  ctx.lineWidth = "2";
  ctx.strokeStyle = "black";
  ctx.arc(x, y, diskRadius, 0, Math.PI*2) 
  // ctx.stroke()
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function createDisk(row, col, color) {
  const [x, y] = centerFromRC(row, col)
  createDiskFromXY(x, y, color)
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

createGrid()

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

document.addEventListener("click", mouseClickHandler, false);

function mouseClickHandler(e) {
  if (!mouseClickOn)
    return

  var x = e.clientX - canvas.offsetLeft;
  var y = e.clientY - canvas.offsetTop;
  if ((x > 0 && x < canvas.width) && 
      (y > 0 && y < canvas.height)) {

    var row, col;
    [row, col] = RCFromXY(x, y)

    if (performAction(col, currState))
      mouseClickOn = false
  } 
}

function statusBarUpdate(col, state) {
  var x, y;

  x = startGrid_x;
  y = startGrid_y - 40
  var width = cell_width * nCols;
  var height = 25

  ctx.clearRect(x, y, width, height)
  ctx.fillStyle = bgColor;
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
  // // the triangle
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 5);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 4, y - 5);
  ctx.closePath();

  ctx.lineWidth = 10;
  ctx.strokeStyle = diskColor[state.player];
  ctx.stroke();

  ctx.fillStyle = diskColor[state.player];
  ctx.fill();

}

function showCheckMatePattern(r, c, i, j, nConnect) {

  var x, y;
  for (var itr = 0; itr < nConnect; itr++) {
    [x, y] = centerFromRC(r + i * itr, c + j * itr);
    ctx.beginPath();
    ctx.arc(x, y, 0.1 * diskRadius, 0, Math.PI * 2)
    ctx.fillStyle = "black"
    ctx.fill()
    ctx.closePath();
  }
  
  var x0, y0;
  [x0, y0] = centerFromRC(r, c);

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x, y);
  ctx.strokeStyle = "black"
  ctx.stroke();
}

function isCheckMate(state) {
  var nConnect = 4
  
  var ijPattern = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];
  var count = 0

  for (var i = 0; i < 4; i++) {

    for (var row = 0; row < state.nRows; row++) {
      for (var col = 0; col < state.nCols; col++) {

        if (state.board[row][col] == 0)
          continue
        count = 0;

        for (var j = 0; j < nConnect; j++) {
          var cRow = row + ijPattern[i][0] * j 
          var cCol = col + ijPattern[i][1] * j
          if (!isValidRC(cRow, cCol))
            continue
          
          if (state.board[row][col] == state.board[cRow][cCol])
            count++;
        }
        // console.log("count is " + count)
        if (count == nConnect) {
          showCheckMatePattern(row, col, ijPattern[i][0], ijPattern[i][1], nConnect)
          return true
        }
      }
    }
  }
  return false
}  

function performAction(col, state) {
  if (!isValidRC(0, col))
    return false
  
  var row = state.nRows - 1;
  
  while (row >= 0) {
    if (state.board[row][col] == 0)
      break;
    row--;
  }
  
  if (row < 0)
    return false

  state.board[row][col] = state.player
  fillDisk(row, col, state)
  state.player *= -1

  return true
}

function showCurrPlayer(text, state) {
  var x, y;

  [x, y] = centerFromRC(state.nRows - 1, state.nCols - 1)
  y += cell_height + 20;
  
  var width = cell_width * 3;
  var height = cell_height

  var startX = startGrid_x + 4 * cell_width
  var startY = y - 55

  ctx.clearRect(startX, startY, width, height)
  ctx.fillStyle = "grey";
  ctx.fillRect(startX, startY, width, height)
   
  ctx.font = "50px Georgia";
  ctx.fillStyle = "green" 
  ctx.textAlign = "right"; 
  ctx.fillText(text, x - diskRadius - 40, y + 20);
  createDiskFromXY(x, y, diskColor[state.player])
}

function draw() {
  var currRow, currCol;
  [currRow, currCol] = RCFromXY(currMouse_x, currMouse_y);
  
  if (isValidRC(currRow, currCol)) {
    statusBarUpdate(currCol, currState)
  }
  
  if (d_isCheckMate) {
    return
  }

  showCurrPlayer("PLAYER", currState)
   
  // console.log("Refreshed")
  // console.log("yes")
  if (!mouseClickOn) {
    mouseClickOn = true

    if (isCheckMate(currState)) {
      d_isCheckMate = true
      currState.player *= -1
      showCurrPlayer("WINNER", currState)
      mouseClickOn = false
   }

  }
}
setInterval(draw, 10);
