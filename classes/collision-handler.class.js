class CollisionHandler {
  world; // die World, deren Objekte geprüft werden
  stompTolerance = 20; // Fuß des Fuchses darf so viele Pixel unter der Kopf-Oberkante des Gegners sein

  /**
   * Creates the collision handler for one world.
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
   * any other touch costs the fox energy. Dead enemies do no harm.
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
      fox.hit(enemy.contactDamage);
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
   * The fox loses energy when a bullet hits it. The bullet disappears on impact.
   */
  checkBulletCollisions() {
    let fox = this.world.character;
    this.world.bullets.forEach((bullet) => {
      if (fox.isColliding(bullet)) {
        fox.hit(bullet.damage);
      }
    });
    this.world.bullets = this.world.bullets.filter((bullet) => !fox.isColliding(bullet));
  }


  /**
   * Removes every duck the fox collects in this tick from the level.
   * The fox only picks up a duck if it can carry one more.
   */
  checkDuckCollisions() {
    let fox = this.world.character;
    let level = this.world.level;
    level.ducks = this.collectItems(level.ducks, () => fox.canCollectDuck(), () => fox.collectDuck());
  }


  /**
   * Removes every berry the fox collects in this tick from the level.
   * Berries can always be collected.
   */
  checkBerryCollisions() {
    let fox = this.world.character;
    let level = this.world.level;
    level.berries = this.collectItems(level.berries, () => true, () => fox.collectBerry());
  }


  /**
   * Shared pickup logic for ducks and berries: the fox picks up every item it touches
   * while canPickUp() allows it. Items that are not picked up stay lying in the level.
   * @param {MovableObject[]} items - The items lying in the level.
   * @param {Function} canPickUp - Returns true if the fox may pick up one more item.
   * @param {Function} pickUp - Gives the picked up item to the fox.
   * @returns {MovableObject[]} The items that are still lying in the level.
   */
  collectItems(items, canPickUp, pickUp) {
    let fox = this.world.character;
    return items.filter((item) => {
      if (!canPickUp() || !fox.isColliding(item)) {
        return true;
      }
      pickUp();
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
   * Looks for a living enemy the thrown duck touches and hits it (the duck quacks).
   * Dead enemies are skipped, so they can not be hit again.
   * @param {ThrowableDuck} duck - The thrown duck to check.
   * @returns {boolean} True if the duck hit an enemy.
   */
  tryHitEnemy(duck) {
    let enemy = this.world.level.enemies.find((item) => !item.isDead() && duck.isColliding(item));
    if (!enemy) {
      return false;
    }
    soundManager.play("quack");
    enemy.takeDuckHit();
    return true;
  }
}
