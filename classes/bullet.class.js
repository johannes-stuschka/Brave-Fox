/**
 * A bullet shot by a hunter. It flies in a straight line until it hits the fox,
 * the ground or leaves the screen.
 * @extends MovableObject
 */
class Bullet extends MovableObject {
  scale = 2;
  width = 10 * this.scale;
  height = 4 * this.scale;
  speed;
  groundY = 447 - this.height;
  damage;
  stepX = 0;
  stepY = 0;

  /**
   * Creates a bullet centered on the gun muzzle, aimed at a target point.
   * Speeds are pixels per tick; the fox walks 4 pixels per tick.
   * @param {number} x - x of the gun muzzle in the level.
   * @param {number} y - y of the gun muzzle in the level.
   * @param {number} targetX - x of the point the bullet flies toward.
   * @param {number} targetY - y of the point the bullet flies toward.
   * @param {number} speed - Flight speed in pixels per tick.
   * @param {number} damage - Energy the fox loses when this bullet hits it.
   */
  constructor(x, y, targetX, targetY, speed, damage) {
    super();
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.speed = speed;
    this.damage = damage;
    this.aimAt(targetX, targetY);
    this.img = ICONS.bullet;
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
   * One flight step along the straight line. Called 60 times per second by the World.
   */
  move() {
    this.x += this.stepX;
    this.y += this.stepY;
  }

}
