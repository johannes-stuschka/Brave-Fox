class Hunter extends MovableObject {
  y = 250;
  frameWidth = 128; // ein Frame im Original-Spritesheet (768 / 6)
  frameHeight = 128;
  width = 192;
  height = 192;
  otherDirection = true;
  animations = {
    idle: { path: "./imgs/Cowboy_1/Idle.png", frames: 6, fps: 10, row: 0 },
  };

  /**
   * Creates a hunter at the given x position and starts its idle animation.
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super();
    this.x = x;
    this.loadImages(Object.values(this.animations));
    this.animate();
  }
}
