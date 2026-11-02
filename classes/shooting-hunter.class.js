class ShootingHunter extends Hunter {
  range = 450; // ab diesem Abstand (in Pixeln) zum Fuchs wird geschossen
  minCooldown = 2000; // Pause zwischen zwei Schüssen: 2 bis 2,5 Sekunden
  maxCooldown = 2500;
  muzzleOffsetX = 130; // Mündung: 104px im Frame * 1.25 (Abstand zur Bildkante)
  muzzleY = 377; // y (287) + 72px im Frame * 1.25
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
