/**
 * The game world: holds the fox and the level, runs the game loop and draws everything.
 */
class World {
  character = new Character();
  level;
  canvas;
  ctx;
  bullets = []; // alle Kugeln, die gerade fliegen
  thrownDucks = []; // alle Enten, die der Fuchs gerade geworfen hat
  cameraX = 0;
  cameraOffset = 120; // so viele Pixel bleibt der Fuchs vom linken Rand entfernt (Computer)
  touchCameraOffset = 220; // mit Touch-Buttons: Fuchs steht rechts neben den Lauf-Buttons (sie enden bei ca. 186 px)
  touchQuery = window.matchMedia("(max-width: 1024px), (pointer: coarse)"); // gleiche Bedingung wie in style.css
  collisionHandler; // prüft alle Zusammenstöße (Gegner, Kugeln, Enten)
  healthBar = new StatusBar(20, 20, "#c0392b", HEART_IMAGE, 100);
  duckBar = new StatusBar(20, 56, "#f5c542", DUCK_IMAGE, MAX_DUCKS, 2);
  berryBar; // wird im constructor erstellt, weil das Maximum von der Beeren-Anzahl im Level abhängt
  bossBar = new StatusBar(507, 20, "#8b1a1a", BOSS_HAT_IMAGE, 100); // oben rechts: 720 - 20 - 193 (Breite des Balkens)
  boss; // der Endboss des Levels, seine Energie zeigt die bossBar
  sleepZzz = new SleepZzz(); // "Z z z" über dem schlafenden Fuchs
  animationFrameId; // id des nächsten requestAnimationFrame, damit wir das Zeichnen stoppen können

