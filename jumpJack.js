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
" xxxxxxxxxxxxxxxxx    "
"                      ",
];

//level constructor
function Level(plan){
  this.height = plan[0].length;
  this.width = plan.length;
  this.grid = [];
  this.actors = [];

  for(var y=0; y<this.height; y++){
    var line = plan[y], gridLine = [];
    for(var x=0; x<this.width; x++){
      var ch = line[x];
      fieldType = null;
      var Actor = actorChars(ch);   
      if(Actor){
        this.actors.push(new Actor(new Vector(x, y), ch));  
      }else{
        if(ch == "x"){
          filedType = "wall";
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
  if(vPlus.equal(vPlusT){
    console.log("Vector plus test: OK");
  }else{
    console.log("Vector plus test: Wrong");
  }
  if(vTimes.equal(vTimesT){
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
}
test();
