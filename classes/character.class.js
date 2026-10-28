class Character extends MovableObject {
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  sourceY = 96;
  idleFrames = 4;
  idleFps = 6;
  speed = 4;

  constructor() {
    super().loadImage("./imgs/fox/Fox_Idle_with_shadow.png");
    this.idleAnimation();
    this.move();
  }

  move() {
    setInterval(() => {
      if (keyBoard.left == true) {
        this.x -= this.speed;
        this.otherDirection = true;
      }
      if (keyBoard.right == true) {
        this.x += this.speed;
        this.otherDirection = false;
      }
    }, 1000 / 60);
  }
}
