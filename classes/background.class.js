class Background extends MovableObject {
  y = 0;
  width = 720;
  height = 480;

  /**
   * Creates one background image at the given x position.
   * @param {string} imagePath - Path to the image file.
   * @param {number} x - Left edge of the image in the level.
   * @param {boolean} [mirrored=false] - true draws the image flipped horizontally,
   *   so it fits seamlessly to its unflipped neighbour.
   */
  constructor(imagePath, x, mirrored = false) {
    super().loadImage(imagePath);
    this.x = x;
    this.otherDirection = mirrored;
  }
}