  /**
   * Creates the world, connects fox and enemies with it,
   * starts bullets, thrown ducks, collisions and drawing.
   * @param {HTMLCanvasElement} canvas - The canvas to draw on.
   * @param {Level} level - The level that should be played.
   */
  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.level = level;
    this.berryBar = this.createBerryBar();
    this.boss = this.findBoss();
    this.setWorld();
    this.collisionHandler = new CollisionHandler(this);
    this.moveBullets();
    this.moveThrownDucks();
    this.startCollisionCheck();
    this.draw();
  }


  /**
   * Creates the berry bar under the duck bar. It is full when all berries of the level are collected.
   * @returns {StatusBar} The berry bar.
   */
  createBerryBar() {
    return new StatusBar(20, 92, "#e0243c", BERRY_IMAGE, this.level.berries.length, 2);
  }


  /**
   * Finds the end boss among the enemies of the level.
   * @returns {BossHunter|undefined} The boss, or undefined if the level has none.
   */
  findBoss() {
    return this.level.enemies.find((enemy) => enemy instanceof BossHunter);
  }


  /**
   * Gives the fox and every enemy access to the world (e.g. to find the fox).
   */
  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
    });
  }


  /**
   * Starts the interval that moves all bullets (60 times per second).
   */
  moveBullets() {
    setStoppableInterval(() => this.updateBullets(), 1000 / 60);
  }


  /**
   * Moves every bullet one step and keeps only the bullets that are still needed,
   * so the array does not grow forever.
   */
  updateBullets() {
    this.bullets.forEach((bullet) => bullet.move());
    this.bullets = this.bullets.filter((bullet) => this.isBulletNeeded(bullet));
  }


  /**
   * A bullet is needed while it is inside the level, above the ground and not far away from the fox.
   * @param {Bullet} bullet - The bullet to check.
   * @returns {boolean} True if the bullet should keep flying.
   */
  isBulletNeeded(bullet) {
    let insideLevel = bullet.x + bullet.width > 0 && bullet.x < this.level.levelEndX;
    let nearFox = Math.abs(bullet.x - this.character.x) < this.canvas.width;
    return insideLevel && nearFox && !bullet.hasHitGround();
  }


  /**
   * Starts the interval that moves all thrown ducks (60 times per second).
   */
  moveThrownDucks() {
    setStoppableInterval(() => this.updateThrownDucks(), 1000 / 60);
  }


  /**
   * Moves every thrown duck one step and keeps only the ducks that are still flying.
   */
  updateThrownDucks() {
    this.thrownDucks.forEach((duck) => duck.move());
    this.thrownDucks = this.thrownDucks.filter((duck) => this.isThrownDuckNeeded(duck));
  }


  /**
   * A thrown duck is needed while it has not landed and is still inside the level.
   * @param {ThrowableDuck} duck - The thrown duck to check.
   * @returns {boolean} True if the duck should keep flying.
   */
  isThrownDuckNeeded(duck) {
    let insideLevel = duck.x + duck.width > 0 && duck.x < this.level.levelEndX;
    return insideLevel && !duck.hasLanded();
  }


  /**
   * Starts the interval that checks all collisions (60 times per second).
   */
  startCollisionCheck() {
    setStoppableInterval(() => this.checkCollisions(), 1000 / 60);
  }


  /**
   * One collision tick: the collision handler checks everything, then the bars are updated.
   */
  checkCollisions() {
    this.collisionHandler.checkAll();
    this.updateStatusBars();
  }


  /**
   * Shows the current energy, the collected ducks and the collected berries of the fox
   * and the energy of the boss in the bars.
   */
  updateStatusBars() {
    this.healthBar.setValue(this.character.energy);
    this.duckBar.setValue(this.character.ducks);
    this.berryBar.setValue(this.character.berries);
    if (this.boss) {
      this.bossBar.setValue(this.boss.energy);
    }
  }


  /**
   * Draws one frame: fixed sky, everything that moves with the camera, then the fixed bars.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.addToMap(this.level.sky);
    this.updateCamera();
    this.ctx.translate(this.cameraX, 0);
    this.drawWorldObjects();
    this.ctx.translate(-this.cameraX, 0);
    this.drawStatusBars();
    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }


  /**
   * Stops the drawing loop, so this world does not keep running after the game ended.
   */
  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }


  /**
   * Draws the fixed bars of the fox. The boss bar only appears once the boss noticed the fox.
   */
  drawStatusBars() {
    this.healthBar.draw(this.ctx);
    this.duckBar.draw(this.ctx);
    this.berryBar.draw(this.ctx);
    if (this.boss && this.boss.isAlerted()) {
      this.bossBar.draw(this.ctx);
    }
  }


  /**
   * Draws all objects that live in the level (they scroll with the camera).
   */
  drawWorldObjects() {
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.backgrounds);
    this.addObjectsToMap(this.level.berries);
    this.addObjectsToMap(this.level.ducks);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.bullets);
    this.addObjectsToMap(this.thrownDucks);
    this.addToMap(this.character);
    this.drawSleepZzz();
    this.drawHitboxes();
  }


  /**
   * Draws the rising "Z z z" above the fox while it sleeps.
   */
  drawSleepZzz() {
    if (this.character.isSleeping()) {
      this.sleepZzz.draw(this.ctx, this.character);
    }
  }


  /**
   * Debug help: draws the hitboxes of fox, hunters, bullets, berries and all ducks when SHOW_HITBOXES is true.
   */
  drawHitboxes() {
    if (!SHOW_HITBOXES) {
      return;
    }
    let objects = [this.character, ...this.level.enemies, ...this.bullets, ...this.level.ducks, ...this.thrownDucks];
    objects.push(...this.level.berries);
    objects.forEach((item) => this.drawHitbox(item));
  }


  /**
   * Draws the hitbox of one object as a thin red frame.
   * @param {MovableObject} item - The object whose hitbox is shown.
   */
  drawHitbox(item) {
    let box = item.getHitbox();
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(box.x, box.y, box.width, box.height);
  }


  /**
   * Chooses how far the fox stays from the left edge.
   * With touch buttons (tablet, phone) the fox stands further right, so the buttons do not cover it.
   * touchQuery.matches is checked again every frame, so it also changes after a resize.
   * @returns {number} Distance in canvas pixels.
   */
  getCameraOffset() {
    return this.touchQuery.matches ? this.touchCameraOffset : this.cameraOffset;
  }


  /**
   * Moves the camera so the fox stays getCameraOffset() pixels from the left edge.
   * The camera stops at the start and at the end of the level.
   * Math.round keeps whole pixels, so no thin lines appear between tiles.
   */
  updateCamera() {
    let wantedX = this.getCameraOffset() - this.character.x;
    let minX = this.canvas.width - this.level.levelEndX;
    let cameraX = Math.min(0, Math.max(minX, wantedX));
    this.cameraX = Math.round(cameraX);
  }


  /**
   * Draws every object of a list.
   * @param {MovableObject[]} objects - The objects to draw.
   */
  addObjectsToMap(objects) {
    objects.forEach((item) => {
      this.addToMap(item);
    });
  }


  /**
   * Draws one object, mirrored if it looks to the left and turned if it has a rotation.
   * @param {MovableObject} item - The object to draw.
   */
  addToMap(item) {
    this.ctx.save();
    if (item.otherDirection) {
      this.ctx.translate(item.x + item.width, item.y); // Nullpunkt an rechte Kante
      this.ctx.scale(-1, 1); // spiegeln
    } else {
      this.ctx.translate(item.x, item.y); // Nullpunkt an linke Kante
    }
    this.rotateAroundCenter(item);
    this.drawImage(item);
    this.ctx.restore();
  }


  /**
   * Turns the canvas around the middle of the object (e.g. a spinning thrown duck).
   * Objects without a rotation are not changed.
   * @param {MovableObject} item - The object that is drawn next.
   */
  rotateAroundCenter(item) {
    if (!item.rotation) {
      return;
    }
    this.ctx.translate(item.width / 2, item.height / 2);
    this.ctx.rotate(item.rotation);
    this.ctx.translate(-item.width / 2, -item.height / 2);
  }


  /**
   * Draws the image of an object: one frame of a sprite sheet or the whole image.
   * The whole image can also be a canvas (e.g. the painted bullet).
   * @param {MovableObject} item - The object to draw.
   */
  drawImage(item) {
    if (item.frameWidth) {
      let { sourceX, sourceY, frameWidth, frameHeight } = item;
      this.ctx.drawImage(item.img, sourceX, sourceY, frameWidth, frameHeight, 0, 0, item.width, item.height);
    } else {
      this.ctx.drawImage(item.img, 0, 0, item.width, item.height);
    }
  }
}
