/**
 * Checks all collisions between the fox and enemies, bullets, ducks and berries.
 */
class CollisionHandler {
  world;
  stompTolerance = 20;

  /**
   * Creates the collision handler for one world.
   * stompTolerance: how many pixels the fox's feet may be below the top of an enemy for a stomp.
   * @param {World} world - The world whose fox, enemies, bullets, ducks and berries are checked.
   */
  constructor(world) {
    this.world = world;
  }


  /**
   * One collision tick: everything against the fox (only while it is alive),
   * then the thrown ducks against the enemies.
   */
  checkAll() {
    if (!this.world.character.isDead()) {
      this.checkFoxCollisions();
    }
    this.removeDefeatedEnemies();
    this.checkThrownDuckCollisions();
  }


  /**
   * Checks enemies, bullets, ducks and berries against the fox.
   */
  checkFoxCollisions() {
    this.checkEnemyCollisions();
    this.checkBulletCollisions();
    this.checkDuckCollisions();
    this.checkBerryCollisions();
  }


  /**
   * Checks every enemy against the fox.
   */
  checkEnemyCollisions() {
    this.world.level.enemies.forEach((enemy) => this.checkEnemyCollision(enemy));
  }


  /**
   * One enemy against the fox: a stomp defeats the enemy and lets the fox bounce,
   * any other touch is handled by the enemy (energy loss, maybe a push). Dead enemies do no harm.
   * @param {Hunter} enemy - The enemy to check.
   */
  checkEnemyCollision(enemy) {
    let fox = this.world.character;
    if (enemy.isDead() || !fox.isColliding(enemy)) {
      return;
    }
    if (this.isStomp(enemy)) {
      enemy.die();
      fox.bounce();
    } else {
      enemy.touchFox(fox);
    }
  }


  /**
   * A stomp: the enemy can be stomped, the fox is falling (speedY < 0)
   * and the feet of the fox are only a little below the top of the enemy.
   * Touching the enemy from the side is not a stomp.
   * @param {Hunter} enemy - The enemy the fox touches.
   * @returns {boolean} True if the fox lands on top of the enemy.
   */
  isStomp(enemy) {
    let fox = this.world.character.getHitbox();
    let foxBottom = fox.y + fox.height;
    let enemyTop = enemy.getHitbox().y;
    let isFalling = this.world.character.speedY < 0;
    return enemy.canBeStomped && isFalling && foxBottom - enemyTop <= this.stompTolerance;
  }


  /**
   * Removes all enemies that were dead for longer than their removeDelay.
   */
  removeDefeatedEnemies() {
    let level = this.world.level;
    level.enemies = level.enemies.filter((enemy) => !enemy.isReadyToRemove());
  }


  /**
   * Every bullet that touches the fox's hitbox hits it and disappears on impact.
   * During the short invulnerability after a hit the bullet is used up without damage.
   */
  checkBulletCollisions() {
    let fox = this.world.character;
    this.world.bullets = this.removeTouchedItems(this.world.bullets, () => true, (bullet) => fox.hit(bullet.damage));
  }


  /**
   * Removes every duck the fox collects in this tick from the level.
   * The fox only picks up a duck if it can carry one more.
   */
  checkDuckCollisions() {
    let fox = this.world.character;
    let level = this.world.level;
    level.ducks = this.removeTouchedItems(level.ducks, () => fox.canCollectDuck(), () => fox.collectDuck());
  }


  /**
   * Removes every berry the fox collects in this tick from the level.
   * Berries can always be collected.
   */
  checkBerryCollisions() {
    let fox = this.world.character;
    let level = this.world.level;
    level.berries = this.removeTouchedItems(level.berries, () => true, () => fox.collectBerry());
  }


  /**
   * Shared logic for bullets, ducks and berries: every item the fox touches is handled
   * by onTouch and removed, as long as canTouch() allows it. All other items stay.
   * @param {DrawableObject[]} items - The items in the level.
   * @param {Function} canTouch - Returns true if the fox may take one more item.
   * @param {Function} onTouch - Handles the touched item (gets the item as parameter).
   * @returns {DrawableObject[]} The items that stay in the level.
   */
  removeTouchedItems(items, canTouch, onTouch) {
    let fox = this.world.character;
    return items.filter((item) => {
      if (!canTouch() || !fox.isColliding(item)) {
        return true;
      }
      onTouch(item);
      return false;
    });
  }


  /**
   * Removes every thrown duck that hit an enemy in this tick.
   */
  checkThrownDuckCollisions() {
    let world = this.world;
    world.thrownDucks = world.thrownDucks.filter((duck) => !this.tryHitEnemy(duck));
  }


  /**
   * Looks for an enemy that can be hit and that the thrown duck touches, and hits it (the duck quacks).
   * Dead enemies and a boss in the air are skipped, the duck flies on.
   * @param {ThrowableDuck} duck - The thrown duck to check.
   * @returns {boolean} True if the duck hit an enemy.
   */
  tryHitEnemy(duck) {
    let enemy = this.world.level.enemies.find((item) => item.canBeHit() && duck.isColliding(item));
    if (!enemy) {
      return false;
    }
    soundManager.play("quack");
    enemy.takeDuckHit();
    return true;
  }
}
