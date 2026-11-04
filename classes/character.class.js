const MAX_DUCKS = 10;

/**
 * The fox that the player controls: walk, jump, throw ducks, collect berries.
 * @extends Creature
 */
class Character extends Creature {
  x = 160;
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  speed = 4;
  jumpSpeed = 12;
  ducks = 0;
  berries = 0;
  throwCooldown = 400;
  lastThrow = 0;
  throwKeyWasPressed = false;
  throwDistance = 24;
  throwHeight = 10;
  bounceSpeed = 7;
  pushSpeed = 0;
  pushFriction = 0.5;
  sleepDelay = 5000;
  lastActivity = Date.now();
  offset = { top: 12, right: 4, bottom: 10, left: 12 };
  shadowFreeImages = {};
  animations = {
    idle: { path: "./imgs/fox/Fox_Idle_with_shadow.png", frames: 4, fps: 6, row: 3 },
    walk: { path: "./imgs/fox/Fox_walk_with_shadow.png", frames: 6, fps: 10, row: 3 },
    jumpUp: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 2, firstFrame: 3 },
    jumpDown: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 2, firstFrame: 0 },
    hurt: { path: "./imgs/fox/Fox_Hurt_with_shadow.png", frames: 4, fps: 8, row: 3 },
    death: { path: "./imgs/fox/Fox_Death_with_shadow.png", frames: 6, fps: 6, row: 3, loop: false },
    sleep: { path: "./imgs/fox/Fox_Death_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 5 },
  };

  /**
   * Creates the fox, preloads its animations and starts animation, movement and gravity.
   * The jump borrows two fixed frames of the run sheet (its rows are swapped: row 2 looks right).
   * The sleep frame is the last frame of the lying death animation.
   * pushSpeed is the sideways speed of a knockback, pushFriction slows it down every tick.
   */
  constructor() {
    super();
    this.startAnimations();
    this.move();
    this.applyGravity();
  }

  /**
   * Returns the image to draw: in the air (jumping, falling, hurt or dying) the fox has no shadow,
   * because the shadow belongs on the ground.
   * @returns {HTMLImageElement|HTMLCanvasElement} The sprite sheet to draw.
   */
  getImage() {
    if (!this.isAboveGround()) {
      return this.img;
    }
    return this.getShadowFreeImage(this.img);
  }

  /**
   * Returns a copy of the sprite sheet without shadow. The copy is made only once per sheet.
   * Until the sheet has loaded, the normal image is used.
   * @param {HTMLImageElement} img - The sprite sheet with shadow.
   * @returns {HTMLImageElement|HTMLCanvasElement} The sheet without shadow.
   */
  getShadowFreeImage(img) {
    if (!img.complete || img.naturalWidth == 0) {
      return img;
    }
    if (!this.shadowFreeImages[img.src]) {
      this.shadowFreeImages[img.src] = this.removeShadow(img);
    }
    return this.shadowFreeImages[img.src];
  }

  /**
   * Paints the sheet onto a new canvas and erases the shadow.
   * The shadow is the only half-transparent part of the fox images, the fox itself is fully opaque.
   * If the pixels can not be read (e.g. game opened as a file), the normal image is kept.
   * @param {HTMLImageElement} img - The sprite sheet with shadow.
   * @returns {HTMLImageElement|HTMLCanvasElement} The canvas without shadow (or the original image).
   */
  removeShadow(img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    try {
      ctx.putImageData(this.eraseHalfTransparentPixels(ctx.getImageData(0, 0, canvas.width, canvas.height)), 0, 0);
      return canvas;
    } catch (error) {
      return img;
    }
  }

  /**
   * Makes every half-transparent pixel fully transparent (each pixel has 4 values: red, green, blue, alpha).
   * @param {ImageData} imageData - The pixels of the sprite sheet.
   * @returns {ImageData} The same pixels, now without shadow.
   */
  eraseHalfTransparentPixels(imageData) {
    let pixels = imageData.data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 255) {
        pixels[i] = 0;
      }
    }
    return imageData;
  }

  /**
   * Starts the movement interval of the fox (60 times per second).
   */
  move() {
    setTickInterval(() => this.handleKeys());
  }

  /**
   * One input tick: snore sound, remembers activity, slides from a knockback,
   * then walks, jumps and throws. A dead fox ignores every key.
   */
  handleKeys() {
    this.updateSnore();
    if (this.isDead()) {
      return;
    }
    this.trackActivity();
    this.slideByPush();
    this.moveByKeys();
    this.jumpByKey();
    this.throwByKey();
  }

  /**
   * Plays the snore loop while the fox sleeps and stops it when it wakes up or dies.
   */
  updateSnore() {
    if (this.isSleeping()) {
      soundManager.startLoop("snore");
    } else {
      soundManager.stopLoop("snore");
    }
  }

  /**
   * Any pressed key counts as activity: the fox stays awake or wakes up.
   */
  trackActivity() {
    if (this.isAnyKeyPressed()) {
      this.lastActivity = Date.now();
    }
  }

  /**
   * Checks if at least one game key is pressed right now.
   * @returns {boolean} True if any key in keyBoard is true.
   */
  isAnyKeyPressed() {
    return Object.values(keyBoard).some((isPressed) => isPressed == true);
  }

  /**
   * Takes damage like every MovableObject and wakes the fox up.
   * A dead fox can not be hit any more. The yelp only sounds if the hit really hurt.
   * @param {number} damage - How many energy points are lost.
   */
  hit(damage) {
    if (this.isDead()) {
      return;
    }
    let energyBefore = this.energy;
    super.hit(damage);
    this.lastActivity = Date.now();
    if (this.energy < energyBefore) {
      soundManager.play("hurt");
    }
  }

  /**
   * Returns how long the fox has been sleeping already.
   * @returns {number} Milliseconds since falling asleep (negative while still awake).
   */
  getSleepTime() {
    return Date.now() - this.lastActivity - this.sleepDelay;
  }

  /**
   * Checks if the fox did nothing for longer than sleepDelay and is still alive.
   * @returns {boolean} True while the fox sleeps.
   */
  isSleeping() {
    return !this.isDead() && this.getSleepTime() > 0;
  }

  /**
   * Throws one duck when D was just pressed down. Holding D does not throw again,
   * the key has to be released and pressed once more.
   */
  throwByKey() {
    let isNewPress = keyBoard.d == true && !this.throwKeyWasPressed;
    this.throwKeyWasPressed = keyBoard.d;
    if (isNewPress && this.canThrowDuck()) {
      this.throwDuck();
    }
  }

  /**
   * Checks if the fox has a duck and the cooldown since the last throw is over.
   * @returns {boolean} True if the fox may throw a duck now.
   */
  canThrowDuck() {
    let cooldownOver = Date.now() - this.lastThrow >= this.throwCooldown;
    return this.ducks > 0 && cooldownOver;
  }

  /**
   * Uses one duck and lets it fly. The duck bar shows the new count in the next tick.
   */
  throwDuck() {
    soundManager.play("throw");
    this.ducks--;
    this.lastThrow = Date.now();
    this.world.thrownDucks.push(this.createThrownDuck());
  }

  /**
   * Creates a duck in front of the fox that flies in the direction the fox looks.
   * @returns {ThrowableDuck} The new thrown duck.
   */
  createThrownDuck() {
    let direction = this.getDirection();
    let centerX = this.x + this.width / 2 + direction * this.throwDistance;
    return new ThrowableDuck(centerX, this.y + this.throwHeight, direction);
  }

  /**
   * Lets the fox jump, but only when it stands on the ground.
   */
  jump() {
    if (!this.isAboveGround()) {
      this.speedY = this.jumpSpeed;
    }
  }

  /**
   * Small jump after landing on an enemy (works in the air, unlike jump()).
   */
  bounce() {
    this.speedY = this.bounceSpeed;
  }

  /**
   * Knocks the fox away from an enemy: a sideways slide plus a small hop.
   * @param {number} direction - -1 pushes to the left, 1 pushes to the right.
   * @param {number} speed - Start speed of the slide in pixels per tick.
   */
  knockBack(direction, speed) {
    this.pushSpeed = direction * speed;
    this.bounce();
  }

  /**
   * Moves the fox by the current knockback speed and slows the slide down until it stops.
   */
  slideByPush() {
    if (this.pushSpeed === 0) {
      return;
    }
    this.moveTo(this.x + this.pushSpeed);
    let slowdown = Math.min(Math.abs(this.pushSpeed), this.pushFriction);
    this.pushSpeed -= Math.sign(this.pushSpeed) * slowdown;
  }

  /**
   * Checks if the fox can carry one more duck.
   * @returns {boolean} True while the fox has fewer than MAX_DUCKS.
   */
  canCollectDuck() {
    return this.ducks < MAX_DUCKS;
  }

  /**
   * Adds one duck to the ammo, but never more than MAX_DUCKS. The duck quacks happily.
   */
  collectDuck() {
    this.ducks = Math.min(MAX_DUCKS, this.ducks + 1);
    soundManager.play("quack");
  }

  /**
   * Adds one collected berry and plays a sparkle.
   */
  collectBerry() {
    this.berries++;
    soundManager.play("berry");
  }

  /**
   * Lets the fox jump while ArrowUp is pressed, but only from the ground (then the jump sound plays).
   */
  jumpByKey() {
    if (keyBoard.up == true && !this.isAboveGround()) {
      this.jump();
      soundManager.play("jump");
    }
  }

  /**
   * Moves the fox left or right while the arrow keys are pressed.
   */
  moveByKeys() {
    if (keyBoard.left == true) {
      this.moveLeft();
    }
    if (keyBoard.right == true) {
      this.moveRight();
    }
  }

  /**
   * Moves the fox to the left, but not past the start of the level (x = 0).
   */
  moveLeft() {
    this.moveTo(this.x - this.speed);
    this.otherDirection = true;
  }

  /**
   * Moves the fox to the right, but not past the end of the level.
   */
  moveRight() {
    this.moveTo(this.x + this.speed);
    this.otherDirection = false;
  }

  /**
   * Puts the fox at a new x position, but never outside the level.
   * @param {number} x - The wanted x position.
   */
  moveTo(x) {
    let maxX = this.world.level.levelEndX - this.width;
    this.x = Math.min(maxX, Math.max(0, x));
  }

  /**
   * Checks if an arrow key for walking is pressed.
   * @returns {boolean} True if the fox is moving left or right.
   */
  isMoving() {
    return keyBoard.left == true || keyBoard.right == true;
  }

  /**
   * Returns the jump frame: stretched while rising, gathered while falling.
   * @returns {{path: string, frames: number, fps: number, row: number, firstFrame: number}} The jump animation.
   */
  getJumpAnimation() {
    if (this.speedY > 0) {
      return this.animations.jumpUp;
    }
    return this.animations.jumpDown;
  }

  /**
   * Chooses the animation: death, hurt, jump (in the air) or one of the ground animations.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.death;
    }
    if (this.isHurt()) {
      return this.animations.hurt;
    }
    if (this.isAboveGround()) {
      return this.getJumpAnimation();
    }
    return this.getGroundAnimation();
  }

  /**
   * Chooses the animation on the ground: sleep, walk (moving) or idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The ground animation.
   */
  getGroundAnimation() {
    if (this.isSleeping()) {
      return this.animations.sleep;
    }
    if (this.isMoving()) {
      return this.animations.walk;
    }
    return this.animations.idle;
  }
}
