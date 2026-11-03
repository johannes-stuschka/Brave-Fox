// Pixel-Cowboyhut für die Boss-Lebensanzeige: "#" = Hut, "b" = Hutband, "o" = dunkler Rand, "." = durchsichtig
const BOSS_HAT_PIXELS = [
  "...ooo...",
  "..o###o..",
  "..o###o..",
  "..obbbo..",
  "oo#####oo",
  "o#######o",
  ".ooooooo.",
];

const BOSS_HAT_IMAGE = createPixelImage(BOSS_HAT_PIXELS, { "#": "#7a4a24", b: "#8b1a1a", o: "#2b1d10" });

/**
 * The end boss: wakes up when the fox comes near, chases it and shoots.
 * It can only be defeated with thrown ducks.
 * @extends Hunter
 */
class BossHunter extends Hunter {
  width = 288; // 128px-Frame * 2.25 = 288px, 1.8x so groß wie ein normaler Jäger (160px)
  height = 288;
  y = 159; // Füße (unterste Sprite-Zeile) stehen auf der Bodenlinie des Fuchses: 159 + 288 = 447
  offset = { top: 126, right: 110, bottom: 0, left: 106 }; // sichtbarer Körper: Frame-Pixel 47-78 / 56-127, mal 2.25
  contactDamage = 30; // stärker als ein normaler Jäger (20)
  canBeStomped = false; // der Boss kann nur mit Enten besiegt werden
  duckDamage = 20; // 5 Enten-Treffer bis der Boss besiegt ist
  invulnerableTime = 500; // kurze Pause nach einem Treffer, so trifft eine Ente nicht doppelt
  alertRange = 500; // so nah (Mitte zu Mitte) muss der Fuchs kommen, damit der Boss aufwacht
  alertDuration = 1000; // so lange (ms) dauert die Kampfhaltung, bevor die Jagd beginnt
  speed = 2.5; // schneller als die laufenden Jäger (max 1.2), langsamer als der Fuchs (walkSpeed 4)
  stopDistance = 20; // so nah läuft der Boss an den Fuchs heran, dann bleibt er stehen
  minCooldown = 2000; // Pause zwischen zwei Schüssen: 2 bis 3 Sekunden
  maxCooldown = 3000;
  muzzleOffsetX = 234; // Mündung: 104px im Frame * 2.25 (Abstand zur Bildkante)
  muzzleY = 321; // y (159) + 72px im Frame * 2.25
  state = "idle"; // "idle" (wartet), "alert" (Kampfhaltung) oder "chase" (jagt den Fuchs)
  alertStartTime = 0;
  animations = {
    idle: { path: "./imgs/Cowboy_1/Idle.png", frames: 6, fps: 6, row: 0 },
    // Achtung: der Dateiname beginnt mit einem kyrillischen "С" (С), nicht mit einem lateinischen "C"
    alert: { path: "./imgs/Cowboy_1/Сharging.png", frames: 9, fps: 9, row: 0, loop: false },
    run: { path: "./imgs/Cowboy_1/Run.png", frames: 12, fps: 14, row: 0 },
    shot: { path: "./imgs/Cowboy_1/Shot.png", frames: 4, fps: 8, row: 0 },
    hurt: { path: "./imgs/Cowboy_1/Hurt.png", frames: 4, fps: 8, row: 0 },
    dead: { path: "./imgs/Cowboy_1/Dead.png", frames: 5, fps: 8, row: 0, loop: false },
  };

  /**
   * Creates the big end boss. It waits until the fox comes near.
   * @param {number} x - Position of the boss in the level.
   */
  constructor(x) {
    super(x);
    this.startAnimations();
    this.watchFox();
  }


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
   * While hurt the boss stands still for a moment.
   */
  chaseFox() {
    if (this.isHurt()) {
      return;
    }
    this.faceFox();
    this.startShotIfReady();
    this.fireAtShotFrame();
    this.endShotWhenDone();
    if (!this.isShooting) {
      this.runTowardFox();
    }
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
   * Starts the shot animation when the cooldown is over.
   */
  startShotIfReady() {
    if (this.isShooting || Date.now() < this.nextShotTime) {
      return;
    }
    this.startShot();
  }


  /**
   * A thrown duck hit the boss: it loses duckDamage energy (not while still hurt).
   * A hit wakes the boss up, and a shot that was running is cancelled.
   */
  takeDuckHit() {
    if (this.isHurt()) {
      return;
    }
    this.hit(this.duckDamage);
    this.isShooting = false;
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
   * Picks the animation for the current state: dead, hurt, alert, shot, run or idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getCurrentAnimation() {
    if (this.isDead()) {
      return this.animations.dead;
    }
    if (this.isHurt()) {
      return this.animations.hurt;
    }
    if (this.state === "alert") {
      return this.animations.alert;
    }
    return this.getChaseAnimation();
  }


  /**
   * Animation while chasing: shot while shooting, otherwise run. Before the chase: idle.
   * @returns {{path: string, frames: number, fps: number, row: number}} The current animation.
   */
  getChaseAnimation() {
    if (this.state !== "chase") {
      return this.animations.idle;
    }
    if (this.isShooting) {
      return this.animations.shot;
    }
    return this.animations.run;
  }
}
