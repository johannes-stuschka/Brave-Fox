class Cloud extends MovableObject {
  y = 20;
  width = 750;
  height = (this.width * 324) / 576;
  speed = 0.2;
  targetX = -735;

  constructor() {
    super().loadImage("./imgs/background/nature_4/2.png");
    this.x = 0;
    this.animate();
  }

  /**
   * Lets the cloud drift to the left and starts again on the right side.
   */
  animate() {
    setStoppableInterval(() => {
      if (this.x > this.targetX) {
        this.x -= this.speed;
      } else {
        this.x = 720;
      }
    }, 1000 / 60);
  }
}
