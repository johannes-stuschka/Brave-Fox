/**
 * A cloud that slowly drifts through the sky.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
  y = 20;
  width = 750;
  height = (this.width * 324) / 576;
  speed = 0.2;
  levelEndX;

  /**
   * Creates a cloud at the given x position and lets it drift.
   * @param {number} x - Start position of the cloud.
   * @param {number} levelEndX - Right end of the level (cloud restarts there).
   */
  constructor(x, levelEndX) {
    super().loadImage("./imgs/background/nature_4/2.png");
    this.x = x;
    this.levelEndX = levelEndX;
    this.animate();
  }


  /**
   * Starts the interval that lets the cloud drift.
   */
  animate() {
    setTickInterval(() => this.drift());
  }


  /**
   * Moves the cloud a little to the left and starts again at the end of the level.
   */
  drift() {
    if (this.x > -this.width) {
      this.x -= this.speed;
    } else {
      this.x = this.levelEndX;
    }
  }
}
