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
}

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
  if(table){
    console.log("drawBackground test: background table built");
  }else{
    console.log("drawBackground test: wrong!");
  }
  return table;
};

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
test();
