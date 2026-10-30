class World {
  character = new Character();
  level;
  canvas;
  ctx;
  bullets = []; // alle Kugeln, die gerade fliegen
  camera_x = 0;
  cameraOffset = 120; // so viele Pixel bleibt der Fuchs vom linken Rand entfernt
  stompTolerance = 20; // Fuß des Fuchses darf so viele Pixel unter der Kopf-Oberkante des Gegners sein
  healthBar = new StatusBar(20, 20, "#c0392b", HEART_PIXELS, 100);

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
   * One collision tick: enemies and bullets against the fox, then update the bars.
   */
  checkCollisions() {
    this.checkEnemyCollisions();
    this.checkBulletCollisions();
    this.updateStatusBars();
  }


  /**
   * Checks every enemy against the fox, then removes enemies that lay dead long enough.
   */
  checkEnemyCollisions() {
    this.level.enemies.forEach((enemy) => this.checkEnemyCollision(enemy));
    this.removeDefeatedEnemies();
  }


  /**
   * One enemy against the fox: a stomp defeats the enemy and lets the fox bounce,
   * any other touch costs the fox energy. Dead enemies do no harm.
   * @param {Hunter} enemy - The enemy to check.
   */
  checkEnemyCollision(enemy) {
    if (enemy.isDead() || !this.character.isColliding(enemy)) {
      return;
    }
    if (this.isStomp(enemy)) {
      enemy.die();
      this.character.bounce();
    } else {
      this.character.hit(enemy.contactDamage);
    }
  }


  /**
   * A stomp: the enemy can be stomped, the fox is falling (speedY < 0)
   * and the feet of the fox are only a little below the top of the enemy.
   * Touching the enemy from the side is not a stomp.
   * @param {Hunter} enemy - The enemy the fox touches.
   * @returns {boolean} True if the fox lands on top of the enemy.
   */
  isStomp(enemy) {
    let fox = this.character.getHitbox();
    let foxBottom = fox.y + fox.height;
    let enemyTop = enemy.getHitbox().y;
    let isFalling = this.character.speedY < 0;
    return enemy.canBeStomped && isFalling && foxBottom - enemyTop <= this.stompTolerance;
  }


  /**
   * Removes all enemies that were dead for longer than their removeDelay.
   */
  removeDefeatedEnemies() {
    this.level.enemies = this.level.enemies.filter((enemy) => !enemy.isReadyToRemove());
  }


  /**
   * The fox loses energy when a bullet hits it. The bullet disappears on impact.
   */
  checkBulletCollisions() {
    this.bullets.forEach((bullet) => {
      if (this.character.isColliding(bullet)) {
        this.character.hit(bullet.damage);
      }
    });
    this.bullets = this.bullets.filter((bullet) => !this.character.isColliding(bullet));
  }


  /**
   * Shows the current energy of the fox in the health bar.
   */
  updateStatusBars() {
    this.healthBar.setValue(this.character.energy);
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
    requestAnimationFrame(() => this.draw());
  }


  /**
   * Draws all objects that live in the level (they scroll with the camera).
   */
  drawWorldObjects() {
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.backgrounds);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.bullets);
    this.addToMap(this.character);
    this.drawHitboxes();
  }


  /**
   * Debug help: draws the hitboxes of fox, hunters and bullets when SHOW_HITBOXES is true.
   */
  drawHitboxes() {
    if (!SHOW_HITBOXES) {
      return;
    }
    let objects = [this.character, ...this.level.enemies, ...this.bullets];
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
