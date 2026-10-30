class World {
  character = new Character();
  level;
  canvas;
  ctx;
  bullets = []; // alle Kugeln, die gerade fliegen
  camera_x = 0;
  cameraOffset = 120; // so viele Pixel bleibt der Fuchs vom linken Rand entfernt
  collisionHandler; // prüft alle Zusammenstöße (Gegner, Kugeln, Enten)
  healthBar = new StatusBar(20, 20, "#c0392b", HEART_IMAGE, 100);
  duckBar = new StatusBar(20, 56, "#f5c542", DUCK_IMAGE, MAX_DUCKS, 2);

  /**
   * Creates the world, connects fox and enemies with it, starts bullets, collisions and drawing.
   * @param {HTMLCanvasElement} canvas - The canvas to draw on.
   * @param {Level} level - The level that should be played.
   */
  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.level = level;
    this.setWorld();
    this.collisionHandler = new CollisionHandler(this);
    this.moveBullets();
    this.startCollisionCheck();
    this.draw();
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
   * A bullet is needed while it is inside the level and not far away from the fox.
   * @param {Bullet} bullet - The bullet to check.
   * @returns {boolean} True if the bullet should keep flying.
   */
  isBulletNeeded(bullet) {
    let insideLevel = bullet.x + bullet.width > 0 && bullet.x < this.level.levelEndX;
    let nearFox = Math.abs(bullet.x - this.character.x) < this.canvas.width;
    return insideLevel && nearFox;
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
   * Shows the current energy and the collected ducks of the fox in the bars.
   */
  updateStatusBars() {
    this.healthBar.setValue(this.character.energy);
    this.duckBar.setValue(this.character.ducks);
  }


  /**
   * Draws one frame: fixed sky, everything that moves with the camera, then the fixed bars.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.addToMap(this.level.sky);
    this.updateCamera();
    this.ctx.translate(this.camera_x, 0);
    this.drawWorldObjects();
    this.ctx.translate(-this.camera_x, 0);
    this.healthBar.draw(this.ctx);
    this.duckBar.draw(this.ctx);
    requestAnimationFrame(() => this.draw());
  }


  /**
   * Draws all objects that live in the level (they scroll with the camera).
   */
  drawWorldObjects() {
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.backgrounds);
    this.addObjectsToMap(this.level.ducks);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.bullets);
    this.addToMap(this.character);
    this.drawHitboxes();
  }


  /**
   * Debug help: draws the hitboxes of fox, hunters, bullets and ducks when SHOW_HITBOXES is true.
   */
  drawHitboxes() {
    if (!SHOW_HITBOXES) {
      return;
    }
    let objects = [this.character, ...this.level.enemies, ...this.bullets, ...this.level.ducks];
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
   * Moves the camera so the fox stays cameraOffset pixels from the left edge.
   * The camera stops at the start and at the end of the level.
   * Math.round keeps whole pixels, so no thin lines appear between tiles.
   */
  updateCamera() {
    let wantedX = this.cameraOffset - this.character.x;
    let minX = this.canvas.width - this.level.levelEndX;
    let cameraX = Math.min(0, Math.max(minX, wantedX));
    this.camera_x = Math.round(cameraX);
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
   * Draws one object, mirrored if it looks to the left.
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
    this.drawImage(item);
    this.ctx.restore();
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
