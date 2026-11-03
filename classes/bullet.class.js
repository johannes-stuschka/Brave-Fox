/**
 * A bullet shot by a hunter. It flies in a straight line until it hits the fox,
 * the ground or leaves the screen.
 * @extends MovableObject
 */
class Bullet extends MovableObject {
  width = 10;
  height = 4;
  speed = 7; // Pixel pro Tick, viel schneller als der Fuchs (walkSpeed 4)
  groundY = 447; // Bodenlinie: hier schlägt die Kugel in den Boden ein
  damage = 15; // so viel Energie verliert der Fuchs bei einem Treffer
  stepX = 0; // so weit fliegt die Kugel pro Tick nach rechts (negativ = nach links)
  stepY = 0; // so weit fliegt die Kugel pro Tick nach unten (negativ = nach oben)
  rotation = 0; // Flugwinkel, World.addToMap zeichnet die Kugel damit gedreht

  /**
   * Creates a bullet at the gun muzzle, aimed at a target point (the fox).
   * It has no image file, the image is painted on a tiny canvas instead.
   * @param {number} x - Start position (left edge) in the level.
   * @param {number} y - Start height (the muzzle of the gun).
   * @param {number} targetX - x of the point the bullet flies toward.
   * @param {number} targetY - y of the point the bullet flies toward.
   */
  constructor(x, y, targetX, targetY) {
    super();
    this.x = x;
    this.y = y;
    this.aimAt(targetX, targetY);
    this.img = this.createBulletImage();
  }


  /**
   * Sets the flight steps so the bullet flies in a straight line toward the target.
   * The way to the target is shortened to exactly speed pixels per tick.
   * @param {number} targetX - x of the target point.
   * @param {number} targetY - y of the target point.
   */
  aimAt(targetX, targetY) {
    let distanceX = targetX - (this.x + this.width / 2);
    let distanceY = targetY - (this.y + this.height / 2);
    let length = Math.hypot(distanceX, distanceY) || 1;
    this.stepX = (distanceX / length) * this.speed;
    this.stepY = (distanceY / length) * this.speed;
    this.rotation = Math.atan2(this.stepY, this.stepX);
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
   * One flight step along the straight line. Called 60 times per second by the World.
   */
  move() {
    this.x += this.stepX;
    this.y += this.stepY;
  }


  /**
   * Checks if the bullet has reached the ground line.
   * @returns {boolean} True when the bullet hit the ground.
   */
  hasHitGround() {
    return this.y + this.height >= this.groundY;
  }
}
