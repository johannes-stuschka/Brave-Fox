/**
 * An item lying on the ground that the fox collects by touching it.
 * What it looks like and how it moves comes from a kind preset like Collectible.duck or Collectible.berry.
 * @extends DrawableObject
 */
class Collectible extends DrawableObject {
  static duck = {
    images: [ICONS.duck],
    svgWidth: 17,
    svgHeight: 14,
    groundY: 419,
    offset: { top: 0, right: 2, bottom: 2, left: 2 },
    switchTime: 600,
    mirrors: true,
  };

  static berry = {
    images: [ICONS.berry, ICONS.berryDull],
    svgWidth: 12,
    svgHeight: 13,
    groundY: 421,
    offset: { top: 6, right: 0, bottom: 2, left: 0 },
    switchTime: 400,
    mirrors: false,
  };

  scale = 2;
  images;
  switchTime;
  mirrors;

  /**
   * Creates a collectible of the given kind standing on the ground.
   * @param {number} x - Position in the level.
   * @param {Object} kind - A kind preset, e.g. Collectible.duck or Collectible.berry.
   */
  constructor(x, kind) {
    super();
    this.x = x;
    this.y = kind.groundY;
    this.width = kind.svgWidth * this.scale;
    this.height = kind.svgHeight * this.scale;
    this.offset = kind.offset;
    this.images = kind.images;
    this.switchTime = kind.switchTime;
    this.mirrors = kind.mirrors;
    this.img = this.images[0];
    this.animate();
  }


  /**
   * Starts the interval that animates the collectible on the spot (it never moves).
   */
  animate() {
    setTickInterval(() => this.updateAnimation());
  }


  /**
   * Shows the next image and, if the kind mirrors, turns around every switchTime milliseconds.
   * Each collectible switches at a different moment because of its x position.
   */
  updateAnimation() {
    let step = Math.floor((Date.now() + this.x) / this.switchTime);
    this.img = this.images[step % this.images.length];
    this.otherDirection = this.mirrors && step % 2 == 1;
  }
}
