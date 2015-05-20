/*
 * Date: 19/May/2015
 * Author: Jacob Way(危强)
 * Version: 0.0
 */

//design level
//drawing
//move
//action
//run

//x, y coordinate Function
function Vector(x, y){
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function(other){
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor){
  return new Vector(this.x * factor, this.y * factor);
};

Vector.prototype.equal = function(other){
  if(this.x === other.x &&
      this.y === other.y){
    return true;
  }
  return false;
};

//key press event handler
var arrowCodes = {
  37: "left",
  38: "up",
  39: "right"
};

function trackKeys(codes){
  var pressed = Object.create(null);
  function handler(event){
    if(codes.hasOwnProperty(event.keyCode)){
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }

  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

//design level
var levelPlan = [
"                      ",
"                      ",
" x                    ",
" x                    ",
" x                    ",
" x                    ",
" x                    ",
" x Y                  ",
" xxxxxxxxxxxxxxxxx    ",
"                      ",
];

//level constructor
function Level(plan){
  this.height = plan.length;
  this.width = plan[0].length;
  this.grid = [];
  this.actors = [];

  for(var y=0; y<this.height; y++){
    var line = plan[y], gridLine = [];
    for(var x=0; x<this.width; x++){
      var ch = line[x];
      fieldType = null;
      var Actor = actorChars[ch];
      if(Actor){
        this.actors.push(new Actor(new Vector(x, y), ch));  
      }else{
        if(ch == "x"){
          fieldType = "wall";
        }
      }
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
}

Level.prototype.animate = function(step, keys){
  this.actors.forEach(function(actor){
    actor.act(step, this, keys);
  }, this);
};

Level.prototype.obstacleAt = function(pos, size){
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if(xStart<0 || xEnd>this.width || yStart<0){
    return "wall"
  }

  for(var y=yStart; y<yEnd; y++){
    for(var x=xStart; x<xEnd; x++){
      var fieldType = this.grid[y][x];
      if(fieldType){
        return fieldType;
      }
    }
  }
};

//actorChars
var actorChars = {
  "Y": Player
};

function Player(pos){
  this.pos = pos;
  this.speed = new Vector(0, 0);
  this.size = new Vector(1, 1);
  this.type = "player";
}

Player.prototype.act = function(step, level, keys){
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);
};

var jumpSpeed = 17/10;
var gravity = 30/10;

Player.prototype.moveY = function(step, level, keys){
  this.speed.y += gravity * step;
  var newDist = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(newDist);
  var obstacle = level.obstacleAt(newPos, this.size);   //todo: obstacleAt
  if(obstacle){
    if(keys.up && this.speed.y > 0){
      this.speed.y = -jumpSpeed;
    }else{
      this.speed.y = 0;
    }
  }else{
    this.pos = newPos;
  }
};

var playerXSpeed = 7;

Player.prototype.moveX = function(step, level, keys){
  this.speed.x = 0;
  if(keys.right){
    this.speed.x += playerXSpeed;
  }
  if(keys.left){
    this.speed.x -= playerXSpeed;
  }
  var newDist = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(newDist);
  this.pos = newPos;
};


//drawing
//create dom element
function elt(name, className){
  var elt = document.createElement(name);
  if(className){
    elt.className = className;
  }
  return elt;
}

var scale = 20; //scale the dom element

//DOMDisplay constructor
function DOMDisplay(parent, level){
  this.wrap = parent.appendChild(elt("div", "game"));   //todo: elt
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

//draw background
DOMDisplay.prototype.drawBackground = function(){
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(gridLine){
    var row = table.appendChild(elt("tr", "bgRow"));
    row.style.height = scale + "px";
    gridLine.forEach(function(type){
      row.appendChild(elt("td", type));
    });
  });
  /*
  if(table){
    console.log("drawBackground test: background table built");
  }else{
    console.log("drawBackground test: wrong!");
  }
  */
  return table;
};

//draw actors
DOMDisplay.prototype.drawActors = function(){
  var actorWrap = elt("div");
  this.level.actors.forEach(function(actor){
    var actorEle = actorWrap.appendChild(elt("div", "actor " + actor.type));
    actorEle.style.width = actor.size.x * scale + "px";
    actorEle.style.height = actor.size.y * scale + "px";
    actorEle.style.top = actor.pos.y * scale + "px";
    actorEle.style.left = actor.pos.x * scale + "px";
  });
  /*
  if(actorWrap){
    console.log("drawActors test: draw actors built");
  }else{
    console.log("drawActors test: wrong!");
  }
  */
  return actorWrap;
};

DOMDisplay.prototype.drawFrame = function(){
  if(this.actorLayer){
    this.wrap.removeChild(this.actorLayer);
  }  
  this.actorLayer = this.wrap.appendChild(this.drawActors());


};

var arrows = trackKeys(arrowCodes);
if(arrows){
  console.log("trackKeys test: key events registered");
}

function runAnimation(frameFunc){
  var lastTime = null;
  function frame(time){
    if(lastTime != null){
      var step = Math.min(time - lastTime, 100) / 1000;
      frameFunc(step);
      //console.log("runAnimation step: ", step);

    }
    lastTime = time;
    if(1){
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
  console.log("Game in runAnimation");
}

function runLevel(level, Display){
  var display = new Display(document.body, level);
  runAnimation(function(step){
    level.animate(step, arrows);
    display.drawFrame();
  });
  console.log("Game in runLevel");
}


function runGame(plan, Display){
  runLevel(new Level(plan), Display);
  console.log("Game is running");
}

runGame(levelPlan, DOMDisplay);

function test(){
  //Level test
  var level = new Level(levelPlan);
  gridLength = level.grid.length;
  planHeight = levelPlan.length;
  if(gridLength === planHeight){
    console.log("Level test: level grid length is OK");
  }else{
    console.log("Level test: Wrong!");
  }

  //Vector test
  var v1 = new Vector(1, 1);
  var v2 = new Vector(2, 3);
  var vPlusT = new Vector(3, 4);
  var vTimesT = new Vector(2, 2);
  var vPlus = v1.plus(v2);
  var vTimes = v1.times(2);
  if(vPlus.equal(vPlusT)){
    console.log("Vector plus test: OK");
  }else{
    console.log("Vector plus test: Wrong");
  }
  if(vTimes.equal(vTimesT)){
    console.log("Vector times test: OK");
  }else{
    console.log("Vector times test: Wrong");
  }

  //Player test
  var player = new Player(new Vector(1,1));
  var playerPos = player.pos;
  if(playerPos.equal(new Vector(1, 1))){
    console.log("Player constructor test: OK");
  }

  //elt test
  var divElt = elt("div", "game");
  if(divElt.calssName == "game"){
    console.log("elt test: OK");
  }

  //DOMDisplay test
  var display = new DOMDisplay(document.body, level);
  if(display){
    console.log("DOMDisplay constructor test: OK");
  }

  /*
  //DOMDisplay drawBackground test
  display.drawBackground();
  */
}
//test();
