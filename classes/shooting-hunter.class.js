class ShootingHunter extends Hunter {
  range = 450; // ab diesem Abstand (in Pixeln) zum Fuchs wird geschossen
  minCooldown = 2000; // Pause zwischen zwei Schüssen: 2 bis 2,5 Sekunden
  maxCooldown = 2500;
  shotFrame = 1; // in diesem Frame von Shot.png blitzt das Mündungsfeuer
  muzzleOffsetX = 130; // Mündung: 104px im Frame * 1.25 (Abstand zur Bildkante)
  muzzleY = 377; // y (287) + 72px im Frame * 1.25
  isShooting = false;
  bulletFired = false;
  shotStartTime = 0;
  nextShotTime = 0;
  animations = {
    idle: { path: "./imgs/Cowboy_1/Idle.png", frames: 6, fps: 6, row: 0 },
    shot: { path: "./imgs/Cowboy_1/Shot.png", frames: 4, fps: 8, row: 0 },
    dead: { path: "./imgs/Cowboy_1/Dead.png", frames: 5, fps: 8, row: 0, loop: false },
  };

  /**
   * Creates a hunter that stands still and shoots at the fox when it comes close.
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super(x);
    this.startAnimations();
    this.watchFox();
  }


  /**
   * Starts the interval that checks the fox 60 times per second.
   */
  watchFox() {
    setStoppableInterval(() => this.update(), 1000 / 60);
  }


  /**
   * One tick: look at the fox, start a shot, fire the bullet, end the shot.
   * Waits until the World has connected itself (this.world). A dead hunter does nothing.
   */
  update() {
    if (!this.world || this.isDead()) {
      return;
    }
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
    this.isShooting = true;
    this.bulletFired = false;
    this.shotStartTime = Date.now();
  }


  /**
   * Fires one bullet as soon as the muzzle-flash frame of the shot is shown.
   */
  fireAtShotFrame() {
    let isFlashFrame = this.currentAnimation === this.animations.shot && this.currentImage === this.shotFrame;
    if (this.isShooting && !this.bulletFired && isFlashFrame) {
      this.world.bullets.push(this.createBullet());
      this.bulletFired = true;
    }
  }


  /**
   * Creates a bullet at the gun muzzle that flies in the looking direction.
   * @returns {Bullet} The new bullet.
   */
  createBullet() {
    if (this.otherDirection) {
      return new Bullet(this.x + this.width - this.muzzleOffsetX, this.muzzleY, -1);
    }
    return new Bullet(this.x + this.muzzleOffsetX, this.muzzleY, 1);
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
