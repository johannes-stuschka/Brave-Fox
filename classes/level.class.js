class Level {
  sky;
  clouds;
  backgrounds;
  enemies;
  ducks;
  levelEndX;

  /**
   * Stores everything that belongs to one level.
   * @param {Background} sky - The fixed sky behind everything.
   * @param {Cloud[]} clouds - Clouds that drift over the whole level.
   * @param {Background[]} backgrounds - Background tiles, placed side by side.
   * @param {MovableObject[]} enemies - All enemies of the level.
   * @param {CollectibleDuck[]} ducks - Ducks the fox can collect as ammo.
   * @param {number} levelEndX - Right end of the level in pixels.
   */
  constructor(sky, clouds, backgrounds, enemies, ducks, levelEndX) {
    this.sky = sky;
    this.clouds = clouds;
    this.backgrounds = backgrounds;
    this.enemies = enemies;
    this.ducks = ducks;
    this.levelEndX = levelEndX;
  }
}
