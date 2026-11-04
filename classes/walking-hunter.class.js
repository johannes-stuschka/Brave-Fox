/**
 * A hunter that walks slowly toward the fox.
 * @extends Hunter
 */
class WalkingHunter extends Hunter {
  static animationNames = ["walk", "dead"];

  minSpeed = 0.6;
  maxSpeed = 1.2;
  fpsPerSpeed = 10;

  /**
   * Creates a walking hunter with a random slow speed and lets it walk left.
   * @param {number} x - Start position of the hunter in the level.
   */
  constructor(x) {
    super(x);
    this.speed = this.getRandomSpeed();
    this.animations.walk.fps = this.speed * this.fpsPerSpeed;
    this.startAnimations();
    this.walk();
  }


  /**
   * Picks a random speed between minSpeed and maxSpeed.
   * @returns {number} Pixels the hunter moves per tick.
   */
  getRandomSpeed() {
    return this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
  }


  /**
   * Starts the movement interval of the hunter (60 times per second).
   */
  walk() {
    setTickInterval(() => this.moveLeft());
  }


  /**
   * Moves the hunter one step to the left, toward the fox.
   * A dead hunter does not move any more.
   */
  moveLeft() {
    if (this.isDead()) {
      return;
    }
    this.x -= this.speed;
  }


  /**
   * Plays the dead animation when defeated, otherwise the walk animation.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.dead;
    }
    return this.animations.walk;
  }
}
