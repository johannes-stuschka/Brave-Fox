/**
 * A drawable object that moves through the level with its own speed (pixels per tick).
 * It can also fall with gravity (speedY up, acceleration down) until it reaches its ground line.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
  speed = 0;
  groundY = 389;
  speedY = 0;
  acceleration = 0.5;

  /**
   * Starts the gravity interval (one step per game tick).
   */
  applyGravity() {
    setTickInterval(() => this.updateGravity());
  }


  /**
   * One gravity step: moves the object by speedY and slows it down.
   * Does nothing while the object stands on the ground.
   */
  updateGravity() {
    if (this.isAboveGround() || this.speedY > 0) {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
      this.landOnGround();
    }
  }


  /**
   * Puts the object exactly on the ground if it fell below it.
   */
  landOnGround() {
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
    }
  }


  /**
   * Checks if the object is in the air.
   * @returns {boolean} True if the object is higher than the ground.
   */
  isAboveGround() {
    return this.y < this.groundY;
  }
}
