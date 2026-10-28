class Hunter extends MovableObject {
  y = 250;
  frameWidth = 128; // ein Frame im Original-Spritesheet (768 / 6)
  frameHeight = 128;
  width = 192;
  height = 192;
  otherDirection = true;
  idleFrames = 6;
  idleFps = 10;

  constructor() {
    super().loadImage("./imgs/Cowboy_1/Idle.png");
    this.x = 250 + Math.random() * 278; // max. 528, damit er nicht rechts aus dem Canvas (720) ragt
    this.idleAnimation();
  }
}
