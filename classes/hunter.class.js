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
   * Creates a hunter at a random x position and starts its idle animation.
   */
  constructor() {
    super();
    this.x = 250 + Math.random() * 278; // max. 528, damit er nicht rechts aus dem Canvas (720) ragt
    this.loadImages(Object.values(this.animations));
    this.animate();
  }
}
