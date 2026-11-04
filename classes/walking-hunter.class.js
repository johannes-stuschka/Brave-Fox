/**
 * A hunter that walks slowly toward the fox and also shoots at it.
 * It reuses the shooting of ShootingHunter: while it shoots it stands still
 * and looks at the fox, afterwards it walks on to the left.
 * It shoots a bit less often than a standing hunter, because it is harder to dodge.
 * @extends ShootingHunter
 */
class WalkingHunter extends ShootingHunter {
  static animationNames = ["walk", "shot", "dead"];

  minSpeed = 0.6;
  maxSpeed = 1.2;
  fpsPerSpeed = 10;
  minCooldown = 2800;
  maxCooldown = 3600;

  /**
   * Creates a walking hunter with a random slow speed.
   * The inherited constructor already starts the animation and the update interval.
   * @param {number} x - Start position of the hunter in the level.
   */
  constructor(x) {
    super(x);
    this.speed = this.getRandomSpeed();
    this.animations.walk.fps = this.speed * this.fpsPerSpeed;
  }

  /**
   * Picks a random speed between minSpeed and maxSpeed.
   * @returns {number} Pixels the hunter moves per tick.
   */
  getRandomSpeed() {
    return this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
  }

  /**
   * One tick: shoots at the fox when it is in range, otherwise walks left.
   * Waits until the World has connected itself (this.world). A dead hunter does nothing.
   */
  update() {
    if (!this.world || this.isDead()) {
      return;
    }
    this.shootAtFox();
    if (!this.isShooting) {
      this.moveLeft();
    }
  }

  /**
   * Moves the hunter one step to the left, toward the fox, and lets it look left.
   */
  moveLeft() {
    this.otherDirection = true;
    this.x -= this.speed;
  }

  /**
   * Plays the dead animation when defeated, the shot animation while shooting, otherwise walk.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.dead;
    }
    if (this.isShooting) {
      return this.animations.shot;
    }
    return this.animations.walk;
  }
}
