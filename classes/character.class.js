class Character extends MovableObject {
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  speed = 4;
  animations = {
    idle: { path: "./imgs/fox/Fox_Idle_with_shadow.png", frames: 4, fps: 6, row: 3 },
  };

  /**
   * Creates the fox, preloads its animations and starts animation and movement.
   */
  constructor() {
    super();
    this.loadImages(Object.values(this.animations));
    this.animate();
    this.move();
  }


  /**
   * Moves the fox left or right while the arrow keys are pressed.
   */
  move() {
    setStoppableInterval(() => {
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
