/**
 * A duck thrown by the fox. It flies in an arc and defeats hunters it hits.
 * It has the same size as the collectible duck and lands on the same ground line.
 * Speeds are measured in pixels per tick, the spin in radians per tick.
 * A direction of -1 flies to the left, 1 flies to the right.
 * @extends MovableObject
 */
class ThrowableDuck extends MovableObject {
  scale = 2;
  width = Collectible.duck.svgWidth * this.scale;
  height = Collectible.duck.svgHeight * this.scale;
  groundY = Collectible.duck.groundY;
  speed = 7.5;
  speedY = 7;
  acceleration = 0.4;
  spinSpeed = 0.2;
  direction;
  offset = { top: 2, right: 2, bottom: 2, left: 2 };

  /**
   * Creates a thrown duck. It starts centered on centerX and flies in the given direction.
   * When it flies to the left, the duck image is mirrored.
   * @param {number} centerX - Horizontal middle of the duck at the start.
   * @param {number} y - Top edge of the duck at the start.
   * @param {number} direction - -1 flies to the left, 1 flies to the right.
   */
  constructor(centerX, y, direction) {
    super();
    this.x = centerX - this.width / 2;
    this.y = y;
    this.direction = direction;
    this.otherDirection = direction < 0;
    this.img = ICONS.duck;
  }


  /**
   * One flight step: forward, up or down along the arc, and a little spin.
   * Called 60 times per second by the World.
   */
  move() {
    this.x += this.speed * this.direction;
    this.updateGravity();
    this.rotation += this.spinSpeed;
  }

}
