class World {
  character = new Character();
  level;
  canvas;
  ctx;
  camera_x = 0;
  cameraOffset = 120; // so viele Pixel bleibt der Fuchs vom linken Rand entfernt

  /**
   * Creates the world, connects the fox with it and starts drawing.
   * @param {HTMLCanvasElement} canvas - The canvas to draw on.
   * @param {Level} level - The level that should be played.
   */
  constructor(canvas, level) {
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.canvas = canvas;
    this.level = level;
    this.character.world = this;
    this.draw();
  }


  /**
   * Draws one frame: fixed sky first, then everything that moves with the camera.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.addToMap(this.level.sky);
    this.updateCamera();
    this.ctx.translate(this.camera_x, 0);
    this.drawWorldObjects();
    this.ctx.translate(-this.camera_x, 0);
    requestAnimationFrame(() => this.draw());
  }


  /**
   * Draws all objects that live in the level (they scroll with the camera).
   */
  drawWorldObjects() {
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.level.backgrounds);
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
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
