/**
 * Base class for everything that is drawn: position, size, image,
 * looking direction, hitbox and drawing itself on the canvas.
 */
class DrawableObject {
  x = 0;
  y = 0;
  width = 64;
  height = 64;
  img;
  otherDirection = false;
  rotation = 0;
  offset = { top: 0, right: 0, bottom: 0, left: 0 };

  /**
   * Loads a single image and uses it as the current image.
   * @param {string} path - Path to the image file.
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Returns the image that is drawn right now. Subclasses can swap it (e.g. the fox without shadow in the air).
   * @returns {HTMLImageElement|HTMLCanvasElement} The image to draw.
   */
  getImage() {
    return this.img;
  }

  /**
   * Returns the direction the object looks in.
   * @returns {number} -1 when it looks left, 1 when it looks right.
   */
  getDirection() {
    return this.otherDirection ? -1 : 1;
  }

  /**
   * Draws the object, mirrored if it looks to the left and turned if it has a rotation.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  draw(ctx) {
    if (!isImageReady(this.getImage())) {
      return;
    }
    ctx.save();
    this.moveContextToObject(ctx);
    this.rotateAroundCenter(ctx);
    this.drawImage(ctx);
    ctx.restore();
  }

  /**
   * Moves the origin of the canvas to the object. A mirrored object starts at its right edge.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  moveContextToObject(ctx) {
    if (this.otherDirection) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(this.x, this.y);
    }
  }

  /**
   * Turns the canvas around the middle of the object (e.g. a spinning thrown duck).
   * Objects without a rotation are not changed.
   * @param {CanvasRenderingContext2D} ctx - The canvas context.
   */
  rotateAroundCenter(ctx) {
    if (!this.rotation) {
      return;
    }
    ctx.translate(this.width / 2, this.height / 2);
    ctx.rotate(this.rotation);
    ctx.translate(-this.width / 2, -this.height / 2);
  }

  /**
   * Draws the whole image into the object's rectangle. Sprite sheets override this.
   * @param {CanvasRenderingContext2D} ctx - The canvas context, already moved to the object.
   */
  drawImage(ctx) {
    ctx.drawImage(this.getImage(), 0, 0, this.width, this.height);
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
   * @param {DrawableObject} other - The other object.
   * @returns {boolean} True if both hitboxes touch each other.
   */
  isColliding(other) {
    let a = this.getHitbox();
    let b = other.getHitbox();
    return a.x + a.width > b.x && a.x < b.x + b.width && a.y + a.height > b.y && a.y < b.y + b.height;
  }
}
