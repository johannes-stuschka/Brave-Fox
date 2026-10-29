class WalkingHunter extends Hunter {
  minSpeed = 0.6; // langsamer als der Fuchs (walkSpeed 4)
  maxSpeed = 1.2;
  fpsPerSpeed = 10; // 1 px pro Tick = 10 fps, so passen Schritte und Bewegung zusammen
  speed;
  animations = {
    walk: { path: "./imgs/Cowboy_1/Walk.png", frames: 12, fps: 10, row: 0 },
  };

  /**
   * Creates a walking hunter with a random slow speed and lets it walk left.
   * @param {number} x - Start position of the hunter in the level.
   */
  constructor(x) {
    super(x);
    this.speed = this.getRandomSpeed();
    this.animations.walk.fps = this.speed * this.fpsPerSpeed;
    this.startAnimations();
    this.walk();
  }


  /**
   * Picks a random speed between minSpeed and maxSpeed.
   * @returns {number} Pixels the hunter moves per tick.
   */
  getRandomSpeed() {
    return this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed);
  }


  /**
   * Starts the movement interval of the hunter (60 times per second).
   */
  walk() {
    setStoppableInterval(() => this.moveLeft(), 1000 / 60);
  }


  /**
   * Moves the hunter one step to the left, toward the fox.
   */
  moveLeft() {
    this.x -= this.speed;
  }


  /**
   * The walking hunter always plays its walk animation.
   * @returns {{path: string, frames: number, fps: number, row: number}} The walk animation.
   */
  getCurrentAnimation() {
    return this.animations.walk;
  }
}
