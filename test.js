
Player.prototype.moveY = function(step, level, keys){
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if(obstacle){
    level.playerTouched(obstacle);
    if(keys.up && this.speed.y > 0){
      this.speed.y = -jumpSpeed;
    }else{
      this.speed.y = 0;
    }
  }else{
    this.pos = newPos;
  }
};
