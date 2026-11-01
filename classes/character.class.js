const MAX_DUCKS = 10; // so viele Enten kann der Fuchs höchstens tragen
const SLEEP_DELAY = 10000; // nach so vielen ms ohne Taste und ohne Treffer schläft der Fuchs ein (max. 15 s)

class Character extends MovableObject {
  y = 389;
  frameWidth = 32;
  frameHeight = 32;
  walkSpeed = 4;
  world; // wird von der World gesetzt (für levelEndX)
  runSpeed = 7;
  ducks = 0; // gesammelte Enten (Munition)
  berries = 0; // gesammelte Beeren
  throwCooldown = 400; // so lange (ms) muss der Fuchs zwischen zwei Würfen warten
  lastThrow = 0; // Zeitpunkt (ms) des letzten Wurfs
  throwKeyWasPressed = false; // war D im letzten Tick schon gedrückt? (kein Dauerfeuer)
  throwDistance = 24; // so weit vor der Fuchs-Mitte erscheint die geworfene Ente
  throwHeight = 10; // so weit unter der Oberkante des Fuchses startet die Ente
  bounceSpeed = 7; // kleiner Hüpfer nach oben, wenn der Fuchs auf einen Gegner springt
  lastActivity = Date.now(); // Zeitpunkt (ms) der letzten Taste oder des letzten Treffers
  offset = { top: 12, right: 4, bottom: 10, left: 12 }; // Kopf bis Pfoten, ohne Schwanzspitze und Schatten
  animations = {
    idle: { path: "./imgs/fox/Fox_Idle_with_shadow.png", frames: 4, fps: 6, row: 3 },
    walk: { path: "./imgs/fox/Fox_walk_with_shadow.png", frames: 6, fps: 10, row: 3 },
    run: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 6, fps: 13, row: 3 },
    jumpUp: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 3 },
    jumpDown: { path: "./imgs/fox/Fox_Run_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 0 },
    hurt: { path: "./imgs/fox/Fox_Hurt_with_shadow.png", frames: 4, fps: 8, row: 3 },
    death: { path: "./imgs/fox/Fox_Death_with_shadow.png", frames: 6, fps: 6, row: 3, loop: false },
    sleep: { path: "./imgs/fox/Fox_Death_with_shadow.png", frames: 1, fps: 1, row: 3, firstFrame: 5 }, // liegender Fuchs
  };

  /**
   * Creates the fox, preloads its animations and starts animation, movement and gravity.
   */
  constructor() {
    super();
    this.loadImages(Object.values(this.animations));
    this.animate();
    this.move();
    this.applyGravity();
  }


  /**
   * Starts the movement interval of the fox (60 times per second).
   */
  move() {
    setStoppableInterval(() => this.handleKeys(), 1000 / 60);
  }


  /**
   * One input tick: remembers activity, then walks, jumps and throws.
   * A dead fox ignores every key.
   */
  handleKeys() {
    if (this.isDead()) {
      return;
    }
    this.trackActivity();
    this.moveByKeys();
    this.jumpByKey();
    this.throwByKey();
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
   * A dead fox can not be hit any more.
   * @param {number} damage - How many energy points are lost.
   */
  hit(damage) {
    if (this.isDead()) {
      return;
    }
    super.hit(damage);
    this.lastActivity = Date.now();
  }


  /**
   * Returns how long the fox has been sleeping already.
   * @returns {number} Milliseconds since falling asleep (negative while still awake).
   */
  getSleepTime() {
    return Date.now() - this.lastActivity - SLEEP_DELAY;
  }


  /**
   * Checks if the fox did nothing for longer than SLEEP_DELAY and is still alive.
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
    this.ducks--;
    this.lastThrow = Date.now();
    this.world.thrownDucks.push(this.createThrownDuck());
  }


  /**
   * Creates a duck in front of the fox that flies in the direction the fox looks.
   * @returns {ThrowableDuck} The new thrown duck.
   */
  createThrownDuck() {
    let direction = this.otherDirection ? -1 : 1;
    let centerX = this.x + this.width / 2 + direction * this.throwDistance;
    return new ThrowableDuck(centerX, this.y + this.throwHeight, direction);
  }


  /**
   * Small jump after landing on an enemy (works in the air, unlike jump()).
   */
  bounce() {
    this.speedY = this.bounceSpeed;
  }


  /**
   * Checks if the fox can carry one more duck.
   * @returns {boolean} True while the fox has fewer than MAX_DUCKS.
   */
  canCollectDuck() {
    return this.ducks < MAX_DUCKS;
  }


  /**
   * Adds one duck to the ammo, but never more than MAX_DUCKS.
   */
  collectDuck() {
    this.ducks = Math.min(MAX_DUCKS, this.ducks + 1);
  }


  /**
   * Adds one collected berry.
   */
  collectBerry() {
    this.berries++;
  }


  /**
   * Lets the fox jump while Space is pressed (jump() checks the ground).
   */
  jumpByKey() {
    if (keyBoard.space == true) {
      this.jump();
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
    this.x = Math.max(0, this.x - this.getSpeed());
    this.otherDirection = true;
  }


  /**
   * Moves the fox to the right, but not past the end of the level.
   */
  moveRight() {
    let maxX = this.world.level.levelEndX - this.width;
    this.x = Math.min(maxX, this.x + this.getSpeed());
    this.otherDirection = false;
  }


  /**
   * Returns the current speed: faster while Shift is held.
   * @returns {number} Pixels the fox moves per tick.
   */
  getSpeed() {
    if (keyBoard.shift == true) {
      return this.runSpeed;
    }
    return this.walkSpeed;
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
   * Chooses the animation on the ground: sleep, run (moving + Shift), walk (moving) or idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The ground animation.
   */
  getGroundAnimation() {
    if (this.isSleeping()) {
      return this.animations.sleep;
    }
    if (this.isMoving() && keyBoard.shift == true) {
      return this.animations.run;
    }
    if (this.isMoving()) {
      return this.animations.walk;
    }
    return this.animations.idle;
  }
}
