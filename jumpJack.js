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
  //animation
  //draw frame

(function() {
    var throttle = function(type, name, obj) {
        var obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();


(function(){
//design level
/*var levelPlan = [
"                      ",
"             o        ",
"            o o       ",
"           o   o      ",
" Y        o     o  M  ",
" x       M          x ",
" x      o         o x ",
" x       o       o  x ",
" x   x    o     o   x ",
" x         o   o    x ",
" x          o o     x ",
" x!!!!!!!!!!!!!!!!!!x ",
"                      ",
];
*/
var levelPlan = [
"             o        ",
"             o      M ",
"                    xx",
"             o      x ",
" Y           o    x x ",
" x           o      x ",
" x        x  o  x   x ",
" x      x    o      x ",
" x x x       ox     x ",
" x           o      x ",
" x          xo      x ",
" x!!!!!!!!!!!!!!!!!!x ",
"                      ",
];


var baseScale = 47;
var scale = baseScale;   // scale the dom element

var slogan = ["跳", "啊", "跳", ",", "小", "强", ",", "我", "想", "看", "看", "这", "个", "大", "大", "的", "世", "界"];
var sloganCount = 0;
function initialVar(){
  if(sloganCount && sloganCount != 0)
    sloganCount = 0;
}

function scaleMap(){
  //caculate the map size
  var aRatio = levelPlan[0].length / levelPlan.length;
  var cWidth = document.documentElement.clientWidth; 
  var cHeight = document.documentElement.clientHeight;
  var cRatio = cWidth / cHeight;

  if(aRatio > cRatio){
    scale = cWidth / levelPlan[0].length;
  }else{
    scale = cHeight / levelPlan.length;
  }

  var scaleRatio = scale / baseScale;
  document.body.style.fontSize = Math.floor(16 * scaleRatio) + "px";
}

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

function hasAudio(){
  var audio = document.createElement("audio");
  return audio && audio.canPlayType;
}

var sounds = ["background", "jump", "won", "lost"];

function loadSounds(sounds){
  var results = Object.create(null);
  var name;

  function handler(event){
    results[name].canPlay = true;
  }
  for(var i=0; i<sounds.length; i++){
    name = sounds[i];
    results[name] = document.createElement("audio");
    results[name].addEventListener("canplay", handler);
    results[name].src = name + ".mp3";
    if(name == "background"){
      results[name].loop = true;
    }
  }
  return results;
}

if(hasAudio){
  var soundsObj = loadSounds(sounds);
}

//key press event handler
var arrowCodes = {
  37: "left",
  38: "up",
  39: "right",
  "touched": null

};

var touchLocation = [];

function trackKeys(codes){
  var pressed = Object.create(null);
  function handler(event){
    if(codes.hasOwnProperty(event.keyCode) &&
        (event.type == "keydown" || event.type == "keyup")){
      var down = (event.type == "keydown");
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
      soundsObj.jump.play();
    }
    if(codes.hasOwnProperty("touched") &&
        (event.type == "touchstart" || event.type == "touchend")){
      var isTouched = event.type == "touchstart";
      pressed["touched"] = isTouched;
      event.preventDefault();

      var touchList = event.changedTouches;
      var touch;
      for(var i = 0; i < touchList.length; i++){
        touch = {x: touchList[i].pageX, y: touchList[i].pageY, id: touchList[i].identifier};
      }
      touchLocation = [touch.x, touch.y];
    }
  }

  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  addEventListener("touchstart", handler);
  addEventListener("touchend", handler);
  return pressed;
}
/*
function trackTouch(){
  var touched = Object.create(null);
  function handler(event){
    var isTouched = event.type == "touchstart";
    touched["touched"] = isTouched;
    event.preventDefault();
    console.log("trackTouch handler is running");
  }

  addEventListener("touchstart", handler);
  addEventListener("touchend", handler);
  return touched;
}*/

//level constructor
function Level(plan){
  this.height = plan.length;
  this.width = plan[0].length;
  this.grid = [];
  this.actors = [];
  this.status = this.finishDelay = null;

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
        if(ch == "!"){
          fieldType = "lava";
        }
        if(ch == "o"){
          fieldType = "wall";
        }
      }
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  this.player = this.actors.filter(function(actor){
    return actor.type == "player";
  })[0];
}

var maxStep = 0.05;

Level.prototype.animate = function(step, keys){
  if(this.status != null){
    this.finishDelay -= step;
  }

  while(step>0){
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor){
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Level.prototype.obstacleAt = function(pos, size){
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if(xStart<0 || xEnd>this.width || yStart<0){
    return "wall";
  }
  if(yEnd > this.height){
    return "lava";
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

Level.prototype.actorAt = function(actor){
  for(var i=0; i<this.actors.length; i++){
    var other = this.actors[i];
    if(actor != other &&
        actor.pos.x < other.pos.x + other.size.x &&
        actor.pos.x + actor.size.x > other.pos.x &&
        actor.pos.y < other.pos.y + other.size.y &&
        actor.pos.y + actor.size.y > other.pos.y){
      return other;
    }
  }
};

Level.prototype.playerTouched = function(type, actor){
  if(type == "lava" && this.status == null){
    this.status = "lost";
    this.finishDelay = 1;
    soundsObj.lost.play();
  }else if(type == "medal"){
    this.actors = this.actors.filter(function(other){
      return other != actor;
    });

    var some = this.actors.some(function(item){
      return item.type == "medal";
    });
    if(!some){
      this.status = "won";
      this.finishDelay = 1;
      soundsObj.won.play();
    }
  }
};

Level.prototype.isFinished = function(){
  return this.status != null && this.finishDelay < 0;
};

//actorChars
var actorChars = {
  "Y": Player,
  "M": Medal
};

function Medal(pos){
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}

var wobbleSpeed = 8, wobbleDist = 0.07;
Medal.prototype.act = function(step){
  this.wobble += wobbleSpeed * step;
  this.wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, this.wobblePos));
};

Medal.prototype.type = "medal";

function Player(pos){
  this.pos = pos;
  this.speed = new Vector(0, 0);
  this.size = new Vector(0.85, 0.85);
}

Player.prototype.type = "player";

Player.prototype.act = function(step, level, keys){
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);
  this.touchedXY(step, level, keys);

  var otherActor = level.actorAt(this);
  if(otherActor){
    level.playerTouched(otherActor.type, otherActor);
  }

  if(level.status == "lost"){
    this.pos.y += step;
    this.size.y -= step;
  }
};

var jumpSpeed = 17;
var gravity = 30;

Player.prototype.moveY = function(step, level, keys){
  this.speed.y += gravity * step;
  var newDist = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(newDist);
  var obstacle = level.obstacleAt(newPos, this.size);   
  if(obstacle){
    level.playerTouched(obstacle);  
    if((keys.up || keys.touched) && this.speed.y > 0){
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
  var obstacle = level.obstacleAt(newPos, this.size);
  if(obstacle){
    level.playerTouched(obstacle);
  }else{
    this.pos = newPos;
  }
};

Player.prototype.touchX = function(step, level, keys){
  this.speed.x = 0;

  var isRight = touchLocation[0] > this.pos.x * scale;
  var isLeft = touchLocation[0] < this.pos.x * scale;
  console.log("player.pos.x: ", this.pos.x * scale);
  console.log("touchLocation: isRight: ", touchLocation, isRight);
  if(keys.touched && isRight){
    this.speed.x += playerXSpeed;
  }
  if(keys.touched && (isLeft)){
    this.speed.x -= playerXSpeed;
    console.log("isLeft & this.speed.x & this.pos.x: ", isLeft, this.speed.x, this.pos.x);
  }
  var newDist = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(newDist);
  var obstacle = level.obstacleAt(newPos, this.size);
  if(obstacle){
    level.playerTouched(obstacle);
  }else{
    this.pos = newPos;
    console.log("newPos.x: ", this.pos.x);
  }
};

Player.prototype.touchY = function(step, level, keys){
  this.speed.y += gravity * step;
  var newDist = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(newDist);
  var obstacle = level.obstacleAt(newPos, this.size);   
  if(obstacle){
    level.playerTouched(obstacle);  
    if((keys.up || keys.touched) && this.speed.y > 0){
      this.speed.y = -jumpSpeed;
    }else{
      this.speed.y = 0;
    }
  }else{
    this.pos = newPos;
  }
};

Player.prototype.touchedXY = function(step, level, keys){
  if(keys.touched == true){
    console.log("touchedXY is running");
    this.touchX(step, level, keys);
    this.touchY(step, level, keys);
  }
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

// var scale = 20; //scale the dom element

//DOMDisplay constructor
function DOMDisplay(parent, level){
  this.wrap = parent.appendChild(elt("div", "game"));   //todo: elt
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

function lavaText(type, tdElt){
  if(type == "lava" && sloganCount < slogan.length){
    tdElt.textContent = slogan[sloganCount];
    sloganCount++;
  }
}

//draw background
DOMDisplay.prototype.drawBackground = function(){
  initialVar();
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function(gridLine){
    var row = table.appendChild(elt("tr", "bgRow"));
    row.style.height = scale + "px";
    gridLine.forEach(function(type){
      var tdElt = elt("td", type);
      row.appendChild(tdElt);
      if(type == "lava")
        lavaText(type, tdElt);
    });
  });
  return table;
};

function actorText(actor, actorEle){
  if(actor.type == "player"){
    actorEle.textContent = "强";
  }
  if(actor.type == "medal"){
    actorEle.textContent = "❤️";
  }
}
//draw actors
DOMDisplay.prototype.drawActors = function(){
  var actorWrap = elt("div", "actorLayer");
  this.level.actors.forEach(function(actor){
    var actorEle = actorWrap.appendChild(elt("div", "actor " + actor.type));
    actorEle.style.width = actor.size.x * scale + "px";
    actorEle.style.height = actor.size.y * scale + "px";
    actorEle.style.top = actor.pos.y * scale + "px";
    actorEle.style.left = actor.pos.x * scale + "px";

    actorText(actor, actorEle);
  });
  return actorWrap;
};

DOMDisplay.prototype.drawFrame = function(){
  if(this.actorLayer){
    this.wrap.removeChild(this.actorLayer);
  }  
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = "game " + (this.level.status || "");
};

DOMDisplay.prototype.clear = function(){
  this.wrap.parentNode.removeChild(this.wrap);
};

var arrows = trackKeys(arrowCodes);
if(arrows){
  console.log("trackKeys test: key events registered");
}

function runAnimation(frameFunc){
  var lastTime = null;
  function frame(time){
    var stop = false;
    if(lastTime != null){
      var step = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(step) === false;
    }
    lastTime = time;
    if(!stop){
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display, andThen){
  var display = new Display(document.body, level);
  runAnimation(function(step){
    level.animate(step, arrows);
    display.drawFrame();

    if(level.isFinished()){
      display.clear();
      if(andThen){
        andThen(level.status);
      }
      console.log("In runLevel, any chance to return false?");
      return false;
    }

  });
  
  // If resize event, redraw game background
  window.addEventListener('optimizedResize', function(){
    scaleMap();
    var backgroundElt = document.getElementsByClassName("background")[0];
    if(backgroundElt)
      backgroundElt.parentNode.removeChild(backgroundElt);
    display.wrap.appendChild(display.drawBackground());
  });
}

function runGame(plan, Display){
  function start(){
    runLevel(new Level(plan), Display, function(status){
      if(status == "lost"){
        start();
      }
      if(status == "won"){
        //won logic
        start();
      }
    });
  }

  soundsObj.background.play();
  scaleMap();
  createTextLayer();
  start();
}

function createTextLayer(){
  var content= "<p>技术灵感：Marijn Haverbeke</p>" +
    "<p>创意灵感：危国华（爸爸）</p>" +
    "<p>技术实现：危强（儿子）</p>";
  var textLayer = elt("div", "textLayer");
  textLayer.innerHTML = content;
  document.body.appendChild(textLayer);
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

})();
