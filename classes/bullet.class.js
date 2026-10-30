class Bullet extends MovableObject {
  width = 10;
  height = 4;
  speed = 7; // Pixel pro Tick, viel schneller als der Fuchs (walkSpeed 4)
  flightY = 428; // Brusthöhe des Fuchses: mit einem Sprung kann er drüber
  sinkSpeed = 3; // so schnell sinkt die Kugel von der Mündung auf flightY
  damage = 15; // so viel Energie verliert der Fuchs bei einem Treffer
  direction; // -1 = fliegt nach links, 1 = fliegt nach rechts

  /**
   * Creates a bullet at the gun muzzle. It has no image file,
   * the image is painted on a tiny canvas instead.
   * @param {number} x - Start position (left edge) in the level.
   * @param {number} y - Start height (the muzzle of the gun).
   * @param {number} direction - -1 flies to the left, 1 flies to the right.
   */
  constructor(x, y, direction) {
    super();
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.img = this.createBulletImage();
  }


  /**
   * Paints a small bullet on its own canvas, so no image file is needed.
   * World.addToMap can draw a canvas exactly like an image.
   * @returns {HTMLCanvasElement} The painted bullet.
   */
  createBulletImage() {
    let canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#3b3b3b";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#f2c94c"; // heller Streifen, damit die Kugel auffällt
    ctx.fillRect(1, 1, this.width - 2, 1);
    return canvas;
  }


  /**
   * One flight step: forward by speed and down until flightY is reached.
   * Called 60 times per second by the World.
   */
  move() {
    this.x += this.speed * this.direction;
    this.y = Math.min(this.flightY, this.y + this.sinkSpeed);
  }
}
