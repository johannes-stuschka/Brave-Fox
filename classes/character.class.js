class Character extends MovableObject {
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  walkSpeed = 4;
  world; // wird von der World gesetzt (für levelEndX)
  runSpeed = 7;
  offset = { top: 12, right: 4, bottom: 10, left: 12 }; // Kopf bis Pfoten, ohne Schwanzspitze und Schatten
  animations = {
    idle: { path: "./imgs/fox/Fox_Idle_with_shadow.png", frames: 4, fps: 6, row: 3 },
    walk: { path: "./imgs/fox/Fox_walk_with_shadow.png", frames: 6, fps: 10, row: 3 },
    run: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 6, fps: 13, row: 3 },
    jumpUp: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 3 },
    jumpDown: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 0 },
  };

  /**
   * Creates the fox, preloads its animations and starts animation, movement and gravity.
   */
  constructor() {
    super();
    this.loadImages(Object.values(this.animations));
    this.animate();
    this.move();
    this.applyGravity();
  }


  /**
   * Starts the movement interval of the fox (60 times per second).
   */
  move() {
    setStoppableInterval(() => {
      this.moveByKeys();
      this.jumpByKey();
    }, 1000 / 60);
  }


  /**
   * Lets the fox jump while Space is pressed (jump() checks the ground).
   */
  jumpByKey() {
    if (keyBoard.space == true) {
      this.jump();
    }
  }


  /**
   * Moves the fox left or right while the arrow keys are pressed.
   */
  moveByKeys() {
    if (keyBoard.left == true) {
      this.moveLeft();
    }
    if (keyBoard.right == true) {
      this.moveRight();
    }
  }


  /**
   * Moves the fox to the left, but not past the start of the level (x = 0).
   */
  moveLeft() {
    this.x = Math.max(0, this.x - this.getSpeed());
    this.otherDirection = true;
  }


  /**
   * Moves the fox to the right, but not past the end of the level.
   */
  moveRight() {
    let maxX = this.world.level.levelEndX - this.width;
    this.x = Math.min(maxX, this.x + this.getSpeed());
    this.otherDirection = false;
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
   * Returns the jump frame: stretched while rising, gathered while falling.
   * @returns {{path: string, frames: number, fps: number, row: number, firstFrame: number}} The jump animation.
   */
  getJumpAnimation() {
    if (this.speedY > 0) {
      return this.animations.jumpUp;
    }
    return this.animations.jumpDown;
  }


  /**
   * Chooses the animation: jump (in the air), run (moving + Shift), walk (moving) or idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isAboveGround()) {
      return this.getJumpAnimation();
    }
    if (this.isMoving() && keyBoard.shift == true) {
      return this.animations.run;
    }
    if (this.isMoving()) {
      return this.animations.walk;
    }
    return this.animations.idle;
  }
}
