class Hunter extends MovableObject {
  frameWidth = 128; // ein Frame im Cowboy-Spritesheet (z.B. Walk.png: 1536 / 12)
  frameHeight = 128;
  width = 160; // 1.25x gezeichnet: sichtbare Figur ca. 91px, knapp 2x so groß wie der Fuchs
  height = 160;
  y = 287; // Füße (unterste Sprite-Zeile) stehen auf der Bodenlinie des Fuchses (y = 447)
  otherDirection = true; // Sprite schaut nach rechts, Jäger schauen zum Fuchs nach links
  world; // wird von der World gesetzt (z.B. um den Fuchs zu finden)
  offset = { top: 70, right: 62, bottom: 0, left: 58 }; // sichtbarer Körper: Frame-Pixel 47-78 / 56-127, mal 1.25
  contactDamage = 20; // so viel Energie verliert der Fuchs bei Berührung
  canBeStomped = true; // der Fuchs kann ihn durch Draufspringen besiegen (Endboss: false)
  deathTime = 0; // Zeitpunkt (ms), an dem der Jäger besiegt wurde
  removeDelay = 1200; // so lange (ms) bleibt der besiegte Jäger noch liegen
  shotFrame = 1; // nur für schießende Jäger: in diesem Frame von Shot.png blitzt das Mündungsfeuer
  isShooting = false;
  bulletFired = false;
  shotStartTime = 0;
  nextShotTime = 0;

  /**
   * Shared base for all hunters: sets the position in the level.
   * Subclasses define their animations and call startAnimations().
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super();
    this.x = x;
  }


  /**
   * Preloads the sprite sheets of this hunter and starts its animation interval.
   */
  startAnimations() {
    this.loadImages(Object.values(this.animations));
    this.animate();
  }


  /**
   * Defeats the hunter: no energy left, remembers when it happened.
   * The dead animation and the removal are based on this.
   */
  die() {
    this.energy = 0;
    this.deathTime = Date.now();
    soundManager.play("hunter-dead");
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
    let screenLeft = -this.world.camera_x;
    let screenRight = screenLeft + this.world.canvas.width;
    return this.x + this.width > screenLeft && this.x < screenRight;
  }


  /**
   * A thrown duck hit the hunter: a normal hunter is defeated right away.
   * The end boss can override this and only lose some energy instead.
   */
  takeDuckHit() {
    this.die();
  }


  /**
   * Checks if the hunter is dead long enough to be removed from the level.
   * @returns {boolean} True when the dead hunter can disappear.
   */
  isReadyToRemove() {
    return this.isDead() && Date.now() - this.deathTime >= this.removeDelay;
  }


  /**
   * Starts the interval that updates a shooting hunter 60 times per second.
   * The subclass decides in update() what happens on every tick.
   */
  watchFox() {
    setStoppableInterval(() => this.update(), 1000 / 60);
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
}
