class Character extends MovableObject {
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  walkSpeed = 4;
  runSpeed = 7;
  animations = {
    idle: { path: "./imgs/fox/Fox_Idle_with_shadow.png", frames: 4, fps: 6, row: 3 },
    walk: { path: "./imgs/fox/Fox_walk_with_shadow.png", frames: 6, fps: 10, row: 3 },
    run: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 6, fps: 13, row: 3 },
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
   * Starts the movement interval of the fox (60 times per second).
   */
  move() {
    setStoppableInterval(() => this.moveByKeys(), 1000 / 60);
  }


  /**
   * Moves the fox left or right while the arrow keys are pressed.
   */
  moveByKeys() {
    if (keyBoard.left == true) {
      this.x -= this.getSpeed();
      this.otherDirection = true;
    }
    if (keyBoard.right == true) {
      this.x += this.getSpeed();
      this.otherDirection = false;
    }
  }


  /**
   * Returns the current speed: faster while Shift is held.
   * @returns {number} Pixels the fox moves per tick.
   */
  getSpeed() {
    if (keyBoard.shift == true) {
      return this.runSpeed;
    }
    return this.walkSpeed;
  }


  /**
   * Checks if an arrow key for walking is pressed.
   * @returns {boolean} True if the fox is moving left or right.
   */
  isMoving() {
    return keyBoard.left == true || keyBoard.right == true;
  }


  /**
   * Chooses the animation: run (moving + Shift), walk (moving) or idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isMoving() && keyBoard.shift == true) {
      return this.animations.run;
    }
    if (this.isMoving()) {
      return this.animations.walk;
    }
    return this.animations.idle;
  }
}
