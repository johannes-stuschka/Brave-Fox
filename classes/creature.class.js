/**
 * A living figure of the game (the fox and all hunters): it is drawn from a
 * sprite sheet animation and has energy that it loses when it is hit.
 * @extends MovableObject
 */
class Creature extends MovableObject {
  world;
  animations;
  frameWidth;
  frameHeight;
  sourceX = 0;
  sourceY = 0;
  currentImage = 0;
  imageCache = {};
  currentAnimation = null;
  animationTime = 0;
  energy = 100;
  lastHit = 0;
  invulnerableTime = 1000;

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
   * Preloads the sprite sheets of all animations of this creature and starts its animation interval.
   */
  startAnimations() {
    this.loadImages(Object.values(this.animations));
    this.animate();
  }


  /**
   * Starts the single animation interval of this creature.
   * Shows the first frame right away so there is always an image to draw.
   */
  animate() {
    this.playAnimation(this.getCurrentAnimation());
    setTickInterval(() => this.updateAnimation());
  }


  /**
   * Returns the animation that should play right now.
   * Subclasses override this (e.g. walk while a key is pressed).
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
    this.animationTime += TICK_TIME;
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
   * Sets sourceX/sourceY so that drawImage() cuts out the current frame.
   * firstFrame (optional) lets an animation start later in the row.
   * @param {{row: number, firstFrame?: number}} animation - The animation that is playing.
   */
  showFrame(animation) {
    let frame = (animation.firstFrame || 0) + this.currentImage;
    this.sourceX = frame * this.frameWidth;
    this.sourceY = (animation.row || 0) * this.frameHeight;
  }


  /**
   * Draws only the current frame of the sprite sheet.
   * @param {CanvasRenderingContext2D} ctx - The canvas context, already moved to the creature.
   */
  drawImage(ctx) {
    let { sourceX, sourceY, frameWidth, frameHeight } = this;
    ctx.drawImage(this.getImage(), sourceX, sourceY, frameWidth, frameHeight, 0, 0, this.width, this.height);
  }


  /**
   * Takes damage, but only if the creature is not invulnerable after the last hit.
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
   * @returns {boolean} True while the creature is still invulnerable.
   */
  isHurt() {
    return Date.now() - this.lastHit < this.invulnerableTime;
  }


  /**
   * Checks if the creature has no energy left.
   * @returns {boolean} True if energy is 0.
   */
  isDead() {
    return this.energy == 0;
  }
}
