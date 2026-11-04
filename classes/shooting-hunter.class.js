/**
 * A hunter that stands still and shoots at the fox when it comes into range.
 * Owns all shooting logic, so the end boss can reuse it.
 * @extends Hunter
 */
class ShootingHunter extends Hunter {
  static animationNames = ["idle", "shot", "dead"];

  range = 450;
  minCooldown = 2000;
  maxCooldown = 2500;
  muzzleOffsetX = 130;
  muzzleY = 377;
  bulletSpeed = 7;
  bulletDamage = 15;
  shotFrame = 1;
  isShooting = false;
  bulletFired = false;
  shotStartTime = 0;
  nextShotTime = 0;

  /**
   * Creates a hunter that shoots at the fox and starts its animation and update intervals.
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super(x);
    this.startAnimations();
    this.watchFox();
  }


  /**
   * Starts the interval that updates the hunter 60 times per second.
   * update() decides what happens on every tick.
   */
  watchFox() {
    setTickInterval(() => this.update());
  }


  /**
   * One tick: shoots at the fox.
   * Waits until the World has connected itself (this.world). A dead hunter does nothing.
   */
  update() {
    if (!this.world || this.isDead()) {
      return;
    }
    this.shootAtFox();
  }


  /**
   * The full shooting sequence of one tick: look at the fox, start a shot,
   * fire the bullet at the right frame and end the shot when it is done.
   */
  shootAtFox() {
    this.faceFox();
    this.startShotIfReady();
    this.fireAtShotFrame();
    this.endShotWhenDone();
  }


  /**
   * Returns the horizontal distance from the hunter to the fox (center to center).
   * Negative means the fox is to the left of the hunter.
   * @returns {number} Distance in pixels.
   */
  getDistanceToFox() {
    let fox = this.world.character;
    return fox.x + fox.width / 2 - (this.x + this.width / 2);
  }


  /**
   * Turns the hunter so it looks at the fox (sprite looks right, mirrored looks left).
   */
  faceFox() {
    this.otherDirection = this.getDistanceToFox() < 0;
  }


  /**
   * Starts the shot animation when the fox is in range and the cooldown is over.
   */
  startShotIfReady() {
    let foxInRange = Math.abs(this.getDistanceToFox()) <= this.range;
    if (this.isShooting || !foxInRange || Date.now() < this.nextShotTime) {
      return;
    }
    this.startShot();
  }


  /**
   * Starts the shot animation. The bullet comes later in fireAtShotFrame().
   */
  startShot() {
    this.isShooting = true;
    this.bulletFired = false;
    this.shotStartTime = Date.now();
  }


  /**
   * Fires one bullet (with a bang) as soon as the muzzle-flash frame of the shot is shown.
   */
  fireAtShotFrame() {
    let isFlashFrame = this.currentAnimation === this.animations.shot && this.currentImage === this.shotFrame;
    if (this.isShooting && !this.bulletFired && isFlashFrame) {
      this.world.bullets.push(this.createBullet());
      this.bulletFired = true;
      this.playShotSound();
    }
  }


  /**
   * Creates a bullet at the gun muzzle that flies toward the aim point.
   * @returns {Bullet} The new bullet.
   */
  createBullet() {
    let aim = this.getAimPoint();
    return new Bullet(this.getMuzzleX(), this.muzzleY, aim.x, aim.y, this.bulletSpeed, this.bulletDamage);
  }


  /**
   * Returns the x position of the gun muzzle, mirrored when the hunter looks left.
   * @returns {number} Muzzle x in level coordinates.
   */
  getMuzzleX() {
    if (this.otherDirection) {
      return this.x + this.width - this.muzzleOffsetX;
    }
    return this.x + this.muzzleOffsetX;
  }


  /**
   * Aims at the middle of the fox's hitbox. The bullet flies straight to where
   * the fox is now, so the fox can still dodge.
   * @returns {{x: number, y: number}} The point the bullet flies toward.
   */
  getAimPoint() {
    let fox = this.world.character.getHitbox();
    return { x: fox.x + fox.width / 2, y: fox.y + fox.height / 2 };
  }


  /**
   * Plays the gun shot, but only if the hunter is visible on the canvas
   * (hunters far away should not be heard).
   */
  playShotSound() {
    if (this.isOnScreen()) {
      soundManager.play("shot");
    }
  }


  /**
   * Checks if a part of the hunter is inside the visible part of the level.
   * @returns {boolean} True if the hunter can be seen on the canvas.
   */
  isOnScreen() {
    let screenLeft = -this.world.cameraX;
    let screenRight = screenLeft + this.world.canvas.width;
    return this.x + this.width > screenLeft && this.x < screenRight;
  }


  /**
   * Ends the shot after all frames of Shot.png were shown and plans the next shot.
   */
  endShotWhenDone() {
    let shot = this.animations.shot;
    let shotDuration = (shot.frames * 1000) / shot.fps;
    if (this.isShooting && Date.now() - this.shotStartTime >= shotDuration) {
      this.isShooting = false;
      this.nextShotTime = Date.now() + this.getRandomCooldown();
    }
  }


  /**
   * Picks a random pause between minCooldown and maxCooldown.
   * @returns {number} Pause in milliseconds.
   */
  getRandomCooldown() {
    return this.minCooldown + Math.random() * (this.maxCooldown - this.minCooldown);
  }


  /**
   * Plays the dead animation when defeated, the shot animation while shooting, otherwise idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.dead;
    }
    if (this.isShooting) {
      return this.animations.shot;
    }
    return this.animations.idle;
  }
}
