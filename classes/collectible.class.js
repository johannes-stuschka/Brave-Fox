/**
 * An item that the fox collects by touching it. It lies on the ground or floats in the air.
 * What it looks like and how it moves comes from a kind preset like Collectible.duck or Collectible.berry.
 * A floating item hovers floatHeight pixels above the ground and bobs gently up and down,
 * so the fox has to jump to reach it.
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
  floatHeight = 90;
  bobHeight = 6;
  bobTime = 1200;
  images;
  switchTime;
  mirrors;
  floating;
  baseY;

  /**
   * Creates a collectible of the given kind, on the ground or floating in the air.
   * @param {number} x - Position in the level.
   * @param {Object} kind - A kind preset, e.g. Collectible.duck or Collectible.berry.
   * @param {boolean} [floating=false] - True lets the item float above the ground.
   */
  constructor(x, kind, floating = false) {
    super();
    this.x = x;
    this.floating = floating;
    this.baseY = floating ? kind.groundY - this.floatHeight : kind.groundY;
    this.y = this.baseY;
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
   * Starts the interval that animates the collectible on the spot
   * (a floating one also bobs up and down).
   */
  animate() {
    setTickInterval(() => {
      this.updateAnimation();
      this.bob();
    });
  }


  /**
   * Moves a floating collectible gently up and down around baseY (a sine wave).
   * Each one bobs at a different moment because of its x position. Items on the ground stay still.
   */
  bob() {
    if (!this.floating) {
      return;
    }
    let angle = ((Date.now() + this.x * 3) / this.bobTime) * 2 * Math.PI;
    this.y = this.baseY + Math.sin(angle) * this.bobHeight;
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
