/**
 * The end boss: wakes up when the fox comes near, chases it and shoots.
 * It reuses the shooting of ShootingHunter (without a range limit) and the
 * inherited constructor; it can only be defeated with thrown ducks.
 * It shoots more often and its bullets hurt more than those of a normal hunter.
 * Touching the boss hurts and knocks the fox back, and duck hits do not interrupt its shots.
 * @extends ShootingHunter
 */
class BossHunter extends ShootingHunter {
  static animationNames = ["idle", "alert", "run", "shot", "hurt", "dead"];

  width = 288;
  height = 288;
  y = 159;
  offset = { top: 126, right: 110, bottom: 0, left: 106 };
  contactDamage = 35;
  knockbackSpeed = 10;
  canBeStomped = false;
  duckDamage = 20;
  invulnerableTime = 400;
  alertRange = 500;
  alertDuration = 1000;
  speed = 2.5;
  stopDistance = 20;
  range = Infinity;
  minCooldown = 700;
  maxCooldown = 1100;
  muzzleOffsetX = 234;
  muzzleY = 321;
  bulletDamage = 30;
  state = "idle";
  alertStartTime = 0;

  /**
   * One tick: runs the method of the current state.
   * Waits until the World has connected itself (this.world). A dead boss does nothing.
   */
  update() {
    if (!this.world || this.isDead()) {
      return;
    }
    if (this.state === "idle") {
      this.waitForFox();
    } else if (this.state === "alert") {
      this.finishAlert();
    } else {
      this.chaseFox();
    }
  }


  /**
   * Idle state: switches to the alert state (with a warning sound) as soon as the fox is within alertRange.
   */
  waitForFox() {
    if (Math.abs(this.getDistanceToFox()) <= this.alertRange) {
      this.faceFox();
      this.state = "alert";
      this.alertStartTime = Date.now();
      soundManager.play("boss-alert");
    }
  }


  /**
   * Alert state: after alertDuration the boss starts to chase the fox.
   * The first shot comes after one cooldown.
   */
  finishAlert() {
    if (Date.now() - this.alertStartTime >= this.alertDuration) {
      this.state = "chase";
      this.nextShotTime = Date.now() + this.getRandomCooldown();
    }
  }


  /**
   * Chase state: shoots now and then, otherwise runs toward the fox.
   * While hurt the boss stands still for a moment, but it keeps shooting.
   */
  chaseFox() {
    this.shootAtFox();
    if (!this.isShooting && !this.isHurt()) {
      this.runTowardFox();
    }
  }


  /**
   * Touching the boss hurts like any hunter and also knocks the fox away from the boss,
   * so the fox can not stand inside the boss.
   * @param {Character} fox - The fox that touches the boss.
   */
  touchFox(fox) {
    super.touchFox(fox);
    let direction = Math.sign(this.getDistanceToFox()) || 1;
    fox.knockBack(direction, this.knockbackSpeed);
  }


  /**
   * Runs one step toward the fox, but stops when it is already very close.
   * The boss never leaves the level.
   */
  runTowardFox() {
    let distance = this.getDistanceToFox();
    if (Math.abs(distance) <= this.stopDistance) {
      return;
    }
    let step = distance < 0 ? -this.speed : this.speed;
    let maxX = this.world.level.levelEndX - this.width;
    this.x = Math.min(maxX, Math.max(0, this.x + step));
  }


  /**
   * A thrown duck hit the boss: it loses duckDamage energy (not while still hurt).
   * A hit wakes the boss up; a shot that is already running is not cancelled.
   */
  takeDuckHit() {
    if (this.isHurt()) {
      return;
    }
    this.hit(this.duckDamage);
    this.wakeUp();
    this.reactToHit();
  }


  /**
   * After a hit: the boss dies when the energy is gone, otherwise it grunts in pain.
   */
  reactToHit() {
    if (this.isDead()) {
      this.die();
    } else {
      soundManager.play("boss-hurt");
    }
  }


  /**
   * Skips the waiting: a boss that is hit from far away starts to chase right away.
   */
  wakeUp() {
    if (this.state === "idle") {
      this.state = "chase";
      this.nextShotTime = Date.now() + this.getRandomCooldown();
    }
  }


  /**
   * Checks if the boss noticed the fox (then its health bar is shown).
   * @returns {boolean} True once the boss left the idle state.
   */
  isAlerted() {
    return this.state !== "idle";
  }


  /**
   * The defeated boss stays lying in the level (the win screen follows later).
   * @returns {boolean} Always false.
   */
  isReadyToRemove() {
    return false;
  }


  /**
   * Picks the animation for the current state: dead, alert, or one of the chase animations.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.dead;
    }
    if (this.state === "alert") {
      return this.animations.alert;
    }
    return this.getChaseAnimation();
  }


  /**
   * Animation while chasing: shot while shooting (even when hurt, so the bullet still fires),
   * hurt after a duck hit, otherwise run. Before the chase: idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getChaseAnimation() {
    if (this.state !== "chase") {
      return this.animations.idle;
    }
    if (this.isShooting) {
      return this.animations.shot;
    }
    if (this.isHurt()) {
      return this.animations.hurt;
    }
    return this.animations.run;
  }
}
