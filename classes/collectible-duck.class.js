/**
 * A duck lying in the level. The fox picks it up to throw it later.
 * @extends MovableObject
 */
class CollectibleDuck extends MovableObject {
  scale = 2; // jedes SVG-Pixel wird 2x2 gezeichnet, wie beim Fuchs
  width = 17 * this.scale; // duck.svg ist 17 x 14 Pixel groß
  height = 14 * this.scale;
  waddleTime = 600; // nach so vielen ms dreht sich die Ente in die andere Richtung
  offset = { top: 0, right: 2, bottom: 2, left: 2 };

  /**
   * Creates a duck that stands on the ground and can be collected as ammo.
   * @param {number} x - Position in the level.
   * @param {number} y - Top edge of the duck (its feet then touch the ground).
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.img = ICONS.duck;
    this.waddle();
  }


  /**
   * Starts the interval that lets the duck waddle on the spot (it never leaves the ground).
   */
  waddle() {
    setStoppableInterval(() => this.updateWaddle(), 1000 / 60);
  }


  /**
   * Turns the duck left or right every waddleTime milliseconds.
   * Each duck turns at a different moment because of its x position.
   */
  updateWaddle() {
    let step = Math.floor((Date.now() + this.x) / this.waddleTime);
    this.otherDirection = step % 2 == 1;
  }
}
