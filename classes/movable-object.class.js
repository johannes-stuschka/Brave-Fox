class MovableObject {
  x = 160;
  img;
  height = 64;
  width = 64;
  otherDirection = false;
  sourceX = 0;
  sourceY = 0;
  currentImage = 0;
  imageCache = {};
  currentAnimation = null;
  animationTime = 0; // vergangene ms seit dem letzten Frame-Wechsel
  animationTick = 1000 / 60; // so oft prüft animate(), ob ein neuer Frame dran ist
  groundY = 389; // y-Wert, auf dem das Objekt auf dem Boden steht
  speedY = 0; // Geschwindigkeit nach oben (positiv = steigt, negativ = fällt)
  acceleration = 0.5; // so stark zieht die Schwerkraft pro Tick nach unten
  jumpSpeed = 12; // Start-Geschwindigkeit beim Absprung
  offset = { top: 0, right: 0, bottom: 0, left: 0 }; // durchsichtiger Rand im Bild, gilt für Blick nach rechts
  energy = 100; // Lebenspunkte
  lastHit = 0; // Zeitpunkt (ms) des letzten Treffers
  invulnerableTime = 1000; // so lange (ms) nach einem Treffer gibt es keinen neuen Schaden

  /**
   * Loads a single image and uses it as the current image.
   * @param {string} path - Path to the image file.
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }


  /**
   * Preloads the sprite sheets of all given animations into the image cache.
   * @param {Array<{path: string}>} animations - Animations whose images should be loaded.
   */
  loadImages(animations) {
    animations.forEach((animation) => {
      let img = new Image();
      img.src = animation.path;
      this.imageCache[animation.path] = img;
    });
  }


  /**
   * Starts the single animation interval of this object.
   * Shows the first frame right away so there is always an image to draw.
   */
  animate() {
    this.playAnimation(this.getCurrentAnimation());
    setStoppableInterval(() => this.updateAnimation(), this.animationTick);
  }


  /**
   * Returns the animation that should play right now.
   * Subclasses can override this (e.g. walk while a key is pressed).
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    return this.animations.idle;
  }


  /**
   * Called every tick: plays the next frame when the animation changed
   * or when enough time has passed for its fps.
   */
  updateAnimation() {
    let animation = this.getCurrentAnimation();
    this.animationTime += this.animationTick;
    let frameDuration = 1000 / animation.fps;
    if (animation !== this.currentAnimation || this.animationTime >= frameDuration) {
      this.animationTime = 0;
      this.playAnimation(animation);
    }
  }


  /**
   * Switches to a new animation (starting at frame 0) or advances one frame.
   * @param {{path: string, frames: number, fps: number, row: number, loop?: boolean}} animation - The animation to play.
   */
  playAnimation(animation) {
    if (animation !== this.currentAnimation) {
      this.currentAnimation = animation;
      this.img = this.imageCache[animation.path];
      this.currentImage = 0;
    } else {
      this.currentImage = this.getNextFrame(animation);
    }
    this.showFrame(animation);
  }


  /**
   * Returns the number of the next frame. Normal animations start again at 0,
   * animations with loop: false stay on their last frame (e.g. dying).
   * @param {{frames: number, loop?: boolean}} animation - The animation that is playing.
   * @returns {number} The next frame number.
   */
  getNextFrame(animation) {
    if (animation.loop === false) {
      return Math.min(this.currentImage + 1, animation.frames - 1);
    }
    return (this.currentImage + 1) % animation.frames;
  }


  /**
   * Sets sourceX/sourceY so that World.addToMap cuts out the current frame.
   * firstFrame (optional) lets an animation start later in the row.
   * @param {{row: number, firstFrame?: number}} animation - The animation that is playing.
   */
  showFrame(animation) {
    let frame = (animation.firstFrame || 0) + this.currentImage;
    this.sourceX = frame * this.frameWidth;
    this.sourceY = (animation.row || 0) * this.frameHeight;
  }


  /**
   * Starts the gravity interval (60 times per second).
   */
  applyGravity() {
    setStoppableInterval(() => this.updateGravity(), 1000 / 60);
  }


  /**
   * One gravity step: moves the object by speedY and slows it down.
   * Does nothing while the object stands on the ground.
   */
  updateGravity() {
    if (this.isAboveGround() || this.speedY > 0) {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
      this.landOnGround();
    }
  }


  /**
   * Puts the object exactly on the ground if it fell below it.
   */
  landOnGround() {
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
    }
  }


  /**
   * Checks if the object is in the air.
   * @returns {boolean} True if the object is higher than the ground.
   */
  isAboveGround() {
    return this.y < this.groundY;
  }


  /**
   * Lets the object jump, but only when it stands on the ground.
   */
  jump() {
    if (!this.isAboveGround()) {
      this.speedY = this.jumpSpeed;
    }
  }


  /**
   * Returns the hitbox: the drawn rectangle minus the transparent border (offset).
   * When the object is mirrored, left and right offset swap places.
   * @returns {{x: number, y: number, width: number, height: number}} The hitbox in level coordinates.
   */
  getHitbox() {
    let left = this.otherDirection ? this.offset.right : this.offset.left;
    let right = this.otherDirection ? this.offset.left : this.offset.right;
    return {
      x: this.x + left,
      y: this.y + this.offset.top,
      width: this.width - left - right,
      height: this.height - this.offset.top - this.offset.bottom,
    };
  }


  /**
   * Checks if the hitboxes of this object and another object overlap.
   * @param {MovableObject} other - The other object.
   * @returns {boolean} True if both hitboxes touch each other.
   */
  isColliding(other) {
    let a = this.getHitbox();
    let b = other.getHitbox();
    return a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height > b.y && a.y < b.y + b.height;
  }


  /**
   * Takes damage, but only if the object is not invulnerable after the last hit.
   * Energy never drops below 0.
   * @param {number} damage - How many energy points are lost.
   */
  hit(damage) {
    if (this.isHurt()) {
      return;
    }
    this.energy = Math.max(0, this.energy - damage);
    this.lastHit = Date.now();
  }


  /**
   * Checks if the last hit was less than invulnerableTime ago.
   * @returns {boolean} True while the object is still invulnerable.
   */
  isHurt() {
    return Date.now() - this.lastHit < this.invulnerableTime;
  }


  /**
   * Checks if the object has no energy left.
   * @returns {boolean} True if energy is 0.
   */
  isDead() {
    return this.energy == 0;
  }
}
