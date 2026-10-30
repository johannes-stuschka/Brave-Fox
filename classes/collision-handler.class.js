class CollisionHandler {
  world; // die World, deren Objekte geprüft werden
  stompTolerance = 20; // Fuß des Fuchses darf so viele Pixel unter der Kopf-Oberkante des Gegners sein

  /**
   * Creates the collision handler for one world.
   * @param {World} world - The world whose fox, enemies, bullets and ducks are checked.
   */
  constructor(world) {
    this.world = world;
  }


  /**
   * One collision tick: enemies, bullets and ducks against the fox.
   */
  checkAll() {
    this.checkEnemyCollisions();
    this.checkBulletCollisions();
    this.checkDuckCollisions();
  }


  /**
   * Checks every enemy against the fox, then removes enemies that lay dead long enough.
   */
  checkEnemyCollisions() {
    this.world.level.enemies.forEach((enemy) => this.checkEnemyCollision(enemy));
    this.removeDefeatedEnemies();
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
   */
  checkDuckCollisions() {
    let level = this.world.level;
    level.ducks = level.ducks.filter((duck) => !this.tryCollectDuck(duck));
  }


  /**
   * The fox picks up a duck it touches, but only if it can carry one more.
   * A duck that is not collected stays lying in the level.
   * @param {CollectibleDuck} duck - The duck to check.
   * @returns {boolean} True if the duck was collected.
   */
  tryCollectDuck(duck) {
    let fox = this.world.character;
    if (!fox.canCollectDuck() || !fox.isColliding(duck)) {
      return false;
    }
    fox.collectDuck();
    return true;
  }
}
