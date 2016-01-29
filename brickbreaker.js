// inner variables
var canvas, ctx;

var iStart = 0;
var bRightBut = false;
var bLeftBut = false;
var oBall, oPadd, oBricks;
var iPoints = 0;
var iGameTimer;
var iElapsed = iMin = iSec = 0;
var sLastTime, sLastPoints;

// objects :
function Ball(x, y, dx, dy, r, img) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.r = r;
  this.img = img;
}

function Padd(x, w, h, img) {
  this.x = x;
  this.w = w;
  this.h = h;
  this.img = img;
}

function Bricks(w, h, r, c, p) {
  this.w = w;
  this.h = h;
  this.r = r; // rows
  this.c = c; // cols
  this.p = p; // padd
  this.objs;
  this.colors = ['#44707b', '#d1c4af']; // colors for rows
}

// ------------------------------------------------------------- draw functions :

function clear() { 
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clear canvas function
  ctx.fillStyle = '#2a333a'; // fill background
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function generateBricks() {
  for (i = 0; i < oBricks.r; i++) {
    ctx.fillStyle = oBricks.colors[i];

    for (j = 0; j < oBricks.c; j++) {
      if (oBricks.objs[i][j] == 1) {
        ctx.beginPath();
        ctx.rect((j * (oBricks.w + oBricks.p)) + oBricks.p, (i * (oBricks.h + oBricks.p)) + oBricks.p, oBricks.w, oBricks.h);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // collision detection
  rowHeight = oBricks.h + oBricks.p; //rowHeight = BRICKHEIGHT + PADDING;
  colWidth = oBricks.w + oBricks.p; //colwidth = BRICKWIDTH + PADDING;
  iRow = Math.floor(oBall.y / rowHeight); 
  iCol = Math.floor(oBall.x / colWidth);

  // mark brick as broken (empty) and reverse brick
  if (oBall.y < oBricks.r * rowHeight && iRow >= 0 && iCol >= 0 && oBricks.objs[iRow][iCol] == 1) {
    oBricks.objs[iRow][iCol] = 0;
    oBall.dy = -oBall.dy;
    iPoints++;
  }
}

function drawBall() {
  ctx.drawImage(oBall.img, 0, 0, oBall.r, oBall.r, oBall.x, oBall.y, oBall.r, oBall.r);
}

function result() {
  ctx.font = '12px Verdana';
  ctx.fillStyle = '#fff';
  iMin = Math.floor(iElapsed / 60);
  iSec = iElapsed % 60;
  if (iMin < 10) iMin = "0" + iMin;
  if (iSec < 10) iSec = "0" + iSec;
  ctx.fillText('Time: ' + iMin + ':' + iSec, 10, 170);
  ctx.fillText('Points: ' + iPoints, 10, 200);

  if (sLastTime != null && sLastPoints != null) {
    ctx.fillText('Last Time: ' + sLastTime, 10, 230);
    ctx.fillText('Last Points: ' + sLastPoints, 10, 260);
  }
}

function drawScene() { // main drawScene function
  clear(); // clear canvas

  drawBall();

  //move pad
  if (bRightBut)
    oPadd.x += 5;
  else if (bLeftBut)
    oPadd.x -= 5;

  // draw Padd (rectangle)
  ctx.drawImage(oPadd.img, oPadd.x, ctx.canvas.height - oPadd.h);

  // draw bricks (from array of its objects)
  generateBricks();

  // reverse X position of ball
  if (oBall.x + oBall.dx + oBall.r > ctx.canvas.width || oBall.x + oBall.dx - oBall.r < 0) {
    oBall.dx = -oBall.dx;
  }

  if (oBall.y + oBall.dy - oBall.r < 0) {
    oBall.dy = -oBall.dy;
  } else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height - oPadd.h) {
    if (oBall.x > oPadd.x && oBall.x < oPadd.x + oPadd.w) {
      oBall.dx = 10 * ((oBall.x-(oPadd.x+oPadd.w/2))/oPadd.w);
      oBall.dy = -oBall.dy;
    } 
    else if (oBall.y + oBall.dy + oBall.r > ctx.canvas.height) {
      clearInterval(iStart);
      clearInterval(iGameTimer);

      // HTML5 Local storage - save values
      localStorage.setItem('last-time', iMin + ':' + iSec);
      localStorage.setItem('last-points', iPoints);
    }
  }

  //move ball
  oBall.x += oBall.dx;
  oBall.y += oBall.dy;

  result();
  
} //drawScene

// initialization
$(function(){

  canvas = document.getElementById('scene');
  ctx = canvas.getContext('2d');

  var width = canvas.width;
  var height = canvas.height;

  var padImg = new Image();
  var ballImg = new Image();
  var url = window.location.pathname + 'img/';

  padImg.src = url + 'paddle.png';
  ballImg.src = url + 'ball.png';

  padImg.onload = function() {};
  ballImg.onload = function() {};

  //oBall = new Ball(width / 2, 280, 0.5, -5, 10, ballImg); // new ball object: x, y, dx, dy, r, img
  oBall = new Ball(width / 2, 280, 0.5, -5, 18, ballImg); 
  oPadd = new Padd(width / 2, 87, 40, padImg); // new padd object: x, w, h, img
  oBricks = new Bricks((width / 8) - 1, 20, 6, 8, 2); // new bricks object: w, h, r, c, padding

  oBricks.objs = new Array(oBricks.r); // fill-in bricks
  for (i=0; i < oBricks.r; i++) {
    oBricks.objs[i] = new Array(oBricks.c);
    for (j=0; j < oBricks.c; j++) {
       oBricks.objs[i][j] = 1;
    }
  }

  iStart = setInterval(drawScene, 10); // loop drawScene
  iGameTimer = setInterval(countTimer, 1000); // inner game timer

  // HTML5 Local storage - get values
  sLastTime = localStorage.getItem('last-time');
  sLastPoints = localStorage.getItem('last-points');

  $(window).keydown(function(event){ // keyboard-down alerts
    switch (event.keyCode) {
      case 37: // 'Left' key
        bLeftBut = true;
        break;
      case 39: // 'Right' key
        bRightBut = true;
        break;
    }
  });

	$(window).keyup(function(event){ // keyboard-up alerts
    switch (event.keyCode) {
      case 37: // 'Left' key
        bLeftBut = false;
        break;
      case 39: // 'Right' key
        bRightBut = false;
        break;
    }
  });

  var iCanvX1 = $(canvas).offset().left;
  var iCanvX2 = iCanvX1 + width;

  $('#scene').mousemove(function(e) { // binding mousemove event
    if (e.pageX > iCanvX1 && e.pageX < iCanvX2) {
      oPadd.x = Math.max(e.pageX - iCanvX1 - (oPadd.w/2), 0);
      oPadd.x = Math.min(ctx.canvas.width - oPadd.w, oPadd.x);
    }
	});

});

function countTimer() {
  iElapsed++;
}
