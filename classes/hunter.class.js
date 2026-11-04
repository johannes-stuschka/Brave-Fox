/**
 * Shared base class for all hunters (walking, shooting and the boss).
 * Holds what every hunter needs: size, position, hitbox, contact damage,
 * the sprite animations and the logic for being defeated and removed.
 * @extends Creature
 */
class Hunter extends Creature {
  static spriteFolder = "./imgs/Cowboy_1/";

  static animationCatalog = {
    idle: { file: "Idle.png", frames: 6, fps: 6 },
    walk: { file: "Walk.png", frames: 12, fps: 10 },
    run: { file: "Run.png", frames: 12, fps: 14 },
    alert: { file: "Сharging.png", frames: 9, fps: 9, loop: false },
    shot: { file: "Shot.png", frames: 4, fps: 8 },
    hurt: { file: "Hurt.png", frames: 4, fps: 10 },
    jump: { file: "Jump.png", frames: 10, fps: 12, loop: false },
    dead: { file: "Dead.png", frames: 5, fps: 8, loop: false },
  };

  static animationNames = ["dead"];

  frameWidth = 128;
  frameHeight = 128;
  width = 160;
  height = 160;
  y = 287;
  otherDirection = true;
  offset = { top: 70, right: 62, bottom: 0, left: 58 };
  contactDamage = 20;
  canBeStomped = true;
  deathTime = 0;
  removeDelay = 1200;
  animations;

  /**
   * Sets the position in the level and creates this hunter's own animation objects.
   * Subclasses call startAnimations() when they are ready.
   * @param {number} x - Position of the hunter in the level.
   */
  constructor(x) {
    super();
    this.x = x;
    this.animations = Hunter.createAnimations(this.constructor.animationNames);
  }


  /**
   * Builds fresh animation objects from the catalog, so every hunter can change its own copy.
   * @param {string[]} names - Names of the animations to create.
   * @returns {Object<string, {path: string, frames: number, fps: number, row: number, loop?: boolean}>} The animations by name.
   */
  static createAnimations(names) {
    let animations = {};
    names.forEach((name) => {
      let { file, ...settings } = Hunter.animationCatalog[name];
      animations[name] = { path: Hunter.spriteFolder + file, row: 0, ...settings };
    });
    return animations;
  }


  /**
   * Defeats the hunter: no energy left, remembers when it happened.
   * The dead animation and the removal are based on this.
   */
  die() {
    this.energy = 0;
    this.deathTime = Date.now();
    soundManager.play("hunter-dead");
  }


  /**
   * A thrown duck hit the hunter: a normal hunter is defeated right away.
   * The end boss can override this and only lose some energy instead.
   */
  takeDuckHit() {
    this.die();
  }


  /**
   * The fox ran into the hunter (not a stomp): the fox loses contactDamage energy.
   * The end boss can override this to also push the fox away.
   * @param {Character} fox - The fox that touches the hunter.
   */
  touchFox(fox) {
    fox.hit(this.contactDamage);
  }


  /**
   * Checks if a thrown duck can hit this hunter right now. Dead hunters can not be hit again.
   * @returns {boolean} True if the hunter can be hit.
   */
  canBeHit() {
    return !this.isDead();
  }


  /**
   * Checks if the hunter is dead long enough to be removed from the level.
   * @returns {boolean} True when the dead hunter can disappear.
   */
  isReadyToRemove() {
    return this.isDead() && Date.now() - this.deathTime >= this.removeDelay;
  }
}
