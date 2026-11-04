const TILE_WIDTH = 720;

const LEVEL1_TILE_COUNT = 6;

const BOSS_X = 3950;

/**
 * Builds a fresh level 1 (can be called again for a restart).
 * @returns {Level} The new level with sky, clouds, backgrounds, enemies, ducks and berries.
 */
function createLevel1() {
  let levelEndX = TILE_WIDTH * LEVEL1_TILE_COUNT;
  return new Level(
    new Background("./imgs/background/nature_4/1.png", 0),
    createClouds(levelEndX),
    createBackgroundTiles(LEVEL1_TILE_COUNT),
    createEnemies(),
    createDucks(),
    createBerries(),
    levelEndX,
  );
}

/**
 * Places both background layers side by side, each tile exactly
 * TILE_WIDTH pixels after the one before, so there are no gaps.
 * Every second tile is mirrored, so neighbouring tiles share the same
 * edge pixels and no hard cut is visible at the tile borders.
 * @param {number} count - How many tiles per layer.
 * @returns {Background[]} All background tiles (back layer first).
 */
function createBackgroundTiles(count) {
  let tiles = [];
  let layers = ["./imgs/background/nature_4/3.png", "./imgs/background/nature_4/4.png"];
  layers.forEach((path) => {
    for (let i = 0; i < count; i++) {
      let mirrored = i % 2 === 1;
      tiles.push(new Background(path, i * TILE_WIDTH, mirrored));
    }
  });
  return tiles;
}

/**
 * Creates one cloud per tile, so clouds cover the whole level.
 * @param {number} levelEndX - Right end of the level.
 * @returns {Cloud[]} The clouds.
 */
function createClouds(levelEndX) {
  let clouds = [];
  for (let x = 0; x < levelEndX; x += TILE_WIDTH) {
    clouds.push(new Cloud(x, levelEndX));
  }
  return clouds;
}

/**
 * Spreads the walking hunters over the level, far enough from the start of the fox.
 * The standing hunters stand in the gaps between the walking hunters. All of them shoot.
 * The big boss waits alone in the arena at the end (no normal hunter starts there).
 * @returns {Hunter[]} The enemies.
 */
function createEnemies() {
  return [
    new WalkingHunter(1000),
    new ShootingHunter(1400),
    new WalkingHunter(1800),
    new ShootingHunter(2300),
    new WalkingHunter(2700),
    new ShootingHunter(3100),
    new WalkingHunter(3400),
    new BossHunter(BOSS_X),
  ];
}

/**
 * Places the collectible ducks on the ground, spread over the whole level.
 * They stand between the start points of the hunters, not on top of them.
 * The last ducks lie just before the boss arena, so the fox has ammo for the boss.
 * @returns {Collectible[]} The ducks.
 */
function createDucks() {
  let duckXs = [300, 450, 600, 800, 1200, 1620, 2050, 2200, 2550, 2950, 3300, 3460, 3510, 3560, 3610];
  return duckXs.map((x) => new Collectible(x, Collectible.duck));
}

/**
 * Places the collectible berries, spread over the whole level.
 * Some lie in small groups, so exploring is rewarded.
 * They lie between the ducks and the start points of the hunters.
 * About every second berry floats in the air, so the fox has to jump for it.
 * @returns {Collectible[]} The berries.
 */
function createBerries() {
  let groundBerryXs = [380, 680, 900, 1290, 1510, 1900, 2420, 2850];
  let floatingBerryXs = [710, 740, 1110, 1540, 2130, 2450, 3220];
  let groundBerries = groundBerryXs.map((x) => new Collectible(x, Collectible.berry));
  let floatingBerries = floatingBerryXs.map((x) => new Collectible(x, Collectible.berry, true));
  return [...groundBerries, ...floatingBerries];
}
